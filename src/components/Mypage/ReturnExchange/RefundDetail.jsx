import React, { useEffect, useState } from 'react';
import axios from '../../../api/axios';
import styled, { keyframes } from 'styled-components';
import Pagination from '../../Pagination';
import MypageLayout from '../MypageLayout';
import { BASE_URL } from '../../../api/axios';

const RefundDetail = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 5,
    totalPages: 0,
    totalElements: 0,
    isFirst: true,
    isLast: true,
  });

  const getKoreanStatus = (status) => {
    switch (status) {
      case 'REQUESTED':
        return '환불 요청';
      case 'REFUNDED':
        return '환불 완료';
      default:
        return status;
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || (pageInfo.totalPages > 0 && page > pageInfo.totalPages))
      return;
    setPageInfo((p) => ({ ...p, page: page - 1 }));
  };

  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/orders/refund-requests', {
          params: { page: pageInfo.page, size: pageInfo.size },
        });

        const data = response.data;
        console.log(data);
        setRefunds(data.content);
        setPageInfo((prev) => ({
          ...prev,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          isFirst: data.first,
          isLast: data.last,
        }));
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            '환불 내역을 불러오는 중 오류가 발생했습니다.'
        );
        setLoading(false);
      }
    };

    fetchRefunds();
  }, [pageInfo.page, pageInfo.size]);

  if (loading)
    return (
      <MypageLayout title="환불 내역">
        <LoadingWrapper>
          <Spinner />
          <LoadingText>환불 내역을 불러오는 중입니다...</LoadingText>
        </LoadingWrapper>
      </MypageLayout>
    );
  if (error)
    return (
      <MypageLayout title="환불 내역">
        <ErrorText>에러: {error}</ErrorText>
      </MypageLayout>
    );

  return (
    <MypageLayout title="환불 내역">
      {refunds.length === 0 && <NoData>환불 요청 내역이 없습니다.</NoData>}

      {refunds.map((order) => (
        <OrderGroup key={order.orderId}>
          {order.items.map((item) => (
            <RefundCard key={item.orderItemId}>
              <CardHeader>
                <OrderInfo>
                  <span className="label">주문번호</span>
                  <span className="value">{order.orderId}</span>
                  <span className="date">
                    | {new Date(order.orderDate).toLocaleDateString('ko-KR')}
                  </span>
                </OrderInfo>
                <StatusBadge status={item.refundStatus}>
                  {getKoreanStatus(item.refundStatus)}
                </StatusBadge>
              </CardHeader>

              <ProductSection>
                <ProductImage
                  src={`${BASE_URL}${item.imageUrl}`}
                  alt={item.itemName}
                />
                <ProductDetails>
                  <h4>{item.itemName}</h4>
                  <div className="meta">
                    <span>수량: {item.count}개</span>
                    <span className="price">
                      {(item.count * item.orderPrice).toLocaleString()}원
                    </span>
                  </div>
                </ProductDetails>
              </ProductSection>

              <ReasonBox>
                <div className="reason-item">
                  <span className="title">환불 사유</span>
                  <span className="content">{item.refundReason || '-'}</span>
                </div>
                <div className="reason-item">
                  <span className="title">상세 내용</span>
                  <span className="content">{item.refundDetail || '-'}</span>
                </div>
              </ReasonBox>
            </RefundCard>
          ))}
        </OrderGroup>
      ))}
      {pageInfo.totalPages > 1 && (
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

export default RefundDetail;

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

const OrderGroup = styled.div`
  margin-bottom: 24px;
`;

const RefundCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  background-color: ${({ theme }) => theme.colors.white};
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 16px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
  margin-bottom: 16px;

  @media ${({ theme }) => theme.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const OrderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;

  .label {
    color: ${({ theme }) => theme.colors.gray[600]};
  }
  .value {
    color: ${({ theme }) => theme.colors.gray[700]};
  }
  .date {
    color: ${({ theme }) => theme.colors.gray[600]};
    font-size: 14px;
  }
`;

const StatusBadge = styled.span`
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ status, theme }) => {
    switch (status) {
      case 'REQUESTED':
        return theme.colors.yellow;
      case 'REFUNDED':
        return theme.colors.success;
      default:
        return theme.colors.gray[500];
    }
  }};
`;

const ProductSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;

  @media ${({ theme }) => theme.mobile} {
    align-items: flex-start;
  }
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};

  @media ${({ theme }) => theme.mobile} {
    width: 64px;
    height: 64px;
  }
`;

const ProductDetails = styled.div`
  flex: 1;
  color: ${({ theme }) => theme.colors.gray[700]};
  h4 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 6px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
    .price {
      font-weight: 700;
    }
  }
`;

const ReasonBox = styled.div`
  background-color: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .reason-item {
    display: flex;
    font-size: 14px;
    line-height: 1.5;

    .title {
      min-width: 70px;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.gray[600]};
    }
    .content {
      color: ${({ theme }) => theme.colors.gray[700]};
    }
  }
`;

const ErrorText = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.colors.danger};
`;

const NoData = styled.div`
  text-align: center;
  padding: 80px 0;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: 16px;
`;
