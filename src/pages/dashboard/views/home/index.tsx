import React, { useEffect, useState } from 'react';
import { List, message, Typography } from 'antd';
import { RouteComponentProps } from 'react-router-dom';
import { useRecentService, useWindowService } from 'base/browser/AppContext';
import { BaseLayout } from 'pages/dashboard/components/layout';

import styles from './home.module.less';

import { UserBar } from '../../components/user-bar';
import { URI } from '@opensumi/ide-utils/lib/uri';
import { Link } from 'pages/dashboard/components/link';

interface WorkspaceRouteParams {
  type?: string;
}

export const HomePage: React.FunctionComponent<RouteComponentProps<WorkspaceRouteParams>> = (props) => {
  const [workspaces, setWorkspaces] = useState<string[]>([]);
  const winService = useWindowService();
  const recentService = useRecentService();

  useEffect(() => {
    recentService.recentWorkspaces().then((list) => {
      setWorkspaces(list);
    });
  }, []);

  return (
    <BaseLayout>
      <UserBar message={message} />
      <div className={styles.workspace_line} />
      <div className={styles.recent}>
        <Typography.Title level={3}>最近打开</Typography.Title>
        <List
          size="small"
          itemLayout="horizontal"
          dataSource={workspaces}
          renderItem={(workspace) => (
            <List.Item>
              <Link key={workspace} onClick={() => winService.openEditor(workspace)}>
                {new URI(workspace).codeUri.fsPath}
              </Link>
            </List.Item>
          )}
        />
      </div>
    </BaseLayout>
  );
};
