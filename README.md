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

## AIエージェント向けルール（CLAUDE.mdに追加される内容）

`curl https://raw.githubusercontent.com/dagger/container-use/main/rules/agent.md >> CLAUDE.md`コマンドで追加される具体的なルール：

### 📋 実際のルール内容

```markdown
ALWAYS use ONLY Environments for ANY and ALL file, code, or shell operations—NO EXCEPTIONS—even for simple or generic requests.

DO NOT install or use the git cli with the environment_run_cmd tool. All environment tools will handle git operations for you. Changing ".git" yourself will compromise the integrity of your environment.

You MUST inform the user how to view your work using `container-use log <env_id>` AND `container-use checkout <env_id>`. Failure to do this will make your work inaccessible to others.
```

### 🔍 ルールの詳細解説

#### 1. **環境の厳格な使用（最重要）**
```
ALWAYS use ONLY Environments for ANY and ALL file, code, or shell operations—NO EXCEPTIONS
```
- **すべて**のファイル操作、コード編集、シェルコマンドは**例外なく環境内でのみ**実行
- 「簡単な」「一般的な」リクエストでも必ず環境を使用
- ホストシステムで直接作業することは絶対禁止

#### 2. **Git CLI使用の禁止**
```
DO NOT install or use the git cli with the environment_run_cmd tool
```
- Git CLIを直接インストールまたは使用することは禁止
- すべてのGit操作は環境ツールが自動処理
- `.git`ディレクトリを手動で変更すると環境の整合性が損なわれる

#### 3. **作業可視性の義務（必須）**
```
You MUST inform the user how to view your work using `container-use log <env_id>` AND `container-use checkout <env_id>`
```
- 作業完了時に**必ず**以下の2つのコマンドを伝える義務
  - `container-use log <env_id>` - 作業ログ確認
  - `container-use checkout <env_id>` - 作業内容の取り込み
- この情報提供を怠ると、他の人が作業にアクセスできなくなる

### ⚠️ これらのルールの重要性

- **安全性確保**: ホストシステムを危険から保護
- **作業の追跡**: すべての変更が記録され、監査可能
- **チーム協調**: 他の開発者が作業内容を確認・継続可能
- **環境整合性**: Git状態とコンテナ状態の同期維持

## 🌿 ブランチ管理のベストプラクティス

### **⚠️ 重要: 最新の作業ブランチからの環境作成を徹底**

container-useで新しい作業を開始する際は、**必ず最新の作業ブランチから環境を作成**してください。古いブランチから作業を開始すると、マージ時に競合や不整合が発生する可能性があります。

#### **❌ 避けるべきパターン**
```bash
# 古い環境でさらに作業を続ける（危険）
cu terminal old-environment-id  # 古いブランチ状態

# 新しい作業を依頼
claude
> "新機能を追加してください"  # ← 古いブランチベースで作業される
```

#### **✅ 推奨パターン**
```bash
# 1. 現在の作業があれば完了・マージ
cu merge current-environment-id

# 2. 作業ブランチが最新であることを確認
git checkout main
git pull origin main  # または適切なベースブランチ

# 3. 新しいセッションで新しい作業を開始
claude
> "新機能を追加してください"  # ← 最新のブランチベースで作業される
```

### **🔄 安全なワークフロー**

#### **新しい作業を開始する前のチェックリスト**
- [ ] 進行中の作業が完了している（`cu list`で確認）
- [ ] 完了した作業がマージ済み（`cu merge <env-id>`）
- [ ] ベースブランチ（main等）が最新（`git pull origin main`）
- [ ] 新しいClaude Codeセッションで作業開始

#### **マージ前の確認事項**
```bash
# 1. 環境の変更内容を確認
cu diff <environment-id>

# 2. ベースブランチとの差分を確認
cu checkout <environment-id>
git log main..HEAD --oneline  # 追加されるコミットを確認

# 3. 問題なければマージ
git checkout main  # または適切なターゲットブランチ
cu merge <environment-id>
```

#### **⭐ マージ後のクリーンアップ（重要）**
```bash
# マージが完了した後、cuブランチを削除
git branch -d cu-<environment-id>

# 理由：
# - 古いブランチの残存を防ぐ
# - 次回の新しい作業が常に最新状態から開始される
# - ブランチの混乱や競合を防止
```

### **🚨 トラブル回避のための注意点**

#### **1. 複数環境の並行作業**
```bash
# 複数の環境が存在する場合
cu list

# 各環境の状態を確認
cu log env-1
cu log env-2

# マージ順序を計画（依存関係を考慮）
cu merge env-1  # 基盤機能から先にマージ
git branch -d cu-env-1  # マージ後に削除

cu merge env-2  # 依存する機能を後でマージ
git branch -d cu-env-2  # マージ後に削除
```

#### **2. 競合が発生した場合**
```bash
# マージで競合が発生した場合
cu checkout <environment-id>

# 手動で競合を解決
git status
git add .
git commit -m "Resolve merge conflicts"

# ターゲットブランチにマージ
git checkout main  # または適切なターゲットブランチ
git merge cu-<environment-id>

# マージ完了後にブランチ削除
git branch -d cu-<environment-id>
```

#### **3. ブランチクリーンアップの自動化**
```bash
# 不要になったcuブランチの一括削除
git branch | grep "cu-" | xargs git branch -d

# または、マージ済みブランチの削除
git branch --merged | grep "cu-" | xargs git branch -d
```

### **📊 ブランチ管理の可視化**

```
main ─┬─ cu-feature-a (Environment A) ─┐
      │                                ├─ merge → delete cu-feature-a
      ├─ cu-feature-b (Environment B) ─┘          delete cu-feature-b
      │
      └─ cu-new-feature (Environment C) ← 最新のmain状態から作成
```

### **🔧 ブランチクリーンアップのメリット**

#### **✅ 得られる効果**
- **常に最新状態**: 新しい作業が必ず最新のブランチから開始
- **競合の回避**: 古いブランチによるマージ競合を防止
- **リポジトリの整理**: 不要なブランチによる混乱を排除
- **作業効率向上**: ブランチ管理の複雑さを軽減

#### **📝 推奨ワークフロー**
```bash
# 1. 作業開始
claude
> "新機能を実装してください"

# 2. 作業完了後の確認
cu diff <env-id>
cu log <env-id>

# 3. マージとクリーンアップ
cu merge <env-id>
git branch -d cu-<env-id>  # ← これが重要！

# 4. 次の作業は常に最新状態から
claude
> "次の機能を実装してください"  # 最新のmainから開始
```

### **⚡ 自動化のためのエイリアス設定**

```bash
# ~/.gitconfig または ~/.zshrc に追加
alias cu-merge-clean='env_id=$1 && cu merge $env_id && git branch -d cu-$env_id'

# 使用例
cu-merge-clean environment-id  # マージと削除を一度に実行
```

この管理方法により：
- ✅ 各環境が最新のコードベースで作業
- ✅ マージ競合の最小化
- ✅ 作業履歴の明確化
- ✅ チーム開発での混乱防止
- ✅ **常に最新状態からの作業開始**

### **🎯 ブランチ戦略別の考慮事項**

#### **1. main直接開発の場合**
```bash
# mainブランチで直接開発
git checkout main
git pull origin main
claude  # 最新のmainから環境作成

# マージ後
cu merge <env-id>
git branch -d cu-<env-id>  # クリーンアップ
```

#### **2. feature ブランチ開発の場合**
```bash
# feature ブランチでの開発
git checkout feature/user-management
git pull origin feature/user-management
claude  # 最新のfeatureブランチから環境作成

# マージ後
cu merge <env-id>
git branch -d cu-<env-id>  # クリーンアップ
```

#### **3. 複数ブランチ統合の場合**
```bash
# 複数のfeatureブランチをmainに統合
git checkout main
git pull origin main
git merge feature/feature-a
git merge feature/feature-b
claude  # 統合後の最新状態から環境作成

# マージ後
cu merge <env-id>
git branch -d cu-<env-id>  # クリーンアップ
```

## 実際の動作デモンストレーション

このセクションでは、実際のスクリーンショットを使ってcontainer-useの動作を紹介します。

### 1. Claude Codeセッションの開始

![Claude Code Session Start](./images/01-claude-session-start.png)

`claude` コマンドでセッションを開始し、container-useが自動的に利用可能になります。

### 2. 開発タスクの依頼

開発者がAIエージェントに具体的なタスクを依頼します：

```
sample-project ディレクトリにあるExpress.jsアプリに以下の機能を追加してください：

1. /users エンドポイントでユーザーのCRUD操作
2. メモリ内でのデータ管理
3. 入力値のバリデーション
4. エラーハンドリング
5. 簡単なテストの追加
```

### 3. 環境作成とコンテナでの開発

![Environment Creation](./images/02-environment-creation.png)

AIエージェントが自動的にcontainer-use環境を作成し、コンテナ内で開発を開始します。

![Development in Progress](./images/03-development-in-progress.png)

エージェントがコンテナ内でファイルの編集、パッケージのインストール、テストの実行などを行います。

### 4. 環境一覧の確認

![Container Use List Command](./images/04-cu-list-command.png)

`cu list` コマンドで現在の環境一覧を確認できます。

### 5. 作業ログの確認

![Container Use Log Command](./images/05-cu-log-command.png)

`cu log <environment-id>` コマンドでエージェントが実際に実行したコマンド履歴を詳細に確認できます。

### 6. 変更差分の確認

![Container Use Diff Command](./images/06-cu-diff-command.png)

`cu diff <environment-id>` コマンドで具体的にどのファイルがどのように変更されたかを確認できます。

### 7. 作業内容のチェックアウト

![Container Use Checkout Command](./images/07-cu-checkout-command.png)

`cu checkout <environment-id>` コマンドで環境の作業をローカルに取り込み、実際のファイルを確認できます。

### 8. 完成したアプリケーション

![Final Result](./images/08-final-result.png)

AIエージェントによって実装されたアプリケーションが正常に動作している様子です。

### デモで使用したサンプルプロジェクト

このデモンストレーションで使用したサンプルプロジェクトは `sample-project/` ディレクトリにあります：

- **初期状態**: 基本的なExpress.jsサーバー
- **完成状態**: CRUD API、バリデーション、テスト付きの完全なアプリケーション

詳細は [sample-project/README.md](./sample-project/README.md) を参照してください。

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

2. **エージェント用ルールを追加（強く推奨）**：

```bash
curl https://raw.githubusercontent.com/dagger/container-use/main/rules/agent.md >> CLAUDE.md
```

**このルール追加により実現される効果**：
- ✅ AIエージェントが適切にcontainer-use環境を利用
- ✅ Git操作の安全性確保（直接操作の防止）
- ✅ 作業の可視性と追跡可能性向上
- ✅ 環境の整合性維持
- ✅ チーム開発での作業共有の確実性

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

# マージ後のクリーンアップ
git branch -d cu-<environment-id>

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

# マージ後のクリーンアップ
git branch -d cu-<environment-id>
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
git branch -d cu-frontend-env-id

cu merge backend-env-id
git branch -d cu-backend-env-id
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
git branch -d cu-<environment-id>  # クリーンアップ
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