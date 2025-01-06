import { AwsError } from '../types/aws';

const DEBUG = true;

export const logger = {
  error: (message: string, error: unknown) => {
    console.error(message, error);
    if (DEBUG) {
      if (isAwsError(error)) {
        return `${message}\nAWS Error: ${error.name}\nMessage: ${error.message}\nRequest ID: ${error.$metadata?.requestId || 'N/A'}`;
      }
      return `${message}\nError: ${error instanceof Error ? error.message : String(error)}`;
    }
    return message;
  },
  debug: (...args: unknown[]) => {
    if (DEBUG) {
      console.log(...args);
    }
  }
};

function isAwsError(error: unknown): error is AwsError {
  return error !== null && 
         typeof error === 'object' && 
         '$metadata' in error &&
         'name' in error;
}