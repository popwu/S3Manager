import React from 'react';
import { Folder, File, Download, Trash2, Upload } from 'lucide-react';
import { S3File } from '../types/s3';
import { S3Service } from '../services/s3Client';

interface FileListProps {
  files: S3File[];
  currentPath: string;
  s3Service: S3Service;
  onNavigate: (path: string) => void;
  onRefresh: () => void;
}

export function FileList({ files, currentPath, s3Service, onNavigate, onRefresh }: FileListProps) {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const key = currentPath + file.name;
      await s3Service.uploadFile(file, key);
      onRefresh();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file');
    }
  };

  const handleDownload = async (key: string) => {
    try {
      const blob = await s3Service.downloadFile(key);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = key.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file');
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await s3Service.deleteFile(key);
      onRefresh();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete file');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Path: {currentPath || '/'}
        </div>
        <label className="cursor-pointer inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload File
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </div>

      <div className="bg-white rounded-lg shadow">
        <ul className="divide-y divide-gray-200">
          {currentPath && (
            <li
              className="px-4 py-3 flex items-center hover:bg-gray-50 cursor-pointer"
              onClick={() => onNavigate(currentPath.split('/').slice(0, -2).join('/') + '/')}
            >
              <Folder className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-900">..</span>
            </li>
          )}
          {files.map((file) => (
            <li
              key={file.key}
              className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <div
                className="flex items-center cursor-pointer"
                onClick={() => file.isDirectory && onNavigate(file.key)}
              >
                {file.isDirectory ? (
                  <Folder className="w-5 h-5 text-gray-400 mr-3" />
                ) : (
                  <File className="w-5 h-5 text-gray-400 mr-3" />
                )}
                <span className="text-sm text-gray-900">
                  {file.key.split('/').slice(-2)[0]}
                </span>
              </div>
              {!file.isDirectory && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(file.key)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.key)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}