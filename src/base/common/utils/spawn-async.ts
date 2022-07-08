import { ChildProcess, SpawnOptions as NodeSpawnOptions } from 'child_process';
import spawn from 'cross-spawn';

export interface SpawnOptions extends NodeSpawnOptions {
  ignoreStdio?: boolean;
}

export interface SpawnPromise<T> extends Promise<T> {
  child: ChildProcess;
}

export interface SpawnResult {
  pid: number;
  output: string[];
  stdout: string;
  stderr: string;
  status: number | null;
  signal: string | null;
}

export const spawnAsync = (command: string, args?: ReadonlyArray<string>, options: SpawnOptions = {}): Promise<SpawnResult> => {
  const fakeErr = new Error('fake error just to preserve stacktrace');
  const previousStack = fakeErr.stack && fakeErr.stack.split('\n').splice(1);
  const previousStackString = previousStack && ['    ...', ...previousStack].join('\n');

  let child: ChildProcess;
  return new Promise((resolve, reject) => {
    const { ignoreStdio, ...nodeOptions } = options;
    child = spawn(command, args, nodeOptions);
    let stdout = '';
    let stderr = '';

    if (!ignoreStdio) {
      if (child.stdout) {
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });
      }

      if (child.stderr) {
        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      }
    }

    const completionListener = (code: number | null, signal: string | null) => {
      child.removeListener('error', errorListener);
      const result: SpawnResult = {
        pid: child.pid,
        output: [stdout, stderr],
        stdout,
        stderr,
        status: code,
        signal,
      };
      if (code !== 0) {
        const error = signal
          ? new Error(`${command} exited with signal: ${signal}`)
          : new Error(`${command} exited with non-zero code: ${code}`);
        if (error.stack && previousStackString) {
          error.stack += `\n${previousStackString}`;
        }
        Object.assign(error, result);
        reject(error);
      } else {
        resolve(result);
      }
    };

    let errorListener = (error: Error) => {
      if (ignoreStdio) {
        child.removeListener('exit', completionListener);
      } else {
        child.removeListener('close', completionListener);
      }
      Object.assign(error, {
        pid: child.pid,
        output: [stdout, stderr],
        stdout,
        stderr,
        status: null,
        signal: null,
      });
      reject(error);
    };

    if (ignoreStdio) {
      child.once('exit', completionListener);
    } else {
      child.once('close', completionListener);
    }
    child.once('error', errorListener);
  });
};
