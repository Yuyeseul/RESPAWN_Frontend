import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from '../../api/axios';
import styled, { css } from 'styled-components';

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
      const response = await axios.get(`/api/coupons/count`);
      console.log(response.data);
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
        const res = await axios.get(`/api/coupons/${activeTab}`, {
          params: { page: currentPage, size: PAGE_SIZE },
        });
        console.log(res.data);

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
    // 상태 초기화
    setCoupons([]);
    setPage(0);
    setHasMore(true);
    setInitialLoading(true);
    fetchCoupons(true);
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
    <Container>
      <Title>쿠폰</Title>

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
        <Message>불러오는 중...</Message>
      ) : coupons.length === 0 && !loading ? (
        <Message>{emptyMsg}</Message>
      ) : (
        <CouponList>
          {coupons.map((c, index) => (
            <CouponCard
              key={`${c.id}-${index}`}
              ref={coupons.length === index + 1 ? lastCouponElementRef : null}
              aria-disabled={activeTab === 'unavailable'}
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

      {!initialLoading && loading && <Message>불러오는 중...</Message>}
      {error && <Message>{error}</Message>}
    </Container>
  );
};

export default Coupon;

const Container = styled.div`
  max-width: 1000px;
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 30px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 15px 0;
  font-size: 16px;
  font-weight: 700;
  color: #888;
  background-color: #f8f8f8;
  border: 1px solid #ddd;
  border-bottom: none;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  ${({ active }) =>
    active &&
    css`
      color: #333;
      background-color: #fff;
      border-bottom: 1px solid #fff;
      position: relative;
      top: 1px;
    `}
`;

const Count = styled.span`
  margin-left: 6px;
  color: #666;
`;

const Message = styled.div`
  font-size: 16px;
  color: #666;
  text-align: center;
  padding: 32px 0;
`;

const CouponList = styled.div`
  display: flex; /* Flexbox로 변경하여 내부 아이템 정렬 용이 */
  flex-direction: column; /* 세로 방향으로 아이템 쌓기 */
  gap: 16px;
`;

const CouponCard = styled.div`
  width: 100%;
  max-width: 720px; /* 필요에 따라 640~800px 조정 */
  margin: 0 auto; /* 가운데 정렬 */
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CouponName = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  color: #222;
  margin: 0;
  line-height: 1.35;
  word-break: keep-all;
  overflow-wrap: anywhere; /* 긴 이름 대응 */
`;

const CouponDiscount = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #e53935;
`;

const CouponExpire = styled.div`
  font-size: 0.88rem;
  color: #8b95a1;
  margin-top: 2px;
`;
