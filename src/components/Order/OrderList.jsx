import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import axios from '../../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import StepProgress from '../common/StepProgress';
import PaymentComponent from './PaymentComponent';
import AddressManager from './AddressManager';
import DiscountManager from './DiscountManager';
import { BASE_URL } from '../../api/axios';

const OrderList = () => {
  const navigate = useNavigate();
  const isCompleting = React.useRef(false);
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const toggleExpand = () => setIsExpanded(!isExpanded);
  const visibleOrders = isExpanded ? orders : orders.slice(0, 1);
  const remainingCount = orders.length - 1;

  const [selectedCartItemIds, setSelectedCartItemIds] = useState([]);

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [defaultAddress, setDefaultAddress] = useState(null);

  const [discountInfo, setDiscountInfo] = useState({
    usedPoint: 0,
    couponCode: null,
    couponDiscount: 0,
    finalAmount: 0,
  });

  const [selectedPayment, setSelectedPayment] = useState('신용카드');

  // PaymentComponent 실행을 위한 상태
  const [showPaymentComponent, setShowPaymentComponent] = useState(false);

  const PAYMENT_OPTIONS = {
    일반결제: '신용카드 결제창이 전환됩니다.',
    삼성페이: '삼성페이 앱으로 결제창이 전환됩니다.',
    토스페이: '토스 앱으로 결제창이 전환됩니다.',
    네이버페이: '네이버페이 결제창으로 전환됩니다.',
    페이코: '페이코 앱으로 결제창이 전환됩니다.',
    무통장입금: '무통장입금 결제창이 전환됩니다.',
    카카오페이: '카카오페이 앱으로 결제창이 전환됩니다.',
  };

  // 결제하기 버튼 클릭 시 바로 PaymentComponent 실행 (모달 없이)
  const handlePaymentClick = () => {
    if (!orderData) {
      alert('주문정보를 불러오는 중입니다. 잠시 후 시도해주세요.');
      return;
    }

    if (selectedCartItemIds.length === 0) {
      alert('주소와 상품을 선택해주세요.');
      return;
    }

    if (!selectedAddressId) {
      alert('배송지를 선택해주세요.');
      return;
    }

    // PaymentComponent 실행 (모달 없이 바로 결제창 팝업)
    setShowPaymentComponent(true);
  };

  // PaymentComponent에서 결제 완료 시 호출될 함수
  const handlePaymentComplete = () => {
    isCompleting.current = true;
    setShowPaymentComponent(false);

    // 결제 완료 후 주문 완료 처리
    axios
      .post(`/orders/${orderId}/complete`, {
        addressId: selectedAddressId,
        couponCode: discountInfo.couponCode,
      })
      .then((res) => {
        console.log('couponCode', discountInfo.couponCode);
        alert(res.data.message || '주문이 완료되었습니다!');
        navigate(`/order/${orderId}/complete`);
      })
      .catch((err) => {
        isCompleting.current = false;
        alert(err.response?.data?.error || '주문 처리 중 오류가 발생했습니다.');
      });
  };

  // PaymentComponent 닫기
  const handlePaymentClose = () => {
    setShowPaymentComponent(false);
  };

  const renderPaymentDetail = () => {
    const option = PAYMENT_OPTIONS[selectedPayment];

    if (Array.isArray(option)) {
      return (
        <BankList>
          {option.map((item) => (
            <div key={item}>{item}</div>
          ))}
        </BankList>
      );
    }

    if (typeof option === 'string') {
      return <NoticeBox>{option}</NoticeBox>;
    }

    return null;
  };

  useEffect(() => {
    if (showPaymentComponent) {
      const preventGoBack = () => {
        window.history.pushState(null, '', window.location.href);
        alert('결제 진행 중에는 페이지를 이동할 수 없습니다.');
      };

      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', preventGoBack);

      return () => window.removeEventListener('popstate', preventGoBack);
    }
  }, [showPaymentComponent]);

  useEffect(() => {
    const currentOrderId = orderId;
    const sendDeleteRequest = () => {
      if (isCompleting.current || !currentOrderId) return;
      axios
        .delete('/orders/temporary')
        .catch((err) => console.error('삭제 실패:', err));
    };

    const handleBeforeUnload = (event) => {
      const navEntries = performance.getEntriesByType('navigation');
      const isRefresh =
        navEntries.length > 0 && navEntries[0].type === 'reload';
      if (!isRefresh) {
        sendDeleteRequest();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);

      const targetPath = window.location.pathname;
      const isStayingOnOrderPage = targetPath.includes(
        `/order/${currentOrderId}`
      );
      const isGoingToComplete = targetPath.includes('/complete');

      if (!isStayingOnOrderPage && !isGoingToComplete) {
        sendDeleteRequest();
      }
    };
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;

    axios
      .get(`/orders/${orderId}`)
      .then((res) => {
        const data = res.data;
        console.log('orderList', data);
        setOrderData(data);
        setOrders(data.orderItems || []);
        setBuyerInfo({
          name: data.name || '',
          phone: data.phoneNumber || '',
          email: data.email || '',
        });
        setSelectedCartItemIds(
          res.data.orderItems.map((item) => item.cartItemId)
        );

        const hasAddress =
          !!data.addressId ||
          !!data.zoneCode ||
          !!data.baseAddress ||
          !!data.detailAddress ||
          !!data.recipient ||
          !!data.addressPhone;

        const defaultAddr = hasAddress
          ? {
              id: data.addressId ?? null,
              zoneCode: data.zoneCode ?? '',
              baseAddress: data.baseAddress ?? '',
              detailAddress: data.detailAddress ?? '',
              recipient: data.recipient ?? '',
              phone: data.addressPhone ?? '',
            }
          : null;
        setDefaultAddress(defaultAddr);
      })
      .catch((err) => console.error('주문 내역 불러오기 실패', err));
  }, [orderId]);

  const handleAddressSelect = useCallback((addressId) => {
    setSelectedAddressId(addressId);
  }, []);

  const handleDiscountUpdate = useCallback((info) => {
    setDiscountInfo(info);
  }, []);

  return (
    <Container>
      {(showPaymentComponent || isCompleting.current) && (
        <LoadingOverlay>
          <Spinner />
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
            결제가 진행 중입니다. 잠시만 기다려 주세요...
          </p>
        </LoadingOverlay>
      )}
      <Section>
        <StepProgressWrapper>
          <StepProgress currentStep={2} />
        </StepProgressWrapper>
        <Title>주문결제</Title>
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
                    <img
                      src={`${BASE_URL}${item.imageUrl}`}
                      alt={item.itemName}
                    />
                    <div className="info-text">
                      <div className="name">{item.itemName}</div>
                      <div className="mobile-only-price">
                        {item.itemPrice.toLocaleString()}원 / {item.count}개
                      </div>
                    </div>
                  </ProductInfo>
                </td>
                <td data-label="상품가격">
                  {item.itemPrice.toLocaleString()}원
                </td>
                <td data-label="수량">{item.count}개</td>
                <td data-label="주문금액">
                  {(item.itemPrice * item.count).toLocaleString()}원
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

      <CheckoutLayout>
        <LeftPanel>
          <AddressManager
            defaultAddress={defaultAddress}
            onAddressSelect={handleAddressSelect}
          />
          <PaymentSection>
            <h3>결제방법</h3>
            <PaymentMethodList>
              {Object.keys(PAYMENT_OPTIONS).map((method) => (
                <button
                  key={method}
                  onClick={() => setSelectedPayment(method)}
                  className={selectedPayment === method ? 'selected' : ''}
                >
                  {method}
                </button>
              ))}
            </PaymentMethodList>

            {renderPaymentDetail()}
          </PaymentSection>
        </LeftPanel>

        <RightPanel>
          <DiscountManager
            orderData={orderData}
            onUpdate={handleDiscountUpdate}
            onPaymentRequest={handlePaymentClick}
          />
        </RightPanel>
      </CheckoutLayout>

      {/* PaymentComponent - 모달 없이 바로 결제 실행 */}
      {showPaymentComponent && orderData && (
        <PaymentComponent
          orderInfo={{
            orderId,
            totalAmount: discountInfo.finalAmount,
            buyerInfo,
            orders,
            selectedPayment,
            selectedAddressId,
            selectedCartItemIds,
            usePointAmount: discountInfo.usedPoint,
            couponCode: discountInfo.couponCode,
          }}
          onPaymentComplete={handlePaymentComplete}
          onClose={handlePaymentClose}
        />
      )}
    </Container>
  );
};

export default OrderList;

const Container = styled.div`
  padding: 40px;
  max-width: ${({ theme }) => theme.maxWidth};
  min-height: 500px;
  width: 100%;
  margin: 0 auto;

  @media ${({ theme }) => theme.mobile} {
    padding: 20px 15px;
  }
`;

const Section = styled.div`
  margin-bottom: 40px;
`;

const StepProgressWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;

  @media ${({ theme }) => theme.mobile} {
    margin-bottom: 30px;
  }
`;

const Title = styled.h2`
  font-size: 34px;
  text-align: center;
  margin: 0 0 40px 0;
  color: ${({ theme }) => theme.colors.gray[700]};

  @media ${({ theme }) => theme.mobile} {
    font-size: 24px;
    margin-bottom: 20px;
  }
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

    @media ${({ theme }) => theme.mobile} {
    display: block;
    thead { display: none; }
    tbody { display: block; width: 100%; }

    tr {
      display: block;
      background: ${({ theme }) => theme.colors.white};
      border: 1px solid ${({ theme }) => theme.colors.gray[300]};
      border-radius: 16px; 
      margin-bottom: 20px;
      padding: 20px; 
    }

    td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0; 
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

const CheckoutLayout = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 40px;
  align-items: flex-start;

  @media ${({ theme }) => theme.mobile} {
    flex-direction: column;
    gap: 20px;
  }
`;

const LeftPanel = styled.div`
  flex: 2;
  @media ${({ theme }) => theme.mobile} {
    width: 100%;
  }
`;

const RightPanel = styled.div`
  flex: 1;
  @media ${({ theme }) => theme.mobile} {
    width: 100%;
  }
`;

const PaymentSection = styled.div`
  margin-top: 40px;

  h3 {
    font-size: 20px;
    margin-bottom: 10px;
  }
`;

const PaymentMethodList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;

  button {
    padding: 12px 20px;
    min-width: 120px;
    font-size: 15px;
    border: 1px solid ${({ theme }) => theme.colors.gray[300]};
    border-radius: 8px;
    background: ${({ theme }) => theme.colors.white};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.primary};
    }

    &.selected {
      border-color: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.primary};
      font-weight: 600;
    }

    @media ${({ theme }) => theme.mobile} {
      flex: 1 1 calc(50% - 12px);
      min-width: 0;
    }
  }
`;

const BankList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 20px;

  @media ${({ theme }) => theme.mobile} {
    grid-template-columns: 1fr;
  }

  div {
    background: ${({ theme }) => theme.colors.gray[100]};
    padding: 10px;
    text-align: center;
    border-radius: 6px;
    font-size: 14px;
  }
`;

const NoticeBox = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.pink_lace};
  border: 1px solid ${({ theme }) => theme.colors.pink_lace};
  border-radius: 6px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.wish};
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  color: white;
  gap: 20px;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top: 5px solid ${({ theme }) => theme.colors.white};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
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
