#!/bin/bash
# scripts/servers.sh - 部署服务器配置

[[ -n "${_SERVERS_LOADED:-}" ]] && return 0
_SERVERS_LOADED=true

servers::get_host() {
    case "$1" in
        production|prod) echo "pj.csautodriver.com" ;;
        uat|test) echo "pj-test.csautodriver.com" ;;
        ubunto|dev) echo "192.168.60.22" ;;
        *) echo "" ;;
    esac
}

servers::list_envs() {
    echo "production uat ubunto"
}

servers::print_all() {
    echo "  production -> pj.csautodriver.com"
    echo "  uat        -> pj-test.csautodriver.com"
    echo "  ubunto     -> 192.168.60.22"
}

servers::get_env_for_branch() {
    case "$1" in
        develop) echo "ubunto" ;;
        test) echo "uat" ;;
        *) echo "" ;;
    esac
}

servers::print_branch_mappings() {
    echo "  develop -> ubunto"
    echo "  test    -> uat"
    echo "  master  -> 须指定 env"
}

servers::get_build_env() {
    case "$1" in
        production|prod) echo "prod" ;;
        uat|test) echo "test" ;;
        ubunto|dev) echo "dev" ;;
        *) echo "" ;;
    esac
}

servers::get_project_filename() {
    case "$1" in
        pt) echo "platform" ;;
        cp) echo "corp" ;;
        pj) echo "project" ;;
        *) echo "" ;;
    esac
}

servers::get_project_dir() {
    case "$1" in
        # 192.168.60.22 的 nginx 容器读取 /usr/share/nginx/html 下的同名目录，
        # 宿主机对应 /etc/nginx-data/html/<project>。
        pt) echo "platform" ;;
        cp) echo "corp" ;;
        pj) echo "project" ;;
        *) echo "" ;;
    esac
}

servers::get_access_url() {
    local env="$1"
    local host="$2"
    local project="$3"

    case "${env}:${project}" in
        ubunto:pt|dev:pt) echo "http://${host}:7001/" ;;
        ubunto:cp|dev:cp) echo "http://${host}:7002/" ;;
        ubunto:pj|dev:pj) echo "http://${host}:7003/client/" ;;
        *) echo "https://${host}/" ;;
    esac
}

servers::print_projects() {
    echo "  pt -> platform"
    echo "  cp -> corp"
    echo "  pj -> project [默认]"
}

DEFAULT_SSH_USER="root"
DEFAULT_UPLOAD_DIR="/root/chongshi/ibms-front"
DEFAULT_DEPLOY_DIR="/etc/nginx-data/html"
DEFAULT_PROJECT="pj"
SSH_TIMEOUT="${SSH_TIMEOUT:-10}"
