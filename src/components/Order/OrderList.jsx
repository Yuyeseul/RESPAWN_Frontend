import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import axios from '../../api/axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import StepProgress from '../common/StepProgress';
import PaymentComponent from './PaymentComponent';
import AddressManager from './AddressManager';
import DiscountManager from './DiscountManager';

const OrderList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isCompleting = React.useRef(false);
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    phone: '',
    email: '',
  });

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
    신용카드: '신용카드 결제창이 전환됩니다.',
    무통장입금: '무통장입금 결제창이 전환됩니다.',
    카카오페이: '카카오페이 앱으로 결제창이 전환됩니다.',
    토스페이: '토스 앱으로 결제창이 전환됩니다.',
    네이버페이: '네이버페이 결제창으로 이동합니다.',
    페이코: '페이코 앱으로 결제창이 전환됩니다.',
    삼성페이: '삼성페이 앱으로 결제창이 전환됩니다.',
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
      fetch('/orders/temporary', {
        method: 'DELETE',
        keepalive: true,
      });
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
            {orders.map((item) => (
              <tr key={item.orderItemId}>
                <td>
                  <ProductInfo>
                    <img src={item.imageUrl} alt={item.itemName} />
                    <div>{item.itemName}</div>
                  </ProductInfo>
                </td>
                <td>{item.itemPrice.toLocaleString()}원</td>
                <td>{item.count}</td>
                <td>{(item.itemPrice * item.count).toLocaleString()}원</td>
              </tr>
            ))}
          </tbody>
        </ProductTable>
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
  max-width: 1200px;
  margin: 0 auto;
`;

const Section = styled.div`
  margin-bottom: 40px;
`;

const StepProgressWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px; /* 타이틀과 간격 */
`;

const Title = styled.h2`
  font-size: 34px;
  text-align: center;
  margin: 0 0 40px 0; /* 아래쪽 마진 유지 */
`;

const ProductTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 16px;
    border-bottom: 1px solid #eee;
    text-align: center;
  }

  th {
    background-color: #f9f9f9;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  img {
    width: 70px;
    height: 70px;
    border-radius: 4px;
    object-fit: cover;
  }
`;

const CheckoutLayout = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 40px;
  align-items: flex-start;
`;

const LeftPanel = styled.div`
  flex: 2;
`;

const RightPanel = styled.div`
  flex: 1;
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
    border: 1px solid #ccc;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #f0f8ff;
      border-color: rgb(85, 90, 130);
      color: rgb(85, 90, 130);
    }

    &.selected {
      background-color: #e6f0ff;
      border-color: rgb(85, 90, 130);
      color: rgb(85, 90, 130);
      font-weight: 600;
    }

    &:disabled {
      background: #f2f2f2;
      color: #999;
      border-color: #ddd;
      cursor: not-allowed;
    }
  }
`;

const BankList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 20px;

  div {
    background: #f5f5f5;
    padding: 10px;
    text-align: center;
    border-radius: 6px;
    font-size: 14px;
  }
`;

const NoticeBox = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 6px;
  font-size: 14px;
  color: #856404;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); // 반투명 검정
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999; // 최상단 배치
  color: white;
  gap: 20px;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top: 5px solid #ffffff;
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
