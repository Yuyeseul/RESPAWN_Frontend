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
    const fetchItems = async () => {
      try {
        const res = await axios.get('/items/my-items/summary');
        console.log(res.data);
        setItems(res.data);
      } catch (err) {
        console.error('상품 목록 불러오기 실패:', err);
      }
    };

    fetchItems();
  }, []);

  // 2. 주문 목록 가져오기 (선택된 상품이나 페이지가 바뀔 때마다 실행)
  useEffect(() => {
    const fetchOrders = async (itemId) => {
      try {
        const response = await axios.get('/orders/seller/orders', {
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

    fetchOrders(selectedItem);
  }, [selectedItem, pageInfo.page, pageInfo.size]);

  return (
    <Container>
      <Header>
        <Title>주문 관리</Title>
        <SelectorWrapper>
          <ItemSelector
            value={selectedItem}
            onChange={setSelectedItem}
            productList={items}
          />
        </SelectorWrapper>
      </Header>

      {/* PC 환경: 기존 테이블 뷰 */}
      <DesktopTableWrapper>
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
                  <td>
                    <StatusBadge $status={order.orderStatus}>
                      {statusMap[order.orderStatus]}
                    </StatusBadge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <NoDataCell colSpan="7">{'주문 내역이 없습니다.'}</NoDataCell>
              </tr>
            )}
          </tbody>
        </Table>
      </DesktopTableWrapper>

      {/* 모바일 환경: 카드형 리스트 뷰 */}
      <MobileListWrapper>
        {orders.length > 0 ? (
          orders.map((order) => (
            <MobileCard
              key={order.orderId}
              onClick={() =>
                navigate(`/sellerCenter/orderList/${order.orderItemId}`)
              }
            >
              <CardHeader>
                <OrderId>주문번호: {order.orderId}</OrderId>
                <OrderDate>
                  {order.orderDate
                    ? new Date(order.orderDate).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'}
                </OrderDate>
              </CardHeader>
              <CardBody>
                <ItemName>{order.itemName}</ItemName>
                <ItemDetails>
                  <strong>{order.totalPrice.toLocaleString()}원</strong> /{' '}
                  {order.count}개
                </ItemDetails>
              </CardBody>
              <CardFooter>
                <Buyer>구매자: {order.buyerName}</Buyer>
                <StatusBadge $status={order.orderStatus}>
                  {statusMap[order.orderStatus]}
                </StatusBadge>
              </CardFooter>
            </MobileCard>
          ))
        ) : (
          <NoDataCard>주문 내역이 없습니다.</NoDataCard>
        )}
      </MobileListWrapper>

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

// --- 스타일 컴포넌트 영역 ---

const Container = styled.div`
  max-width: 1600px;
  margin: 60px auto;
  padding: 0 20px;

  @media (max-width: 768px) {
    margin: 20px auto;
    padding: 0 10px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme: { colors } }) => colors.primary};
  margin: 0;
`;

const DesktopTableWrapper = styled.div`
  width: 100%;
  @media (max-width: 768px) {
    display: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme: { colors } }) => colors.white};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  th,
  td {
    padding: 15px;
    text-align: center;
    border-bottom: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
    vertical-align: middle;
  }

  th {
    background: ${({ theme: { colors } }) => colors.primary_hover};
    color: ${({ theme: { colors } }) => colors.gray[800]};
    font-weight: 600;
    white-space: nowrap;
  }

  tr:hover {
    background: ${({ theme: { colors } }) => colors.gray[50]};
  }
`;

const MobileListWrapper = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
`;

const MobileCard = styled.div`
  background: ${({ theme: { colors } }) => colors.white};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.98);
    background: ${({ theme: { colors } }) => colors.gray[50]};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
  padding-bottom: 8px;
`;

const OrderId = styled.span`
  font-size: 13px;
  color: ${({ theme: { colors } }) => colors.gray[600]};
  font-weight: 500;
`;

const OrderDate = styled.span`
  font-size: 12px;
  color: ${({ theme: { colors } }) => colors.gray[550]};
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ItemName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme: { colors } }) => colors.gray[800]};
  line-height: 1.4;
  word-break: keep-all;
`;

const ItemDetails = styled.div`
  font-size: 14px;
  color: ${({ theme: { colors } }) => colors.gray[650]};

  strong {
    color: ${({ theme: { colors } }) => colors.primary};
    font-weight: 700;
  }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
`;

const Buyer = styled.span`
  font-size: 13px;
  color: ${({ theme: { colors } }) => colors.gray[650]};
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background-color: ${(props) => {
    switch (props.$status) {
      case 'ORDERED':
      case 'PAID':
        return props.theme.colors.primary_hover;
      case 'REFUND_REQUESTED':
      case 'RETURNED':
        return props.theme.colors.angel_pink;
      case 'CANCELED':
      case 'REFUNDED':
        return props.theme.colors.gray[100];
      default:
        return props.theme.colors.primary_hover;
    }
  }};
  color: ${(props) => {
    switch (props.$status) {
      case 'ORDERED':
      case 'PAID':
        return props.theme.colors.primary;
      case 'REFUND_REQUESTED':
      case 'RETURNED':
        return props.theme.colors.danger;
      case 'CANCELED':
      case 'REFUNDED':
        return props.theme.colors.gray[550];
      default:
        return props.theme.colors.primary;
    }
  }};
`;

const NoDataCard = styled.div`
  padding: 40px 0;
  text-align: center;
  color: ${({ theme: { colors } }) => colors.gray[550]};
  font-size: 14px;
  background: ${({ theme: { colors } }) => colors.white};
  border-radius: 10px;
  border: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
`;

const NoDataCell = styled.td`
  padding: 50px 0 !important;
  text-align: center;
  color: ${({ theme: { colors } }) => colors.gray[550]};
  font-size: 16px;
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;

const SelectorWrapper = styled.div`
  @media (max-width: 768px) {
    width: 100%;
    select {
      width: 100%;
    }
  }
`;
