# 🌿 ブランチ管理のベストプラクティス

実際にcontainer-useを使用して発見した課題と、その解決策を詳しく説明します。

## 📋 目次
- [実際に使ってみて分かった課題](#実際に使ってみて分かった課題)
- [安全なワークフロー](#安全なワークフロー)
- [トラブル回避のための注意点](#トラブル回避のための注意点)
- [ブランチクリーンアップ](#ブランチクリーンアップ)

## 💡 実際に使ってみて分かった課題

### 🚨 課題1: 古いブランチからの作業によるコンフリクト

#### 問題のパターン（実体験）
```bash
# 3日前に作成された古い環境で作業
cu list
# → old-environment (3日前に作成、古いブランチベース)

cu terminal old-environment
# → 古いコードベースで新しい機能を開発
# → マージ時に大量のコンフリクトが発生
```

#### 実際に発生した問題
- 他の開発者の変更が反映されていない
- マージ時に予期しないコンフリクト
- 作業のやり直しが必要になる場合も
- レビューが困難（どれが新しい変更か不明）

#### 解決策
**必ず最新の作業ブランチから環境を作成**

```bash
# ✅ 正しいパターン
# 1. 現在の作業があれば完了・マージ
cu merge current-environment-id

# 2. 作業ブランチが最新であることを確認
git checkout main
git pull origin main

# 3. 新しいセッションで新しい作業を開始
claude
> "新機能を追加してください"  # ← 最新のブランチベースで作業される
```

### 📊 課題2: diffが見づらく変更内容の把握が困難

#### 問題のパターン（実体験）
```bash
# cu diffの出力例
cu diff environment-id
# → 大量のファイルが一度に表示
# → どのファイルが重要な変更なのか判別困難
# → スクロールが大変でレビューに時間がかかる
```

#### 実際の困りごと
- ファイル数が多いと全体像が見えない
- 重要な変更とマイナーな変更の区別が困難
- レビュー効率が悪い

#### 解決策
**段階的な確認とcheckoutでの詳細確認**

```bash
# ✅ 改善されたワークフロー
# 1. 概要確認
cu diff <environment-id>

# 2. より詳細な確認のためcheckout
cu checkout <environment-id>

# 3. ファイル別に変更を確認
git status
git diff --name-only  # 変更されたファイル一覧
git diff --stat       # 変更の統計情報

# 4. 重要なファイルを個別に確認
git diff main -- important-file.js
git diff main -- package.json

# 5. 新規作成ファイルの確認
git ls-files --others --exclude-standard
```

#### 🎨 **diff表示の改善ツール（実証済み）**

##### **🔍 非破壊的な確認方法（推奨）**
```bash
# checkoutせずに直接確認（現在の作業を中断しない）
npx difit container-use/<environment-id> main

# 例：literate-bulldog環境の確認
npx difit container-use/literate-bulldog main

# 複数環境の監視
cu list
npx difit container-use/env-1 main
npx difit container-use/env-2 main

# 環境同士の比較
npx difit container-use/env-1 container-use/env-2
```

**メリット**：
- ✅ 現在の作業を中断しない
- ✅ リアルタイムでエージェントの作業を監視可能
- ✅ 複数環境の比較が簡単
- ✅ GitHub風UIで見やすい表示

##### **従来の方法（checkoutが必要）**
```bash
# GitHub風UIでdiff確認
cu checkout <environment-id>
npx difit HEAD main

# 現在の作業内容確認
npx difit
npx difit .

# Node.js 21.0.0+が必要
node --version
```

##### **その他の改善ツール**
```bash
# delta（Rust製、高速）
git diff main | delta

# diff-so-fancy（カラフル表示）
git diff main | diff-so-fancy

# bat（シンタックスハイライト）
git diff main | bat --language diff
```

## 🔄 安全なワークフロー

### 新しい作業を開始する前のチェックリスト
- [ ] 進行中の作業が完了している（`cu list`で確認）
- [ ] 完了した作業がマージ済み（`cu merge <env-id>`）
- [ ] ベースブランチ（main等）が最新（`git pull origin main`）
- [ ] 新しいClaude Codeセッションで作業開始

### マージ前の確認事項（改良版）

#### 段階的確認プロセス（非破壊的方法推奨）
```bash
# Phase 1: 非破壊的な概要確認（推奨）
npx difit container-use/<environment-id> main

# Phase 2: 詳細確認（必要に応じてcheckout）
cu checkout <environment-id>
npx difit HEAD main

# Phase 3: 統計的確認（必要に応じて）
git diff --stat main
git log main..HEAD --oneline

# Phase 4: 重要ファイルの個別確認（必要に応じて）
git diff main -- src/
git diff main -- package.json

# Phase 5: テスト実行（必要に応じて）
npm test
npm run build

# Phase 6: マージ実行
git checkout main
cu merge <environment-id>
```

#### マージ後のクリーンアップ（重要）
```bash
# マージが完了した後、cuブランチを削除
git branch -d cu-<environment-id>

# 理由：
# - 古いブランチの残存を防ぐ
# - 次回の新しい作業が常に最新状態から開始される
# - ブランチの混乱や競合を防止
```

## 🚨 トラブル回避のための注意点

### 1. diffの見づらさへの対策

#### リアルタイム監視方法
```bash
# エージェント作業中のリアルタイム確認
cu list  # 現在の環境確認
npx difit container-use/<environment-id> main  # 非破壊的確認

# 複数環境の同時監視
npx difit container-use/frontend-work main
npx difit container-use/backend-work main
npx difit container-use/frontend-work container-use/backend-work
```

#### エイリアス設定で効率化
```bash
# ~/.bashrc または ~/.zshrc に追加
alias cu-watch='npx difit container-use/$1 main'
alias cu-compare='npx difit container-use/$1 container-use/$2'

# 使用例
cu-watch literate-bulldog
cu-compare env-1 env-2
```

#### 段階的確認方法（従来）
```bash
# cu diffが見づらい場合の確認手順
cu checkout <environment-id>

# ステップ1: 概要把握
git diff --name-only main  # 変更ファイル一覧
git diff main --stat       # ファイル別変更量

# ステップ2: ディレクトリ別確認
git diff main -- src/      # ソースコード
git diff main -- tests/    # テストファイル
git diff main -- docs/     # ドキュメント

# ステップ3: 設定ファイル確認
git diff main -- package.json
git diff main -- *.config.js
git diff main -- *.md

# ステップ4: 新規ファイル確認
git ls-files --others --exclude-standard
```

### 2. 複数環境の並行作業

#### 依存関係を考慮したマージ順序
```bash
# 複数の環境が存在する場合
cu list

# 各環境の状態を非破壊的に確認
npx difit container-use/env-1 main
npx difit container-use/env-2 main
npx difit container-use/env-1 container-use/env-2  # 環境間の差分

# マージ順序を計画（依存関係を考慮）
cu merge env-1  # 基盤機能から先にマージ
git branch -d cu-env-1  # マージ後に削除

cu merge env-2  # 依存する機能を後でマージ
git branch -d cu-env-2  # マージ後に削除
```

### 3. 競合が発生した場合（実際の対処法）

#### 競合解決の手順
```bash
# マージで競合が発生した場合
cu checkout <environment-id>

# 競合ファイルの確認
git status
git diff --name-only --diff-filter=U  # 競合ファイル一覧

# 手動で競合を解決
# ファイルを編集して競合マーカーを削除
git add .
git commit -m "Resolve merge conflicts"

# ターゲットブランチにマージ
git checkout main
git merge cu-<environment-id>

# マージ完了後にブランチ削除
git branch -d cu-<environment-id>
```

## 🔧 ブランチクリーンアップ

### 自動化のためのエイリアス設定

#### Git エイリアス
```bash
# ~/.gitconfig に追加
[alias]
    cu-clean = "!f() { git branch | grep 'cu-' | xargs git branch -d; }; f"
    cu-clean-merged = "!f() { git branch --merged | grep 'cu-' | xargs git branch -d; }; f"
```

#### Shell エイリアス
```bash
# ~/.bashrc または ~/.zshrc に追加
alias cu-merge-clean='env_id=$1 && cu merge $env_id && git branch -d cu-$env_id'

# 使用例
cu-merge-clean environment-id  # マージと削除を一度に実行
```

### 定期的なクリーンアップ

#### 週次クリーンアップスクリプト
```bash
#!/bin/bash
# weekly-cleanup.sh

echo "🧹 Container-use環境のクリーンアップを開始..."

# マージ済みブランチの削除
echo "📋 マージ済みcuブランチを削除中..."
git branch --merged | grep "cu-" | xargs -r git branch -d

# 孤立したcuブランチの確認
echo "🔍 孤立したcuブランチを確認中..."
git branch | grep "cu-" | while read branch; do
    echo "警告: $branch は未マージのcuブランチです"
done

echo "✅ クリーンアップ完了"
```

### ブランチ管理の可視化

#### 現在の状態確認
```bash
# ブランチ一覧（cuブランチのみ）
git branch | grep "cu-"

# リモート環境ブランチの確認
git branch -r | grep "container-use/"

# 各ブランチの最終更新
git for-each-ref --format='%(refname:short) %(committerdate)' refs/heads/ | grep "cu-"

# マージ状況確認
git branch --merged | grep "cu-"      # マージ済み
git branch --no-merged | grep "cu-"   # 未マージ
```

#### ブランチ状態の図解
```
main ─┬─ cu-feature-a ─┐
      │                ├─ merge → delete cu-feature-a
      ├─ cu-feature-b ─┘          delete cu-feature-b
      │
      └─ cu-new-feature ← 最新のmain状態から作成

remotes/container-use/
├── literate-bulldog    # 非破壊的確認可能
├── feature-work        # npx difit container-use/feature-work main
└── bugfix-work         # npx difit container-use/bugfix-work main
```

## 🎯 推奨ワークフロー（実践済み）

### 日常的なワークフロー（非破壊的監視）
```bash
# 1. 作業開始前の準備
git checkout main
git pull origin main
cu list  # 既存環境確認

# 2. 作業開始
claude
> "新機能を実装してください"

# 3. 作業進捗の監視（非破壊的）
npx difit container-use/<env-id> main  # リアルタイム確認

# 4. 作業完了後の最終確認
cu checkout <env-id>  # 必要に応じて
npx difit HEAD main   # 最終チェック

# 5. マージとクリーンアップ
cu merge <env-id>
git branch -d cu-<env-id>  # ← これが重要！

# 6. 次の作業は常に最新状態から
claude
> "次の機能を実装してください"  # 最新のmainから開始
```

### 複数環境監視のワークフロー
```bash
# 1. 複数環境の同時作業
cu list

# 2. 各環境の進捗確認（非破壊的）
npx difit container-use/frontend-work main
npx difit container-use/backend-work main
npx difit container-use/frontend-work container-use/backend-work

# 3. 統合の計画
# 依存関係を確認してからマージ順序を決定
```

この管理方法により：
- ✅ 各環境が最新のコードベースで作業
- ✅ マージ競合の最小化
- ✅ 作業履歴の明確化
- ✅ チーム開発での混乱防止
- ✅ **常に最新状態からの作業開始**
- ✅ **非破壊的なリアルタイム監視**
- ✅ **GitHub風UIでの効率的なdiff確認**