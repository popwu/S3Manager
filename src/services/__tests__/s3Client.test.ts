import { describe, it, expect, vi } from 'vitest';
import { S3Service } from '../s3Client';
import { S3Config } from '../../types/s3';

// S3 兼容协议测试配置
const testConfig: S3Config = {
  id: 'test',
  name: 'test',
  bucket: 'bsv',
  region: 'auto',
  accessKeyId: '4bd8076123233edf3b3e3adfe95dd198',
  secretAccessKey: '2b3ef7824c7dfad522251d802f2a565915ed523c782262eadf1d31e89ef70c5a',
  endpoint: 'https://d201ab745ab7ea0913da8a38e3989474.r2.cloudflarestorage.com'
};

describe('S3Service with S3 Compatible Protocol', () => {
  describe('constructor', () => {
    it('should initialize with valid config', () => {
      const service = new S3Service(testConfig);
      console.log('S3Service initialized with config:', testConfig);
      expect(service).toBeInstanceOf(S3Service);
    });
  });

  describe('basic operations', () => {
    const testPrefix = 'test-files/';
    const testKey = `${testPrefix}test-file.txt`;

    it('should upload, list, download and delete test file', async () => {
      const service = new S3Service(testConfig);
      
      // 1. Upload test file
      const file = new File(['test content'], 'test-file.txt', { type: 'text/plain' });
      console.log('Uploading test file:', { key: testKey, size: file.size });
      await service.uploadFile(file, testKey);
      console.log('Test file uploaded successfully');

      // 2. List files
      const files = await service.listFiles(testPrefix);
      console.log('Listed files:', files);
      expect(files.some(f => f.key === testKey)).toBe(true);

      // 3. Download file
      console.log('Downloading test file:', testKey);
      const blob = await service.downloadFile(testKey);
      console.log('Test file downloaded:', { size: blob.size, type: blob.type });
      expect(blob).toBeInstanceOf(Blob);

      // 4. Delete file
      console.log('Deleting test file:', testKey);
      await service.deleteFile(testKey);
      console.log('Test file deleted successfully');

      // Verify deletion
      const filesAfterDelete = await service.listFiles(testPrefix);
      expect(filesAfterDelete.some(f => f.key === testKey)).toBe(false);
    }, 30000); // 设置30秒超时
  });
});
