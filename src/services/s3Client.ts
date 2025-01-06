import { S3Client, ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { S3Config, S3File } from '../types/s3';
import { logger } from '../utils/logger';

export class S3Service {
  private client: S3Client;
  private bucket: string;
  // private endpoint: string;

  constructor(config: S3Config) {
    // Extract bucket name from URL if present
    // const urlPattern = /^(https?:\/\/[^\/]+)\/([^\/]+)/;
    // const match = config.bucket.match(urlPattern);
    
    // if (match) {
    //   this.endpoint = match[1];
    //   this.bucket = match[2];
    // } else {
    this.bucket = config.bucket;
    //   this.endpoint = config.endpoint || '';
    // }

    logger.debug('Initializing S3 client with config:', {
      region: config.region,
      bucket: config.bucket,
      endpoint: config.endpoint,
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    });
    
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      customUserAgent: 's3-browser-client',
      disableHostPrefix: true,
      signerConstructor: SignatureV4
    });
  }

  async listFiles(prefix: string = ''): Promise<S3File[]> {
    try {
      logger.debug('Listing files with prefix:', prefix);
      
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        Delimiter: '/',
      });

      const response = await this.client.send(command);
      const files: S3File[] = [];

      // Add directories
      response.CommonPrefixes?.forEach((prefix) => {
        if (prefix.Prefix) {
          files.push({
            key: prefix.Prefix,
            size: 0,
            lastModified: new Date(),
            isDirectory: true,
          });
        }
      });

      // Add files
      response.Contents?.forEach((content) => {
        if (content.Key && content.Key !== prefix) {
          files.push({
            key: content.Key,
            size: content.Size || 0,
            lastModified: content.LastModified || new Date(),
            isDirectory: false,
          });
        }
      });

      logger.debug('Listed files:', files);
      return files;
    } catch (err) {
      if (err instanceof Error) {
        logger.error('Failed to list files', err);
        throw new Error(`Failed to load files: ${err.message}`);
      } else {
        logger.error('Failed to list files', err);
        throw new Error('An unknown error occurred while loading files');
      }
    }
  }

  async uploadFile(file: File, key: string): Promise<void> {
    try {
      logger.debug('Uploading file:', { key, size: file.size });
      
      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: file,
        },
      });

      await upload.done();
      logger.debug('File uploaded successfully:', key);
    } catch (error) {
      throw new Error(logger.error('Failed to upload file', error));
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      logger.debug('Deleting file:', key);
      
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      logger.debug('File deleted successfully:', key);
    } catch (error) {
      throw new Error(logger.error('Failed to delete file', error));
    }
  }

  async downloadFile(key: string): Promise<Blob> {
    try {
      logger.debug('Downloading file:', key);
      
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);
      if (!response.Body) {
        throw new Error('No file content received');
      }

      const blob = new Blob([await response.Body.transformToByteArray()]);
      logger.debug('File downloaded successfully:', { key, size: blob.size });
      return blob;
    } catch (error) {
      throw new Error(logger.error('Failed to download file', error));
    }
  }
}
