import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import axios from '../../api/axios';
import SmallBanner from '../Banner/SmallBanner';
import OrderCard from './OrderHistory/OrderCard';
import Pagination from '../Pagination';

function MainInfo() {
  const [user, setUser] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 3,
    totalPages: 0,
    totalElements: 0,
    isFirst: true,
    isLast: true,
  });

  const handlePageChange = (page) => {
    // Pagination 컴포넌트는 1-indexed 페이지 번호를 전달
    if (page < 1 || (pageInfo.totalPages > 0 && page > pageInfo.totalPages))
      return;
    setPageInfo((p) => ({ ...p, page: page - 1 })); // 0-indexed로 변환하여 상태 업데이트
  };

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const [userRes, orderRes] = await Promise.allSettled([
          axios.get('/myPage/summary', { signal: controller.signal }),
          axios.get('/api/orders/history/recent-month', {
            params: { page: pageInfo.page, size: pageInfo.size },
            signal: controller.signal,
          }),
        ]);

        if (!active) return;

        console.log('userRes', userRes.value.data);
        console.log('orderRes', orderRes.value.data);

        setUser(userRes.value.data.result);

        const ordersData = orderRes.value.data;
        setRecentOrders(ordersData.content || []);
        setPageInfo((prev) => ({
          ...prev,
          totalPages: ordersData.totalPages,
          totalElements: ordersData.totalElements,
          isFirst: ordersData.first,
          isLast: ordersData.last,
        }));
      } catch (error) {
        console.error('유저 또는 주문 정보 불러오기 실패', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchData();

    return () => {
      active = false;
      controller.abort();
    };
  }, [pageInfo.page, pageInfo.size]);

  // 정렬: 최신 주문이 먼저
  const sortedOrders = useMemo(
    () =>
      recentOrders
        .slice()
        .sort(
          (a, b) =>
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        ),
    [recentOrders]
  );

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <Container>
      <SmallBanner />
      <MainContent>
        <TopInfoBox>
          <InfoItem>
            <label>쿠폰</label>
            <span>{user.couponCount} 개</span>
          </InfoItem>
          <InfoItem>
            <label>회원등급</label>
            <span>{user.grade}</span>
          </InfoItem>
          <InfoItem>
            <label>적립금</label>
            <span>{user.activePoint} P</span>
          </InfoItem>
        </TopInfoBox>

        <SectionTitle>주문배송조회</SectionTitle>

        {sortedOrders.length > 0 ? (
          <>
            {/* ✅ FIX: currentOrders -> sortedOrders 로 변경 */}
            {sortedOrders.map((o) => (
              <OrderCard key={o.orderId} order={o} />
            ))}

            {pageInfo.totalPages > 1 && (
              <PaginationWrapper>
                <Pagination
                  currentPage={pageInfo.page + 1} // UI에는 1-indexed
                  totalPages={pageInfo.totalPages}
                  onPageChange={handlePageChange} // ✅ FIX: 올바른 핸들러 함수 전달
                  isFirst={pageInfo.isFirst}
                  isLast={pageInfo.isLast}
                />
              </PaginationWrapper>
            )}
          </>
        ) : (
          <NoOrderText>최근 주문 내역이 없습니다.</NoOrderText>
        )}
      </MainContent>
    </Container>
  );
}

export default MainInfo;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Noto Sans KR', sans-serif;
`;

const MainContent = styled.div`
  margin-top: 20px;
`;

const TopInfoBox = styled.div`
  display: flex;
  border: 1px solid #ccc;
  background: #f4f4f4;
  margin-bottom: 24px;
`;

const InfoItem = styled.div`
  flex: 1;
  padding: 20px;
  text-align: center;
  border-right: 1px solid #ccc;

  &:last-child {
    border-right: none;
  }

  label {
    display: block;
    font-weight: bold;
    margin-bottom: 8px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 22px;
  margin-bottom: 20px;
  border-bottom: 2px solid #222;
  padding-bottom: 6px;
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 24px;
`;

const NoOrderText = styled.p`
  color: #999;
  text-align: center;
  font-size: 16px;
`;
