import { useEffect, useState } from 'react';

/**
 * 对列表进行分页
 * @param itemList
 * @param pageVol
 * @returns
 */
export const usePagination = <T>(itemList: T[], pageVol = 16) => {
  const [list, setList] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [previousPageEnabled, setPreviousPageEnabled] = useState(false);
  const [nextPageEnabled, setNextPageEnabled] = useState(false);

  useEffect(() => {
    const list = itemList.slice(pageVol * page, pageVol * (page + 1));
    setList(list);

    const maxPage = Math.ceil(itemList.length / pageVol) - 1;
    setPreviousPageEnabled(page > 0);
    setNextPageEnabled(page < maxPage);
  }, [itemList, page]);

  const previousPage = () => {
    setPage(page - 1);
  };

  const nextPage = () => {
    setPage(page + 1);
  };

  return {
    previousPageEnabled,
    nextPageEnabled,
    previousPage,
    nextPage,
    currentList: list,
  };
};