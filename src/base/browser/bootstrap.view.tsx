import React from 'react';
import ReactDOM from 'react-dom';
import { AppContext, setBaseInjector } from 'base/browser/AppContext';
import { bootstrap } from 'base/browser/bootstrap';

interface PageRenderOptions {
  dom?: HTMLElement | null;
}

export const pageRender = async (app: JSX.Element, options?: PageRenderOptions) => {
  const { injector } = await bootstrap();
  setBaseInjector(injector);
  const innerApp = (
    <AppContext.Provider value={{ injector }}>
      {app}
    </AppContext.Provider>);

  const innerDom = options?.dom || document.getElementById('main')!;
  return new Promise<void>((resolve) => {
    ReactDOM.render(innerApp, innerDom, () => {
      resolve();
    });
  });
};
