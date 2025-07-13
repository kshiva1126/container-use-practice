# 🤖 AIエージェント向けルール

`curl https://raw.githubusercontent.com/dagger/container-use/main/rules/agent.md >> CLAUDE.md`で追加される重要なルールとベストプラクティスを説明します。

## 📋 目次
- [実際のルール内容](#実際のルール内容)
- [ルールの詳細解説](#ルールの詳細解説)
- [ルールの重要性](#ルールの重要性)
- [ベストプラクティス](#ベストプラクティス)

## 📋 実際のルール内容

CLAUDE.mdに追加される具体的なルール：

```markdown
ALWAYS use ONLY Environments for ANY and ALL file, code, or shell operations—NO EXCEPTIONS—even for simple or generic requests.

DO NOT install or use the git cli with the environment_run_cmd tool. All environment tools will handle git operations for you. Changing ".git" yourself will compromise the integrity of your environment.

You MUST inform the user how to view your work using `container-use log <env_id>` AND `container-use checkout <env_id>`. Failure to do this will make your work inaccessible to others.
```

## 🔍 ルールの詳細解説

### 1. **環境の厳格な使用（最重要）**
```
ALWAYS use ONLY Environments for ANY and ALL file, code, or shell operations—NO EXCEPTIONS
```

#### 意味
- **すべて**のファイル操作、コード編集、シェルコマンドは**例外なく環境内でのみ**実行
- 「簡単な」「一般的な」リクエストでも必ず環境を使用
- ホストシステムで直接作業することは絶対禁止

#### 具体例
```bash
# ❌ 禁止：ホストで直接実行
echo "Hello World" > test.txt

# ✅ 正しい：環境内で実行
# エージェントが環境を作成してから実行
```

### 2. **Git CLI使用の禁止**
```
DO NOT install or use the git cli with the environment_run_cmd tool
```

#### 意味
- Git CLIを直接インストールまたは使用することは禁止
- すべてのGit操作は環境ツールが自動処理
- `.git`ディレクトリを手動で変更すると環境の整合性が損なわれる

#### 理由
- 環境ツールがGit状態とコンテナ状態を自動同期
- 手動Git操作は同期を破壊する可能性
- 作業の追跡可能性を保証

### 3. **作業可視性の義務（必須）**
```
You MUST inform the user how to view your work using `container-use log <env_id>` AND `container-use checkout <env_id>`
```

#### 意味
- 作業完了時に**必ず**以下の2つのコマンドを伝える義務
  - `container-use log <env_id>` - 作業ログ確認
  - `container-use checkout <env_id>` - 作業内容の取り込み
- この情報提供を怠ると、他の人が作業にアクセスできなくなる

#### 具体例
```bash
# エージェントが必ず伝えるべき内容
作業が完了しました。以下のコマンドで確認できます：
- container-use log abc-123
- container-use checkout abc-123
```

## ⚠️ ルールの重要性

### 安全性確保
- **ホストシステム保護**: 危険なコマンドもコンテナ内で完結
- **分離環境**: 複数エージェントが干渉することなく並行作業
- **予期しない副作用の防止**: システム全体への影響を排除

### 作業の追跡性
- **完全な監査ログ**: すべての操作が記録される
- **再現可能性**: 作業内容の完全な復元が可能
- **デバッグ支援**: 問題発生時の原因特定が容易

### チーム協調
- **作業の共有**: 他の開発者が内容を確認・継続可能
- **透明性**: 何が行われたかが明確
- **継続性**: 作業を他の人に引き継ぎ可能

### 環境整合性
- **Git状態の同期**: コンテナとGit状態が常に一致
- **データの整合性**: 作業内容の破損を防止
- **信頼性**: 一貫した動作を保証

## 💡 ベストプラクティス

### エージェント利用者向け

#### 環境の効率的な利用
```bash
# 新しい作業開始前
cu list                    # 既存環境確認
cu merge <old-env-id>      # 完了した作業をマージ
git branch -d cu-<old-env-id>  # 古いブランチ削除

# 新しいセッション開始
claude
```

#### コミュニケーション
- **明確な指示**: エージェントに具体的なタスクを依頼
- **定期的な確認**: 長時間の作業中は進捗を確認
- **エラー報告**: 問題発生時は詳細を確認

#### エラーハンドリング
```bash
# エージェントが応答しない場合
cu terminal <env-id>       # 直接環境に接続
cu log <env-id>           # ログで状況確認

# 環境をリセットしたい場合
# 新しいセッションで再開（古い環境は自動削除される）
```

### 開発者向けチェックリスト

作業開始前：
- [ ] container-useが正しくセットアップされている
- [ ] CLAUDE.mdにエージェントルールが追加されている
- [ ] 最新のブランチ状態を確認済み

作業完了後：
- [ ] `cu log <env-id>`で作業内容を確認
- [ ] `cu diff <env-id>`で変更差分を確認
- [ ] `cu checkout <env-id>`で詳細確認（必要に応じて）
- [ ] `cu merge <env-id>`で作業を統合
- [ ] `git branch -d cu-<env-id>`でブランチクリーンアップ

### 注意事項

#### ルール違反の影響
- **環境の破損**: Git状態の不整合
- **作業の消失**: 追跡不可能な変更
- **セキュリティリスク**: ホストシステムへの予期しない影響

#### 対処法
- **再セットアップ**: ルールを再度CLAUDE.mdに追加
- **エージェント再教育**: 正しい使用方法を再指示
- **環境の再作成**: 破損した環境の作り直し

このルールに従うことで、container-useの安全性と効率性を最大限に活用できます。