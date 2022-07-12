import { Injectable } from '@opensumi/di';
import { shell } from 'electron';
import { stat } from 'fs-extra';
import { dirname } from 'path';
import { spawn } from 'child_process';
import { IShellService } from 'base/common/types/services';
import { isWin } from 'base/common/utils';
import { BaseService } from 'base/common/services/base';

@Injectable()
export class ShellService extends BaseService implements IShellService {
  async openItem(path: string) {
    return shell.openPath(path);
  }

  async openExternal(uri: string) {
    shell.openExternal(uri);
  }

  async revealInFinder(path: string) {
    shell.showItemInFolder(path);
  }

  async revealInSystemTerminal(path: string) {
    const fileStat = await stat(path);
    let targetPath = path;
    if (!fileStat.isDirectory()) {
      targetPath = dirname(path);
    }
    openInTerminal(targetPath);
  }
}

export async function openInTerminal(dir: string) {
  if (isWin) {
    spawn('cmd', ['/s', '/c', 'start', 'cmd.exe', '/K', 'cd', '/D', dir], {
      detached: true,
    });
  } else {
    spawn('open', ['-a', 'Terminal', dir], {
      detached: true,
    });
  }
}
