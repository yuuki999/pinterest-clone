from dotenv import load_dotenv
import os
from vertex import ImageSearchDemo

# .envファイルを読み込む（明示的にパスを指定）
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

# 環境変数を明示的に設定
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/Users/itoi/projects/itoi/pinterest-clone/vertex/secret/voltaic-plating-265716-42cdc3593d25.json'

# メインスクリプトとして実行
if __name__ == "__main__":
    # 環境変数が正しく設定されているか確認
    if not os.getenv('GOOGLE_APPLICATION_CREDENTIALS'):
        raise EnvironmentError(
            "GOOGLE_APPLICATION_CREDENTIALS environment variable is not set. "
            "Please check your .env file."
        )
    
    # Google Cloud の設定
    PROJECT_ID = "voltaic-plating-265716"
    BUCKET_NAME = "sisterly"
    LOCATION = "asia-northeast1"
    INDEX_NAME = "sisterly_deployed_20241107_090612_8ef2af22"
    
    # テスト用ディレクトリ
    LOCAL_IMAGE_DIR = "test_images"
    QUERY_IMAGE = "test_images/shake_1121_post_2023_8_24_20_15_453176394428825057914.jpg"
    
    # デモの初期化と実行
    demo = ImageSearchDemo(
        project_id=PROJECT_ID,
        location=LOCATION,
        bucket_name=BUCKET_NAME,
        index_display_name=INDEX_NAME
    )
    
    # 1. 画像のアップロード
    print("画像アップロード Cloud Storage...")
    uploaded_uris = demo.upload_images_to_gcs(LOCAL_IMAGE_DIR)
    print(f"Uploaded {len(uploaded_uris)} images")
    
    # 2. インデックスの構築
    print("\n構築 Vector Search index...")
    demo.build_image_index(uploaded_uris)
    print("Index 構築成功")
    
    # 3. 類似画像の検索
    print("\n類似画像の検索中...")
    results = demo.search_similar_images(QUERY_IMAGE)
    
    # 4. 結果の画像をダウンロード
    print("\n画像をDLします...")
    demo.download_result_images(results, "search_results")
    print("Process completed!")
