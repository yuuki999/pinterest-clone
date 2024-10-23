任意の名前でマイグレーションを実行する。
```
npx prisma migrate dev --name remove_user_relation
```

クライアントの再作成
```
npx prisma generate
```
