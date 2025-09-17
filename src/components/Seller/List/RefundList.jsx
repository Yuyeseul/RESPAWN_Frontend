import React, { useEffect, useState } from 'react';
import axios from '../../../api/axios';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const RefundList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'requested';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [requestedRefunds, setRequestedRefunds] = useState([]);
  const [completedRefunds, setCompletedRefunds] = useState([]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/sellerCenter/refundList?tab=${tab}`);
  };

  useEffect(() => {
    // 요청된 환불 리스트 가져오기
    const fetchRequestedRefunds = async () => {
      try {
        const res = await axios.get('/api/orders/seller/refund-requests');
        setRequestedRefunds(res.data);
        console.log(res.data);
      } catch (err) {
        console.error('환불 요청 불러오기 실패:', err);
      }
    };

    // 완료된 환불 리스트 가져오기
    const fetchCompletedRefunds = async () => {
      try {
        const res = await axios.get('/api/orders/seller/refund-completed');
        setCompletedRefunds(res.data);
      } catch (err) {
        console.error('환불 완료 불러오기 실패:', err);
      }
    };

    fetchRequestedRefunds();
    fetchCompletedRefunds();
  }, []);

  const handleClick = (orderItemId) => {
    navigate(`/sellerCenter/refundList/${orderItemId}`);
  };

  // 보여줄 데이터 선택
  const refundsToDisplay =
    activeTab === 'requested' ? requestedRefunds : completedRefunds;

  return (
    <Container>
      <Title>환불 요청 목록</Title>
      <TabMenu>
        <TabButton
          active={activeTab === 'requested'}
          onClick={() => handleTabChange('requested')}
        >
          환불 요청 중
        </TabButton>
        <TabButton
          active={activeTab === 'completed'}
          onClick={() => handleTabChange('completed')}
        >
          환불 완료
        </TabButton>
      </TabMenu>

      <Table>
        <thead>
          <tr>
            <th>주문 ID</th>
            <th>상품명</th>
            <th>환불 요청 날짜</th>
            <th>주문 금액</th>
            <th>수량</th>
          </tr>
        </thead>
        <tbody>
          {refundsToDisplay.length > 0 ? (
            refundsToDisplay.map((item) => (
              <tr
                key={item.orderItemId}
                onClick={() => handleClick(item.orderItemId)}
              >
                <td>{item.orderItemId}</td>
                <td>{item.itemName}</td>
                <td>
                  {new Date(item.refundInfo.requestedAt).toLocaleDateString()}
                </td>
                <td>{item.orderPrice?.toLocaleString()}원</td>
                <td>{item.count}</td>
              </tr>
            ))
          ) : (
            <tr>
              <NoDataCell colSpan="5">
                {activeTab === 'requested'
                  ? '환불 요청 내역이 없습니다.'
                  : '환불 완료 내역이 없습니다.'}
              </NoDataCell>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default RefundList;

// 스타일 추가
const Container = styled.div`
  max-width: 1600px;
  margin: 60px auto;
  padding: 0 20px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #555a82;
`;

const TabMenu = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  background: ${({ active }) => (active ? '#555a82' : '#e6e8f4')};
  color: ${({ active }) => (active ? 'white' : '#555a82')};
  border: none;
  padding: 10px 20px;
  font-weight: 700;
  cursor: pointer;
  margin-right: 10px;
  border-radius: 5px;
  transition: background 0.3s;

  &:hover {
    background: #4a4e70;
    color: white;
  }
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

const NoDataCell = styled.td`
  padding: 50px 0 !important;
  text-align: center;
  color: #999;
  font-size: 16px;
`;
