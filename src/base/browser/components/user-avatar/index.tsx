import cls from 'classnames';
import React from 'react';

import styles from './index.module.less';

const defaultAvatarUrl = 'https://img.alicdn.com/imgextra/i2/O1CN01hqONs81e0ZNcEsXn8_!!6000000003809-2-tps-400-400.png';

interface IUserAvatar {
  onClick: () => void;
  className?: string;
}
export const UserAvatar = ({ onClick, className }: IUserAvatar) => (
  <>
    <img className={cls(className || styles.user_avatar, styles.user_avatar_cursor)} src={defaultAvatarUrl} alt="Not Login" onClick={onClick} />
  </>
);
