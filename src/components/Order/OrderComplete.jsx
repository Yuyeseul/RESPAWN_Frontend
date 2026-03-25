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
      } catch {
        setError('주문 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderInfo();
  }, [orderId]);

  const handleGoHome = () => navigate('/');
  const handleGoMyPage = () => navigate('/mypage');

  if (loading) return <Root>주문 정보를 불러오는 중입니다...</Root>;
  if (error) return <Root>{error}</Root>;
  if (!orderInfo) return null;

  return (
    <Root>
      <Card>
        <StepProgressWrapper>
          <StepProgress currentStep={3} />
        </StepProgressWrapper>
        <Header>
          <div>
            <MainMsg>주문이 완료되었습니다</MainMsg>
            <Info>
              <span>
                주문일시{' '}
                <b>
                  {orderInfo?.orderDate
                    ? new Date(orderInfo.orderDate).toLocaleString('ko-KR')
                    : '-'}
                </b>
              </span>
              <span>
                주문번호 <OrderNum>{orderInfo.orderId}</OrderNum>
              </span>
            </Info>
          </div>
        </Header>

        <SectionTitle>주문 상품</SectionTitle>
        <Table>
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>이미지</th>
              <th style={{ textAlign: 'left' }}>상품명</th>
              <th style={{ textAlign: 'center' }}>수량</th>
              <th style={{ textAlign: 'center' }}>단가</th>
              <th style={{ textAlign: 'center' }}>금액</th>
            </tr>
          </thead>
          <tbody>
            {orderInfo?.orderItems?.map((item) => {
              const unit = item?.orderPrice;
              const qty = item?.count;
              const lineTotal = (Number(unit) || 0) * (Number(qty) || 0);

              return (
                <tr key={item.orderItemId}>
                  <td style={{ textAlign: 'center' }}>
                    <img
                      src={`${BASE_URL}${item.imageUrl}`}
                      alt=""
                      width={64}
                    />
                  </td>
                  <td>{item.itemName ?? '-'}</td>
                  <td style={{ textAlign: 'center' }}>{qty ?? 0}</td>
                  <td style={{ textAlign: 'center' }}>
                    {formatCurrency(unit)}원
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {formatCurrency(lineTotal)}원
                  </td>
                </tr>
              );
            }) ?? null}
          </tbody>
        </Table>

        <RowSection>
          <InfoCard>
            <InfoHeading>배송지 정보</InfoHeading>
            <InfoTable>
              <tbody>
                <tr>
                  <InfoTh>수령인</InfoTh>
                  <td>{orderInfo.deliveryInfo[0].address.recipient}</td>
                </tr>
                <tr>
                  <InfoTh>연락처</InfoTh>
                  <td>{orderInfo.deliveryInfo[0].address.phone}</td>
                </tr>
                <tr>
                  <InfoTh>주소</InfoTh>
                  <td>
                    [{orderInfo.deliveryInfo[0].address.zoneCode}]{' '}
                    {orderInfo.deliveryInfo[0].address.baseAddress}{' '}
                    {orderInfo.deliveryInfo[0].address.detailAddress}
                  </td>
                </tr>
              </tbody>
            </InfoTable>
          </InfoCard>
          <InfoCard>
            <InfoHeading>결제 정보</InfoHeading>
            <PaymentDetailsGrid>
              {/* 왼쪽 컬럼 */}
              <PaymentColumn>
                <ColumnTitle>금액</ColumnTitle>
                <PaymentRow>
                  <PaymentLabel>상품 합계</PaymentLabel>
                  <PaymentValue>
                    {formatCurrency(orderInfo.itemTotalPrice ?? 0)}원
                  </PaymentValue>
                </PaymentRow>
                <PaymentRow>
                  <PaymentLabel>배송비</PaymentLabel>
                  <PaymentValue>
                    {formatCurrency(orderInfo.deliveryFee ?? 0)}원
                  </PaymentValue>
                </PaymentRow>
                <Divider />
                <PaymentRow>
                  <PaymentLabel>합계</PaymentLabel>
                  <PaymentValue>
                    {formatCurrency(orderInfo.originalAmount ?? 0)}원
                  </PaymentValue>
                </PaymentRow>
              </PaymentColumn>

              {/* 오른쪽 컬럼 */}
              <PaymentColumn>
                <ColumnTitle>할인 및 적립</ColumnTitle>
                <PaymentRow>
                  <PaymentLabel>포인트 사용</PaymentLabel>
                  <PaymentValue isDiscount>
                    {formatCurrency(orderInfo.usedPointAmount ?? 0)}원
                  </PaymentValue>
                </PaymentRow>
                <PaymentRow>
                  <PaymentLabel>쿠폰 사용</PaymentLabel>
                  <PaymentValue isDiscount>
                    - {formatCurrency(orderInfo.usedCouponAmount ?? 0)}원
                  </PaymentValue>
                </PaymentRow>
                <PaymentRow>
                  <PaymentLabel>추후 적립금</PaymentLabel>
                  <PaymentValue>
                    {formatCurrency(orderInfo.pointBenefit?.savedAmount ?? 0)}원
                  </PaymentValue>
                </PaymentRow>
              </PaymentColumn>
            </PaymentDetailsGrid>

            <PaymentDivider />

            <InfoTable>
              <tbody>
                <tr>
                  <InfoTh>결제수단</InfoTh>
                  <InfoTd>
                    {paymentMethodLabel(orderInfo?.paymentInfo?.paymentMethod)}
                  </InfoTd>
                </tr>
                <tr>
                  <InfoTh>PG사</InfoTh>
                  <InfoTd>
                    {orderInfo?.paymentInfo?.pgProvider ?? '정보 없음'}
                  </InfoTd>
                </tr>
              </tbody>
            </InfoTable>

            <PaymentDivider />
            <FinalTotalRow>
              <FinalTotalLabel>총 결제금액</FinalTotalLabel>
              <TotalAmount>
                {formatCurrency(orderInfo.totalAmount)}원
              </TotalAmount>
            </FinalTotalRow>
          </InfoCard>
        </RowSection>

        <ButtonGroup>
          <ActionBtn onClick={handleGoHome}>홈으로</ActionBtn>
          <ActionBtn onClick={handleGoMyPage}>마이페이지</ActionBtn>
        </ButtonGroup>
      </Card>
    </Root>
  );
}

export default OrderComplete;

const Root = styled.div`
  min-height: 100vh;
  padding: 60px 20px;
  align-items: center;
  font-family: 'Noto Sans KR', sans-serif;
  color: #34495e;
`;

const StepProgressWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px; /* 타이틀과 간격 */
`;

const Card = styled.div`
  background: #ffffff;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  border-radius: 18px;
  padding: 5px 36px;
  @media (max-width: 900px) {
    padding: 30px 6vw;
  }
`;

const Header = styled.div`
  margin-bottom: 38px;
`;

const MainMsg = styled.div`
  font-size: 26px;
  font-weight: 800;
  margin-bottom: 8px;
  color: #2c3e50;
`;

const Info = styled.div`
  font-size: 15px;
  color: #607d8b;
  margin-top: 6px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;

  span {
    display: flex;
    align-items: center;
  }

  b {
    margin-left: 4px;
    font-weight: 600;
    color: #34495e;
  }
`;

const OrderNum = styled.span`
  color: #34495e;
  font-size: 16px;
  margin-left: 6px;
  font-weight: 700;
  letter-spacing: 0.05em;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #34495e;
  margin-top: 32px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0 12px;
  font-size: 16px;
  margin-bottom: 24px;

  thead th {
    font-weight: 700;
    color: #2c3e50;
    padding: 16px 12px;
    text-align: left;
    border-bottom: 2px solid #b0bec5;
  }

  tbody tr {
    background: #f9fbfd;
    border-radius: 14px;
    box-shadow: 0 3px 8px rgb(0 0 0 / 0.07);
    transition: background-color 0.25s ease;
  }

  tbody td {
    padding: 16px 12px;
    vertical-align: middle;
    color: #34495e;
  }
`;

const RowSection = styled.div`
  display: flex;
  gap: 32px;
  margin-top: 36px;
  margin-bottom: 24px;
  justify-content: center;
  @media (max-width: 700px) {
    flex-direction: column;
    gap: 24px;
  }
`;

const InfoCard = styled.div`
  flex: 1;
  background: #fcfdff;
  border-radius: 18px;
  padding: 32px 28px 28px;
  box-shadow: 0 4px 22px rgba(0, 0, 0, 0.06);
  min-width: 360px;
`;

const InfoHeading = styled.div`
  font-size: 17px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 18px;
  padding: 0 0 12px;
  border-bottom: 2px solid #b0bec5;
`;

const PaymentDetailsGrid = styled.div`
  display: flex;
  gap: 24px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const PaymentColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ColumnTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: #34495e;
  margin: 0 0 4px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
`;

const PaymentRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
`;

const PaymentLabel = styled.span`
  color: #607d8b;
`;

const PaymentValue = styled.span`
  font-weight: 600;
  color: ${(props) => (props.isDiscount ? '#e53935' : '#2c3e50')};
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #cfd8dc;
`;

const PaymentDivider = styled.hr`
  border: none;
  border-top: 1px solid #cfd8dc;
  margin: 20px 0;
`;

const FinalTotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FinalTotalLabel = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
`;

const InfoTable = styled.table`
  width: 100%;
  font-size: 15px;
  border-collapse: collapse; /* 테이블 셀 사이의 간격을 없애줍니다 */
`;

const InfoTh = styled.th`
  text-align: left;
  width: 110px;
  color: #607d8b;
  font-weight: 500;
  padding: 8px 0;
  vertical-align: top;
`;

const InfoTd = styled.td`
  text-align: left;
  padding: 8px 0;
  color: #2c3e50;
  font-weight: 600;
`;

const TotalAmount = styled.div`
  font-size: 20px;
  font-weight: 900;
  color: #1a2935;
  letter-spacing: 0.05em;
`;

const ButtonGroup = styled.div`
  margin-top: 48px;
  display: flex;
  gap: 32px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button`
  min-width: 160px;
  background: rgb(105, 111, 148);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 16px 32px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgb(85, 90, 130);
  }

  &:active {
    transform: translateY(2px);
  }
`;
