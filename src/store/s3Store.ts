import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { S3Config } from '../types/s3';

interface S3Store {
  configs: S3Config[];
  activeConfigId: string | null;
  addConfig: (config: Omit<S3Config, 'id'>) => void;
  updateConfig: (id: string, config: Partial<S3Config>) => void;
  deleteConfig: (id: string) => void;
  setActiveConfig: (id: string | null) => void;
}

export const useS3Store = create<S3Store>()(
  persist(
    (set) => ({
      configs: [],
      activeConfigId: null,
      addConfig: (config) =>
        set((state) => ({
          configs: [...state.configs, { ...config, id: crypto.randomUUID() }],
        })),
      updateConfig: (id, config) =>
        set((state) => ({
          configs: state.configs.map((c) =>
            c.id === id ? { ...c, ...config } : c
          ),
        })),
      deleteConfig: (id) =>
        set((state) => ({
          configs: state.configs.filter((c) => c.id !== id),
          activeConfigId: state.activeConfigId === id ? null : state.activeConfigId,
        })),
      setActiveConfig: (id) => set({ activeConfigId: id }),
    }),
    {
      name: 's3-manager-storage',
    }
  )
);