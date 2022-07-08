import React, { useContext } from 'react';

import type { Injector } from '@opensumi/di';

import {
  IShellService,
  IDialogService,
  IWindowService,
  ILoggerService,
} from 'base/common/types/services';
import { IEventService } from './services/event';
import { IRecentService } from 'editor/common/types';

interface IAppContext {
  injector: Injector | null;
}

let baseInjector: Injector | null = null;

export const AppContext = React.createContext({
  injector: null,
} as IAppContext);

export function AppProvider({ injector, children }) {
  return (
    <AppContext.Provider value={{ injector }}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * 由于 injector 可能在非常早的时候使用，加一个保底
 * @param injector
 */
export function setBaseInjector(injector: Injector) {
  baseInjector = injector;
}

export function useInjector() {
  const { injector } = useContext(AppContext);
  return injector;
}

export function useWindowService() {
  const { injector } = useContext(AppContext);
  return injector?.get(IWindowService) as IWindowService;
}

export function useDialogService() {
  const { injector } = useContext(AppContext);
  return injector?.get(IDialogService) as IDialogService;
}

export function useShellService() {
  const { injector } = useContext(AppContext);
  return injector?.get(IShellService) as IShellService;
}

export function useLoggerService() {
  const { injector } = useContext(AppContext);
  return injector?.get(ILoggerService) as ILoggerService;
}

export function useEventService() {
  const { injector } = useContext(AppContext);
  return injector?.get(IEventService) as IEventService;
}

export function useRecentService() {
  const { injector } = useContext(AppContext);
  return injector?.get(IRecentService) as IRecentService;
}
