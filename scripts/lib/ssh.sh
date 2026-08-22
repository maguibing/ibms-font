#!/bin/bash
# scripts/lib/ssh.sh - SSH 工具函数

[[ -n "${_SSH_LOADED:-}" ]] && return 0
_SSH_LOADED=true

SSH_KEY_FILE="${SSH_KEY_FILE:-$HOME/.ssh/id_rsa}"
SSH_KEY_ED25519="${SSH_KEY_ED25519:-$HOME/.ssh/id_ed25519}"
SSH_TIMEOUT="${SSH_TIMEOUT:-10}"

ssh::key_exists() {
    [ -f "$SSH_KEY_FILE" ] && [ -f "${SSH_KEY_FILE}.pub" ] && return 0
    [ -f "$SSH_KEY_ED25519" ] && [ -f "${SSH_KEY_ED25519}.pub" ] && return 0
    return 1
}

ssh::get_key() {
    if [ -f "$SSH_KEY_ED25519" ]; then
        echo "$SSH_KEY_ED25519"
    elif [ -f "$SSH_KEY_FILE" ]; then
        echo "$SSH_KEY_FILE"
    else
        echo ""
    fi
}

ssh::generate_key() {
    local key_file="$SSH_KEY_ED25519"

    if [ -f "$key_file" ]; then
        echo "SSH 密钥已存在: $key_file"
        return 0
    fi

    echo "生成 SSH 密钥..."
    mkdir -p "$(dirname "$key_file")"
    ssh-keygen -t ed25519 -N "" -f "$key_file" -q || {
        echo "SSH 密钥生成失败"
        return 1
    }
}

ssh::can_connect() {
    local host="$1"
    local user="${2:-$USER}"

    if [ "$host" = "127.0.0.1" ] || [ "$host" = "localhost" ]; then
        return 0
    fi

    ssh -o StrictHostKeyChecking=no \
        -o BatchMode=yes \
        -o ConnectTimeout="$SSH_TIMEOUT" \
        -o PasswordAuthentication=no \
        "${user}@${host}" "exit 0" >/dev/null 2>&1
}

ssh::check_connection() {
    local host="$1"
    local user="${2:-root}"

    echo "检查 SSH 连接 ${user}@${host}..."

    if ssh::can_connect "$host" "$user"; then
        echo "SSH 连接正常"
        return 0
    fi

    echo ""
    echo "SSH 连接失败，可能是首次连接或未配置密钥"
    echo ""
    echo "配置命令:"
    echo "  ssh-keygen -t ed25519 -C \"your_email@example.com\""
    echo "  ssh-copy-id ${user}@${host}"
    echo ""

    return 1
}

ssh::setup_connection() {
    local host="$1"
    local user="${2:-root}"

    if ssh::can_connect "$host" "$user"; then
        echo "已可免密登录: ${user}@${host}"
        return 0
    fi

    if ! ssh::key_exists; then
        ssh::generate_key || return 1
    fi

    local key_file
    key_file=$(ssh::get_key)

    if [ -n "$key_file" ]; then
        ssh-copy-id -i "${key_file}.pub" -o ConnectTimeout="$SSH_TIMEOUT" "${user}@${host}" || {
            echo "SSH 公钥复制失败"
            return 1
        }
    fi
}

ssh::exec() {
    local host="$1"
    local user="${2:-root}"
    shift 2
    local cmd="$*"

    if [ "$host" = "127.0.0.1" ] || [ "$host" = "localhost" ]; then
        eval "$cmd"
        return $?
    fi

    ssh -T -o StrictHostKeyChecking=no \
        -o ConnectTimeout="$SSH_TIMEOUT" \
        -o LogLevel=ERROR \
        "${user}@${host}" "$cmd"
}

ssh::check_rsync() {
    if command -v rsync >/dev/null 2>&1; then
        return 0
    fi

    echo "rsync 未安装，将使用 scp 替代"
    return 1
}

ssh::upload() {
    local local_file="$1"
    local host="$2"
    local remote_path="$3"
    local user="${4:-root}"

    ssh::exec "$host" "$user" "mkdir -p $(dirname "$remote_path")"

    if command -v rsync >/dev/null 2>&1; then
        echo "使用 rsync 上传..."
        rsync -avz --progress \
            -e "ssh -o ConnectTimeout=$SSH_TIMEOUT -o StrictHostKeyChecking=no" \
            "$local_file" \
            "${user}@${host}:${remote_path}"
    else
        echo "使用 scp 上传..."
        scp -o ConnectTimeout="$SSH_TIMEOUT" \
            -o StrictHostKeyChecking=no \
            "$local_file" \
            "${user}@${host}:${remote_path}"
    fi
}
