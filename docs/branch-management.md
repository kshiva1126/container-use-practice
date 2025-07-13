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

## 🔄 安全なワークフロー

### 新しい作業を開始する前のチェックリスト
- [ ] 進行中の作業が完了している（`cu list`で確認）
- [ ] 完了した作業がマージ済み（`cu merge <env-id>`）
- [ ] ベースブランチ（main等）が最新（`git pull origin main`）
- [ ] 新しいClaude Codeセッションで作業開始

### マージ前の確認事項（改良版）

#### 段階的確認プロセス
```bash
# Phase 1: 概要確認
cu diff <environment-id>

# Phase 2: 詳細確認
cu checkout <environment-id>

# Phase 3: 統計的確認
git diff --stat main
git log main..HEAD --oneline

# Phase 4: 重要ファイルの個別確認
git diff main -- src/
git diff main -- package.json
git diff main -- README.md

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

#### 段階的確認方法
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

# 各環境の状態を確認
cu log env-1
cu log env-2

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
```

## 🎯 推奨ワークフロー（実践済み）

### 日常的なワークフロー
```bash
# 1. 作業開始前の準備
git checkout main
git pull origin main
cu list  # 既存環境確認

# 2. 作業開始
claude
> "新機能を実装してください"

# 3. 作業完了後の確認
cu diff <env-id>         # 概要確認
cu checkout <env-id>     # 詳細確認
git diff --stat main     # 統計的確認

# 4. マージとクリーンアップ
cu merge <env-id>
git branch -d cu-<env-id>  # ← これが重要！

# 5. 次の作業は常に最新状態から
claude
> "次の機能を実装してください"  # 最新のmainから開始
```

この管理方法により：
- ✅ 各環境が最新のコードベースで作業
- ✅ マージ競合の最小化
- ✅ 作業履歴の明確化
- ✅ チーム開発での混乱防止
- ✅ **常に最新状態からの作業開始**
- ✅ **diff確認の効率化**