# Container Use Practice

このリポジトリは、[Dagger container-use](https://github.com/dagger/container-use)を使用したAIエージェント開発環境の実践サンプルプロジェクトです。

## container-useとは

container-useは、AIエージェント（Claude Code、Cursorなど）が安全かつ独立して作業できるコンテナ環境を提供するツールです。

### 主な特徴

- 🔒 **分離された環境**: 各エージェントは独自のコンテナで作業
- 👀 **リアルタイムの可視性**: エージェントの完全な作業履歴を追跡
- 🚁 **直接介入**: エージェントの状態を確認し、必要に応じて制御可能
- 🎮 **環境コントロール**: 標準の Git ワークフローで作業を管理
- 🌎 **汎用性**: あらゆるエージェント、モデル、インフラストラクチャと互換

### 安全性

従来のAIエージェントは直接ホストシステムで実行されるため、以下のようなリスクがありました：

- ❌ `rm -rf /` などの危険なコマンドによるシステム破壊
- ❌ 重要なファイルの意図しない削除や変更
- ❌ 複数のエージェントが同時作業時の干渉

container-useを使用することで：

- ✅ コンテナ内で実行されるため、ホストシステムは保護される
- ✅ 危険なコマンドを実行してもコンテナ内のみで完結
- ✅ 各エージェントが独立した環境で安全に作業可能

## セットアップ

### 前提条件

以下がインストールされていることを確認してください：

- Docker
- Git
- Claude Code（または他のMCP互換エージェント）

### インストール

#### macOS（推奨）

```bash
brew install dagger/tap/container-use
```

#### その他のプラットフォーム

```bash
curl -fsSL https://raw.githubusercontent.com/dagger/container-use/main/install.sh | bash
```

### Claude Codeとの連携設定

1. Claude CodeにMCPサーバーとして追加：

```bash
claude mcp add container-use -- container-use stdio
```

2. エージェント用ルールを追加（オプション）：

```bash
curl https://raw.githubusercontent.com/dagger/container-use/main/rules/agent.md >> CLAUDE.md
```

## 使用方法

### 基本的な使用方法

1. **新しいClaude Codeセッション開始**：
   ```bash
   claude
   ```

2. **container-use環境でのプロジェクト作業**：
   - Claude Codeが自動的にコンテナ環境内で実行される
   - 通常通りコーディング作業を行う
   - すべての変更はコンテナ内で安全に実行される

3. **作業結果の確認**：
   - Git履歴で変更を追跡
   - 必要に応じてホストシステムにマージ

## AIエージェントコーディングの流れ

container-useを利用したAIエージェント開発の典型的なワークフローは以下の通りです：

### 1. AIエージェントによる環境作成・開発フェーズ

```bash
# Claude Codeセッション開始
claude

# エージェントに開発タスクを依頼
# 例：「Node.jsでWebアプリを作成してください」
```

**エージェント側での処理**：
1. **環境作成**: container-use環境を自動作成
2. **依存関係セットアップ**: 必要なツール・ライブラリをインストール
3. **コード開発**: ファイル作成・編集・テストを実行
4. **作業コミット**: 全ての変更を自動的にGitコミット

### 2. 作業確認・検証フェーズ

```bash
# 環境一覧確認
cu list
# または container-use list

# 作業ログ確認（何をしたかの詳細）
cu log <environment-id>

# 変更差分確認
cu diff <environment-id>

# 実際のファイルを確認したい場合
cu checkout <environment-id>
```

### 3. 作業統合フェーズ

#### パターンA: 直接マージ（推奨）
```bash
# mainブランチに作業を統合
cu merge <environment-id>

# 確認
git log --oneline -5
```

#### パターンB: レビュー後マージ
```bash
# 専用ブランチで確認
cu checkout <environment-id>

# ファイル内容を確認・テスト
npm test
npm run build

# 問題なければmainにマージ
git checkout main
git merge cu-<environment-id>
```

### 4. 継続開発・反復フェーズ

```bash
# 新しい機能追加やバグ修正を依頼
claude

# 既存環境での続行も可能
cu terminal <environment-id>  # 直接コンテナ操作
```

### メリット

- ✅ **安全性**: ホストシステムに影響なし
- ✅ **追跡可能**: 全ての作業がGit履歴で管理
- ✅ **再現性**: 環境が完全に分離・記録
- ✅ **効率性**: エージェントが最適な環境を自動構築
- ✅ **柔軟性**: 必要に応じて人間が介入・修正可能

## 注意事項

- container-useは現在実験的な段階にあり、仕様が変更される可能性があります
- 詳細なドキュメントは[公式サイト](https://container-use.com/quickstart)を参照してください
- サポートが必要な場合は[Discord](https://discord.gg/dagger-io)の#container-useチャンネルをご利用ください

## 参考リンク

- [Dagger container-use GitHub](https://github.com/dagger/container-use)
- [公式ドキュメント](https://container-use.com/quickstart)
- [Discord コミュニティ](https://discord.gg/dagger-io)

## ライセンス

このサンプルプロジェクトは学習・実践用途のものです。