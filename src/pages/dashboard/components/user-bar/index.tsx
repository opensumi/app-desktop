import React from 'react';
import { UserAvatar } from 'base/browser/components/user-avatar';

import styles from './index.module.less';

export const UserBar: React.FunctionComponent<any> = ({ removeLoading, message }) => {
  const logoutClick = () => true;
  const loginClick = () => undefined;

  const renderUser = () => (
    <>
      <div className={styles.user_nick_wrap}>
        <h3 className={styles.user_nick}>
          你好,
          OpenSumi
        </h3>
        <i className={`iconfont icondengchu ${styles.user_log_out}`} title="登出" onClick={logoutClick} />
      </div>
      <p className={styles.user_dep}>{'OpenSumi 前置页'}</p>
    </>
  );

  return (
    <div className={styles.workspace_user}>
      <UserAvatar onClick={loginClick} />
      <div className={styles.user_info}>{renderUser()}</div>
    </div>
  );
};
