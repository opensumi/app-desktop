export const safeParse = (data = '', defaultData: any) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error(e);
    return defaultData;
  }
};