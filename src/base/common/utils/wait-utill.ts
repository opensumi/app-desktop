export const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

export interface IWaitUntilOption {
  retryTime: number;
  ms: number
}

export const waitUntil = async (func: any, options: IWaitUntilOption = { retryTime: 10, ms: 1000 }) => {
  let times = 0;
  const next = async () => {
    const result = await func();
    if (result) {
      return true;
    } if (times !== options.retryTime) {
      times++;
      await sleep(options.ms);
      return next();
    }
    return false;
  };
  return next();
};