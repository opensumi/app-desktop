import React from 'react';
import cls from 'classnames';
import { TabRendererBase } from '@opensumi/ide-main-layout/lib/browser/tabbar/renderer.view';
import { LeftTabPanelRenderer, RightTabPanelRenderer } from '@opensumi/ide-main-layout/lib/browser/tabbar/panel.view';
import { TabbarServiceFactory, TabbarService } from '@opensumi/ide-main-layout/lib/browser/tabbar/tabbar.service';
import { ComponentRegistryInfo, useInjectable } from '@opensumi/ide-core-browser';

export const EmptyRightTabbarRenderer: React.FC = () => {
  const tabbarService: TabbarService = useInjectable(TabbarServiceFactory)('right');
  tabbarService.barSize = 0;
  return <div style={{ width: 0 }} />;
};

export const EmptyLeftTabbarRenderer: React.FC = () => {
  const tabbarService: TabbarService = useInjectable(TabbarServiceFactory)('left');
  tabbarService.barSize = 0;
  return <div style={{ width: 0 }} />;
};

export const RightTabRenderer = ({
  className,
  components,
}: {
  className: string;
  components: ComponentRegistryInfo[];
}) => (
  <TabRendererBase
    side='right'
    direction='right-to-left'
    className='right-slot'
    components={components}
    TabbarView={EmptyRightTabbarRenderer}
    TabpanelView={RightTabPanelRenderer}
  />
);

export const CenterTabRenderer = ({
  className,
  components,
}: {
  className: string;
  components: ComponentRegistryInfo[];
}) => (
  <TabRendererBase
    side='center'
    direction='left-to-right'
    className={cls(className, 'left-slot')}
    components={components}
    TabbarView={EmptyLeftTabbarRenderer}
    TabpanelView={LeftTabPanelRenderer}
  />
);

export const LeftTabRenderer = ({
  className,
  components,
}: {
  className: string;
  components: ComponentRegistryInfo[];
}) => (
  <TabRendererBase
    side='left'
    direction='left-to-right'
    className='left-slot'
    components={components}
    TabbarView={EmptyLeftTabbarRenderer}
    TabpanelView={LeftTabPanelRenderer}
  />
);
