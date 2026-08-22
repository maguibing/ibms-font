#!/bin/bash
# scripts/deploy.sh - 一键部署脚本
# 流程：构建 -> 打包 -> 上传 -> 远程解压

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/lib/util.sh"
source "${SCRIPT_DIR}/lib/ssh.sh"
source "${SCRIPT_DIR}/servers.sh"

ENV=""
BRANCH=""
SSH_USER="$DEFAULT_SSH_USER"
PROJECT="$DEFAULT_PROJECT"
HOST=""
REMOTE_DIR=""
DEPLOY_DIR=""
DRY_RUN=false
SKIP_BUILD=false
SKIP_UPLOAD=false
USE_SUDO=false
BACKUP=true
CLEAN_BACKUP=false

show_help() {
    echo ""
    echo "ruoyi-plus-soybean 一键部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -e, --env <name>        环境名 (production, uat, ubunto)"
    echo "  -b, --branch <name>     分支名 (默认: 当前分支)"
    echo "  -u, --user <name>       SSH 用户 (默认: $DEFAULT_SSH_USER)"
    echo "  -h, --host <addr>       服务器地址 (覆盖默认配置)"
    echo "  -p, --project <name>    项目简写 (pt, cp, pj，默认: $DEFAULT_PROJECT)"
    echo "  -r, --remote-dir <path> 远程上传目录 (默认: $DEFAULT_UPLOAD_DIR)"
    echo "  --deploy-dir <path>     远程部署目录 (默认: $DEFAULT_DEPLOY_DIR/<project>)"
    echo "  --sudo                  使用 sudo 执行远程命令"
    echo "  --no-backup             不备份旧版本"
    echo "  --clean-backup          清理超过7天的旧备份"
    echo "  -d, --dry-run           测试模式，不实际执行"
    echo "  --skip-build            跳过构建步骤"
    echo "  --skip-upload           跳过上传步骤（仅本地打包）"
    echo "  --help                  显示此帮助"
    echo ""
    echo "可用环境:"
    servers::print_all
    echo ""
    echo "分支默认映射:"
    servers::print_branch_mappings
    echo ""
    echo "项目简写:"
    servers::print_projects
    echo ""
    echo "示例:"
    echo "  make deploy project=cp env=ubunto"
    echo "  make deploy project=pj env=uat branch=test"
    echo "  make deploy project=pt env=production host=pt.csautodriver.com"
    echo "  make deploy-dry project=cp env=ubunto"
    echo ""
}

parse_args() {
    local first_char=""
    if [ -n "${1:-}" ]; then
        first_char=$(printf '%s' "$1" | cut -c1)
    fi

    if [ $# -ge 1 ] && [ "$first_char" != "-" ]; then
        ENV="${1:-}"
        BRANCH="${2:-}"
        SSH_USER="${3:-$DEFAULT_SSH_USER}"
        PROJECT="${4:-$DEFAULT_PROJECT}"
        HOST="${5:-}"
        [ "${6:-}" = "true" ] && DRY_RUN=true
        REMOTE_DIR="${7:-}"
        DEPLOY_DIR="${8:-}"
        [ "${9:-}" = "true" ] && USE_SUDO=true
        return 0
    fi

    while [ $# -gt 0 ]; do
        case "$1" in
            -e|--env) ENV="$2"; shift 2 ;;
            -p|--project|--scene) PROJECT="$2"; shift 2 ;;
            -b|--branch) BRANCH="$2"; shift 2 ;;
            -u|--user) SSH_USER="$2"; shift 2 ;;
            -h|--host) HOST="$2"; shift 2 ;;
            -r|--remote-dir) REMOTE_DIR="$2"; shift 2 ;;
            --deploy-dir) DEPLOY_DIR="$2"; shift 2 ;;
            --sudo) USE_SUDO=true; shift ;;
            --no-backup) BACKUP=false; shift ;;
            --clean-backup) CLEAN_BACKUP=true; shift ;;
            -d|--dry-run) DRY_RUN=true; shift ;;
            --skip-build) SKIP_BUILD=true; shift ;;
            --skip-upload) SKIP_UPLOAD=true; shift ;;
            --help) show_help; exit 0 ;;
            *)
                util::log error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

get_sudo_prefix() {
    if $USE_SUDO && [ "$SSH_USER" != "root" ]; then
        echo "sudo"
    else
        echo ""
    fi
}

get_build_cmd() {
    local build_env="$1"

    if [ "$build_env" = "prod" ]; then
        echo "pnpm build:${PROJECT}"
    else
        echo "pnpm build:${PROJECT}:${build_env}"
    fi
}

main() {
    parse_args "$@"
    cd "${SCRIPT_DIR}/.."

    util::step "开始部署"

    if [ -z "$BRANCH" ]; then
        BRANCH=$(util::git_branch)
        [ -z "$BRANCH" ] && util::die "无法获取当前分支，请指定 branch 参数"
    fi

    if [ -z "$ENV" ]; then
        ENV=$(servers::get_env_for_branch "$BRANCH")
        if [ -n "$ENV" ]; then
            util::log info "从分支 '$BRANCH' 自动推断环境: $ENV"
        else
            util::log error "分支 '$BRANCH' 没有默认环境映射，请指定 env 参数"
            servers::print_branch_mappings
            exit 1
        fi
    fi

    PROJECT_FILENAME=$(servers::get_project_filename "$PROJECT")
    if [ -z "$PROJECT_FILENAME" ]; then
        util::log error "未知项目简写: $PROJECT"
        servers::print_projects
        exit 1
    fi

    PROJECT_DIR_SUFFIX=$(servers::get_project_dir "$PROJECT")
    [ -z "$PROJECT_DIR_SUFFIX" ] && util::die "未知部署目录: $PROJECT"

    if [ -z "$HOST" ]; then
        HOST=$(servers::get_host "$ENV")
        [ -z "$HOST" ] && util::die "未知环境: $ENV，且未指定 host 参数"
    else
        util::log info "使用指定服务器: $HOST"
    fi

    [ -z "$REMOTE_DIR" ] && REMOTE_DIR="$DEFAULT_UPLOAD_DIR"
    [ -z "$DEPLOY_DIR" ] && DEPLOY_DIR="${DEFAULT_DEPLOY_DIR}/${PROJECT_DIR_SUFFIX}"

    BUILD_ENV=$(servers::get_build_env "$ENV")
    [ -z "$BUILD_ENV" ] && util::die "环境 $ENV 没有对应的当前项目构建模式"

    BUILD_CMD=$(get_build_cmd "$BUILD_ENV")
    BUILD_OUT_DIR="dist/${PROJECT}-${BUILD_ENV}"
    OUTPUT_DIR=".output"
    ARCHIVE_NAME="${PROJECT_FILENAME}.zip"
    ARCHIVE_PATH="${OUTPUT_DIR}/${ARCHIVE_NAME}"
    SUDO_PREFIX=$(get_sudo_prefix)
    ACCESS_URL=$(servers::get_access_url "$ENV" "$HOST" "$PROJECT")

    echo ""
    util::log info "部署配置:"
    echo "  环境:     ${ENV}"
    echo "  分支:     ${BRANCH}"
    echo "  主机:     ${HOST}"
    echo "  用户:     ${SSH_USER}"
    echo "  项目:     ${PROJECT} (${PROJECT_FILENAME})"
    echo "  构建环境: ${BUILD_ENV}"
    echo "  构建目录: ${BUILD_OUT_DIR}"
    echo "  上传目录: ${REMOTE_DIR}"
    echo "  部署目录: ${DEPLOY_DIR}"
    echo "  访问地址: ${ACCESS_URL}"
    echo "  构建命令: ${BUILD_CMD}"
    [ -n "$SUDO_PREFIX" ] && echo "  权限:     使用 sudo"
    $BACKUP && echo "  备份:     是" || echo "  备份:     否"
    $DRY_RUN && echo "  模式:     测试模式"
    $SKIP_BUILD && echo "  跳过:     构建步骤"
    $SKIP_UPLOAD && echo "  跳过:     上传步骤"
    echo ""

    if ! $DRY_RUN; then
        if ! util::confirm "确认部署?"; then
            util::log warn "已取消"
            exit 0
        fi
    fi

    util::step "检查环境"

    if ! $SKIP_BUILD; then
        util::require_cmd "pnpm" "npm install -g pnpm" || exit 1
    fi

    util::require_cmd "zip" || exit 1
    util::require_cmd "unzip" || true

    if ! $SKIP_UPLOAD; then
        ssh::check_rsync || true

        if ! $DRY_RUN; then
            if ! ssh::check_connection "$HOST" "$SSH_USER"; then
                echo ""
                if util::confirm "是否尝试配置 SSH 密钥?"; then
                    ssh::setup_connection "$HOST" "$SSH_USER" || exit 1
                else
                    exit 1
                fi
            fi
        fi
    fi

    CURRENT_BRANCH=$(util::git_branch)
    if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
        util::step "切换分支"
        if $DRY_RUN; then
            util::log info "[DRY-RUN] git checkout $BRANCH && git pull"
        else
            util::git_checkout "$BRANCH" || exit 1
        fi
    fi

    if ! $SKIP_BUILD; then
        util::step "安装依赖"
        if $DRY_RUN; then
            util::log info "[DRY-RUN] pnpm install"
        else
            pnpm install --frozen-lockfile 2>/dev/null || pnpm install
        fi

        util::step "构建项目"
        if $DRY_RUN; then
            util::log info "[DRY-RUN] $BUILD_CMD"
        else
            util::echo yellow "> $BUILD_CMD"
            $BUILD_CMD
        fi
    fi

    util::step "打包文件"

    if $DRY_RUN; then
        util::log info "[DRY-RUN] zip -rq $ARCHIVE_PATH ${BUILD_OUT_DIR}/*"
    else
        mkdir -p "$OUTPUT_DIR"

        if [ ! -d "$BUILD_OUT_DIR" ]; then
            util::die "${BUILD_OUT_DIR} 目录不存在，请先构建项目"
        fi

        rm -f "$ARCHIVE_PATH"
        ARCHIVE_ABS="${PWD}/${ARCHIVE_PATH}"
        (
            cd "$BUILD_OUT_DIR"
            zip -rq "$ARCHIVE_ABS" .
        )

        util::log success "打包完成: ${ARCHIVE_PATH}"
        ls -lh "$ARCHIVE_PATH"
    fi

    if ! $SKIP_UPLOAD; then
        util::step "上传到服务器"

        REMOTE_PATH="${REMOTE_DIR}/${ARCHIVE_NAME}"

        if $DRY_RUN; then
            util::log info "[DRY-RUN] ssh::upload $ARCHIVE_PATH $HOST $REMOTE_PATH $SSH_USER"
        else
            ssh::exec "$HOST" "$SSH_USER" "${SUDO_PREFIX} mkdir -p ${REMOTE_DIR}"

            if [ "$BACKUP" = "true" ]; then
                BACKUP_ZIP="${PROJECT_FILENAME}.${BRANCH}.backup.$(date "+%Y-%m-%d_%H-%M-%S").zip"
                ssh::exec "$HOST" "$SSH_USER" "${SUDO_PREFIX} [ -f \"${REMOTE_DIR}/${ARCHIVE_NAME}\" ] && ${SUDO_PREFIX} mv \"${REMOTE_DIR}/${ARCHIVE_NAME}\" \"${REMOTE_DIR}/${BACKUP_ZIP}\" || true"
            fi

            ssh::upload "$ARCHIVE_PATH" "$HOST" "$REMOTE_PATH" "$SSH_USER"
            util::log success "上传完成: ${SSH_USER}@${HOST}:${REMOTE_PATH}"
        fi
    fi

    if ! $SKIP_UPLOAD; then
        util::step "远程部署"

        if $DRY_RUN; then
            util::log info "[DRY-RUN] 远程解压 $ARCHIVE_NAME -> $DEPLOY_DIR"
        else
            ssh -T -o ConnectTimeout="$SSH_TIMEOUT" -o StrictHostKeyChecking=no \
                "${SSH_USER}@${HOST}" bash <<REMOTE_SCRIPT
set -e

log() { echo -e "\033[1;34m[远程]\033[0m \$1"; }

SUDO_CMD="${SUDO_PREFIX}"
ARCHIVE="${REMOTE_DIR}/${ARCHIVE_NAME}"
TARGET_DIR="${DEPLOY_DIR}"
TIMESTAMP=\$(date "+%Y-%m-%d_%H-%M-%S")

log "开始部署..."

if [ ! -f "\$ARCHIVE" ]; then
    echo "找不到 \$ARCHIVE"
    exit 1
fi

if [ "${CLEAN_BACKUP}" = "true" ]; then
    log "清理超过7天的旧备份..."
    find "${REMOTE_DIR}" -maxdepth 1 -name "${PROJECT_FILENAME}.${BRANCH}.backup.*.zip" -mtime +7 -exec \$SUDO_CMD rm -rf {} \; 2>/dev/null || true
fi

TEMP_DIR="/tmp/${PROJECT}_deploy_\${TIMESTAMP}"
rm -rf "\$TEMP_DIR"
mkdir -p "\$TEMP_DIR"
unzip -q "\$ARCHIVE" -d "\$TEMP_DIR"

\$SUDO_CMD mkdir -p "\$TARGET_DIR"
\$SUDO_CMD rm -rf "\${TARGET_DIR:?}/"*

if [ -d "\$TEMP_DIR/dist" ]; then
    \$SUDO_CMD mv "\$TEMP_DIR/dist/"* "\$TARGET_DIR/"
else
    \$SUDO_CMD mv "\$TEMP_DIR/"* "\$TARGET_DIR/"
fi

if [ ! -f "\$TARGET_DIR/index.html" ]; then
    echo "部署目录缺少 index.html: \$TARGET_DIR"
    exit 1
fi

BUILD_TIME_LINE=\$(sed -n '/buildTime/p' "\$TARGET_DIR/index.html" | head -n 1 || true)
[ -n "\$BUILD_TIME_LINE" ] && log "入口构建时间: \$BUILD_TIME_LINE"

if [ -n "\$SUDO_CMD" ]; then
    \$SUDO_CMD chown -R www-data:www-data "\$TARGET_DIR" 2>/dev/null || true
    \$SUDO_CMD chmod -R 755 "\$TARGET_DIR" 2>/dev/null || true
fi

rm -rf "\$TEMP_DIR"

log "部署完成: \$TARGET_DIR"
REMOTE_SCRIPT
        fi
    fi

    util::step "部署完成"

    echo ""
    util::echo ok "部署成功"
    echo "   环境:     ${ENV}"
    echo "   项目:     ${PROJECT} (${PROJECT_FILENAME})"
    echo "   部署目录: ${DEPLOY_DIR}"
    [ "$BACKUP" = "true" ] && echo "   备份位置: ${REMOTE_DIR}/${PROJECT_FILENAME}.${BRANCH}.backup.*.zip"
    echo "   访问地址: ${ACCESS_URL}"
    echo ""

    if [ "$CURRENT_BRANCH" != "$BRANCH" ] && ! $DRY_RUN; then
        git checkout "$CURRENT_BRANCH" --quiet 2>/dev/null || true
    fi
}

main "$@"
