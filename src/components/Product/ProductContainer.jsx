import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import axios from '../../api/axios';
import styled from 'styled-components';
import ProductCard from './ProductCard';
import { useLocation } from 'react-router-dom';
import FilterBar from './FilterBar';

const PAGE_SIZE = 8;

const ProductContainer = () => {
  const location = useLocation();

  const category = useMemo(() => {
    const qs = new URLSearchParams(location.search);
    const c = qs.get('category');
    return c && c.trim().length > 0 ? c : undefined;
  }, [location.search]); // [7]

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [initialLoading, setInitialLoading] = useState(false);
  const [pagingLoading, setPagingLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasMore = useMemo(() => page < totalPages, [page, totalPages]);

  const inFlightRef = useRef(false);
  const ignoreRef = useRef(false);
  const sentinelRef = useRef(null);

  /* =========================
   # 필터/정렬 쿼리 (백엔드 준비되면 주석 해제)
   const { sort, order, limit, minPrice, maxPrice } = useMemo(() => {
     const qs = new URLSearchParams(location.search);
     return {
       sort: qs.get('sort') || 'recommend',                 // 추천순
       order: qs.get('order') || (qs.get('sort') === 'price' ? 'asc' : 'desc'),
       limit: Number(qs.get('limit') || PAGE_SIZE),         // 9/18/30/60 등
       minPrice: qs.get('minPrice') ? Number(qs.get('minPrice')) : undefined,
       maxPrice: qs.get('maxPrice') ? Number(qs.get('maxPrice')) : undefined,
     };
   }, [location.search]);
   ========================= */

  // 페이지 데이터 요청
  const fetchPage = useCallback(
    async (nextPage, isInitial = false) => {
      if (inFlightRef.current) return;

      const controller = new AbortController();
      inFlightRef.current = true;
      isInitial ? setInitialLoading(true) : setPagingLoading(true);

      /* =========================
   # fetchPage 파라미터 (백엔드 준비되면 주석 해제)
   try {
     const res = await axios.get('/api/items', {
       params: {
         ...(category ? { category } : {}),
         // ...(sort ? { sort } : {}),
         // ...(order ? { order } : {}),
         // ...(minPrice !== undefined ? { minPrice } : {}),
         // ...(maxPrice !== undefined ? { maxPrice } : {}),
         offset: nextOffset,
         // limit: limit, // 쿼리의 보기 개수 사용 (없으면 PAGE_SIZE)
         limit: PAGE_SIZE, // 임시 고정
       },
       signal: controller.signal,
     });
   } catch (e) { ... }
   ========================= */

      try {
        const res = await axios.get('/api/items', {
          params: {
            ...(category ? { category } : {}),
            page: nextPage,
            size: PAGE_SIZE,
          },
          signal: controller.signal,
        });
        console.log(res.data);
        if (ignoreRef.current) return;

        const data = res?.data ?? {};
        const pageItems = data?.content ?? [];

        setProducts((prev) => {
          const merged = isInitial ? pageItems : [...prev, ...pageItems];
          const seen = new Set();
          return merged.filter((p) => {
            const k = p?.id ?? JSON.stringify(p);
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
        });

        setPage(nextPage + 1);
        if (typeof data.totalPages === 'number') {
          setTotalPages(data.totalPages);
        }
      } catch (e) {
        if (!ignoreRef.current)
          setError('상품을 불러오는 중 문제가 발생했습니다.');
      } finally {
        if (!ignoreRef.current) {
          isInitial ? setInitialLoading(false) : setPagingLoading(false);
        }
        inFlightRef.current = false;
      }

      return controller;
    },
    [category]
  );

  /* =========================
   # 필터 변경 시 목록 리셋 (백엔드 준비되면 의존성에 포함)
   useEffect(() => {
     ignoreRef.current = false;
     setProducts([]); setOffset(0); setTotal(null); setError(null);
     let controller;
     (async () => { controller = await fetchPage(0, true); })();
     return () => { ignoreRef.current = true; if (controller) controller.abort(); };
   }, [
     category,
     // sort, order, minPrice, maxPrice, limit, // ← 서버 준비되면 주석 해제
     fetchPage
   ]);
   ========================= */

  // 초기 로드 및 카테고리 변경 시 리셋
  useEffect(() => {
    ignoreRef.current = false;
    setProducts([]);
    setPage(0);
    setTotalPages(1);
    setError(null);
    let controller;
    (async () => {
      controller = await fetchPage(0, true);
    })();
    return () => {
      ignoreRef.current = true;
      if (controller) controller.abort();
    };
  }, [category, fetchPage]);

  // IntersectionObserver로 무한 스크롤
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || initialLoading) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasMore && !inFlightRef.current) {
          fetchPage(page, false);
        }
      },
      { root: null, rootMargin: '0px 0px 150px 0px', threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [page, hasMore, initialLoading, fetchPage]);

  const handleAddToCart = useCallback(async (product) => {
    try {
      await axios.post('/api/cart/add', { itemId: product.id, count: 1 });
      alert(`${product.name}이(가) 장바구니에 담겼습니다.`);
    } catch (err) {
      console.error('장바구니 담기 실패:', err);
      alert('장바구니 담기 실패');
    }
  }, []);

  return (
    <ProductWrapper>
      {initialLoading && products.length === 0 && (
        <Status role="status">로딩 중...</Status>
      )}
      {error && products.length === 0 && (
        <Status>상품을 불러오지 못했습니다.</Status>
      )}
      <Title>{category}</Title>
      <FilterBar />
      <Grid>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </Grid>

      {pagingLoading && products.length > 0 && (
        <Status role="status">로딩 중...</Status>
      )}
      {error && products.length > 0 && (
        <Status>추가 상품을 불러오지 못했습니다.</Status>
      )}

      {hasMore && !initialLoading && (
        <Sentinel ref={sentinelRef} aria-hidden="true" />
      )}
    </ProductWrapper>
  );
};

export default ProductContainer;

const ProductWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
`;

const Sentinel = styled.div`
  width: 100%;
  height: 1px;
`;

const Status = styled.div`
  text-align: center;
  color: #666;
  padding: 12px 0;
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: bold;
`;
