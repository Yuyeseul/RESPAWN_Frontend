import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import OrderCard from './OrderCard';
import axios from '../../../api/axios';
import Pagination from '../../Pagination';
import { useLocation } from 'react-router-dom';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
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
      const response = await axios.get('/orders/history', {
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
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, [pageInfo.page]);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchOrderHistory();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <Container>
      <Title>주문 내역</Title>
      {orders.length === 0 ? (
        <EmptyMessage>주문 내역이 없습니다.</EmptyMessage>
      ) : (
        orders.map((order) => <OrderCard key={order.orderId} order={order} />)
      )}
      {pageInfo.totalPages > 1 && (
        <Pagination
          currentPage={pageInfo.page + 1}
          totalPages={pageInfo.totalPages}
          onPageChange={handlePageChange}
          isFirst={pageInfo.isFirst}
          isLast={pageInfo.isLast}
        />
      )}
    </Container>
  );
};

export default OrderHistory;

const Container = styled.div`
  max-width: 1000px;
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 30px;
`;

const EmptyMessage = styled.div`
  font-size: 16px;
  color: #666;
  text-align: center;
  padding: 32px 0;
`;
