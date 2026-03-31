import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../api/axios'; // 경로 확인 필요
import theme from '../styles/theme'; // theme 파일 경로 확인 필요
import logo from '../assets/respawn_logo.png'; // 에셋 폴더 경로 확인 필요
import styled, { keyframes } from 'styled-components';

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
    <Container>
      <LogoWrapper>
        <img src={logo} alt="Respawn Logo" />
      </LogoWrapper>
      <Spinner />
      <Title>결제 정보를 안전하게 확인 중입니다</Title>
      <Description>
        페이지를 새로고침하거나 종료하지 마세요. <br />
        잠시 후 주문 완료 페이지로 이동합니다.
      </Description>
    </Container>
  );
};

export default PaymentCallback;

// 로딩 애니메이션 정의
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: ${theme.colors.gray[50]};
  padding: 20px;
  text-align: center;
`;

const LogoWrapper = styled.div`
  margin-bottom: 40px;
  position: relative;

  img {
    width: 120px; // 로고 사이즈 조절
    height: auto;
    display: block;
  }
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid ${theme.colors.lightNavy};
  border-top: 4px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  color: ${theme.colors.gray[900]};
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 12px;

  @media ${theme.mobile} {
    font-size: 1.25rem;
  }
`;

const Description = styled.p`
  color: ${theme.colors.gray[700]};
  font-size: 1rem;
  line-height: 1.6;
`;
