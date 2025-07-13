# 📖 詳細セットアップ

container-useの詳細なインストールと設定手順を説明します。

## 📋 目次
- [前提条件](#前提条件)
- [インストール方法](#インストール方法)
- [Claude Code連携](#claude-code連携)
- [その他エージェント設定](#その他エージェント設定)
- [初期設定確認](#初期設定確認)

## 🔧 前提条件

以下がインストールされていることを確認してください：

### 必須要件
- **Docker**: コンテナ実行環境
- **Git**: バージョン管理システム
- **MCP互換エージェント**: Claude Code、Cursor、Gooseなど

### 推奨環境
- **macOS**: 最も安定した動作を提供
- **Linux**: Ubuntu 20.04以降
- **Windows**: WSL2環境での使用を推奨

## ⚡ インストール方法

### macOS（推奨）
```bash
brew install dagger/tap/container-use
```

### その他のプラットフォーム
```bash
curl -fsSL https://raw.githubusercontent.com/dagger/container-use/main/install.sh | bash
```

### インストール確認
```bash
container-use --version
# または
cu --version
```

## 🤖 Claude Code連携

### 1. MCPサーバーとして追加
```bash
claude mcp add container-use -- container-use stdio
```

### 2. エージェント用ルールを追加（強く推奨）
```bash
curl https://raw.githubusercontent.com/dagger/container-use/main/rules/agent.md >> CLAUDE.md
```

### 3. 設定確認
```bash
claude mcp list
# container-use が表示されることを確認
```

## 🔧 その他エージェント設定

### Cursor
`~/.cursor/mcp_settings.json` に以下を追加：
```json
{
  "mcpServers": {
    "container-use": {
      "command": "cu",
      "args": ["stdio"],
      "env": [],
      "timeout": 60000
    }
  }
}
```

### Goose
```bash
# Goose設定ファイルに追加
echo 'mcp_servers = ["container-use stdio"]' >> ~/.goose/config.toml
```

### GitHub Copilot
```bash
# GitHub CLI拡張として設定
gh extension install container-use
```

## ✅ 初期設定確認

### 1. Docker動作確認
```bash
docker --version
docker run hello-world
```

### 2. container-use動作確認
```bash
cu list
# 環境一覧が表示される（初期は空）
```

### 3. Claude Codeとの連携確認
```bash
claude
> "container-use環境でテストファイルを作成してください"
```

### 4. 作業確認
```bash
cu list
# 新しい環境が作成されていることを確認

cu log <environment-id>
# エージェントの作業ログを確認
```

## 🚨 トラブルシューティング

### よくある問題

#### Docker権限エラー
```bash
# Dockerグループにユーザーを追加
sudo usermod -aG docker $USER
# 再ログインが必要
```

#### MCPサーバー接続エラー
```bash
# Claude Code設定を再読み込み
claude mcp reload

# 設定を確認
claude mcp list
```

#### container-useコマンドが見つからない
```bash
# パスを確認
which container-use
which cu

# 必要に応じてパスを追加
export PATH=$PATH:/usr/local/bin
```

## ⚙️ 詳細設定

### 環境変数
```bash
# デフォルトタイムアウト設定
export CONTAINER_USE_TIMEOUT=120

# デフォルトベースイメージ
export CONTAINER_USE_BASE_IMAGE=ubuntu:24.04
```

### 設定ファイル
```bash
# ~/.container-use/config.yaml
default_timeout: 120
base_image: ubuntu:24.04
cleanup_on_exit: true
```

詳細な設定オプションについては、[公式ドキュメント](https://container-use.com/quickstart)を参照してください。