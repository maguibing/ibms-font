#!/bin/bash
# scripts/lib/util.sh - 通用工具函数

[[ -n "${_UTIL_LOADED:-}" ]] && return 0
_UTIL_LOADED=true

if [ -t 1 ] && command -v tput >/dev/null 2>&1; then
    NC=$(tput sgr0)
    RED=$(tput setaf 1)
    GREEN=$(tput setaf 2)
    YELLOW=$(tput setaf 3)
    BLUE=$(tput setaf 4)
    PURPLE=$(tput setaf 5)
    BOLD=$(tput bold)
else
    NC=""
    RED=""
    GREEN=""
    YELLOW=""
    BLUE=""
    PURPLE=""
    BOLD=""
fi

util::log() {
    local level="$1"
    local msg="$2"
    local timestamp
    timestamp="$(date '+%m-%d %H:%M:%S')"

    case "$level" in
        info|i)    echo -e "${GREEN}[INF]${NC} $timestamp ${GREEN}$msg${NC}" ;;
        warn|w)    echo -e "${YELLOW}[WRN]${NC} $timestamp ${YELLOW}$msg${NC}" ;;
        error|e)   echo -e "${RED}[ERR]${NC} $timestamp ${RED}$msg${NC}" ;;
        fatal|f)   echo -e "${PURPLE}[FAT]${NC} $timestamp ${PURPLE}$msg${NC}"; exit 1 ;;
        success|s) echo -e "${GREEN}[OK ]${NC} $timestamp ${BOLD}${GREEN}$msg${NC}" ;;
        *)         echo -e "$timestamp $msg" ;;
    esac
}

util::echo() {
    local color="$1"
    local msg="$2"

    case "$color" in
        red)    echo -e "${RED}$msg${NC}" ;;
        green)  echo -e "${GREEN}$msg${NC}" ;;
        yellow) echo -e "${YELLOW}$msg${NC}" ;;
        blue)   echo -e "${BLUE}$msg${NC}" ;;
        ok)     echo -e "${GREEN}$msg${NC}" ;;
        err)    echo -e "${RED}$msg${NC}" ;;
        warn)   echo -e "${YELLOW}$msg${NC}" ;;
        *)      echo -e "$msg" ;;
    esac
}

util::divider() {
    printf "%60s" " " | tr ' ' '-'
    echo
}

util::step() {
    echo ""
    util::divider
    util::log info "$1"
    util::divider
}

util::die() {
    util::log fatal "$1"
}

util::confirm() {
    local msg="${1:-确认继续?}"
    local default="${2:-n}"

    if [ "$default" = "y" ]; then
        printf "%s [Y/n] " "$msg"
    else
        printf "%s [y/N] " "$msg"
    fi

    read -r reply

    case "$reply" in
        y|Y|yes|YES) return 0 ;;
        n|N|no|NO) return 1 ;;
        "") [ "$default" = "y" ] && return 0 || return 1 ;;
        *) return 1 ;;
    esac
}

util::require_cmd() {
    local cmd="$1"
    local install_hint="${2:-}"

    if ! command -v "$cmd" >/dev/null 2>&1; then
        util::log error "命令未找到: $cmd"
        [ -n "$install_hint" ] && util::log info "安装方式: $install_hint"
        return 1
    fi
    return 0
}

util::git_branch() {
    git rev-parse --abbrev-ref HEAD 2>/dev/null || true
}

util::git_checkout() {
    local branch="$1"

    util::log info "切换到分支 $branch..."
    git checkout "$branch" --quiet 2>/dev/null || {
        util::log error "切换分支 $branch 失败"
        return 1
    }

    git pull origin "$branch" --quiet 2>/dev/null || {
        util::log warn "拉取分支 $branch 失败，继续使用本地代码"
    }

    util::log info "已切换到分支: $branch"
    return 0
}
