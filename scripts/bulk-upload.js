const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');

// Prismaクライアントの初期化
const prisma = new PrismaClient();

// S3の設定
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const S3_BASE_PATH = 'cm2pw9n4n0000xyolfazhvmvy';

async function uploadFileToS3(filePath) {
  const fileName = path.basename(filePath);
  try {
    const fileContent = fs.readFileSync(filePath);
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    const extension = path.extname(filePath);
    const key = `${S3_BASE_PATH}/${uuidv4()}${extension}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
    }));

    return {
      success: true,
      key,
      fileName
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー',
      fileName
    };
  }
}

async function createPinRecord(imageUrl, fileName) {
  try {
    await prisma.pin.create({
      data: {
        title: path.basename(fileName, path.extname(fileName)),
        description: `Bulk uploaded: ${fileName}`,
        imageUrl,
        userId: 'cm2pw9n4n0000xyolfazhvmvy', // 管理者のユーザーIDを設定
      }
    });
    return true;
  } catch (error) {
    console.error(`Failed to create pin record for ${fileName}:`, error);
    return false;
  }
}

async function processDirectory(directoryPath) {
  const results = {
    successful: [],
    failed: []
  };

  try {
    const files = fs.readdirSync(directoryPath);
    
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile() && /\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
        console.log(`Uploading ${file}...`);
        
        const uploadResult = await uploadFileToS3(filePath);
        
        if (uploadResult.success && uploadResult.key) {
          const pinCreated = await createPinRecord(uploadResult.key, file);
          if (pinCreated) {
            results.successful.push(file);
            console.log(`✓ Successfully uploaded and created pin for ${file}`);
          } else {
            results.failed.push({ fileName: file, error: 'Failed to create pin record' });
            console.error(`✗ Failed to create pin record for ${file}`);
          }
        } else {
          results.failed.push({ 
            fileName: file, 
            error: uploadResult.error || 'Upload failed'
          });
          console.error(`✗ Failed to upload ${file}: ${uploadResult.error}`);
        }
      }
    }

    console.log('\n=== Upload Summary ===');
    console.log(`Total files processed: ${files.length}`);
    console.log(`Successfully uploaded: ${results.successful.length}`);
    console.log(`Failed: ${results.failed.length}`);
    
    if (results.failed.length > 0) {
      console.log('\nFailed uploads:');
      results.failed.forEach(({ fileName, error }) => {
        console.log(`- ${fileName}: ${error}`);
      });
    }

  } catch (error) {
    console.error('Error processing directory:', error);
    throw error;
  } finally {
    // Prismaクライアントを終了
    await prisma.$disconnect();
  }

  return results;
}

// 環境変数の読み込み
require('dotenv').config();

// 環境変数チェック
const requiredEnvVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_BUCKET_NAME',
  'DATABASE_URL'  // Prismaに必要
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// コマンドライン引数からディレクトリパスを取得
const directoryPath = process.argv[2];

if (!directoryPath) {
  console.error('使用方法: pnpm run bulk-upload /path/to/images/directory');
  process.exit(1);
}

if (!fs.existsSync(directoryPath)) {
  console.error('指定されたディレクトリが存在しません:', directoryPath);
  process.exit(1);
}

console.log(`Starting bulk upload from ${directoryPath}`);
console.log(`Upload destination: s3://${BUCKET_NAME}/${S3_BASE_PATH}/`);

processDirectory(directoryPath)
  .then(() => {
    console.log('Bulk upload completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Bulk upload failed:', error);
    process.exit(1);
  });
