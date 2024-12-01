### データベースのスキーマを変更したら下記のコマンドを上から実行すれば更新される。

データベースリセット
```
npx prisma migrate reset
```

任意の名前でマイグレーションを実行する。
```
npx prisma migrate dev --name remove_user_relation
```
クライアントの再作成(これでprismaが使えるようになる、PC再起動したりしたら必要になるかも。)
```
npx prisma generate
```


shadcnのセットアップ
```
npx shadcn@latest init
npx shadcn@latest add button
npx shadcn@latest add input 
npx shadcn@latest add alert
```

### ライブラリの関係性

lucide-react: アイコンの表現とか
react-aria: ヘッドレスUI + tailwindで柔軟なUI作成、shadcnより低レベルなので、編集性が高い。
shadcn: tailwindとの相性がいい、軽量、小規模PJ向け、ヘッドレスUIなので見た目は自分で作る。こっちの方がreact-ariaより実装コストが低いかも？
MUI: 大規模、styled-componentsを使う場合

shadcnを使用して、下記を実行すると、自動的にコンポーネントが```src/components/ui/dialog.tsx```みたいなところに作成される。
```
npx shadcn@latest add dialog
```

vscodeが重い時は
```
rm -rf node_modules
rm -rf .next
```

memo:
tailwind.config.tsを使ってテーマをダークモードにしたりできる。


### 一括ファイルアップロード

```
pnpm run bulk-upload "./test_images/shake_1121_feed_2024_11_2"
```


### 画像がwebに表示される仕組み


画像読み込みの基本的な流れ

1. HTMLの<img>タグが解析される
1. ブラウザがsrc属性のURLにリクエストを送信
1. サーバーからデータをダウンロード
1. ブラウザが画像をデコード
1. 画像が表示される


### 類似写真検索サービスの作成

最初の6ヶ月はVertex AI Searchが無料なのでそれで対応
ユーザーがちゃんと使ってくれて今後どうするか悩んだ時に、無料で実現できる何かを使用する。
もしくは有料ユーザー向けの精度高い検索システムとしてVertex AI Searchを提供する。

無料枠終了のサイトの金額予想
```
比較のため、一般的なECサイトの規模感を考えると：

中規模ECサイト: 月間10万〜100万PV
大規模ECサイト: 月間100万PV以上

例えば、月間10万クエリの場合：

10万 × ($2.50/1,000) = $250
日本円で約37,500円
```

Vertex AI Search APIを使う準備
```
- Google Cloudアカウントの作成（まだの場合）
- 新規プロジェクトの作成
- 課金の有効化
- Vertex AI Search APIの有効化

開発環境のセットアップ
- Google Cloud SDKのインストール
- 必要な認証情報の設定
- プロジェクトIDの設定
```


vertexAIでエンベディングしたデータをCloud Storageに追加する。

エンベディングのモデルに何を選択するかが重要、調査対象
https://cloud.google.com/vertex-ai/generative-ai/docs/embeddings/get-text-embeddings?hl=ja

検索方法に
セマンティック検索とキーワード検索、ハイブリッド検索が存在する。これらについて理解したい。
どうやらハイブリッド検索をするにはキーワード検索できるようにスパース埋め込みの値も設定しておかないとイけない様子。
```
{
    "id": "product_001",
    "title": "Blue Denim Jacket",
    # 画像の視覚的特徴の埋め込み
    "image_embedding": [0.24, 0.12, ...],  # Vision APIで生成
    
    # メタ情報の埋め込み
    "sparse_embedding": {
        "values": [0.8, 0.6, 0.5],
        "dimensions": [101, 242, 567]  # "jacket", "denim", "blue"などに対応
    },
    
    # 原データ
    "metadata": {
        "category": "Apparel",
        "color": "Blue",
        "style": "Casual",
        "material": "Denim"
    }
}
```

では画像に対して密な埋め込みはどうやってするのか？
・画像自体の視覚的特徴を表現
・Vertex AI Vision API、画像認識モデル（ResNet、EfficientNetなど）を使用して埋め込みを作成。
・Sparse Embedding（疎な埋め込み）で商品タイトル、商品説明の情報に対して埋め込みを作成。

マルチモーダルエンベディングAPIを使用してエンべディングをすることになりそう
https://cloud.google.com/vertex-ai/generative-ai/docs/embeddings/get-multimodal-embeddings?hl=ja

これがすごい参考になる。
https://zenn.dev/makochan/articles/baf89362e23f2c


### マルチモーダルエンベディングAPIに関して

環境構築
```
gcloud init
gcloud components update
gcloud components install beta
gcloud auth application-default login
```


pythonの環境構築をする。
```
python -m venv myenv # Pythonの仮想環境を作成、プロジェクトディレクトリで実行。
pip install --upgrade google-cloud-aiplatform
```

仮想環境を開始(プロンプトの先頭に (myenv) と表示されていれば有効)
```
source myenv/bin/activate # 仮想環境のアクティブ化（Macの場合）
```

仮想環境を終了する場合
```
deactivate
```

pipの情報をrequirements.txtしてバージョン管理する。
```
pip freeze > requirements.txt
```

これにより他の開発者は下記コマンドでpipをインストールできる。
```
pip install -r requirements.txt
```

仮想環境をアクティブにする
```
source ~/projects/itoi/pinterest-clone/myenv/bin/activate
```

### GC便利コマンド

プロジェクトIDの確認
```
gcloud config get-value project
gcloud projects list
```

サービスの有効性を確認。aiplatformに絞る場合
```
gcloud services list --enabled | grep aiplatform
```

バケット一覧を確認する
```
gcloud storage ls
```

バケットを作成する
```
gcloud storage buckets create gs://sisterly \
    --location=asia-northeast1 \
    --uniform-bucket-level-access
```

バケットの削除
```
gcloud storage rm -r gs://sisterly
```

現在のリージョンを確認
```
gcloud config get-value compute/region
```

利用可能なリージョンの一覧を表示
```
gcloud compute regions list
```

リージョンをasia-northeast1（東京）に設定
```
gcloud config set compute/region asia-northeast1
```

一時的にデフォルト認証情報（ADC）を設定する方法
```
gcloud auth application-default login
```

TensorFlow のバージョンの確認
```
(myenv) ➜  vertex git:(main) ✗ python -c "import tensorflow as tf; print(tf.__version__)"
2.18.0
```

vertext ai seatchのインデックスを確認する方法
```
gcloud ai index-endpoints describe 5566554692546199552 \
    --project=voltaic-plating-265716 \
    --region=asia-northeast1
```

### 検索アルゴリズム

brute-force search


### アプリ名

Sisterlyをアプリ名とする。
yuuki.itoi6120@gmail.comをGCのアカウントとして使っている。


### 備考

有益記事
https://zenn.dev/makochan/articles/baf89362e23f2c
