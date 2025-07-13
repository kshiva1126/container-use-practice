# Container Use Practice

🚀 [Dagger container-use](https://github.com/dagger/container-use)を使用したAIエージェント開発環境の実践サンプルプロジェクトです。

## 📋 目次
- [概要](#概要)
- [クイックスタート](#クイックスタート)
- [ドキュメント](#ドキュメント)
- [参考リンク](#参考リンク)

## 🚀 概要

container-useは、AIエージェント（Claude Code、Cursorなど）が**安全かつ独立**して作業できるコンテナ環境を提供するツールです。

### 主な特徴
- 🔒 **分離された環境**: 各エージェントが独自のコンテナで安全に作業
- 👀 **リアルタイム追跡**: エージェントの完全な作業履歴を監視
- 🎮 **標準Git管理**: 通常のGitワークフローで作業を管理
- 🌎 **汎用性**: あらゆるMCP互換エージェントと連携可能

### 安全性のメリット
従来の危険性 → container-useによる解決
- ❌ システム破壊の危険 → ✅ コンテナ内で完全分離
- ❌ 重要ファイルの誤削除 → ✅ ホストシステムは保護
- ❌ 複数エージェントの干渉 → ✅ 独立した環境で並行作業

## ⚡ クイックスタート

### 1. インストール
```bash
# macOS
brew install dagger/tap/container-use

# その他のプラットフォーム
curl -fsSL https://raw.githubusercontent.com/dagger/container-use/main/install.sh | bash
```

### 2. Claude Codeとの連携
```bash
# MCPサーバーとして追加
claude mcp add container-use -- container-use stdio

# エージェント用ルールを追加（推奨）
curl https://raw.githubusercontent.com/dagger/container-use/main/rules/agent.md >> CLAUDE.md
```

### 3. 基本的な使用方法
```bash
# Claude Codeセッション開始
claude
> "Node.jsプロジェクトを作成してください"

# 作業確認
cu list                    # 環境一覧
cu log <environment-id>    # 作業ログ
cu diff <environment-id>   # 変更差分

# 作業統合
cu merge <environment-id>          # マージ
git branch -d cu-<environment-id>  # クリーンアップ
```

> 💡 **重要**: 新しい作業は必ず最新ブランチから開始し、マージ後はブランチを削除してください

## 📚 ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [📖 詳細セットアップ](docs/setup.md) | インストール詳細、各種エージェント設定 |
| [🤖 AIエージェント向けルール](docs/agent-rules.md) | CLAUDE.mdルール、ベストプラクティス |
| [🌿 ブランチ管理](docs/branch-management.md) | 実体験ベースの課題と対策、ワークフロー |
| [💻 コマンドリファレンス](docs/commands.md) | 全コマンド詳細、使用例 |
| [🎬 実際の動作デモ](docs/demo.md) | スクリーンショット付きデモンストレーション |
| [🛠️ トラブルシューティング](docs/troubleshooting.md) | よくある問題と解決方法 |
| [⚙️ 技術仕様](docs/technical.md) | MCP、Git Worktree、Dockerの詳細 |

## 🔄 基本ワークフロー

```
🚀 セッション開始 → 🤖 作業依頼 → 👀 確認 → ✅ マージ → 🧹 クリーンアップ
```

## 📊 実際の使用体験から

> ⚠️ **課題**: 古いブランチからの作業 → 大量のコンフリクト発生  
> ✅ **解決**: 必ず最新ブランチから環境作成

> ⚠️ **課題**: `cu diff`の出力が見づらい  
> ✅ **解決**: `cu checkout`後に段階的に確認

詳細は [ブランチ管理ベストプラクティス](docs/branch-management.md) を参照

## 🔗 参考リンク

- [Dagger container-use GitHub](https://github.com/dagger/container-use)
- [公式ドキュメント](https://container-use.com/quickstart)
- [Discord コミュニティ](https://discord.gg/dagger-io)
- [Dagger 公式サイト](https://dagger.io/)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)

---

## 🚨 重要な注意事項

- container-useは現在**実験的な段階**にあり、仕様が変更される可能性があります
- プロダクション環境での使用前に十分なテストを行ってください
- サポートが必要な場合は[Discord](https://discord.gg/dagger-io)の#container-useチャンネルをご利用ください

## 📄 ライセンス

このサンプルプロジェクトは学習・実践用途のものです。