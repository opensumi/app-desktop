import React, { useContext } from 'react';

import type { Injector } from '@opensumi/di';

import {
  IShellService,
  IDialogService,
  IWindowService,
  ILoggerService,
  IRecentService,
} from 'base/common/types/services';
import { IEventService } from './services/event';

interface IAppContext {
  injector: Injector | null;
}

let baseInjector: Injector | null = null;

interface IAppContext {
  injector: Injector | null;
}

export const AppContext = React.createContext<IAppContext>({
  injector: null,
});

export const extraContextProvider = (injector: Injector) => ({ children }) => (
  <AppContext.Provider value={{ injector }}>
    {children}
  </AppContext.Provider>
);

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
