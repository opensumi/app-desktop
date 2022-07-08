import querystring from 'querystring';
import type { RequestInfo, Response } from 'node-fetch';
import nodeFetch from 'node-fetch';
import { APP_NAME } from '../constants';
import type { PathLike } from './fs';
import { ensureRm, fsp } from './fs';
import { getVersions } from './versions';

export type { RequestInfo } from 'node-fetch';

const DEFAULT_DOWNLOAD_TIMEOUT = 20 * 60 * 1000; // 20 mins

export interface FetchOptions {
  query?: Record<string, any>;
  method?: string;
  headers?: Record<string, string>;
  timeout?: number; // ms
  body?: Record<string, any>;
  [key: string]: any;
}

function getUserAgent() {
  const versions = getVersions();
  const appName = APP_NAME;
  const { platform } = process;
  const version = versions.clientVersion;
  const { arch } = process;
  const addonInfo = `Electron/${process.versions.electron} Kaitian/${versions.frameworkVersion}`;

  return `${appName}/${version} (${platform} ${arch}) ${addonInfo}`;
}

function appendQuery(url: RequestInfo, query: Record<string, string>) {
  if (typeof url === 'string' && query) {
    const _url = new URL(url);
    for (const key in query) {
      if (key) {
        _url.searchParams.append(key, query[key]);
      }
    }
    return _url.toString();
  }
  return url;
}

enum HTTP_CODE { }

export enum FetchErrorCode {
  // 未设置错误
  UNKNOWN_ERROR = 10000,
  // 网络请求错误
  FETCH_ERROR = 10001,
  // 解析 JSON 失败
  PARSE_ERROR = 10002,
}

/**
 * 封装网络异常错误
 */
export class FetchError extends Error {
  name = 'FetchError';

  // 内部错误 NetworkErrorCode 并兼容 http code
  status: number = FetchErrorCode.UNKNOWN_ERROR;

  // 错误中消息的内容
  body: any;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status || 0;
  }
}

const userAgent = getUserAgent();
export async function fetch(uri: RequestInfo, options: FetchOptions = {}) {
  const { body: _body, query, headers: _headers, ...fetchOpts } = options;

  const method = options.method || 'GET';
  const url = query ? appendQuery(uri, query) : uri;

  let contentType: string;
  let headers = _headers;
  let body: string | undefined;

  // 处理 body 数据
  if (['GET', 'HEAD'].includes(method.toUpperCase())) {
    // GET HEAD 都不允许携带 body 数据
    body = undefined;
  } else if (_body) {
    contentType = (_headers && (_headers['content-type'] || _headers['Content-Type'])) || '';
    if (contentType) {
      headers = { ..._headers, 'content-type': contentType };
    }

    // 还有一种情况，如果 body 在，并且没有 method 为 get，
    if (typeof _body === 'string') {
      body = _body;
    } else if (contentType.includes('application/json')) {
      body = JSON.stringify(_body);
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      body = querystring.stringify(_body);
    } else {
      throw new Error('body 只支持 string 和 object 类型');
    }
  }

  const opts = {
    method,
    headers: {
      'User-Agent': userAgent,
      'Cache-control': 'no-cache',
      ...headers,
    },
    body,
    ...fetchOpts,
  };
  let res: Response;
  try {
    res = await nodeFetch(url, opts);
  } catch (error) {
    throw new FetchError(error.message, FetchErrorCode.FETCH_ERROR);
  }

  if (!res.ok) {
    throw new FetchError(
      `[${options.method || 'GET'}] ${res.status} ${res.statusText} ${uri}\n${await res.text()}`,
      res.status,
    );
  }

  return res;
}

/**
 * query: 会自动 append 到 uri 的后面
 * body: 会认为是 json object，直接传送
 * param: 不会被识别，如果想要提交表单数据，可以这样做，
 * const params = new URLSearchParams();
 * params.append('a', 1);
 * fetchOptions: {
 *   method: 'POST',
 *   body: params,
 * }
 * 当 params 是 URLSearchParams 对象时，自动加上头字段 x-www-form-urlencoded
 *
 * @param apiUri
 * @param options
 * @returns
 */
export async function apiFetch<T = any>(apiUri: RequestInfo, options: FetchOptions = {}): Promise<T> {
  // 接受返回的 json 数据
  options.headers = { accept: 'application/json', ...options.headers };
  if (options.body && !options.headers['content-type']) {
    options.headers['content-type'] = 'application/json';
  }
  const res = await fetch(apiUri, options);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new FetchError(`Parse json fail: ${text}\n${error.message}`, FetchErrorCode.PARSE_ERROR);
  }
}

interface DownloadOptions {
  onData?: (info: { totalLength: number; currentLength: number }) => void;
  logger?: any;
  downloadTimeout?: number;
  ignoreCheckLength?: boolean;
}

/**
 * 下载文件，并且提供下载进度回调
 * @param uri 下载地址
 * @param targetPath
 * @param options
 * @returns
 */
export async function downloadFile(uri: RequestInfo, targetPath: PathLike, options: DownloadOptions = {}) {
  const res = await fetch(uri);

  // 确认删除了之前缓存的文件，Windows 对待未删除的文件如果不 append 就会异常退出
  await ensureRm(targetPath);

  return new Promise<void>((resolve, reject) => {
    const out = fsp.createWriteStream(targetPath);
    const timeout = options.downloadTimeout || DEFAULT_DOWNLOAD_TIMEOUT;
    const timer = setTimeout(() => {
      reject(new Error(`Download timeout ${timeout}.`));
      out.end();
    }, timeout);

    res.body.pipe(out);

    const totalLength: number = Number(res.headers.get('content-length')) || 0;
    let currentLength = 0;

    out.on('close', () => {
      resolve();
      clearTimeout(timer);
    });

    res.body.on('data', (chunk) => {
      currentLength += chunk.length;
      if (options.ignoreCheckLength) {
        options.logger?.info('Ignore check content length');
      } else if (totalLength !== 0 && currentLength > totalLength) {
        reject(new Error(`Download file length error. totalLength: ${totalLength}, currentLength: ${currentLength}`));
        return;
      }
      if (totalLength === 0 && options.logger) {
        options.logger.warn('totalLength is 0.');
      }
      if (options.onData) {
        options.onData({ totalLength, currentLength });
      }
    });
    res.body.on('end', () => {
      out.end();
    });

    res.body.on('error', (error) => {
      reject(error);
    });
  });
}

interface UrllibOption {
  method: string;
  timeout: number;
  dataType: string;
  headers: Record<string, string>;
  data: any;
  content: string;
  dataAsQueryString: boolean;
  contentType: string;
}

/**
 * 模拟 urllib request 请求的内容和行为
 * @param uri
 * @param options
 * @returns
 */
export async function mockUrllibRequest(uri: RequestInfo, options: UrllibOption) {
  const fetchOpts: FetchOptions = {};
  if (options.timeout) {
    fetchOpts.timeout = options.timeout;
  }
  if (!options.dataType) {
    options.dataType = 'text';
  }

  if (!fetchOpts.headers) {
    fetchOpts.headers = options.headers || {};
  }
  if (options.dataType === 'json') {
    fetchOpts.headers.accept = 'application/json';
  }

  fetchOpts.method = options.method;

  let _uri = uri;
  let body = options.content || options.data;
  const dataAsQueryString = options.method === 'GET' || options.method === 'HEAD' || options.dataAsQueryString;
  if (!options.content) {
    if (options.data && !(typeof options.data === 'string' || Buffer.isBuffer(options.data))) {
      // 兼容 urllib GET 里面有 data 的请求
      if (dataAsQueryString) {
        const query = querystring.stringify(options.data);
        _uri = `${_uri}?${query}`;
        body = undefined;
      } else {
        let contentType = options.headers['content-type'] || options.headers['Content-Type'];
        if (!contentType) {
          if (options.contentType === 'json') {
            contentType = 'application/json';
          } else {
            contentType = 'application/x-www-form-urlencoded';
          }
          fetchOpts.headers['content-type'] = contentType;
        }
        if (contentType.includes('application/json')) {
          body = JSON.stringify(body);
        } else {
          // 'application/x-www-form-urlencoded'
          body = querystring.stringify(body);
        }
      }
    }
  }

  fetchOpts.body = body;
  const res = await fetch(_uri, fetchOpts);
  const data = await res.text();
  return { status: res.status, data, headers: res.headers };
}
