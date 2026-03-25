import React, { useEffect } from 'react';
import axios from '../../api/axios';

const PaymentComponent = ({ orderInfo, onPaymentComplete, onClose }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.iamport.kr/js/iamport.payment-1.2.0.js';
    script.async = true;
    document.body.appendChild(script);

    const requestPay = () => {
      if (!window.IMP) {
        alert('결제 모듈 로딩에 실패했습니다.');
        onClose();
        return;
      }

      const { IMP } = window;
      IMP.init('imp72461217'); // 가맹점 식별코드

      const merchantUid = `mid_${new Date().getTime()}`;

      // orderInfo에서 필요한 정보 추출
      const {
        orderId,
        totalAmount,
        buyerInfo,
        orders,
        selectedPayment,
        selectedAddressId,
        selectedCartItemIds,
        usePointAmount,
      } = orderInfo;

      // 상품명 생성 (첫 번째 상품명 + 외 n개)
      const productName =
        orders.length > 1
          ? `${orders[0].itemName} 외 ${orders.length - 1}개`
          : orders[0]?.itemName || '상품';

      // 결제 수단에 따른 pg 설정
      let pgProvider = 'html5_inicis';
      let payMethod = 'card';

      switch (selectedPayment) {
        case '신용카드':
          pgProvider = 'html5_inicis';
          payMethod = 'card';
          break;
        case '무통장입금':
          pgProvider = 'html5_inicis';
          payMethod = 'vbank';
          break;
        case '카카오페이':
          pgProvider = 'kakaopay';
          payMethod = 'card';
          break;
        case '토스페이':
          pgProvider = 'tosspay';
          payMethod = 'card';
          break;
        case '네이버페이':
          pgProvider = 'html5_inicis';
          payMethod = 'card';
          break;
        case '페이코':
          pgProvider = 'payco';
          payMethod = 'card';
          break;
        case '삼성페이':
          pgProvider = 'smilepay';
          payMethod = 'card';
          break;
        default:
          pgProvider = 'html5_inicis';
          payMethod = 'card';
      }

      IMP.request_pay(
        {
          pg: pgProvider,
          pay_method: payMethod,
          merchant_uid: merchantUid,
          name: productName,
          amount: totalAmount,
          buyer_name: buyerInfo.name,
          buyer_email: buyerInfo.email,
          buyer_tel: buyerInfo.phone,
        },
        async (response) => {
          if (response.success) {
            try {
              const { data } = await axios.post('/payments/verify', {
                impUid: response.imp_uid,
                merchantUid: response.merchant_uid,
                orderId,
                selectedAddressId,
                selectedCartItemIds,
                usePointAmount,
              });

              if (data.success) {
                onPaymentComplete({
                  impUid: response.imp_uid,
                  merchantUid: response.merchant_uid,
                  payMethod: selectedPayment,
                  amount: totalAmount,
                });
              } else {
                alert('서버 결제 검증에 실패했습니다.');
                onClose();
              }
            } catch (error) {
              console.error('결제 검증 오류:', error);
              alert('서버 결제 검증에 실패했습니다.');
              onClose();
            }
          } else {
            alert(`결제 실패: ${response.error_msg}`);
            onClose();
          }
        }
      );
    };

    // 스크립트 로드 후 바로 결제 실행
    script.onload = () => {
      requestPay();
    };

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [orderInfo, onPaymentComplete, onClose]);

  // 이 컴포넌트는 UI를 렌더링하지 않고, 결제 로직만 수행합니다.
  return null;
};

export default PaymentComponent;
