import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import cls from 'classnames';
import { useInjectable } from '@opensumi/ide-core-browser';
import { TabbarService } from '@opensumi/ide-main-layout/lib/browser/tabbar/tabbar.service';
import { ToolBar } from '@opensumi/ide-toolbar/lib/browser/toolbar.view';
import { Button, Icon } from '@opensumi/ide-components';

import { useEventService } from 'base/browser/AppContext';

import { TopTabService } from './top-tab.service';
import styles from './top-tab.module.less';

import type { ComponentRegistryInfo } from '@opensumi/ide-core-browser';

export const splitVisibleTabs = (containers: ComponentRegistryInfo[], tabSize: number) => [
  containers.slice(0, tabSize),
  containers.slice(tabSize),
];

export const TopTab = observer(() => {
  const topTabService: TopTabService = useInjectable(TopTabService);
  const event = useEventService();
  const [fullScreenStyle, setFullScreenStyle] = useState({});

  const renderTabItem = (side) => {
    if (side === 'center') {
      return <ToolBar />;
    }
    const tabbarService: TabbarService = topTabService[`${side}TabBarService`];

    const { handleTabClick, currentContainerId } = tabbarService;
    const [visibleContainers, hideContainers] = splitVisibleTabs(tabbarService.visibleContainers, 6);
    // 左右侧不能注册同 ID 视图，否则 More 按钮逻辑将会失效, 且当前只支持左边的More
    hideContainers.forEach((component) => {
      const containerId = component.options?.containerId;
      if (containerId) {
        tabbarService.updateTabInMoreKey(containerId, true);
      }
    });

    const components = visibleContainers
      .sort((a, b) => {
        if (!a.options?.priority) {
          return 1;
        }
        if (!b.options?.priority) {
          return -1;
        }
        return b.options?.priority - a.options?.priority;
      })
      .filter((component) => !component.options?.hideTab)
      .map((component) => {
        const containerId = component.options?.containerId;
        tabbarService.updateTabInMoreKey(containerId!, false);
        return (
          <div
            className={styles.topTabItem}
            key={containerId}
            id={containerId}
            onClick={(e) => handleTabClick(e)}
            title={component.options!.title}>
            <Button
              className={cls([{ active: currentContainerId === containerId }, styles.tabBtn, 'activity-icon'])}
              type={'link'}>
              <span
                className={cls(
                  component.options!.iconClass,
                  component.options!.iconClass &&
                  component.options!.iconClass?.indexOf('mask-mode') >= 0 &&
                  styles.maskIcon,
                )}></span>
            </Button>
            <div className={styles.tabTitle}>{component.options!.title}</div>
          </div>
        );
      });
    if (hideContainers.length > 0) {
      components.push(
        <li
          key='tab-more'
          onClick={(e) =>
            tabbarService.showMoreMenu(
              e,
              visibleContainers[visibleContainers.length - 1] &&
              visibleContainers[visibleContainers.length - 1].options!.containerId,
            )
          }
          className={styles.moreTabItem}>
          <Icon icon='doubleright' size='large'></Icon>
        </li>,
      );
    }
    return components;
  };

  useEffect(() => {
    // event.on('full-screen', (event, maximize: boolean) => {
    //   const style = maximize ? { paddingTop: '8px' } : {};
    //   setFullScreenStyle(style);
    // });
  }, []);

  return (
    <div className={styles.topTabWrap} style={fullScreenStyle}>
      <div className={styles.leftTabWrap}>{renderTabItem('left')}</div>
      <div className={styles.centerTabWrap}>{renderTabItem('center')}</div>
      <div className={styles.rightTabWrap}>
        {renderTabItem('right')}
      </div>
    </div>
  );
});
