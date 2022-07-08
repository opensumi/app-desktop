interface WindowQueryMetadata {
  id: number;
  name: string; // window name
  userHome: string;
  rpcPath?: string;
  windowStartTime?: number;
  gotoInfos?: string[];
  kits?: string[];
  extensionDevelopmentHost?: boolean;
  [key: string]: any;
}

interface Window {
  id: number;
  webContentsId: number;
  store: unknown;
  injector: unknown;
  code: string;
  URI: any;
  metadata: WindowQueryMetadata;
  createRPCNetConnection: any;
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
}
