import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from '../api/axios';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import SearchFilter from '../components/Search/SearchFilter';
import SearchResultList from '../components/Search/SearchResultList';

const PAGE_SIZE = 8;

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: '최신순' },
  { value: 'soldCount_desc', label: '판매량순' },
  { value: 'wishCount_desc', label: '좋아요순' },
  { value: 'price_asc', label: '낮은가격순' },
  { value: 'price_desc', label: '높은가격순' },
  { value: 'review_desc', label: '후기많은순' },
];

const SearchResultListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. URL 파라미터 추출 (useMemo를 사용하여 URL 변경 시 자동 계산)
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const query = queryParams.get('query') || '';

  // 필터 상태들: URL에서 직접 가져오기 때문에 별도의 set 함수보다 URL 변경이 우선순위가 됩니다.
  const selectedCategories = queryParams.getAll('categoryIds');
  const selectedCompanies = queryParams.getAll('company');
  const selectedDeliveryType = queryParams.get('deliveryType') || '';
  const minPrice = queryParams.get('minPrice')
    ? Number(queryParams.get('minPrice'))
    : null;
  const maxPrice = queryParams.get('maxPrice')
    ? Number(queryParams.get('maxPrice'))
    : null;

  // 2. 데이터 관리 상태
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [initialLoading, setInitialLoading] = useState(false);
  const [pagingLoading, setPagingLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasMore = useMemo(() => page < totalPages, [page, totalPages]);
  const inFlightRef = useRef(false);
  const ignoreRef = useRef(false);
  const sentinelRef = useRef(null);

  const [resultsCount, setResultsCount] = useState(0);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentSort = queryParams.get('sort') || 'latest';
  const currentDir = queryParams.get('dir') || 'desc';
  const currentSortValue = `${currentSort}_${currentDir}`;

  // 3. 데이터 페칭 함수
  const fetchPage = useCallback(
    async (nextPage, isInitial = false) => {
      if (inFlightRef.current) return;

      const controller = new AbortController();
      inFlightRef.current = true;
      isInitial ? setInitialLoading(true) : setPagingLoading(true);

      try {
        // 현재 URL의 모든 쿼리 파라미터를 복사하여 page/size만 추가/수정
        const sp = new URLSearchParams(location.search);
        sp.set('page', String(nextPage));
        sp.set('size', String(PAGE_SIZE));

        const res = await axios.get(`/items/search/advanced?${sp.toString()}`, {
          signal: controller.signal,
        });
        console.log('검색 결과:', res.data);
        if (ignoreRef.current) return;

        const data = res.data || {};
        const newItems = data.content || [];
        setResultsCount(data.totalElements || 0);

        setItems((prev) => (isInitial ? newItems : [...prev, ...newItems]));
        setPage(nextPage + 1);

        if (typeof data.totalPages === 'number') {
          setTotalPages(data.totalPages);
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error('검색 오류:', err);
          setError('상품을 불러오는 중 문제가 발생했습니다.');
        }
      } finally {
        if (!ignoreRef.current) {
          isInitial ? setInitialLoading(false) : setPagingLoading(false);
        }
        inFlightRef.current = false;
      }
    },
    [location.search]
  );

  // 4. URL 변경 시(필터 클릭 시) 데이터 리셋 및 재조회
  useEffect(() => {
    ignoreRef.current = false;
    setItems([]);
    setPage(0);
    setTotalPages(1);
    setError(null);

    fetchPage(0, true);

    return () => {
      ignoreRef.current = true;
    };
  }, [location.search, fetchPage]);

  // 5. 무한 스크롤 관찰 (Intersection Observer)
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || initialLoading) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !inFlightRef.current) {
          fetchPage(page, false);
        }
      },
      { rootMargin: '0px 0px 200px 0px', threshold: 0 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [page, hasMore, initialLoading, fetchPage]);

  // 6. URL 업데이트 유틸리티 (필터 키값 수정 완료)
  const navigateWithUpdate = (update) => {
    const sp = new URLSearchParams(location.search);
    // 필터 변경 시 페이지는 항상 0으로 리셋
    sp.delete('page');

    Object.entries(update).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        sp.delete(key);
        value.forEach((v) => sp.append(key, v));
      } else if (value === null || value === '') {
        sp.delete(key);
      } else {
        sp.set(key, String(value));
      }
    });
    navigate(`/search?${sp.toString()}`);
  };

  // 7. 이벤트 핸들러 (백엔드 파라미터 key 이름과 일치시킴)
  const handleCategoryChange = (categoryId) => {
    const next = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((c) => c !== categoryId)
      : [...selectedCategories, categoryId];
    navigateWithUpdate({ categoryIds: next });
  };

  const handleCompanyChange = (company) => {
    const next = selectedCompanies.includes(company)
      ? selectedCompanies.filter((c) => c !== company)
      : [...selectedCompanies, company];
    navigateWithUpdate({ company: next });
  };

  const handleDeliveryTypeChange = (id) => {
    navigateWithUpdate({ deliveryType: id });
  };

  const handlePriceChange = ({ min, max }) => {
    navigateWithUpdate({ minPrice: min, maxPrice: max });
  };

  const handleReset = () => {
    const sp = new URLSearchParams();
    if (query) sp.append('query', query);
    navigate(`/search?${sp.toString()}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortSelect = (value) => {
    const [sortField, sortDir] = value.split('_');
    navigateWithUpdate({ sort: sortField, dir: sortDir });
    setIsDropdownOpen(false);
  };

  // 데이터/상수 (UI용)
  const DELIVERY_METHODS = [
    { id: '직접배송', name: '직접배송' },
    { id: '빠른배송', name: '빠른배송' },
    { id: '당일배송', name: '당일배송' },
    { id: '매장픽업', name: '매장픽업' },
  ];
  const COMPANIES = [
    { id: 'Logitech', name: 'Logitech' },
    { id: 'NOX', name: 'NOX' },
    { id: 'PlayStation', name: 'PlayStation' },
    { id: 'Razer', name: 'Razer' },
    { id: 'Corsair', name: 'CORSAIR' },
  ];
  const availableCategories = [
    { id: '모니터', name: '모니터' },
    { id: '헤드셋', name: '헤드셋' },
    { id: '마우스', name: '마우스' },
    { id: '키보드', name: '키보드' },
    { id: '스피커', name: '스피커' },
  ];

  const handleApplyAll = (filters) => {
    const { categories, companies, delivery, price } = filters;

    navigateWithUpdate({
      categoryIds: categories,
      company: companies,
      deliveryType: delivery,
      minPrice: price.min,
      maxPrice: price.max,
    });
  };

  return (
    <>
      <Header />
      <PageWrapper>
        <SearchFilter
          categories={availableCategories}
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
          companies={COMPANIES}
          selectedCompanies={selectedCompanies}
          onCompanyChange={handleCompanyChange}
          deliveryTypeMethods={DELIVERY_METHODS}
          selectedDeliveryType={selectedDeliveryType}
          onDeliveryTypeChange={handleDeliveryTypeChange}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={handlePriceChange}
          onReset={handleReset}
          onApplyAll={handleApplyAll}
        />

        <SortContainer>
          <DropdownContainer ref={dropdownRef}>
            <DropdownHeader onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {SORT_OPTIONS.find((opt) => opt.value === currentSortValue)
                ?.label || '최신순'}
              <Arrow $isOpen={isDropdownOpen}>▼</Arrow>
            </DropdownHeader>

            {isDropdownOpen && (
              <DropdownList>
                {SORT_OPTIONS.map((opt) => (
                  <DropdownItem
                    key={opt.value}
                    $isSelected={currentSortValue === opt.value}
                    onClick={() => handleSortSelect(opt.value)}
                  >
                    {opt.label}
                  </DropdownItem>
                ))}
              </DropdownList>
            )}
          </DropdownContainer>
        </SortContainer>

        <SearchResultList
          query={query}
          items={items}
          resultsCount={resultsCount}
          loading={initialLoading}
        />
        {pagingLoading && <Status>추가 상품 로딩 중...</Status>}
        {error && <Status>{error}</Status>}
        {hasMore && !initialLoading && <Sentinel ref={sentinelRef} />}
      </PageWrapper>
      <Footer />
    </>
  );
};

export default SearchResultListPage;

const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const Sentinel = styled.div`
  height: 40px;
  width: 100%;
`;
const Status = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.gray[600]};
  padding: 20px 0;
`;

const SortContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const DropdownContainer = styled.div`
  position: relative;
  width: 140px;
  z-index: 50;
`;

const DropdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 4px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const Arrow = styled.span`
  font-size: 10px;
  transition: transform 0.2s;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0)')};
`;

const DropdownList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0;
  overflow: hidden;
`;

const DropdownItem = styled.li`
  padding: 10px 12px;
  font-size: 14px;
  cursor: pointer;
  background: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.gray[100] : theme.colors.white};
  font-weight: ${({ $isSelected }) => ($isSelected ? '600' : '400')};
  &:hover {
    background: ${({ theme }) => theme.colors.gray[100]};
  }
`;
