import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { useS3Store } from './store/s3Store';
import { AddForm } from './components/AddForm';
import { EditForm } from './components/EditForm';
import { FileList } from './components/FileList';
import { S3Service } from './services/s3Client';
import { S3File } from './types/s3';
import { logger } from './utils/logger';

export default function App() {
  const { configs, activeConfigId, setActiveConfig, deleteConfig } = useS3Store();
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState(false);
  const [files, setFiles] = useState<S3File[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [s3Service, setS3Service] = useState<S3Service | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeConfig = configs.find(c => c.id === activeConfigId);

  useEffect(() => {
    console.log('Debug - activeConfigId:', activeConfigId);
    console.log('Debug - configs:', configs.map(c => ({ id: c.id, bucket: c.bucket })));
    
    if (activeConfig) {
      logger.debug('Initializing with active config:', activeConfig.bucket);
      const service = new S3Service(activeConfig);
      setS3Service(service);
      loadFiles(service, '');
    } else {
      logger.debug('No active config, clearing state');
      setFiles([]);
      setS3Service(null);
      setCurrentPath('');
      setError(null);
    }
  }, [activeConfig]);

  const loadFiles = async (service: S3Service, path: string) => {
    try {
      setError(null);
      const fileList = await service.listFiles(path);
      setFiles(fileList);
      setCurrentPath(path);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('Failed to load files:', error);
      setError(errorMessage);
      setActiveConfig(null);
    }
  };

  const handleNavigate = (path: string) => {
    if (s3Service) {
      loadFiles(s3Service, path);
    }
  };

  // useEffect(() => {
  //   if (editingConfig) {
  //     console.log('Rendering ConfigForm with:', {
  //       editingConfig,
  //       activeConfigId,
  //       config: configs.find(c => c.id === activeConfigId),
  //       configs
  //     });
  //   }
  // }, [editingConfig, activeConfigId, configs]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">S3 Manager</h1>
            <button
              onClick={() => setShowConfigForm(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Configuration
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 whitespace-pre-wrap font-mono text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1 space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Configurations</h2>
              <ul className="space-y-2">
                {configs.map(config => (
                  <li
                    key={config.id}
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                      config.id === activeConfigId ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveConfig(config.id)}
                  >
                    <span className="text-sm font-medium">{config.name}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveConfig(config.id);
                          setEditingConfig(true);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this configuration?')) {
                            deleteConfig(config.id);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-3">
              {activeConfig && s3Service ? (
                <FileList
                  files={files}
                  currentPath={currentPath}
                  s3Service={s3Service}
                  onNavigate={handleNavigate}
                  onRefresh={() => loadFiles(s3Service, currentPath)}
                />
              ) : (
                <div className="text-center text-gray-500">
                  Select a configuration to view files
                </div>
              )}
            </div>
          </div>
        </div>

        {(showConfigForm || editingConfig) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingConfig ? 'Edit Configuration' : 'Add Configuration'}
              </h2>
              {editingConfig ? (
                <EditForm
                  config={configs.find(c => c.id === activeConfigId)!}
                  onClose={() => {
                    setShowConfigForm(false);
                    setEditingConfig(false);
                  }}
                />
              ) : (
                <AddForm
                  onClose={() => {
                    setShowConfigForm(false);
                    setEditingConfig(false);
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
