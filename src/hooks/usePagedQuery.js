import { useState, useEffect, useCallback, useRef } from 'react';
import { parseApiError } from '../utils/parseApiError';

/**
 * Hook générique pour interroger les endpoints paginés de Spring Boot :
 * Format Spring : { content: [], totalElements: number, totalPages: number, number: number, size: number }
 * Page de base : 0
 * 
 * @param {Function} queryFn Fonction asynchrone prenant ({ page, size, ...params }) et renvoyant la réponse
 * @param {Object} [initialParams={}] Paramètres initiaux (filtres, recherche...)
 * @param {number} [initialSize=10] Taille initiale de page
 * @param {boolean} [autoFetch=true] Si true, déclenche la requête immédiatement
 */
export const usePagedQuery = (queryFn, initialParams = {}, initialSize = 10, autoFetch = true) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0); // 0-based index
  const [size, setSize] = useState(initialSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const queryFnRef = useRef(queryFn);
  useEffect(() => {
    queryFnRef.current = queryFn;
  }, [queryFn]);

  const fetchData = useCallback(
    async (currentPage = page, currentSize = size, currentParams = params) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await queryFnRef.current({
          page: currentPage,
          size: currentSize,
          ...currentParams,
        });

        const resData = response?.data || response;

        if (resData && Array.isArray(resData.content)) {
          setData(resData.content);
          setTotalElements(resData.totalElements ?? resData.content.length);
          setTotalPages(resData.totalPages ?? 1);
          setPage(resData.number ?? currentPage);
          setSize(resData.size ?? currentSize);
        } else if (Array.isArray(resData)) {
          // Cas où l'endpoint renvoie directement un tableau sans pagination
          setData(resData);
          setTotalElements(resData.length);
          setTotalPages(1);
        } else {
          setData([]);
          setTotalElements(0);
          setTotalPages(0);
        }
      } catch (err) {
        const parsed = parseApiError(err, null, false);
        setError(parsed.message);
      } finally {
        setIsLoading(false);
      }
    },
    [page, size, params]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchData(page, size, params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, params, autoFetch]);

  const changePage = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const changeSize = useCallback((newSize) => {
    setSize(newSize);
    setPage(0);
  }, []);

  const updateParams = useCallback((newParams) => {
    setParams((prev) => ({ ...prev, ...newParams }));
    setPage(0);
  }, []);

  const resetParams = useCallback((defaultParams = {}) => {
    setParams(defaultParams);
    setPage(0);
  }, []);

  const refetch = useCallback(() => {
    return fetchData(page, size, params);
  }, [fetchData, page, size, params]);

  return {
    data,
    page,
    size,
    totalElements,
    totalPages,
    isLoading,
    error,
    params,
    changePage,
    changeSize,
    updateParams,
    resetParams,
    refetch,
    setData, // utile pour les optimisations d'UI optimiste
  };
};

export default usePagedQuery;
