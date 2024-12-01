import os
from google.cloud import storage
from google.cloud import aiplatform
from vertexai.vision_models import Image, MultiModalEmbeddingModel
from typing import List, Dict, Optional, Tuple
import time
import json
import logging

class VertexImageSearch:
    def __init__(
        self,
        project_id: str,
        location: str,
        bucket_name: str,
        index_display_name: str,
        dimension: int = 512,
        approximate_neighbor_count: int = 10
    ):
        """Initialize Vertex AI Vector Search for image similarity"""
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        aiplatform.init(project=project_id, location=location)
        
        self.project_id = project_id
        self.location = location
        self.bucket_name = bucket_name
        self.dimension = dimension
        self.index_display_name = index_display_name
        
        self.storage_client = storage.Client(project=project_id)
        self.bucket = self.storage_client.bucket(bucket_name)
        
        self.model = MultiModalEmbeddingModel.from_pretrained("multimodalembedding")
        
        self.index, self.index_endpoint = self._initialize_index_and_endpoint(
            approximate_neighbor_count
        )

    def _initialize_index_and_endpoint(
        self,
        approximate_neighbor_count: int
    ) -> Tuple[aiplatform.MatchingEngineIndex, aiplatform.MatchingEngineIndexEndpoint]:
        """Initialize or get existing Vector Search index and endpoint"""
        try:
            existing_indexes = aiplatform.MatchingEngineIndex.list(
                project=self.project_id,
                location=self.location
            )
            
            index = None
            for existing_index in existing_indexes:
                if existing_index.display_name == self.index_display_name:
                    index = existing_index
                    break
            
            if index is None:
                index = self._create_new_index(approximate_neighbor_count)
                self.logger.info(f"Created new index: {self.index_display_name}")
            else:
                self.logger.info(f"Using existing index: {self.index_display_name}")
            
            endpoint = self._get_or_create_endpoint()
            
            return index, endpoint
            
        except Exception as e:
            self.logger.error(f"Error initializing index and endpoint: {str(e)}")
            raise

    def _create_new_index(
        self,
        approximate_neighbor_count: int
    ) -> aiplatform.MatchingEngineIndex:
        """Create a new Vector Search index"""
        return aiplatform.MatchingEngineIndex.create_tree_ah_index(
            display_name=self.index_display_name,
            dimensions=self.dimension,
            approximate_neighbors_count=approximate_neighbor_count,
        )

    def _get_or_create_endpoint(self) -> aiplatform.MatchingEngineIndexEndpoint:
        """Get existing endpoint or create a new one"""
        endpoint_display_name = f"{self.index_display_name}-endpoint"
        
        existing_endpoints = aiplatform.MatchingEngineIndexEndpoint.list(
            project=self.project_id,
            location=self.location
        )
        
        endpoint = None
        for existing_endpoint in existing_endpoints:
            if existing_endpoint.display_name == endpoint_display_name:
                endpoint = existing_endpoint
                break
        
        if endpoint is None:
            endpoint = aiplatform.MatchingEngineIndexEndpoint.create(
                display_name=endpoint_display_name,
                public_endpoint_enabled=True
            )
            
            # Deploy index to endpoint
            endpoint.deploy_index(
                index=self.index,
                deployed_index_id=f"deployed_{self.index_display_name}"
            )
            
        return endpoint

    def generate_embedding(self, image_path: str) -> List[float]:
        """Generate embedding for a single image"""
        try:
            image = Image.load_from_file(image_path)
            embeddings = self.model.get_embeddings(
                image=image,
                dimension=self.dimension
            )
            return embeddings.image_embedding
        except Exception as e:
            self.logger.error(f"Error generating embedding for {image_path}: {str(e)}")
            raise

    def add_images(
        self,
        image_paths: List[str],
        metadata: List[Dict]
    ):
        """Add multiple images to the Vector Search index"""
        embeddings = []
        valid_metadata = []
        
        for idx, path in enumerate(image_paths):
            try:
                embedding = self.generate_embedding(path)
                embeddings.append(embedding)
                
                current_metadata = metadata[idx].copy()
                current_metadata.update({
                    "image_path": path,
                    "timestamp": time.time()
                })
                valid_metadata.append(current_metadata)
                
            except Exception as e:
                self.logger.error(f"Error processing image {path}: {str(e)}")
                continue

        if embeddings:
            try:
                # Save embeddings
                self.index_endpoint.upsert_embeddings(
                    embeddings=embeddings,
                    metadata_list=valid_metadata
                )
                
                self.logger.info(f"Successfully added {len(embeddings)} images to index")
                
            except Exception as e:
                self.logger.error(f"Error adding embeddings to index: {str(e)}")
                raise

    def bulk_index_images(
        self,
        image_paths: List[str],
        metadata: List[Dict],
        batch_size: int = 100
    ):
        """Bulk index images with batching"""
        for i in range(0, len(image_paths), batch_size):
            batch_paths = image_paths[i:i + batch_size]
            batch_metadata = metadata[i:i + batch_size]
            
            self.logger.info(f"Processing batch {i//batch_size + 1}")
            try:
                self.add_images(batch_paths, batch_metadata)
            except Exception as e:
                self.logger.error(f"Error processing batch {i//batch_size + 1}: {str(e)}")
                continue

    def search_similar_images(
        self,
        query_image_path: str,
        num_neighbors: int = 5,
        filter_expression: Optional[str] = None
    ) -> List[Dict]:
        """Search for similar images"""
        try:
            query_embedding = self.generate_embedding(query_image_path)
            
            search_result = self.index_endpoint.find_neighbors(
                deployed_index_id=f"deployed_{self.index_display_name}",
                queries=[query_embedding],
                num_neighbors=num_neighbors,
                filter_expression=filter_expression
            )
            
            results = []
            for neighbor in search_result[0]:
                results.append({
                    "metadata": neighbor.metadata,
                    "distance": neighbor.distance,
                    "id": neighbor.id
                })
                
            return results
            
        except Exception as e:
            self.logger.error(f"Error searching similar images: {str(e)}")
            raise
