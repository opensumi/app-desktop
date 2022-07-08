import React, { useEffect } from 'react';
import { TitleBar } from '../title-bar';
import { Button } from 'antd';
import { APP_NAME } from 'base/common/constants';

interface ControlGroupProps {
  onConfirmClick: undefined | (() => void);
}

interface DialogPorps {
  title?: string;
  titleHidden?: boolean;
  titleBarHidden?: boolean;
  titleBarLeft?: JSX.Element;
  titleBarRight?: JSX.Element;
  children: JSX.Element;
  onConfirmClick?: () => void;
}

const ControlGroup = (props: ControlGroupProps) => {
  const { onConfirmClick } = props;
  if (!onConfirmClick) return null;

  return (<div>
    <Button onClick={() => {
      window.close();
    }}
    >Cancel</Button>
    <Button type="primary" onClick={onConfirmClick}>Confirm</Button>
  </div>);
};

export const Dialog = (props: DialogPorps) => {
  const { title, titleHidden, titleBarLeft, titleBarRight, children, onConfirmClick, titleBarHidden } = props;

  useEffect(() => {
    // 设置界面的 title
    document.title = title ? `${title} — ${APP_NAME}` : APP_NAME;

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        setTimeout(() => {
          if (e.defaultPrevented) return;

          const closeEvent = new Event('close', { cancelable: true });
          const result = window.dispatchEvent(closeEvent);
          if (result) {
            window.close();
          }
        }, 0);
      }
    });
  }, []);

  return (
    <>
      <TitleBar leftComponent={titleBarLeft} rightComponent={titleBarRight} hidden={titleBarHidden}>{titleHidden ? '' : title}</TitleBar>
      {children}
      <ControlGroup onConfirmClick={onConfirmClick} />
    </>
  );
};