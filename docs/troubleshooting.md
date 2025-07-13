# 🛠️ トラブルシューティング

container-useの使用中に発生する可能性のある問題と解決方法を説明します。

## 📋 目次
- [よくある問題と解決方法](#よくある問題と解決方法)
- [エージェント関連の問題](#エージェント関連の問題)
- [環境・コンテナの問題](#環境コンテナの問題)
- [Git・ブランチの問題](#gitブランチの問題)
- [パフォーマンスの問題](#パフォーマンスの問題)

## 🚨 よくある問題と解決方法

### 問題1: container-useコマンドが見つからない

#### 症状
```bash
$ cu list
bash: cu: command not found
```

#### 解決方法
```bash
# 1. インストール確認
which container-use
which cu

# 2. パスの確認
echo $PATH

# 3. パスを追加（必要に応じて）
export PATH=$PATH:/usr/local/bin

# 4. 再インストール
brew reinstall dagger/tap/container-use
# または
curl -fsSL https://raw.githubusercontent.com/dagger/container-use/main/install.sh | bash
```

### 問題2: Docker権限エラー

#### 症状
```bash
$ cu list
Error: permission denied while trying to connect to Docker daemon
```

#### 解決方法
```bash
# 1. Dockerグループにユーザーを追加
sudo usermod -aG docker $USER

# 2. 再ログイン（またはシステム再起動）
# 3. Docker デーモンの起動確認
sudo systemctl start docker
sudo systemctl enable docker

# 4. 権限確認
docker run hello-world
```

### 問題3: MCPサーバー接続エラー

#### 症状
```bash
Claude Code cannot connect to container-use MCP server
```

#### 解決方法
```bash
# 1. MCP設定の確認
claude mcp list

# 2. 設定の再読み込み
claude mcp reload

# 3. container-useの動作確認
cu --version

# 4. MCP サーバーの再追加
claude mcp remove container-use
claude mcp add container-use -- container-use stdio

# 5. 設定ファイルの確認
cat ~/.claude/mcp_settings.json
```

## 🤖 エージェント関連の問題

### 問題4: エージェントが環境を作成しない

#### 症状
- AIエージェントがホストで直接作業を行う
- container-use環境が作成されない

#### 原因
- CLAUDE.mdにエージェントルールが追加されていない
- エージェントがルールを無視している

#### 解決方法
```bash
# 1. エージェントルールの追加
curl https://raw.githubusercontent.com/dagger/container-use/main/rules/agent.md >> CLAUDE.md

# 2. ルール内容の確認
cat CLAUDE.md

# 3. 明示的な指示
claude
> "container-use環境を使用してファイルを作成してください"

# 4. セッションの再開始
# 新しいClaude Codeセッションを開始
```

### 問題5: エージェントが応答しない・スタックする

#### 症状
- エージェントが長時間応答しない
- 環境内でプロセスが止まっている

#### 解決方法
```bash
# 1. 環境の状態確認
cu list
cu status <environment-id>

# 2. 実行中プロセスの確認
cu ps <environment-id>

# 3. 環境に直接接続
cu terminal <environment-id>

# 4. 手動でプロセス終了
# 環境内で：
ps aux | grep <problem-process>
kill <process-id>

# 5. 環境のリセット
# 新しいClaude Codeセッションを開始
```

### 問題6: エージェントが古い環境を使い続ける

#### 症状
- 新しい作業でも古い環境で実行される
- 最新の変更が反映されない

#### 解決方法
```bash
# 1. 古い環境の確認
cu list

# 2. 古い環境のマージ
cu merge <old-environment-id>
git branch -d cu-<old-environment-id>

# 3. 新しいセッションの開始
claude
> "新しい環境で作業を開始してください"

# 4. 強制的な新環境作成
claude
> "必ず新しいcontainer-use環境を作成して作業してください"
```

## 🐳 環境・コンテナの問題

### 問題7: 環境作成が失敗する

#### 症状
```bash
$ claude
> "ファイルを作成してください"
Error: Failed to create container-use environment
```

#### 解決方法
```bash
# 1. Docker デーモンの確認
docker ps

# 2. ディスク容量の確認
df -h

# 3. メモリ使用量の確認
free -h

# 4. 不要なコンテナの削除
docker system prune

# 5. container-use設定の確認
cu config list

# 6. ベースイメージの更新
docker pull ubuntu:24.04
```

### 問題8: 環境が突然停止する

#### 症状
- 作業中に環境が応答しなくなる
- `cu list`で環境が表示されない

#### 解決方法
```bash
# 1. 環境の状態確認
cu list --all
cu status <environment-id>

# 2. Docker コンテナの確認
docker ps -a | grep container-use

# 3. 環境の復旧試行
cu emergency recover <environment-id>

# 4. ログの確認
cu log <environment-id> --verbose
docker logs <container-id>

# 5. 手動での復旧が困難な場合
# 新しいセッションで作業を再開
```

### 問題9: コンテナのリソース不足

#### 症状
- 環境内でコマンドが遅い
- メモリ不足エラー
- ディスク容量不足

#### 解決方法
```bash
# 1. リソース使用量の確認
cu status <environment-id> --resources

# 2. Docker リソース制限の確認
docker stats

# 3. 不要なファイルの削除
cu terminal <environment-id>
# 環境内で：
df -h
du -sh * | sort -hr
rm -rf node_modules  # 例：大きなディレクトリの削除

# 4. Docker設定の調整
# Docker Desktop の場合：
# Settings > Resources > メモリ・CPU を増加
```

## 📂 Git・ブランチの問題

### 問題10: マージ時のコンフリクト

#### 症状
```bash
$ cu merge <environment-id>
Error: Merge conflict detected
```

#### 解決方法
```bash
# 1. 環境の作業を確認
cu diff <environment-id>
cu checkout <environment-id>

# 2. 競合ファイルの特定
git status
git diff --name-only --diff-filter=U

# 3. 手動で競合を解決
# エディタで競合ファイルを編集
# <<<<<<< HEAD
# =======
# >>>>>>> branch
# マーカーを削除し、正しい内容に修正

# 4. 解決後のコミット
git add .
git commit -m "Resolve merge conflicts"

# 5. マージの再実行
git checkout main
git merge cu-<environment-id>
```

### 問題11: ブランチが削除できない

#### 症状
```bash
$ git branch -d cu-<environment-id>
error: The branch 'cu-<environment-id>' is not fully merged.
```

#### 解決方法
```bash
# 1. マージ状況の確認
git branch --merged | grep cu-<environment-id>
git branch --no-merged | grep cu-<environment-id>

# 2. 強制削除（注意：作業内容を確認後）
git branch -D cu-<environment-id>

# 3. またはマージしてから削除
git checkout main
git merge cu-<environment-id>
git branch -d cu-<environment-id>
```

### 問題12: Git 状態の不整合

#### 症状
- Gitの状態がコンテナと一致しない
- 環境で行った変更がGitに反映されない

#### 解決方法
```bash
# 1. 環境の状態確認
cu status <environment-id>
cu log <environment-id>

# 2. Git状態の確認
cu checkout <environment-id>
git status
git log --oneline -5

# 3. 手動で同期
cu terminal <environment-id>
# 環境内で必要に応じて git commit

# 4. 環境の再作成（最終手段）
# 新しいClaude Codeセッションで作業を再開
```

## ⚡ パフォーマンスの問題

### 問題13: 環境作成が遅い

#### 症状
- 新しい環境の作成に時間がかかる
- AIエージェントが長時間待機する

#### 解決方法
```bash
# 1. ベースイメージのプリプル
docker pull ubuntu:24.04

# 2. Docker イメージのキャッシュ確認
docker images | grep container-use

# 3. 不要なイメージの削除
docker image prune

# 4. ネットワーク速度の確認
# ベースイメージのダウンロード速度を確認

# 5. ローカルイメージの使用
cu config set base_image local-ubuntu:latest
```

### 問題14: 複数環境での性能劣化

#### 症状
- 複数の環境を同時実行すると遅くなる
- システム全体のパフォーマンス低下

#### 解決方法
```bash
# 1. 実行中環境の確認
cu list | grep active

# 2. 不要な環境の停止
cu remove <unnecessary-environment-id>

# 3. システムリソースの確認
htop
docker stats

# 4. 同時実行数の制限
# 必要な環境のみを active に保つ

# 5. Docker リソース制限の設定
# Docker Desktop settings で制限を調整
```

## 🔧 詳細デバッグ方法

### デバッグログの有効化
```bash
# 詳細ログ出力
cu config set log_level debug

# ログファイルの確認
tail -f ~/.container-use/logs/debug.log
```

### システム情報の収集
```bash
# システム情報の一括取得
echo "=== Container-use Version ==="
cu --version

echo "=== Docker Version ==="
docker --version

echo "=== System Resources ==="
free -h
df -h

echo "=== Running Containers ==="
docker ps

echo "=== Container-use Environments ==="
cu list --json

echo "=== Container-use Config ==="
cu config list
```

### サポートへの情報提供
問題が解決しない場合、以下の情報を[Discord](https://discord.gg/dagger-io)の#container-useチャンネルで共有してください：

1. container-useのバージョン
2. オペレーティングシステム
3. Docker のバージョン
4. 具体的なエラーメッセージ
5. 再現手順
6. 上記のシステム情報