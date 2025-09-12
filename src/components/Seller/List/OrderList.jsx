import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from '../../../api/axios';
import { useNavigate } from 'react-router-dom';
import ItemSelector from './ItemSelector';

function OrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');

  const statusMap = {
    ORDERED: '주문접수',
    PAID: '결제완료',
    CANCELED: '주문취소',
    RETURNED: '반품',
    REFUND_REQUESTED: '환불신청',
    REFUNDED: '환불',
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    fetchOrders(selectedItem);
  }, [selectedItem]);

  // 상품 목록 불러오기
  const fetchItems = async () => {
    try {
      const res = await axios.get('/api/items/my-items');
      console.log(res.data);
      setItems(res.data.content);
    } catch (err) {
      console.error('상품 목록 불러오기 실패:', err);
    }
  };

  const fetchOrders = async (itemId) => {
    try {
      let url = '/api/orders/seller/orders';
      if (itemId) {
        url += `?itemId=${itemId}`;
      }
      const response = await axios.get(url);
      console.log(url);
      setOrders(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('주문 목록 가져오기 실패:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
            <th>번호</th>
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
          {orders.map((order, index) => (
            <tr
              key={order.orderId}
              onClick={() =>
                navigate(`/sellerCenter/orderList/${order.orderItemId}`)
              }
              style={{ cursor: 'pointer' }}
            >
              <td>{orders.length - index}</td>
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
          ))}
        </tbody>
      </Table>
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
