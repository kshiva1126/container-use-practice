# 💻 コマンドリファレンス

container-use（cu）の全コマンドの詳細な使用方法と実例を説明します。

## 📋 目次
- [基本コマンド](#基本コマンド)
- [環境管理](#環境管理)
- [作業確認](#作業確認)
- [統合・マージ](#統合マージ)
- [高度な使用方法](#高度な使用方法)

## ⚡ 基本コマンド

### `cu` vs `container-use`
```bash
# 短縮形（推奨）
cu list

# 完全形（同じ機能）
container-use list
```
> 💡 `cu`は`container-use`の短縮形で、全く同じ機能を提供します

### バージョン確認
```bash
cu --version
cu -v
```

### ヘルプ表示
```bash
cu --help
cu -h
cu <command> --help  # 特定コマンドのヘルプ
```

## 🏗️ 環境管理

### `cu list` - 環境一覧表示
```bash
# 全環境の表示
cu list

# 出力例
Environment ID    Status     Created        Branch
abc-123          active     2 hours ago    cu-feature-work
def-456          idle       1 day ago      cu-bugfix
```

#### オプション
```bash
cu list --active    # アクティブな環境のみ
cu list --all       # 全ての環境（削除済み含む）
cu list --json      # JSON形式で出力
```

### `cu create` - 環境の手動作成
```bash
# 基本的な作成
cu create

# 特定のベースイメージで作成
cu create --image ubuntu:22.04

# 名前を指定して作成
cu create --name my-environment
```

> 📝 通常はAIエージェントが自動作成するため、手動作成は稀

## 🔍 作業確認

### `cu log` - 作業ログ確認
```bash
# 基本的な使用方法
cu log <environment-id>

# 詳細ログ
cu log <environment-id> --verbose

# 最新N件のログ
cu log <environment-id> --tail 50

# リアルタイムでログ監視
cu log <environment-id> --follow
```

#### 出力例
```bash
cu log abc-123

# 出力
2024-01-15 10:30:15 | COMMAND | npm install express
2024-01-15 10:30:45 | FILE    | Created: server.js
2024-01-15 10:31:20 | COMMAND | npm test
2024-01-15 10:31:30 | COMMIT  | Add express server implementation
```

### `cu diff` - 変更差分確認
```bash
# 基本的な差分表示
cu diff <environment-id>

# ファイル名のみ表示
cu diff <environment-id> --name-only

# 統計情報表示
cu diff <environment-id> --stat

# 特定ファイルの差分
cu diff <environment-id> -- path/to/file.js
```

#### 出力例
```bash
cu diff abc-123 --stat

# 出力
 server.js     | 45 +++++++++++++++++++++++++++++++++++++++
 package.json  |  3 +++
 README.md     | 12 ++++++++++++
 3 files changed, 60 insertions(+)
```

### `cu checkout` - 作業内容の取り込み
```bash
# 環境の作業をローカルに取り込み
cu checkout <environment-id>

# 特定のディレクトリのみ取り込み
cu checkout <environment-id> -- src/

# 強制上書き
cu checkout <environment-id> --force
```

#### 使用例
```bash
# 詳細確認のためのワークフロー
cu diff abc-123           # 概要確認
cu checkout abc-123       # 詳細確認用に取り込み
git status               # ローカルでの確認
git diff                 # より詳細な差分確認
```

## 🔄 統合・マージ

### `cu merge` - 作業のマージ
```bash
# mainブランチにマージ
cu merge <environment-id>

# 特定のブランチにマージ
cu merge <environment-id> --target feature-branch

# メッセージ指定
cu merge <environment-id> --message "Add new feature"

# マージ前の確認
cu merge <environment-id> --dry-run
```

#### 推奨ワークフロー
```bash
# 1. 事前確認
cu diff abc-123
cu log abc-123

# 2. マージ実行
cu merge abc-123

# 3. クリーンアップ
git branch -d cu-abc-123
```

### `cu apply` - 変更のステージング
```bash
# 変更をステージングエリアに追加（コミットしない）
cu apply <environment-id>

# 手動でコミット
git commit -m "Custom commit message"
```

## 🛠️ 高度な使用方法

### `cu terminal` - 環境への直接接続
```bash
# 環境のシェルに接続
cu terminal <environment-id>

# 特定のシェルで接続
cu terminal <environment-id> --shell bash

# コマンド実行後に終了
cu terminal <environment-id> --command "npm test"
```

#### 使用例
```bash
# エージェントがスタックした場合のデバッグ
cu terminal abc-123
# → 環境内で直接デバッグ作業
```

### `cu exec` - 環境でコマンド実行
```bash
# 環境で単発コマンド実行
cu exec <environment-id> "ls -la"

# 複数コマンド実行
cu exec <environment-id> "npm install && npm test"

# バックグラウンド実行
cu exec <environment-id> "npm start" --detach
```

### `cu cp` - ファイルのコピー
```bash
# ホストから環境へ
cu cp local-file.txt <environment-id>:/path/in/container/

# 環境からホストへ
cu cp <environment-id>:/path/in/container/file.txt ./local-file.txt

# ディレクトリの再帰コピー
cu cp -r ./local-dir <environment-id>:/container/dir/
```

## 🗑️ 環境のクリーンアップ

### `cu remove` - 環境の削除
```bash
# 環境の削除
cu remove <environment-id>

# 確認なしで削除
cu remove <environment-id> --force

# 複数環境の削除
cu remove abc-123 def-456
```

### `cu clean` - 一括クリーンアップ
```bash
# 停止中の環境を削除
cu clean

# 古い環境を削除（7日以上前）
cu clean --older-than 7d

# 全ての環境を削除（注意）
cu clean --all
```

## 📊 情報取得

### `cu status` - 環境の詳細状態
```bash
# 環境の詳細情報
cu status <environment-id>

# リソース使用量含む
cu status <environment-id> --resources

# JSON形式で出力
cu status <environment-id> --json
```

### `cu ps` - 実行中プロセス
```bash
# 環境内の実行中プロセス
cu ps <environment-id>

# 詳細情報
cu ps <environment-id> --verbose
```

## ⚙️ 設定関連

### `cu config` - 設定の確認・変更
```bash
# 現在の設定表示
cu config list

# 特定の設定値を取得
cu config get default_timeout

# 設定値の変更
cu config set default_timeout 300

# 設定のリセット
cu config reset
```

#### 主要な設定項目
```bash
default_timeout      # デフォルトタイムアウト（秒）
base_image          # デフォルトベースイメージ
cleanup_on_exit     # 終了時の自動クリーンアップ
log_level          # ログレベル（debug, info, warn, error）
```

## 🚨 緊急時のコマンド

### `cu emergency` - 緊急停止・復旧
```bash
# 全環境の緊急停止
cu emergency stop

# 特定環境の強制停止
cu emergency stop <environment-id>

# 環境の復旧試行
cu emergency recover <environment-id>

# システム全体のリセット
cu emergency reset --confirm
```

## 📝 実用的なコマンド組み合わせ

### 日常的なワークフロー
```bash
# 作業確認の完全版
cu list | grep active
cu log <env-id> --tail 20
cu diff <env-id> --stat
cu checkout <env-id>
git diff --name-only

# 安全なマージ
cu diff <env-id>          # 事前確認
cu log <env-id>           # ログ確認
cu merge <env-id>         # マージ実行
git branch -d cu-<env-id> # クリーンアップ
```

### デバッグ用
```bash
# 問題のある環境の詳細調査
cu status <env-id> --resources
cu ps <env-id>
cu log <env-id> --verbose
cu terminal <env-id>  # 直接調査
```

### 複数環境の管理
```bash
# 全環境の状況確認
cu list --json | jq '.[] | {id: .id, status: .status, created: .created}'

# 古い環境の一括削除
cu list | grep idle | awk '{print $1}' | xargs cu remove
```

これらのコマンドを効果的に組み合わせることで、container-useの機能を最大限に活用できます。