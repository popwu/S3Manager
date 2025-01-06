export interface S3Config {
  id: string;
  name: string;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
}

export interface S3File {
  key: string;
  size: number;
  lastModified: Date;
  isDirectory: boolean;
}
