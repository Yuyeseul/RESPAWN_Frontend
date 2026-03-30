import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../api/axios'; // 경로 확인 필요

const PaymentCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. URL에서 파라미터 추출
    const queryParams = new URLSearchParams(location.search);

    const impUid = queryParams.get('imp_uid');
    const merchantUid = queryParams.get('merchant_uid');
    const impSuccess = queryParams.get('imp_success');
    const errorMsg = queryParams.get('error_msg'); // 결제 실패 시 에러 메시지
    const temporaryId = queryParams.get('temporaryId');

    const verifyMobilePayment = async () => {
      // 2. 결제 자체가 실패했거나 취소된 경우
      if (impSuccess !== 'true' && impSuccess !== true) {
        alert(`결제 실패: ${errorMsg || '사용자가 취소했습니다.'}`);
        navigate('/payment/fail'); // onClose() 대신 실패 페이지로 이동
        return;
      }

      if (!temporaryId) {
        alert('잘못된 접근입니다.');
        navigate('/payment/fail');
        return;
      }

      try {
        // 3. 백엔드에서 임시 데이터(temporary) 꺼내오기
        const tempResponse = await axios.get(`/temporary/${temporaryId}`);

        if (tempResponse.data.success) {
          const { orderId, addressId, couponCode, usePointAmount } =
            tempResponse.data.data;

          // 4. 백엔드로 최종 검증 요청
          const { data } = await axios.post('/payments/verify', {
            impUid: impUid,
            merchantUid: merchantUid,
            orderId: orderId,
            usePointAmount: usePointAmount,
          });

          if (data.success) {
            try {
              await axios.post(`/orders/${orderId}/complete`, {
                addressId: addressId,
                couponCode: couponCode,
              });

              // 주문 완료 API까지 성공하면 시원하게 완료 페이지로 넘겨줍니다!
              navigate(`/order/${orderId}/complete`);
            } catch (completeError) {
              console.error('주문 완료 처리 중 오류:', completeError);
              alert(
                '결제는 완료되었으나 주문 처리 중 문제가 발생했습니다. 고객센터로 문의해주세요.'
              );
              navigate('/payment/fail');
            }
          } else {
            alert('서버 결제 검증에 실패했습니다.');
            navigate('/payment/fail');
          }
        } else {
          alert('결제 정보를 불러오는데 실패했습니다.');
          navigate('/payment/fail');
        }
      } catch (error) {
        console.error('결제 검증 오류:', error);
        alert('결제 처리 중 오류가 발생했습니다.');
        navigate('/payment/fail');
      }
    };

    verifyMobilePayment();
  }, [location, navigate]);

  // 아무것도 안 보여주기(return null)보다는, 로딩 중이라는 걸 알려주는 게 좋습니다.
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h2>결제 정보를 안전하게 확인하고 있습니다...</h2>
      <p>잠시만 기다려주세요.</p>
    </div>
  );
};

export default PaymentCallback;
