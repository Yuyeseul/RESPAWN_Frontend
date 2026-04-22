import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import OrderCard from './OrderCard';
import axios from '../../../api/axios';
import Pagination from '../../Pagination';
import { useLocation } from 'react-router-dom';
import MypageLayout from '../MypageLayout';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 5,
    totalPages: 0,
    totalElements: 0,
    isFirst: true,
    isLast: true,
  });

  const handlePageChange = (page) => {
    if (page < 1 || (pageInfo.totalPages > 0 && page > pageInfo.totalPages))
      return;
    setPageInfo((p) => ({ ...p, page: page - 1 }));
  };

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/orders/history/summary', {
        params: { page: pageInfo.page, size: pageInfo.size },
      });
      console.log(response.data);
      const data = response.data;
      setOrders(data.content);
      setPageInfo((prev) => ({
        ...prev,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        isFirst: data.first,
        isLast: data.last,
      }));
      console.log(pageInfo);
    } catch (error) {
      console.error('주문 내역 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageInfo.page, pageInfo.size]);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchOrderHistory();
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  return (
    <MypageLayout title="주문 내역">
      {loading ? (
        <LoadingWrapper>
          <Spinner />
          <LoadingText>주문 내역을 불러오는 중입니다...</LoadingText>
        </LoadingWrapper>
      ) : orders.length === 0 ? (
        <EmptyMessage>주문 내역이 없습니다.</EmptyMessage>
      ) : (
        orders.map((order) => <OrderCard key={order.orderId} order={order} />)
      )}

      {!loading && pageInfo.totalPages > 1 && (
        <Pagination
          currentPage={pageInfo.page + 1}
          totalPages={pageInfo.totalPages}
          onPageChange={handlePageChange}
          isFirst={pageInfo.isFirst}
          isLast={pageInfo.isLast}
        />
      )}
    </MypageLayout>
  );
};

export default OrderHistory;

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
  padding: 80px 0;
  gap: 16px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${({ theme }) => theme.colors.gray[200]};
  border-top-color: ${({ theme }) => theme.colors.secondary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  color: ${({ theme }) => theme.colors.gray[550]};
  font-size: 14px;
  font-weight: 600;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const EmptyMessage = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray[600]};
  text-align: center;
  padding: 80px 0;
`;
