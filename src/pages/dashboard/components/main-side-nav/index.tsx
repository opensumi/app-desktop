import React, { useEffect, useState } from 'react';
import { Menu } from 'antd';
import { Link, useHistory } from 'react-router-dom';
import { AppstoreOutlined } from '@ant-design/icons';
import style from './index.module.less';

const NavDict = {
  '/setting': 'setting',
  '/': 'myApp',
  '/workspace/pick': 'createApp',
  '/create': 'createApp',
};

export const MainSideNav = () => {
  const [selectedKey, setSelectedKey] = useState('myApp');
  const history = useHistory();

  useEffect(() => {
    const navKey = Object.keys(NavDict).find((key) => history.location.pathname.startsWith(key));
    if (navKey) {
      setSelectedKey(NavDict[navKey]);
    }
  }, []);

  return (
    <Menu
      key="mainSideMenu"
      theme="dark"
      mode="inline"
      className={style.nav}
      selectedKeys={[selectedKey]}
      onSelect={(param) => {
        setSelectedKey(param.key);
      }}
    >
      <Menu.Item key="myApp" icon={<AppstoreOutlined style={{ fontSize: 18 }} />}>
        <Link to="/" className={style.link}>
          我的应用
        </Link>
      </Menu.Item>
    </Menu>
  );
};
