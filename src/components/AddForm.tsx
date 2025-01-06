import React from 'react';
import { Plus } from 'lucide-react';
import { useS3Store } from '../store/s3Store';

interface AddFormProps {
  onClose: () => void;
}

export function AddForm({ onClose }: AddFormProps) {
  const { addConfig } = useS3Store();
  const [formData, setFormData] = React.useState({
    name: '',
    bucket: '',
    region: '',
    accessKeyId: '',
    secretAccessKey: '',
    endpoint: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addConfig(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          required
          value={formData.bucket}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Bucket</label>
        <input
          type="text"
          required
          value={formData.bucket}
          onChange={(e) => setFormData({ ...formData, bucket: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Region</label>
        <input
          type="text"
          required
          value={formData.region}
          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Access Key ID</label>
        <input
          type="text"
          required
          value={formData.accessKeyId}
          onChange={(e) => setFormData({ ...formData, accessKeyId: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Secret Access Key</label>
        <input
          type="password"
          required
          value={formData.secretAccessKey}
          onChange={(e) => setFormData({ ...formData, secretAccessKey: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Endpoint</label>
        <input
          type="text"
          required
          value={formData.endpoint}
          onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Configuration
        </button>
      </div>
    </form>
  );
}
