import * as Minio from 'minio';
import AppConfig from '../config/AppConfig';

class MinioStorage {
  private static instance: MinioStorage;
  private readonly client: Minio.Client;

  private constructor() {
    const config = AppConfig.getInstance();
    this.client = new Minio.Client({
      endPoint: config.minioEndpoint,
      port: config.minioPort,
      useSSL: config.minioUseSsl,
      accessKey: config.minioAccessKey,
      secretKey: config.minioSecretKey,
    });
  }

  static getInstance(): MinioStorage {
    if (!MinioStorage.instance) {
      MinioStorage.instance = new MinioStorage();
    }
    return MinioStorage.instance;
  }

  async ensureBucket(bucket: string): Promise<void> {
    const exists = await this.client.bucketExists(bucket);
    if (!exists) {
      await this.client.makeBucket(bucket);
    }

    // Allow public read so CDN/browser can fetch images directly
    const policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucket}/*`],
        },
      ],
    });
    await this.client.setBucketPolicy(bucket, policy);
  }

  async putObject(
    bucket: string,
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<void> {
    await this.client.putObject(bucket, key, buffer, buffer.length, {
      'Content-Type': contentType,
    });
  }

  async removeObject(bucket: string, key: string): Promise<void> {
    await this.client.removeObject(bucket, key);
  }
}

export default MinioStorage;
