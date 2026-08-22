SHELL := /bin/bash

PROJECT_NAME := "ruoyi-plus-soybean"
OUTPUT_DIR := ".output"

# ==================== 配置参数 ====================
env ?=
branch ?=
host ?=
user ?= root
project ?= pj
scene ?=
dry-run ?= false
remote-dir ?=
deploy-dir ?=
sudo ?= false

# ==================== 开发命令 ====================

.PHONY: check
# 检查环境配置
check:
	@echo "环境检查:"
	@echo "  OS: $$(uname -s) $$(uname -m)"
	@command -v node >/dev/null && echo "  node: $$(node -v)" || echo "  node: 未安装"
	@command -v pnpm >/dev/null && echo "  pnpm: $$(pnpm -v)" || echo "  pnpm: 未安装"
	@command -v git >/dev/null && echo "  git: 已安装" || echo "  git: 未安装"
	@command -v zip >/dev/null && echo "  zip: 已安装" || echo "  zip: 未安装"
	@command -v rsync >/dev/null && echo "  rsync: 已安装" || echo "  rsync: 未安装(可选)"

.PHONY: build
# 构建项目, 执行命令: make build project=cp env=ubunto
build:
ifeq ($(env),)
	@echo "请指定环境: make build project=cp env=ubunto (production/uat/ubunto)"
	@exit 1
else ifneq ($(scene),)
ifeq ($(env),production)
	pnpm build:$(scene)
else ifeq ($(env),uat)
	pnpm build:$(scene):test
else ifeq ($(env),ubunto)
	pnpm build:$(scene):dev
else
	@echo "未知环境: $(env)"
	@exit 1
endif
else ifeq ($(env),production)
	pnpm build:$(project)
else ifeq ($(env),uat)
	pnpm build:$(project):test
else ifeq ($(env),ubunto)
	pnpm build:$(project):dev
else
	@echo "未知环境: $(env)"
	@exit 1
endif

.PHONY: deploy
# 一键部署, 执行命令: make deploy project=cp env=ubunto [branch=xxx] [host=xxx] [sudo=true]
deploy:
	@bash scripts/deploy.sh "$(env)" "$(branch)" "$(user)" "$(or $(scene),$(project))" "$(host)" "$(dry-run)" "$(remote-dir)" "$(deploy-dir)" "$(sudo)"

.PHONY: deploy-dry
# 测试部署(不实际执行)
deploy-dry:
	@bash scripts/deploy.sh "$(env)" "$(branch)" "$(user)" "$(or $(scene),$(project))" "$(host)" "true" "$(remote-dir)" "$(deploy-dir)" "$(sudo)"

.PHONY: clean
# 清理构建产物
clean:
	rm -rf dist $(OUTPUT_DIR)
	@echo "清理完成"

.PHONY: status
# Git 状态
status:
	@git status

# ==================== 帮助 ====================

.PHONY: help
# 展示帮助信息
help:
	@echo ''
	@echo '用法:'
	@echo '  make <目标命令>'
	@echo ''
	@echo '常用示例:'
	@echo '  make build project=cp env=ubunto'
	@echo '  make deploy project=cp env=ubunto'
	@echo '  make deploy-dry project=pj env=uat'
	@echo ''
	@echo '目标命令:'
	@awk '/^[a-zA-Z\-_0-9]+:/ { \
	helpMessage = match(lastLine, /^# (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")-1); \
			helpMessage = substr(lastLine, RSTART + 2, RLENGTH); \
			printf "\033[1;36m  %-22s\033[0m %s\n", helpCommand,helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)

%:
	@:
