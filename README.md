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
