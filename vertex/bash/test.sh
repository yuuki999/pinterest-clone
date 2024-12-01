#!/bin/bash

# JSONファイルから埋め込みベクトルを抽出
VECTOR=$(jq -r '.embedding | @csv' embedding_0.json | tr -d '\n')

# curlコマンドを実行
curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  "https://763640471.asia-northeast1-79125955655.vdb.vertexai.goog/v1/projects/79125955655/locations/asia-northeast1/indexEndpoints/5566554692546199552:findNeighbors" \
  -d "{
    \"deployedIndexId\": \"sisterly_deployed_20241107_090612_8ef2af22\",
    \"queries\": [{
      \"datapoint\": {
        \"featureVector\": [${VECTOR}]
      }
    }],
    \"returnFullDatapoint\": false
  }"




# ./test.shで実行できる
# 指定したファイルのエンべディングでインデックスに入っているデータを参考に、近傍探索を行う。10件取得。
