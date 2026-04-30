import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from '../../api/axios';
import styled, { css, keyframes } from 'styled-components';
import MypageLayout from './MypageLayout';

const PAGE_SIZE = 10;

const Coupon = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [coupons, setCoupons] = useState([]);
  const [counts, setCounts] = useState({ available: 0, unavailable: 0 });
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const observer = useRef();
  const inFlightRef = useRef(false);

  const fetchCounts = async () => {
    try {
      const response = await axios.get(`/coupons/count`);
      setCounts({
        available: response.data.availableCount || 0,
        unavailable: response.data.unavailableCount || 0,
      });
    } catch (error) {
      console.error('쿠폰 개수를 불러오는데 실패했습니다.', error);
    }
  };

  const fetchCoupons = useCallback(
    async (isInitialLoad = false) => {
      if (inFlightRef.current) return;
      if (!hasMore && !isInitialLoad) return;
      inFlightRef.current = true;
      setError(null);

      const currentPage = isInitialLoad ? 0 : page;

      try {
        const res = await axios.get(`/coupons/${activeTab}`, {
          params: { page: currentPage, size: PAGE_SIZE },
        });

        const newItems = res.data.content || [];
        const pageMeta = res.data.page || {};
        const number =
          typeof pageMeta.number === 'number' ? pageMeta.number : currentPage;
        const totalPages =
          typeof pageMeta.totalPages === 'number' ? pageMeta.totalPages : 0;

        setCoupons((prevItems) =>
          isInitialLoad ? newItems : [...prevItems, ...newItems]
        );
        let more;
        if (totalPages > 0) {
          more = number + 1 < totalPages;
        } else {
          more = newItems.length === PAGE_SIZE;
        }
        setHasMore(more);
        setPage(currentPage + 1);
      } catch (e) {
        setError('쿠폰 정보를 불러오는 데 실패했습니다.');
        console.error(e);
        setHasMore(false);
      } finally {
        setLoading(false);
        if (isInitialLoad) setInitialLoading(false);
        inFlightRef.current = false;
      }
    },
    [activeTab, page, hasMore]
  );

  const lastCouponElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchCoupons(false);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, fetchCoupons]
  );

  useEffect(() => {
    fetchCounts();
  }, []);

  useEffect(() => {
    setCoupons([]);
    setPage(0);
    setHasMore(true);
    setInitialLoading(true);
    fetchCoupons(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const renderAmount = (amt) => {
    const n = Number(amt);
    return Number.isFinite(n) ? `${n.toLocaleString()}원 할인` : '할인';
  };

  const emptyMsg =
    activeTab === 'available'
      ? '사용 가능한 쿠폰이 없습니다.'
      : '만료된 쿠폰이 없습니다.';

  return (
    <MypageLayout title={'쿠폰'}>
      <TabContainer>
        <TabButton
          type="button"
          active={activeTab === 'available'}
          onClick={() => setActiveTab('available')}
        >
          이용 가능 <Count>{counts.available}</Count>
        </TabButton>
        <TabButton
          type="button"
          active={activeTab === 'unavailable'}
          onClick={() => setActiveTab('unavailable')}
        >
          만료됨 <Count>{counts.unavailable}</Count>
        </TabButton>
      </TabContainer>

      {initialLoading ? (
        <LoadingWrapper>
          <Spinner />
          <LoadingText>쿠폰 목록을 불러오는 중입니다...</LoadingText>
        </LoadingWrapper>
      ) : coupons.length === 0 && !loading ? (
        <Message>{emptyMsg}</Message>
      ) : (
        <CouponList>
          {coupons.map((c, index) => (
            <CouponCard
              key={`${c.id}-${index}`}
              ref={coupons.length === index + 1 ? lastCouponElementRef : null}
              $activeTab={activeTab}
            >
              <CouponName>{c.name}</CouponName>
              <CouponDiscount>{renderAmount(c.couponAmount)}</CouponDiscount>
              <CouponExpire>
                {activeTab === 'available'
                  ? `${formatDate(c.expiresAt)} 까지 사용 가능`
                  : `만료일: ${formatDate(c.expiresAt)}`}
              </CouponExpire>
            </CouponCard>
          ))}
        </CouponList>
      )}

      {!initialLoading && loading && (
        <LoadingWrapper $isSmall>
          <Spinner $isSmall />
          <LoadingText $isSmall>더 많은 쿠폰을 불러오는 중...</LoadingText>
        </LoadingWrapper>
      )}
      {error && <Message>{error}</Message>}
    </MypageLayout>
  );
};

export default Coupon;

// === 스타일 영역 ===
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ $isSmall }) => ($isSmall ? '20px 0' : '80px 0')};
  gap: ${({ $isSmall }) => ($isSmall ? '10px' : '16px')};
`;

const Spinner = styled.div`
  width: ${({ $isSmall }) => ($isSmall ? '24px' : '40px')};
  height: ${({ $isSmall }) => ($isSmall ? '24px' : '40px')};
  border: ${({ $isSmall }) => ($isSmall ? '3px' : '4px')} solid
    ${({ theme }) => theme.colors.gray[200]};
  border-top-color: ${({ theme }) => theme.colors.secondary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  color: ${({ theme }) => theme.colors.gray[550]};
  font-size: ${({ $isSmall }) => ($isSmall ? '12px' : '14px')};
  font-weight: 600;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};

  @media ${({ theme }) => theme.mobile} {
    margin-bottom: 16px;
  }
`;

const TabButton = styled.button`
  flex: 1;
  padding: 16px 0;
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[600]};
  background-color: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  ${({ active, theme }) =>
    active &&
    css`
      color: ${theme.colors.gray[700]};
      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: ${theme.colors.gray[700]};
      }
    `}

  @media ${({ theme }) => theme.mobile} {
    padding: 12px 0;
    font-size: 14px;
  }
`;

const Count = styled.span`
  margin-left: 6px;
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const Message = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray[600]};
  text-align: center;
  padding: 32px 0;
`;

const CouponList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CouponCard = styled.div`
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 10px;

  ${({ $activeTab, theme }) =>
    $activeTab === 'unavailable' &&
    css`
      background-color: ${theme.colors.gray[10]};
      border-color: ${theme.colors.gray[300]};
      filter: grayscale(1);
      opacity: 0.6;

      ${CouponDiscount} {
        color: ${theme.colors.gray[600]};
      }
    `}

  @media ${({ theme }) => theme.mobile} {
    padding: 16px;
    border-radius: 8px;
  }
`;

const CouponName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[700]};
  margin: 0;
  line-height: 1.35;
  word-break: keep-all;
  overflow-wrap: anywhere;

  @media ${({ theme }) => theme.mobile} {
    font-size: 14px;
  }
`;

const CouponDiscount = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.red};

  @media ${({ theme }) => theme.mobile} {
    font-size: 16px;
  }
`;

const CouponExpire = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 4px;

  @media ${({ theme }) => theme.mobile} {
    font-size: 12px;
  }
`;
