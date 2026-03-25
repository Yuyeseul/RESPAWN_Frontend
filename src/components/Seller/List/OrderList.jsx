import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from '../../../api/axios';
import { useNavigate } from 'react-router-dom';
import ItemSelector from './ItemSelector';
import Pagination from '../../Pagination';

function OrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
    isFirst: true,
    isLast: true,
  });

  const statusMap = {
    ORDERED: '주문접수',
    PAID: '결제완료',
    CANCELED: '주문취소',
    RETURNED: '반품',
    REFUND_REQUESTED: '환불신청',
    REFUNDED: '환불',
  };

  const handlePageChange = (page) => {
    if (page < 1 || (pageInfo.totalPages > 0 && page > pageInfo.totalPages))
      return;
    setPageInfo((p) => ({ ...p, page: page - 1 }));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    fetchOrders(selectedItem);
  }, [selectedItem, pageInfo.page]);

  // 상품 목록 불러오기
  const fetchItems = async () => {
    try {
      const res = await axios.get('/api/items/my-items/summary');
      console.log(res.data);
      setItems(res.data);
    } catch (err) {
      console.error('상품 목록 불러오기 실패:', err);
    }
  };

  const fetchOrders = async (itemId) => {
    try {
      const response = await axios.get('/api/orders/seller/orders', {
        params: { page: pageInfo.page, size: pageInfo.size, itemId },
      });
      const data = response.data;
      console.log(data);
      setOrders(data.content);
      setPageInfo((prev) => ({
        ...prev,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        isFirst: data.first,
        isLast: data.last,
      }));
    } catch (error) {
      console.error('주문 목록 가져오기 실패:', error);
    }
  };

  return (
    <Container>
      <Header>
        <Title>주문 관리</Title>
        <ItemSelector
          value={selectedItem}
          onChange={setSelectedItem}
          productList={items}
        />
      </Header>
      <Table>
        <thead>
          <tr>
            <th>주문번호</th>
            <th>상품명</th>
            <th>구매자</th>
            <th>수량</th>
            <th>결제금액</th>
            <th>주문일시</th>
            <th>주문상태</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr
                key={order.orderId}
                onClick={() =>
                  navigate(`/sellerCenter/orderList/${order.orderItemId}`)
                }
                style={{ cursor: 'pointer' }}
              >
                <td>{order.orderId}</td>
                <td>{order.itemName}</td>
                <td>{order.buyerName}</td>
                <td>{order.count}</td>
                <td>{order.totalPrice.toLocaleString()}원</td>
                <td>
                  {order.orderDate
                    ? new Date(order.orderDate).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'}
                </td>
                <td>{statusMap[order.orderStatus]}</td>
              </tr>
            ))
          ) : (
            <tr>
              <NoDataCell colSpan="7">{'주문 내역이 없습니다.'}</NoDataCell>
            </tr>
          )}
        </tbody>
      </Table>
      {pageInfo.totalPages > 1 && (
        <PaginationWrapper>
          <Pagination
            currentPage={pageInfo.page + 1}
            totalPages={pageInfo.totalPages}
            onPageChange={handlePageChange}
            isFirst={pageInfo.isFirst}
            isLast={pageInfo.isLast}
          />
        </PaginationWrapper>
      )}
    </Container>
  );
}

export default OrderList;

const Container = styled.div`
  max-width: 1600px;
  margin: 60px auto;
  padding: 0 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #555a82;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;

  th,
  td {
    padding: 12px 15px;
    text-align: center;
    border-bottom: 1px solid #eee;
  }

  th {
    background: #e6e8f4;
    color: #333;
  }

  tr:hover {
    background: #f5f7fa;
  }
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;

const NoDataCell = styled.td`
  padding: 50px 0 !important;
  text-align: center;
  color: #999;
  font-size: 16px;
`;
