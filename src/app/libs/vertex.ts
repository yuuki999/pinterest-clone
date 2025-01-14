import { PredictionServiceClient } from '@google-cloud/aiplatform';

const predictionClient = new PredictionServiceClient({
  apiEndpoint: 'us-central1-aiplatform.googleapis.com',
});

export async function getImageEmbedding(imageUrl: string) {
  const endpoint = `projects/${process.env.GOOGLE_CLOUD_PROJECT}/locations/us-central1/publishers/google/models/multimodalembedding@001`;
  
  const instance = {
    image: {
      gcsUri: imageUrl // Google Cloud Storageのパス
    }
  };

  const request = {
    endpoint,
    instances: [instance]
  };

  const [response] = await predictionClient.predict(request);
  return response.predictions[0].imageEmbedding;
}
