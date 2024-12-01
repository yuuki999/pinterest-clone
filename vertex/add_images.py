# add_images.py
from dotenv import load_dotenv
import os
from vertex import ImageSearchDemo

# .envファイルを読み込む（明示的にパスを指定）
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

# 環境変数を明示的に設定
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/Users/itoi/projects/itoi/pinterest-clone/vertex/secret/voltaic-plating-265716-42cdc3593d25.json'


# TODO: これを試してみて、既存インデックスに画像がアップできるかどうかを確認
def add_new_images(image_dir):
    """
    指定ディレクトリの画像をインデックスに追加
    
    Args:
        image_dir (str): 追加する画像が含まれているディレクトリパス
    """
    # Google Cloud の設定
    PROJECT_ID = "voltaic-plating-265716"
    BUCKET_NAME = "sisterly"
    LOCATION = "asia-northeast1"
    INDEX_NAME = "sisterly_deployed_20241107_090612_8ef2af22"
    ENDPOINT_ID = "5566554692546199552"  # 既存のエンドポイントID
    
    # デモの初期化
    demo = ImageSearchDemo(
        project_id=PROJECT_ID,
        location=LOCATION,
        bucket_name=BUCKET_NAME,
        index_display_name=INDEX_NAME
    )
    
    # 画像の追加とエンべディングの作成を実行
    demo.add_images(image_dir)

if __name__ == "__main__":
    # 環境変数が正しく設定されているか確認
    if not os.getenv('GOOGLE_APPLICATION_CREDENTIALS'):
        raise EnvironmentError(
            "GOOGLE_APPLICATION_CREDENTIALS environment variable is not set. "
            "Please check your .env file."
        )
    
    # 追加したい画像があるディレクトリを指定
    NEW_IMAGES_DIR = "test_images"  # このディレクトリに新しい画像を置く
    
    # 画像の追加を実行
    add_new_images(NEW_IMAGES_DIR)


# python add_images.py
# これで画像をGCSにアップロードできる。
# TODO: アップロードした画像をレコメンド検索で使用できるようにする。
