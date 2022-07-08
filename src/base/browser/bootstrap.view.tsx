import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as StoreProvider } from 'react-redux';
import { Injector } from '@opensumi/di';
import { AppProvider, setBaseInjector } from 'base/browser/AppContext';
import { bootstrap } from 'base/browser/bootstrap';

interface PageRenderOptions {
  dom?: HTMLElement | null;
}

export const pageRender = async (app: JSX.Element, options?: PageRenderOptions) => {
  const { injector } = await bootstrap();
  setBaseInjector(injector);
  const innerApp = (
    <AppProvider injector={injector}>
      {app}
    </AppProvider>);

  const innerDom = options?.dom || document.getElementById('main')!;
  return new Promise<void>((resolve) => {
    ReactDOM.render(innerApp, innerDom, () => {
      resolve();
    });
  });
};
