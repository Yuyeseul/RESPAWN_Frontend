import React, { useEffect, useState } from 'react';
import axios from '../../../api/axios';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Pagination from '../../Pagination';

const RefundList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'requested';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [refunds, setRefunds] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
    isFirst: true,
    isLast: true,
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPageInfo((p) => ({ ...p, page: 0 })); // 페이지를 0으로 리셋
    navigate(`/sellerCenter/refundList?tab=${tab}`);
  };

  const handlePageChange = (page) => {
    setPageInfo((p) => ({ ...p, page: page - 1 }));
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchRefunds = async () => {
      const endpoint =
        activeTab === 'requested'
          ? '/api/orders/seller/refund-requests'
          : '/api/orders/seller/refund-completed';

      try {
        const res = await axios.get(endpoint, {
          params: { page: pageInfo.page, size: pageInfo.size },
          signal: controller.signal,
        });

        const data = res.data;
        console.log(data);
        setRefunds(data.content);
        setPageInfo((prev) => ({
          ...prev,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          isFirst: data.first,
          isLast: data.last,
        }));
      } catch (err) {
        if (err.name !== 'CanceledError') {
          console.error('환불 데이터 불러오기 실패:', err);
        }
      }
    };

    fetchRefunds();

    return () => {
      controller.abort();
    };
  }, [activeTab, pageInfo.page, pageInfo.size]);

  const handleClick = (orderItemId) => {
    navigate(`/sellerCenter/refundList/${orderItemId}`);
  };

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
            <Th width="15%">주문 ID</Th>
            <Th width="40%">상품명</Th>
            <Th width="20%">환불 요청 날짜</Th>
            <Th width="15%">주문 금액</Th>
            <Th width="10%">수량</Th>
          </tr>
        </thead>
        <tbody>
          {refunds.length > 0 ? (
            refunds.map((item) => (
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
  table-layout: fixed;

  th {
    background: #e6e8f4;
    color: #333;
  }

  tr:hover {
    background: #f5f7fa;
  }

  td {
    padding: 12px 15px;
    text-align: center;
    border-bottom: 1px solid #eee;
    word-break: break-word;
  }
`;

const NoDataCell = styled.td`
  padding: 50px 0 !important;
  text-align: center;
  color: #999;
  font-size: 16px;
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;

const Th = styled.th`
  padding: 12px 15px;
  text-align: center;
  width: ${({ width }) => width || 'auto'};
`;
