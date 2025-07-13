# ⚙️ 技術仕様

container-useの技術的な仕組みと詳細なアーキテクチャを説明します。

## 📋 目次
- [アーキテクチャ概要](#アーキテクチャ概要)
- [MCPサーバーとしての動作](#mcpサーバーとしての動作)
- [Git Worktreeの活用](#git-worktreeの活用)
- [Dockerコンテナ管理](#dockerコンテナ管理)
- [Dagger Engine](#dagger-engine)
- [セキュリティモデル](#セキュリティモデル)

## 🏗️ アーキテクチャ概要

### 基本構成
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Agent     │    │  Container-Use   │    │  Docker Engine  │
│ (Claude Code)   │◄──►│   MCP Server     │◄──►│   + Dagger      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Git Repository  │
                       │   + Worktrees    │
                       └──────────────────┘
```

### 核心概念：Environment
```
Environment = Git Branch (via worktree) + Docker Container + Dagger管理
```

各Environmentは以下の要素で構成されます：
- **独立したGitブランチ** (Git Worktree)
- **分離されたDockerコンテナ**
- **Daggerによる状態管理**
- **MCPプロトコルでの通信**

## 🔗 MCPサーバーとしての動作

### Model Context Protocol (MCP)
container-useは[MCP標準](https://modelcontextprotocol.io/)に準拠したサーバーとして動作します。

#### プロトコル仕様
```json
{
  "protocol": "mcp",
  "version": "1.0",
  "transport": "stdio",
  "capabilities": {
    "tools": [
      "environment_create",
      "environment_list", 
      "environment_run_cmd",
      "environment_file_read",
      "environment_file_write",
      "environment_file_list"
    ]
  }
}
```

#### 通信フロー
```
AI Agent ──JSON-RPC──► Container-Use MCP Server
    │                           │
    │                           ├── Docker API
    │                           ├── Git Commands  
    │                           └── Dagger API
    │
    ◄──────────結果──────────────┘
```

### サポートされるエージェント
- **Claude Code**: `claude mcp add container-use -- container-use stdio`
- **Cursor**: JSON設定でMCPサーバーとして追加
- **Goose**: TOML設定で統合
- **カスタムエージェント**: MCP互換であれば利用可能

## 📂 Git Worktreeの活用

### Git Worktreeとは
Git Worktreeは、同一リポジトリで複数のブランチを同時にチェックアウトできる機能です。

#### 通常のGit vs Git Worktree
```bash
# 通常のGit（1つのブランチのみ）
repo/
├── .git/
├── main-files...

# Git Worktree（複数ブランチ同時）
repo/
├── .git/
├── main-files...
├── worktrees/
│   ├── cu-feature-a/    # ブランチ: cu-feature-a
│   └── cu-feature-b/    # ブランチ: cu-feature-b
```

### container-useでの活用
```bash
# 環境作成時の内部処理
git worktree add ./cu-environments/abc-123 -b cu-abc-123
```

#### メリット
- **同時作業**: 複数ブランチでの並行開発
- **分離**: ブランチ間の完全な分離
- **効率性**: ブランチ切り替えのオーバーヘッドなし
- **一貫性**: 1つのリポジトリでの統一管理

### 内部ディレクトリ構造
```
project-root/
├── .git/                    # メインGitリポジトリ
├── main-branch-files...     # mainブランチの内容
└── .container-use/
    ├── environments/
    │   ├── abc-123/         # Environment abc-123
    │   │   ├── workdir/     # Git worktree
    │   │   └── metadata.json
    │   └── def-456/         # Environment def-456
    └── config.yaml
```

## 🐳 Dockerコンテナ管理

### コンテナライフサイクル
```
1. 環境作成要求 
   ↓
2. Git Worktree作成
   ↓  
3. Dockerコンテナ起動
   ↓
4. ボリュームマウント（worktree → container）
   ↓
5. 作業実行
   ↓
6. 結果の同期（container → worktree → git）
```

### コンテナ仕様
```yaml
# デフォルトコンテナ設定
image: ubuntu:24.04
working_dir: /workdir
volumes:
  - type: bind
    source: ./cu-environments/abc-123/workdir
    target: /workdir
environment:
  - CONTAINER_USE_ENV_ID=abc-123
  - GIT_CONFIG_GLOBAL=/dev/null
networks:
  - container-use-network
security:
  - no-new-privileges: true
  - read-only-root-filesystem: false
```

### ネットワーク分離
```bash
# 専用ネットワークの作成
docker network create container-use-network

# コンテナの分離
docker run --network container-use-network \
  --security-opt no-new-privileges \
  ubuntu:24.04
```

### リソース管理
```yaml
resources:
  limits:
    memory: 2GB
    cpu: "1.0"
  reservations:
    memory: 512MB
    cpu: "0.5"
```

## ⚡ Dagger Engine

### Daggerの役割
Daggerは、container-useにおいて以下の機能を提供します：

#### 1. パイプライン管理
```go
// Dagger パイプライン例（疑似コード）
func CreateEnvironment(ctx context.Context, repoPath string) *Environment {
    return dag.Container().
        From("ubuntu:24.04").
        WithWorkdir("/workdir").
        WithMountedDirectory("/workdir", dag.Host().Directory(repoPath)).
        WithExec([]string{"git", "config", "--global", "user.name", "Container User"})
}
```

#### 2. 状態管理
- **不変性**: 各ステップが不変のアーティファクトを生成
- **キャッシュ**: 重複する操作の効率化
- **依存関係**: ステップ間の依存関係管理

#### 3. 観測可能性
```json
{
  "pipeline_id": "env-abc-123",
  "steps": [
    {
      "name": "container_create",
      "status": "completed",
      "duration_ms": 1250,
      "cache_hit": false
    },
    {
      "name": "git_setup", 
      "status": "completed",
      "duration_ms": 300,
      "cache_hit": true
    }
  ]
}
```

### Dagger API統合
```bash
# Dagger CLIとの連携
dagger call create-environment --repo-path ./project

# GraphQL APIでの操作
query {
  container {
    from(address: "ubuntu:24.04") {
      withWorkdir(path: "/workdir") {
        id
      }
    }
  }
}
```

## 🔐 セキュリティモデル

### 分離レベル

#### 1. プロセス分離
- 各環境は独立したDockerコンテナで実行
- プロセス間の通信は制御されたAPIのみ
- ホストシステムへの直接アクセス不可

#### 2. ファイルシステム分離
```bash
# マウントポイントの制限
/workdir          # 作業ディレクトリ（読み書き）
/tmp              # 一時ファイル（読み書き）
/usr, /bin, /lib  # システムファイル（読み取り専用）
```

#### 3. ネットワーク分離
- 専用Docker networkでの分離
- 外部ネットワークアクセスは制御可能
- コンテナ間通信の制限

#### 4. 権限分離
```yaml
security_opt:
  - no-new-privileges:true
  - apparmor:container-use-profile
user: "1000:1000"  # 非rootユーザー
```

### シークレット管理
```bash
# 環境変数による安全な注入
docker run -e SECRET_KEY_FROM_HOST \
  --tmpfs /tmp/secrets:noexec,nosuid,size=100m \
  container-use-env
```

### 監査とログ
```json
{
  "timestamp": "2024-01-15T10:30:15Z",
  "environment_id": "abc-123", 
  "action": "file_write",
  "target": "/workdir/server.js",
  "user_agent": "claude-code/1.0",
  "success": true,
  "checksum": "sha256:abc123..."
}
```

## 🔄 データフロー

### 完全なライフサイクル
```
1. AI Agent Request
   ├── MCP JSON-RPC Call
   └── "environment_create"

2. Container-Use Processing  
   ├── Git Worktree Creation
   ├── Dagger Pipeline Execution
   └── Docker Container Launch

3. Work Execution
   ├── File Operations
   ├── Command Execution  
   └── Git Operations

4. State Synchronization
   ├── Container → Worktree
   ├── Worktree → Git Branch
   └── Audit Log Generation

5. Response to Agent
   ├── Operation Results
   ├── Environment ID
   └── Access Commands
```

### パフォーマンス最適化
- **イメージキャッシュ**: ベースイメージの再利用
- **レイヤーキャッシュ**: Dockerレイヤーの最適化
- **並行実行**: 複数環境の同時処理
- **増分同期**: 変更分のみの同期

この技術仕様により、container-useは安全で効率的なAIエージェント開発環境を実現しています。