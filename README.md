# Container-Use 実践ガイド

AIエージェント（Claude Code）と安全に作業するためのコンテナ環境ツール [container-use](https://github.com/dagger/container-use) の実践レポートです。

## Container-Use とは

Container-useは、AIエージェントが**独立したコンテナ内で安全に作業**できる環境を提供するツールです。

### 核心的な価値
- **🔒 安全性**: ホストシステムを保護しながらAIに自由な作業環境を提供
- **👀 可視性**: AIの全作業履歴をリアルタイムで追跡可能
- **🌿 Git統合**: 標準的なGitワークフローで作業を管理

### 基本的な仕組み
```
AIエージェント → Container-Use → 独立コンテナ → Git Worktree → マージ
```

## 実際に使ってわかった課題

### 1. ブランチ管理の重要性
**❌ 問題**: 古いブランチから環境を作成 → 大量のマージコンフリクト
```bash
# 危険な例
git checkout old-feature-branch
claude  # ここで環境作成すると古い状態ベース
```

**✅ 解決策**: 必ず最新のmainブランチから作業開始
```bash
git checkout main
git pull origin main
claude  # 最新状態から環境作成
```

### 2. 作業確認の難しさ
**❌ 問題**: `cu diff`の出力が大きすぎて確認困難

**✅ 解決策**: 段階的な確認フロー
```bash
# 1. 概要確認
cu list

# 2. 詳細確認（実際にチェックアウト）
cu checkout <env-id>

# 3. 通常のGitコマンドで詳細確認
git status
git diff
git log --oneline
```

### 3. 環境の使い分け
**学習**: 一つの大きなタスクより、小さなタスクごとに環境を分ける方が管理しやすい

## Difit との連携

### Difitとは
[Difit](https://github.com/yoshiko-pg/difit) は、Git diffをGitHub風のインターフェースで表示する軽量なコマンドラインツールです。主な特徴：
- ゼロ設定で`npx difit <commit>`で起動
- 構文ハイライト付きのdiff表示
- AI対応のコードレビュー機能（各行にコメント追加可能）

### 連携のメリット
Container-useで作成した環境の変更を確認する際、Difitを使用することで：
- **視覚的な確認**: `cu diff`の出力よりも読みやすいGitHub風インターフェース
- **AIレビュー**: diffの各行にコメントを追加し、AIプロンプトとして活用
- **効率的な確認**: ブラウザでの直感的な操作

### 推奨確認フロー
```bash
# 1. Container-use環境をチェックアウト
cu checkout <env-id>

# 2. Difitでdiffを確認
npx difit HEAD~1  # 直前のコミットとの差分
# または
npx difit main    # mainブランチとの差分

# 3. 必要に応じてコメント追加・AI活用
```

## クイックスタート

### 1. インストール
```bash
# macOS
brew install dagger/tap/container-use

# Linux/その他
curl -fsSL https://raw.githubusercontent.com/dagger/container-use/main/install.sh | bash
```

### 2. Claude Codeとの連携
```bash
# MCPサーバー追加
claude mcp add container-use -- container-use stdio

# プロジェクトルール追加（推奨）
curl https://raw.githubusercontent.com/dagger/container-use/main/rules/agent.md >> CLAUDE.md
```

### 3. 基本的な使い方
```bash
# 最新ブランチに移動
git checkout main && git pull

# Claude Codeセッション開始
claude
> "新しい機能を実装してください"

# 作業確認
cu list                    # 環境一覧
cu log <env-id>           # 作業ログ確認
cu checkout <env-id>      # 実際の結果を確認
npx difit main            # Difitで視覚的に確認

# 作業統合
cu merge <env-id>         # mainにマージ
git branch -d cu-<env-id> # ブランチクリーンアップ
```

## 推奨ワークフロー

```mermaid
graph LR
    A[最新main] --> B[Claude作業依頼]
    B --> C[container-use環境作成]
    C --> D[AI作業実行]
    D --> E[cu checkout で確認]
    E --> F[Difitで視覚的確認]
    F --> G{品質OK?}
    G -->|No| D
    G -->|Yes| H[cu merge]
    H --> I[ブランチ削除]
```

## 重要な学び

1. **必ず最新ブランチから開始**: 古いブランチからの作業は避ける
2. **小さな単位で作業**: 大きなタスクは分割して管理
3. **段階的確認**: `cu diff`だけでなく`cu checkout`で実際に確認
4. **視覚的確認**: Difitを活用してdiffを読みやすく表示
5. **適切なクリーンアップ**: マージ後は必ずブランチを削除

## 参考リンク

- [Container-Use GitHub](https://github.com/dagger/container-use)
- [Difit GitHub](https://github.com/yoshiko-pg/difit)
- [公式ドキュメント](https://container-use.com/quickstart)
- [Dagger Discord](https://discord.gg/dagger-io) (#container-useチャンネル)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

> **注意**: Container-useは現在実験的段階にあります。プロダクション使用前に十分なテストを行ってください。