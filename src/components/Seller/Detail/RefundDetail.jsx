import React, { useEffect, useState } from 'react';
import axios from '../../../api/axios';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

function RefundDetail() {
  const navigate = useNavigate();
  const { orderItemId } = useParams();
  const [refundItem, setRefundItem] = useState(null);

  const handleBack = () => {
    const tab =
      refundItem?.refundStatus === 'REQUESTED' ? 'requested' : 'completed';
    navigate(`/sellerCenter/refundList?tab=${tab}`);
  };

  const handleAcceptRefund = async () => {
    try {
      const response = await axios.post(
        `/orders/seller/refund-requests/${orderItemId}/complete`
      );
      console.log(response.data);
      alert('환불 처리가 완료되었습니다.');
      navigate('/sellerCenter/refundList'); // 리스트로 이동
    } catch (err) {
      console.error('환불 처리 실패:', err);
      alert(err.response?.data?.error || '환불 처리 중 오류가 발생했습니다.');
    }
  };

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        let res;

        // 환불 요청 중인 데이터 가져오기
        res = await axios.get('/orders/seller/refund-requests');
        console.log(res.data);
        let allRefunds = res.data.content;

        // 요청 중 환불에서 orderItemId가 일치하는 아이템 찾기
        let found = allRefunds.find(
          (item) => item.orderItemId === Number(orderItemId)
        );

        // 못 찾으면 완료된 환불 데이터에서 찾기
        if (!found) {
          res = await axios.get('/orders/seller/refund-completed');
          allRefunds = res.data.content;

          found = allRefunds.find(
            (item) => item.orderItemId === Number(orderItemId)
          );
        }

        if (!found) {
          alert('해당 환불 정보를 찾을 수 없습니다.');
          navigate('/sellerCenter/refundList');
          return;
        }

        // 찾은 객체를 상태에 저장
        setRefundItem(found);
      } catch (err) {
        console.error(err);
        alert('환불 정보를 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchData();
  }, [orderItemId, navigate]);

  if (!refundItem) return <Wrapper>로딩 중...</Wrapper>;

  return (
    <Wrapper>
      <Title>환불 상세</Title>
      <Subtitle>
        해당 환불 요청의 상세 내용을 확인하고 처리할 수 있습니다.
      </Subtitle>

      <Card>
        <SectionTitle>주문 정보</SectionTitle>
        <InfoRow>
          <strong>주문번호:</strong> {refundItem.orderItemId}
        </InfoRow>
        <InfoRow>
          <strong>주문일시:</strong>{' '}
          {new Date(refundItem.orderDate).toLocaleString()}
        </InfoRow>
        <ProductBox>
          <img src={refundItem.imageUrl} alt={refundItem.itemName} />
          <div>
            <div>
              <strong>{refundItem.itemName}</strong>
            </div>
            <div>수량 {refundItem.count}개 </div>
            <div>
              전체가격{' '}
              {(refundItem.count * refundItem.orderPrice).toLocaleString()}원
            </div>
          </div>
        </ProductBox>
      </Card>

      <Card>
        <SectionTitle>구매자 정보</SectionTitle>
        <InfoRow>
          <strong>이름:</strong> {refundItem.buyerInfo?.name || '정보 없음'}
        </InfoRow>
        <InfoRow>
          <strong>전화번호:</strong>{' '}
          {refundItem.buyerInfo?.phoneNumber || '정보 없음'}
        </InfoRow>
        <InfoRow>
          <strong>이메일:</strong> {refundItem.buyerInfo?.email || '정보 없음'}
        </InfoRow>
      </Card>

      <Card>
        <SectionTitle>환불 정보</SectionTitle>
        <InfoRow>
          <strong>사유 :</strong>{' '}
          {refundItem.refundInfo?.refundReason || '정보 없음'}
        </InfoRow>
        <InfoRow>
          <strong>상세 사유 :</strong>
        </InfoRow>
        <DetailBox>{refundItem.refundInfo.refundDetail || '없음'}</DetailBox>
        <InfoRow>
          <strong>상태 :</strong> {getKoreanStatus(refundItem.refundStatus)}
        </InfoRow>
      </Card>
      <ButtonWrapper>
        <BackButton onClick={handleBack}>뒤로가기</BackButton>
        {refundItem.refundStatus === 'REQUESTED' && (
          <ActionButton onClick={handleAcceptRefund}>
            환불 요청을 받기
          </ActionButton>
        )}
      </ButtonWrapper>
    </Wrapper>
  );
}

export default RefundDetail;

const Wrapper = styled.div`
  max-width: 1400px;
  margin: 60px auto;
  padding: 0 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 4px;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 24px;
`;

const Card = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 24px 30px; /* 안쪽 패딩 좀 늘림 */
  margin-bottom: 32px; /* 카드 간 간격 키움 */
  background: #fff;
`;

const SectionTitle = styled.h3`
  font-size: 20px; /* 제목 크기 살짝 키움 */
  margin-bottom: 20px; /* 제목 아래 간격도 좀 키움 */
  color: #222;
  font-weight: 600;
`;

const InfoRow = styled.p`
  margin: 8px 0; /* 위아래 마진 키워서 행 간격 확보 */
  line-height: 1.6; /* 줄간격 조금 더 */
  font-size: 16px; /* 글자 크기 살짝 키움 */
  color: #444; /* 조금 더 부드러운 어두운 색상 */
`;

const ProductBox = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 16px;

  img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #ddd;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  background-color: rgb(85, 90, 130);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const BackButton = styled.button`
  padding: 12px 24px;
  background-color: white;
  color: rgb(85, 90, 130);
  border: 1px solid rgb(85, 90, 130);
  border-radius: 8px;
  cursor: pointer;
`;

const DetailBox = styled.div`
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 12px;
  background: #f9f9f9;
  margin-top: 8px;
  margin-bottom: 12px;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
  font-size: 14px;
  color: #333;
`;
