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
          ? '/orders/seller/refund-requests'
          : '/orders/seller/refund-completed';

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
      <Header>
        <Title>환불 관리</Title>
        <TabMenu>
          <TabButton
            $active={activeTab === 'requested'}
            onClick={() => handleTabChange('requested')}
          >
            환불 요청 중
          </TabButton>
          <TabButton
            $active={activeTab === 'completed'}
            onClick={() => handleTabChange('completed')}
          >
            환불 완료
          </TabButton>
        </TabMenu>
      </Header>

      {/* PC 환경: 데스크톱 테이블 뷰 */}
      <DesktopTableWrapper>
        <Table>
          <thead>
            <tr>
              <Th width="15%">주문번호</Th>
              <Th width="40%">상품명</Th>
              <Th width="20%">환불 요청일</Th>
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
                  style={{ cursor: 'pointer' }}
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
      </DesktopTableWrapper>

      {/* 모바일 환경: 카드형 리스트 뷰 */}
      <MobileListWrapper>
        {refunds.length > 0 ? (
          refunds.map((item) => (
            <MobileCard
              key={item.orderItemId}
              onClick={() => handleClick(item.orderItemId)}
            >
              <CardHeader>
                <OrderId>주문번호: {item.orderItemId}</OrderId>
                <DateText>
                  {new Date(item.refundInfo.requestedAt).toLocaleDateString()}
                </DateText>
              </CardHeader>
              <CardBody>
                <ItemName>{item.itemName}</ItemName>
                <PriceRow>
                  <strong>{item.orderPrice?.toLocaleString()}원</strong> /{' '}
                  {item.count}개
                </PriceRow>
              </CardBody>
            </MobileCard>
          ))
        ) : (
          <NoDataCard>
            {activeTab === 'requested'
              ? '환불 요청 내역이 없습니다.'
              : '환불 완료 내역이 없습니다.'}
          </NoDataCard>
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
};

export default RefundList;

// --- 전면 개편된 스타일 영역 ---

const Container = styled.div`
  max-width: 1600px;
  margin: 60px auto;
  padding: 0 20px;
  font-family:
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    sans-serif;

  @media (max-width: 768px) {
    margin: 20px auto;
    padding: 0 10px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const TabMenu = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const TabButton = styled.button`
  background: ${({ $active }) => ($active ? '#555a82' : '#f1f5f9')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#64748b')};
  border: 1.5px solid ${({ $active }) => ($active ? '#555a82' : '#f1f5f9')};
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $active }) => ($active ? '#3e4263' : '#e2e8f0')};
    border-color: ${({ $active }) => ($active ? '#3e4263' : '#e2e8f0')};
    color: ${({ $active }) => ($active ? '#ffffff' : '#1e293b')};
  }

  @media (max-width: 768px) {
    flex: 1; /* 모바일에서는 탭 버튼이 화면을 반씩 꽉 채우도록 설정 */
    padding: 12px 0;
  }
`;

/* PC용 테이블 래퍼 */
const DesktopTableWrapper = styled.div`
  width: 100%;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  table-layout: fixed;

  th,
  td {
    padding: 14px 15px;
    text-align: center;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
  }

  th {
    background: #e6e8f4;
    color: #333;
    font-weight: 600;
  }

  tr:hover {
    background: #f5f7fa;
  }

  td {
    word-break: keep-all;
  }
`;

const Th = styled.th`
  width: ${({ width }) => width || 'auto'};
`;

const NoDataCell = styled.td`
  padding: 50px 0 !important;
  text-align: center;
  color: #94a3b8;
  font-size: 15px;
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;

/* 모바일용 카드 리스트 래퍼 */
const MobileListWrapper = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
`;

/* 모바일 개별 카드 */
const MobileCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease;

  &:active {
    transform: scale(0.98);
    background: #fcfcfc;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
`;

const OrderId = styled.span`
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
`;

const DateText = styled.span`
  font-size: 12px;
  color: #94a3b8;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ItemName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
  word-break: keep-all;
`;

const PriceRow = styled.div`
  font-size: 14px;
  color: #475569;
  margin-top: 4px;

  strong {
    color: #555a82;
    font-size: 15px;
    font-weight: 700;
  }
`;

const NoDataCard = styled.div`
  padding: 40px 0;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
  background: white;
  border-radius: 10px;
  border: 1px solid #eee;
`;
