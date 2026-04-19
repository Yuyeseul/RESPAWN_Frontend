import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axios';
import StepProgress from '../common/StepProgress';
import { BASE_URL } from '../../api/axios';

function OrderComplete() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);

  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpand = () => setIsExpanded(!isExpanded);
  const visibleOrders = isExpanded ? orders : orders.slice(0, 1);
  const remainingCount = orders.length - 1;

  const formatCurrency = (v) => {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n.toLocaleString() : '0';
  };

  const paymentMethodLabel = (code) => {
    switch (code) {
      case 'card':
        return '신용/체크카드';
      case 'trans':
        return '계좌이체';
      case 'vbank':
        return '가상계좌';
      case 'phone':
        return '휴대폰 결제';
      default:
        return code ?? '-';
    }
  };

  useEffect(() => {
    if (!orderId) return;
    const fetchOrderInfo = async () => {
      try {
        const response = await axios.get(`/orders/${orderId}/complete-info`);
        console.log(response.data);
        setOrderInfo(response.data);
        setOrders(response.data.orderItems);
      } catch {
        setError('주문 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderInfo();
  }, [orderId]);

  if (loading)
    return (
      <Container>
        <StatusMsg>주문 정보를 불러오는 중...</StatusMsg>
      </Container>
    );
  if (error)
    return (
      <Container>
        <StatusMsg>{error}</StatusMsg>
      </Container>
    );
  if (!orderInfo) return null;

  return (
    <Container>
      <StepProgressWrapper>
        <StepProgress currentStep={3} />
      </StepProgressWrapper>

      <Header>
        <Title>주문이 완료되었습니다</Title>
        <OrderBrief>
          <span>
            주문일시{' '}
            <b>{new Date(orderInfo.orderDate).toLocaleString('ko-KR')}</b>
          </span>
          <span>
            주문번호 <b className="order-id">{orderInfo.orderId}</b>
          </span>
        </OrderBrief>
      </Header>

      <Section>
        <SectionTitle>주문 상품 정보</SectionTitle>
        <ProductTable>
          <thead>
            <tr>
              <th>상품정보</th>
              <th>상품가격</th>
              <th>수량</th>
              <th>주문금액</th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.map((item) => (
              <tr key={item.orderItemId}>
                <td>
                  <ProductInfo>
                    <img src={`${BASE_URL}${item.imageUrl}`} alt="" />
                    <div className="info-text">
                      <div className="name">{item.itemName}</div>
                      <div className="mobile-only-price">
                        {item.orderPrice.toLocaleString()}원 / {item.count}개
                      </div>
                    </div>
                  </ProductInfo>
                </td>
                <td data-label="상품가격">
                  {formatCurrency(item.orderPrice)}원
                </td>
                <td data-label="수량">{item.count}개</td>
                <td data-label="주문금액">
                  {formatCurrency(item.orderPrice * item.count)}원
                </td>
              </tr>
            ))}
          </tbody>
        </ProductTable>

        {orders.length > 1 && (
          <ExpandButton onClick={toggleExpand}>
            {isExpanded ? (
              <>접기 ▲</>
            ) : (
              <>
                {orders[0].itemName} 외 <strong>{remainingCount}건</strong>{' '}
                더보기 ▼
              </>
            )}
          </ExpandButton>
        )}
      </Section>

      <InfoGrid>
        <InfoCard>
          <CardTitle>배송지 정보</CardTitle>
          <InfoList>
            <div className="row">
              <span className="label">수령인</span>
              <span className="value">
                {orderInfo.deliveryInfo[0].address.recipient}
              </span>
            </div>
            <div className="row">
              <span className="label">연락처</span>
              <span className="value">
                {orderInfo.deliveryInfo[0].address.phone}
              </span>
            </div>
            <div className="row">
              <span className="label">주소</span>
              <span className="value">
                [{orderInfo.deliveryInfo[0].address.zoneCode}]<br />
                {orderInfo.deliveryInfo[0].address.baseAddress}{' '}
                {orderInfo.deliveryInfo[0].address.detailAddress}
              </span>
            </div>
          </InfoList>
        </InfoCard>

        <InfoCard>
          <CardTitle>결제 정보</CardTitle>
          <InfoList>
            <div className="row">
              <span className="label">상품합계</span>
              <span className="value">
                {formatCurrency(orderInfo.itemTotalPrice)}원
              </span>
            </div>
            <div className="row">
              <span className="label">배송비</span>
              <span className="value">
                +{formatCurrency(orderInfo.deliveryFee)}원
              </span>
            </div>
            {orderInfo.usedPointAmount > 0 && (
              <div className="row discount">
                <span className="label">포인트 사용</span>
                <span className="value">
                  -{formatCurrency(orderInfo.usedPointAmount)}원
                </span>
              </div>
            )}
            {orderInfo.usedCouponAmount > 0 && (
              <div className="row discount">
                <span className="label">쿠폰 할인</span>
                <span className="value">
                  -{formatCurrency(orderInfo.usedCouponAmount)}원
                </span>
              </div>
            )}
            <Divider />
            <div className="row final">
              <span className="label">총 결제금액</span>
              <span className="value total">
                {formatCurrency(orderInfo.totalAmount)}원
              </span>
            </div>
            <div className="row payment-method">
              <span className="label">결제수단</span>
              <span className="value">
                {paymentMethodLabel(orderInfo.paymentInfo?.paymentMethod)} (
                {orderInfo.paymentInfo?.pgProvider})
              </span>
            </div>
          </InfoList>
        </InfoCard>
      </InfoGrid>

      <ButtonGroup>
        <ActionBtn onClick={() => navigate('/')}>홈</ActionBtn>
        <ActionBtn primary onClick={() => navigate('/mypage')}>
          마이페이지
        </ActionBtn>
      </ButtonGroup>
    </Container>
  );
}

export default OrderComplete;

const Container = styled.div`
  padding: 40px;
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  width: 100%;

  @media ${({ theme }) => theme.mobile} {
    padding: 20px 15px;
  }
`;

const StatusMsg = styled.p`
  text-align: center;
  font-size: 18px;
  margin-top: 100px;
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const StepProgressWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;

  @media ${({ theme }) => theme.mobile} {
    margin-bottom: 30px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 50px;

  @media ${({ theme }) => theme.mobile} {
    margin-bottom: 30px;
  }
`;

const Title = styled.h2`
  font-size: 32px;
  color: ${({ theme }) => theme.colors.gray[800]};
  margin-bottom: 15px;

  @media ${({ theme }) => theme.mobile} {
    font-size: 24px;
  }
`;

const OrderBrief = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: 14px;

  b {
    color: ${({ theme }) => theme.colors.gray[700]};
  }
  .order-id {
    color: ${({ theme }) => theme.colors.gray[700]};
  }

  @media ${({ theme }) => theme.mobile} {
    flex-direction: column;
    gap: 5px;
  }
`;

const Section = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.gray[800]};
`;

const ProductTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
    text-align: center;
  }

  th {
    background-color: ${({ theme }) => theme.colors.gray[100]};
  }

  @media ${({ theme }) => theme.mobile} {
    display: block;
    thead {
      display: none;
    }
    tbody {
      display: block;
      width: 100%;
    }

    tr {
      display: block;
      background: ${({ theme }) => theme.colors.white};
      border: 1px solid ${({ theme }) => theme.colors.gray[300]};
      border-radius: 16px;
      margin-bottom: 20px;
      padding: 16px;
    }

    td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0;
      border: none;
      font-size: 14px;

      &[data-label='수량'],
      &[data-label='상품가격'] {
        display: none;
      }

      /* 상품 정보 섹션 (이미지+이름) */
      &:first-child {
        display: block;
      }

      /* 최종 주문금액 섹션 */
      &[data-label='주문금액'] {
        margin-top: 0;
        font-weight: bold;
        font-size: 17px;
        color: ${({ theme }) => theme.colors.primary};

        &::before {
          content: '최종 합계';
          color: ${({ theme }) => theme.colors.gray[800]};
          font-weight: 500;
        }
      }
    }
  }
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  text-align: left;

  img {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .name {
    font-weight: 600;
    font-size: 15px;
    word-break: keep-all;
    padding-bottom: 10px;
  }

  @media ${({ theme }) => theme.mobile} {
    width: 100%;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
    padding-bottom: 15px;
    margin-bottom: 10px;
  }
`;

const ExpandButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-top: none;
  border-radius: 0 0 8px 8px;
  color: ${({ theme }) => theme.colors.gray[700]};
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  word-break: keep-all;
  overflow-wrap: break-word;
  line-height: 1.4;

  strong {
    color: ${({ theme }) => theme.colors.primary};
  }

  @media ${({ theme }) => theme.mobile} {
    border: 1px solid ${({ theme }) => theme.colors.gray[300]};
    border-radius: 8px;
    margin-top: -10px;
    margin-bottom: 20px;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;

  @media ${({ theme }) => theme.mobile} {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const InfoCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
`;

const CardTitle = styled.h4`
  font-size: 18px;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.gray[800]};
`;

const InfoList = styled.div`
  .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 15px;
    line-height: 1.5;

    .label {
      color: ${({ theme }) => theme.colors.gray[600]};
    }
    .value {
      font-weight: 500;
      text-align: right;
    }
    &.discount .value {
      color: ${({ theme }) => theme.colors.red};
    }
    &.final {
      margin-top: 15px;
      font-size: 18px;
      .label {
        color: ${({ theme }) => theme.colors.gray[600]};
        font-weight: bold;
      }
      .total {
        color: ${({ theme }) => theme.colors.primary};
        font-weight: 900;
      }
    }
    &.payment-method {
      font-size: 13px;
      color: ${({ theme }) => theme.colors.gray[600]};
      margin-top: 5px;
    }
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.gray[300]};
  margin: 15px 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 50px;

  @media ${({ theme }) => theme.mobile} {
    flex-direction: column;
  }
`;

const ActionBtn = styled.button`
  padding: 16px 40px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  background: ${(props) =>
    props.primary ? props.theme.colors.gray[800] : props.theme.colors.white};
  color: ${(props) =>
    props.primary ? props.theme.colors.white : props.theme.colors.gray[800]};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;
