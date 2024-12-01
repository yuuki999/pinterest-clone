from dotenv import load_dotenv
import os

# .env ファイルから環境変数を読み込む
load_dotenv()

# 環境変数の取得
class Config:
    CREDENTIALS_PATH = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    PROJECT_ID = os.getenv('GCP_PROJECT_ID')
    BUCKET_NAME = os.getenv('GCP_BUCKET_NAME')
    LOCATION = os.getenv('GCP_LOCATION')
    
    @staticmethod
    def setup_credentials():
        """Google Cloud認証情報をセットアップ"""
        if not os.environ.get('GOOGLE_APPLICATION_CREDENTIALS'):
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = Config.CREDENTIALS_PATH
