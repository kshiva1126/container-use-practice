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

## 技術的な仕組み

### MCPサーバーとしての動作

container-useは**Model Context Protocol（MCP）サーバー**として動作し、AIエージェントにコンテナ化された開発環境を提供します：

- `container-use stdio`コマンドでエージェントと通信
- Claude Code、Cursor、Goose、GitHub Copilotなど任意のMCP互換エージェントで利用可能
- エージェントからの要求に応じて動的に環境を作成・管理

### Environment = Git Worktree + Dockerコンテナ + Dagger

```
Environment = Git Branch (via worktree) + Docker Container + Dagger管理
```

**各コンポーネントの役割**：

1. **Git Worktree**: 
   - 同一リポジトリで複数のブランチを同時にチェックアウト
   - 各エージェントが独立したブランチで作業
   - 標準的なGitワークフローで作業を管理

2. **Docker Container**:
   - 完全に分離された実行環境
   - 依存関係の競合やシステム干渉を防止
   - カスタマイズ可能な開発環境

3. **Dagger Engine**:
   - コンテナのライフサイクル管理
   - Git状態とコンテナ状態の自動同期
   - 不変的な（immutable）アーティファクトとして作業結果を保存

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

### その他のエージェント設定例

#### Cursor
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

## 詳細なコマンドリファレンス

### 環境管理コマンド

```bash
# 環境一覧表示
cu list
container-use list

# 作業ログ確認（コマンド履歴含む）
cu log <environment-id>

# 変更差分確認
cu diff <environment-id>

# 環境の作業をローカルに取り込み
cu checkout <environment-id>

# 作業をmainブランチにマージ（コミット履歴保持）
cu merge <environment-id>

# 変更をステージング（手動コミット用）
cu apply <environment-id>

# 環境のターミナルに直接接続
cu terminal <environment-id>
```

**注意**: `cu`は`container-use`の短縮形で、同じ機能を提供します。

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

## 実践的なワークフロー例

### 並行開発シナリオ

```bash
# セッション1: フロントエンド開発
claude
> "React コンポーネントを作成してください"
# → Environment A (ブランチ: cu-frontend-work)

# セッション2: バックエンド開発  
claude
> "API エンドポイントを追加してください"
# → Environment B (ブランチ: cu-backend-work)

# 両方の作業を並行して確認・マージ可能
cu merge frontend-env-id
cu merge backend-env-id
```

### 実験的開発シナリオ

```bash
# 新しいアプローチを試す
claude
> "新しいアーキテクチャでリファクタリングしてください"

# 結果が気に入らない場合
cu list  # environment-id確認
# 単純に環境を破棄（何も影響なし）

# 結果が良い場合
cu merge <environment-id>  # 安全にマージ
```

## セキュリティとシークレット管理

### シークレットの安全な管理

container-useは以下の方法でシークレットを安全に管理します：

- **環境変数として注入**: APIキーやトークンを安全に環境に提供
- **コンテナ分離**: シークレットは各環境に隔離され、他の環境からアクセス不可
- **一時的な存在**: 環境削除時にシークレットも自動的に削除

### ネットワークとリソース制御

- **ネットワーク分離**: コンテナ間の通信を制御
- **リソース制限**: CPU/メモリ使用量の制限設定
- **ファイルシステム分離**: ホストシステムへの不正アクセスを防止

## トラブルシューティング

### よくある問題と対処法

#### エージェントがスタックした場合
```bash
# 環境に直接接続して状況確認
cu terminal <environment-id>

# 必要に応じて手動で修正
# プロセス確認、ログ確認、手動コマンド実行など
```

#### 依存関係の競合
container-useでは各環境が完全に分離されているため、依存関係の競合は発生しません。異なるバージョンのツールやライブラリを同時に使用可能です。

#### 作業の復旧
```bash
# Git履歴で全ての変更が追跡されているため
cu log <environment-id>  # 何が行われたかを確認
cu diff <environment-id>  # 変更内容を確認
cu checkout <environment-id>  # 必要に応じて作業を復元
```

### パフォーマンスの最適化

- **コンテナイメージの最適化**: 必要最小限の依存関係のみを含める
- **ボリュームマウント**: 大きなデータセットの効率的な共有
- **並行実行**: 複数の環境を同時に実行してもリソース使用量を制御

### メリット

- ✅ **安全性**: ホストシステムに影響なし
- ✅ **追跡可能**: 全ての作業がGit履歴で管理
- ✅ **再現性**: 環境が完全に分離・記録
- ✅ **効率性**: エージェントが最適な環境を自動構築
- ✅ **柔軟性**: 必要に応じて人間が介入・修正可能
- ✅ **並行性**: 複数のエージェントが同時に異なる作業を実行可能
- ✅ **実験性**: リスクなしで新しいアプローチを試行可能

## 開発状況と今後の展望

### 現在の状況

container-useは現在**実験的な段階**にあり、以下の特徴があります：

- 急速な開発とイテレーション
- コミュニティフィードバックに基づく機能改善
- 破壊的変更の可能性（バージョン1.0まで）

### 対応予定の機能

- より多くのエージェントとの統合
- 高度なセキュリティ機能
- パフォーマンスの最適化
- エンタープライズ向け機能

## 注意事項

- container-useは現在実験的な段階にあり、仕様が変更される可能性があります
- プロダクション環境での使用前に十分なテストを行ってください
- 詳細なドキュメントは[公式サイト](https://container-use.com/quickstart)を参照してください
- サポートが必要な場合は[Discord](https://discord.gg/dagger-io)の#container-useチャンネルをご利用ください

## 参考リンク

- [Dagger container-use GitHub](https://github.com/dagger/container-use)
- [公式ドキュメント](https://container-use.com/quickstart)
- [Discord コミュニティ](https://discord.gg/dagger-io)
- [Dagger 公式サイト](https://dagger.io/)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)

## ライセンス

このサンプルプロジェクトは学習・実践用途のものです。