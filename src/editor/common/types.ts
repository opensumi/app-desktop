export const IHelloService = 'IHelloService';
export interface IHelloService {
  hello(): Promise<void>;
}

export const IMainStorageService = 'IMainStorageService';
export interface IMainStorageService {
  homeDir: string;
  setRootStoragePath: (storagePath: string) => void;
  getStoragePath: (storageName: string) => Promise<string | undefined>;
  getItem: <T = any>(storageName: string) => Promise<T>;
  getItemSync: <T = any>(storageName: string) => T;
  setItem: (storageName: string, value: any) => Promise<void>;
}

export const IRecentService = 'IRecentService';
export interface IRecentService {
  recentWorkspaces: () => Promise<string[]>;
}
