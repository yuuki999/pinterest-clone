from google.cloud import storage
from google.cloud import aiplatform
import os
from PIL import Image
import tensorflow as tf
import tensorflow_hub as hub
import uuid
from datetime import datetime
import json
from prisma import Prisma
import traceback

# 検索時の流れは以下の通り
# 検索画像 → 特徴抽出 → ベクトル化 → インデックスで類似ベクトル検索 → 類似画像を返す
class ImageSearchDemo:
    def __init__(self, project_id, location, bucket_name, index_display_name):
        """
        Initialize the Image Search Demo
        
        Args:
            project_id (str): Google Cloud Project ID
            location (str): Region for Vertex AI resources
            bucket_name (str): Cloud Storage bucket name
            index_display_name (str): Name for the Vector Search index
        """
        self.project_id = project_id
        self.location = location
        self.bucket_name = bucket_name
        self.index_display_name = index_display_name
        
        # Initialize Google Cloud clients
        self.storage_client = storage.Client(project=project_id)
        self.bucket = self.storage_client.bucket(bucket_name)
        
        # Initialize Vertex AI
        aiplatform.init(project=project_id, location=location)

        # Initialize Prisma client
        self.prisma = Prisma() 
        
        # Load TensorFlow Hub model for image embeddings
        self.model = hub.load('https://tfhub.dev/google/imagenet/efficientnet_v2_imagenet1k_b0/feature_vector/2') # ここの処理が不安定すぎるので要改善。
        print("Model loaded successfully.")
        
        # Initialize endpoint
        try:
            # 既存のエンドポイントを取得
            self.endpoint = aiplatform.MatchingEngineIndexEndpoint(
                index_endpoint_name=f"projects/{project_id}/locations/{location}/indexEndpoints/5566554692546199552"
            )
            print("Successfully connected to existing endpoint")
        except Exception as e:
            print(f"Error connecting to endpoint: {str(e)}")
            raise
        
    # Google Storageに画像をアップロード
    def upload_images_to_gcs(self, local_dir, user_type='admin', user_id=None):
        """
        Upload images from local directory to Cloud Storage with original filenames
        
        Args:
            local_dir (str): Path to local directory containing images
            user_type (str): 'admin' or 'user'
            user_id (str): User ID for non-admin uploads
            
        Returns:
            list: List of GCS URIs for uploaded images
        """
        uploaded_uris = []
        
        # Determine base directory based on user type
        if user_type == 'admin':
            base_dir = "images/admin/"
        else:
            if not user_id:
                raise ValueError("user_id is required for non-admin uploads")
            base_dir = f"images/users/{user_id}/"
        
        # Create base directory if it doesn't exist
        if not any(blob.name.startswith(base_dir) for blob in self.bucket.list_blobs(prefix=base_dir)):
            blob = self.bucket.blob(base_dir)
            blob.upload_from_string('')
        
        print(f"Scanning directory: {local_dir}")
        
        # Upload each image file
        for filename in os.listdir(local_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                local_path = os.path.join(local_dir, filename)
                
                # Use original filename
                destination_blob_name = f"{base_dir}{filename}"
                blob = self.bucket.blob(destination_blob_name)
                
                print(f"Uploading {filename} to GCS...")
                try:
                    blob.upload_from_filename(local_path)
                    gcs_uri = f"gs://{self.bucket_name}/{destination_blob_name}"
                    uploaded_uris.append(gcs_uri)
                    print(f"Uploaded {filename} to {gcs_uri}")
                except Exception as e:
                    print(f"Error uploading {filename}: {str(e)}")
        
        print(f"Successfully uploaded {len(uploaded_uris)} images")
        return uploaded_uris

    # インデックス構築 & インデックスに画像をアップロード
    # デプロイ完了までに30分ほどかかる
    # 初回インデックス作成時のみ実行
    def build_image_index(self, image_uris, force_create=False):
        """
        Build Vector Search index from image embeddings
        
        Args:
            image_uris (list): List of GCS URIs for images
            force_create (bool): 強制的に新しいインデックスを作成するかどうか
        """
        try:
            # 既存のインデックスとエンドポイントを探す
            # projects/[PROJECT_ID]/locations/[LOCATION]/indexEndpoints/[ENDPOINT_ID]
            existing_endpoint = aiplatform.MatchingEngineIndexEndpoint(
                'projects/79125955655/locations/asia-northeast1/indexEndpoints/5566554692546199552'
            )
            print("既存のエンドポイントが見つかりました。新規作成をスキップします。")
            self.endpoint = existing_endpoint
            return None
            
        except Exception as e:
            print("既存のエンドポイントが見つかりませんでした。新規作成を開始します。")
        
            print("Creating index...")
            index = aiplatform.MatchingEngineIndex.create_tree_ah_index(
                display_name=self.index_display_name,
                description="Image Embeddings Index",
                contents_delta_uri=image_uris,
                dimensions=1280,
                shard_size="SHARD_SIZE_SMALL",
                approximate_neighbors_count=50,
                index_update_method="batch_update",
                distance_measure_type="DOT_PRODUCT_DISTANCE"
            )
            
            print(f"Created index: {index.name}")
            
            # インデックスが完全に作成されるまで待つ
            index.wait()
            
            print("Creating and deploying index endpoint...")
            index_endpoint = aiplatform.MatchingEngineIndexEndpoint.create(
                display_name=f"{self.index_display_name}_endpoint",
                public_endpoint_enabled=True
            )
            
            # エンドポイントが完全に作成されるまで待つ
            index_endpoint.wait()
            
            # 一意のデプロイIDを生成
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_id = str(uuid.uuid4())[:8]
            deployed_index_id = f"{self.index_display_name}_deployed_{timestamp}_{unique_id}"
            
            print("Creating and deploying index endpoint...")
            index_endpoint = aiplatform.MatchingEngineIndexEndpoint.create(
                display_name=f"{self.index_display_name}_endpoint_{timestamp}",
                public_endpoint_enabled=True
            )
            
            index_endpoint.wait()
            
            print(f"Deploying index with ID: {deployed_index_id}")
            deploy_operation = index_endpoint.deploy_index(
                index=index,
                deployed_index_id=deployed_index_id,  # 一意のIDを使用
                machine_type="e2-standard-2",
                min_replica_count=1,
                max_replica_count=1
            )
            
            deploy_operation.result()
            
            print("Index deployed successfully")
            self.endpoint = index_endpoint
            return index

    # 既存のインデックスに新しい画像を追加
    async def add_images(self, image_dir, user_type='admin', user_id=None):
        """
        画像をCloud Storageにアップロードし、インデックスに追加する
        
        Args:
            image_dir (str): 画像が含まれているディレクトリパス
            user_type (str): 'admin' or 'user'
            user_id (str): User ID for non-admin uploads
        """
        print("Adding new images to existing index...")
        
        # 1. 画像をCloud Storageにアップロード
        uploaded_uris = self.upload_images_to_gcs(image_dir, user_type, user_id)
        
        if not uploaded_uris:
            print("No images found to upload")
            return
            
        print(f"Successfully uploaded {len(uploaded_uris)} images")

        # # Prismaクライアントの接続を開始
        # await self.prisma.connect()

        # try:
        #     # DBへの保存
        #     for uri in uploaded_uris:
        #         blob_name = uri.replace(f"gs://{self.bucket_name}/", "")
                
        #         # Prismaでピンを作成
        #         await self.prisma.pin.create({
        #             "data": {
        #                 "title": os.path.basename(blob_name),  # ファイル名をタイトルとして使用
        #                 "description": "",  # 空の説明
        #                 "imageUrl": blob_name,
        #                 "userId": user_id if user_id else "admin",  # user_idが無い場合は"admin"を使用
        #             }
        #         })
        # finally:
        #     # 必ず接続を閉じる
        #     await self.prisma.disconnect()
        
        # 2. 埋め込みベクトルを生成（月単位でグループ化）
        current_month = datetime.now().strftime("%Y%m")
        embeddings_dir = f"embeddings/{current_month}"
        
        for i, uri in enumerate(uploaded_uris):
            blob_name = uri.replace(f"gs://{self.bucket_name}/", "")
            blob = self.bucket.blob(blob_name)
            local_path = f"/tmp/{os.path.basename(blob_name)}"
            
            try:
                print(f"\nProcessing {blob_name}...")
                blob.download_to_filename(local_path)
                
                # Generate embedding
                print("Generating embedding...")
                embedding = self._generate_embedding(local_path)
                print(f"Embedding shape: {len(embedding)}")
                
                # 3. エンベディングデータを作成（メタデータを追加）
                embedding_data = {
                    "id": uri,
                    "embedding": embedding,
                    "metadata": {
                        "image_path": blob_name,
                        "user_type": user_type,
                        "user_id": user_id,
                        "created_at": datetime.now().isoformat(),
                    }
                }
                
                # 一時的なJSONファイルを作成
                embedding_id = str(uuid.uuid4())
                json_path = f"/tmp/embedding_{embedding_id}.json"
                with open(json_path, 'w') as f:
                    json.dump(embedding_data, f)
                
                # Cloud Storageに保存
                cloud_path = f"{embeddings_dir}/{embedding_id}.json"
                embedding_blob = self.bucket.blob(cloud_path)
                embedding_blob.upload_from_filename(json_path)
                
                # Cleanup
                os.remove(local_path)
                os.remove(json_path)
                print(f"Successfully processed {blob_name}")
                
            except Exception as e:
                print(f"Error processing {blob_name}: {str(e)}")
                print(traceback.format_exc())
                continue
            
        # 4. インデックスを更新
        try:
            index = aiplatform.MatchingEngineIndex(
                index_name=f"projects/{self.project_id}/locations/{self.location}/indexes/7368610270005952512"
            )
            
            print("Updating index with new embeddings...")
            contents_delta_uri = f"gs://{self.bucket_name}/{embeddings_dir}"
            operation = index.update_embeddings(
                contents_delta_uri=contents_delta_uri,
                is_complete_overwrite=False
            )
            
            print(f"Successfully added embeddings to index")
            
        except Exception as e:
            print(f"Error updating index: {str(e)}")
            print(traceback.format_exc())
            raise

    # 類似画像の検索 
    def search_similar_images(self, query_image_path, num_neighbors=5):
        """
        Search for similar images using query image
        
        Args:
            query_image_path (str): Path to query image
            num_neighbors (int): Number of similar images to return
            
        Returns:
            list: List of similar image URIs and distances
        """
        print(f"Generating embedding for query image: {query_image_path}")
        query_embedding = self._generate_embedding(query_image_path)
        
        print("Searching for similar images...")
        response = self.endpoint.find_neighbors(
            embedding=query_embedding,
            num_neighbors=num_neighbors
        )
        
        results = [
            {
                "uri": neighbor.id,
                "distance": neighbor.distance
            }
            for neighbor in response
        ]
        print(f"Found {len(results)} similar images")
        return results

    # 画像からエンべディングを作成
    def _generate_embedding(self, image_path):
        """
        Generate embedding vector for an image using TensorFlow Hub model
        
        Args:
            image_path (str): Path to image file
            
        Returns:
            list: Image embedding vector
        """
        # Load and preprocess image
        img = tf.io.read_file(image_path)
        img = tf.image.decode_jpeg(img, channels=3)
        img = tf.image.resize(img, [224, 224])
        img = tf.cast(img, tf.float32) / 255.0
        img = tf.expand_dims(img, 0)
        
        # Generate embedding
        embedding = self.model(img, training=False)
        return embedding[0].numpy().tolist()

    def download_result_images(self, results, output_dir):
        """
        Download result images from Cloud Storage
        
        Args:
            results (list): List of search results with image URIs
            output_dir (str): Directory to save downloaded images
        """
        os.makedirs(output_dir, exist_ok=True)
        print(f"\nDownloading results to {output_dir}")
        
        for i, result in enumerate(results):
            uri = result["uri"]
            blob_name = uri.replace(f"gs://{self.bucket_name}/", "")
            blob = self.bucket.blob(blob_name)
            output_path = os.path.join(output_dir, f"result_{i}.jpg")
            
            print(f"Downloading {blob_name} to {output_path}")
            try:
                blob.download_to_filename(output_path)
                print(f"Downloaded result {i+1}/{len(results)}")
            except Exception as e:
                print(f"Error downloading {blob_name}: {str(e)}")
