export interface AwsError {
  name: string;
  message: string;
  $metadata: {
    requestId?: string;
    attempts?: number;
    totalRetryDelay?: number;
  };
}