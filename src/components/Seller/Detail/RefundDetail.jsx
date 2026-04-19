import React, { useEffect, useState } from 'react';
import axios from '../../../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

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

  if (!refundItem) return <LoadingScreen>로딩 중...</LoadingScreen>;

  return (
    <Wrapper>
      <TopBackButton onClick={handleBack}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        목록으로 돌아가기
      </TopBackButton>

      <Header>
        <Title>환불 상세 내역</Title>
        <Subtitle>
          해당 환불 요청의 상세 내용을 확인하고 처리할 수 있습니다.
        </Subtitle>
      </Header>

      <Card>
        <SectionTitle>주문 정보</SectionTitle>
        <GridWrapper $columns={2}>
          <InfoItem>
            <Label>주문번호</Label>
            <Value className="highlight">{refundItem.orderItemId}</Value>
          </InfoItem>
          <InfoItem>
            <Label>주문일시</Label>
            <Value>
              {new Date(refundItem.orderDate).toLocaleString('ko-KR')}
            </Value>
          </InfoItem>
        </GridWrapper>

        <ProductBox>
          <img
            src={`http://localhost:8080/api${refundItem.imageUrl}`}
            alt={refundItem.itemName}
          />
          <ProductInfo>
            <ProductName>{refundItem.itemName}</ProductName>
            <ProductMeta>수량 {refundItem.count}개</ProductMeta>
            <ProductPrice>
              총 결제금액{' '}
              {(refundItem.count * refundItem.orderPrice).toLocaleString()}원
            </ProductPrice>
          </ProductInfo>
        </ProductBox>
      </Card>

      <Card>
        <SectionTitle>구매자 정보</SectionTitle>
        <GridWrapper $columns={2}>
          <InfoItem>
            <Label>이름</Label>
            <Value>{refundItem.buyerInfo?.name || '정보 없음'}</Value>
          </InfoItem>
          <InfoItem>
            <Label>전화번호</Label>
            <Value>{refundItem.buyerInfo?.phoneNumber || '정보 없음'}</Value>
          </InfoItem>
          <InfoItem>
            <Label>이메일</Label>
            <Value>{refundItem.buyerInfo?.email || '정보 없음'}</Value>
          </InfoItem>
        </GridWrapper>
      </Card>

      <Card>
        <SectionTitle>환불 정보</SectionTitle>
        <GridWrapper $columns={2}>
          <InfoItem>
            <Label>환불 사유</Label>
            <Value>{refundItem.refundInfo?.refundReason || '정보 없음'}</Value>
          </InfoItem>
          <InfoItem>
            <Label>진행 상태</Label>
            <Value>
              <StatusBadge $status={refundItem.refundStatus}>
                {getKoreanStatus(refundItem.refundStatus)}
              </StatusBadge>
            </Value>
          </InfoItem>
        </GridWrapper>

        <RefundDetailLabel>상세 사유</RefundDetailLabel>
        <DetailBox>
          {refundItem.refundInfo.refundDetail || '등록된 상세 사유가 없습니다.'}
        </DetailBox>
      </Card>

      <ButtonWrapper>
        <BackButton onClick={handleBack}>뒤로가기</BackButton>
        {refundItem.refundStatus === 'REQUESTED' && (
          <ActionButton onClick={handleAcceptRefund}>
            환불 요청 승인하기
          </ActionButton>
        )}
      </ButtonWrapper>
    </Wrapper>
  );
}

export default RefundDetail;

// --- 전면 개편된 스타일 영역 ---

const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
`;

const Wrapper = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 40px auto 80px;
  padding: 0 20px;
  box-sizing: border-box;
  font-family:
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    sans-serif;

  @media (max-width: 768px) {
    margin: 20px auto 40px;
    padding: 0 15px;
  }
`;

const TopBackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 24px;
  padding: 0;
  transition: color 0.2s ease;

  &:hover {
    color: #0f172a;
  }
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h2`
  font-size: 26px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
`;

const Card = styled.section`
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 12px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 18px;
    background-color: #555a82;
    border-radius: 4px;
  }
`;

/* 라벨과 데이터를 예쁘게 담는 Grid Box */
const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: ${(props) => `repeat(${props.$columns || 1}, 1fr)`};
  gap: 16px 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* 화면이 좁아지면 무조건 1열 세로 배치 */
    gap: 16px;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: stretch;
  background: #ffffff;
  border: 1.5px solid #f1f5f9;
  border-radius: 10px;
  overflow: hidden;

  /* 480px 이하 모바일에서는 상하 배치로 전환 */
  @media (max-width: 480px) {
    flex-direction: column;
    border: none;
    border-bottom: 1.5px solid #f1f5f9;
    border-radius: 0;
    padding-bottom: 12px;
  }
`;

const Label = styled.div`
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  font-size: 14px;
  width: 100px;
  padding: 14px 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  border-right: 1.5px solid #f1f5f9;

  @media (max-width: 480px) {
    width: 100%;
    background: transparent;
    border-right: none;
    padding: 4px 0 8px 0;
    font-size: 13px;
    color: #94a3b8;
  }
`;

const Value = styled.div`
  padding: 14px 16px;
  font-size: 15px;
  font-weight: 500;
  color: #334155;
  flex: 1;
  display: flex;
  align-items: center;
  word-break: keep-all;

  &.highlight {
    font-weight: 700;
    color: #0f172a;
  }

  @media (max-width: 480px) {
    padding: 0;
    font-size: 15px;
  }
`;

const ProductBox = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 24px;
  padding: 20px;
  background: #f8fafc;
  border: 1.5px solid #f1f5f9;
  border-radius: 12px;

  img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #fff;
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    gap: 16px;
    padding: 16px;

    img {
      width: 64px;
      height: 64px;
    }
  }
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ProductName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  word-break: keep-all;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const ProductMeta = styled.div`
  font-size: 13px;
  color: #64748b;
`;

const ProductPrice = styled.div`
  font-size: 15px;
  color: #555a82;
  font-weight: 700;
  margin-top: 2px;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$status === 'REFUNDED' ? '#f1f5f9' : '#fff0f0'};
  color: ${(props) => (props.$status === 'REFUNDED' ? '#64748b' : '#ef4444')};
`;

const RefundDetailLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin: 24px 0 12px 0;
`;

const DetailBox = styled.div`
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 20px;
  background: #ffffff;
  white-space: pre-wrap;
  min-height: 100px;
  font-size: 15px;
  color: #334155;
  line-height: 1.6;

  @media (max-width: 768px) {
    padding: 16px;
    font-size: 14px;
    min-height: 80px;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
  }
`;

const ButtonBase = styled.button`
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const BackButton = styled(ButtonBase)`
  background: white;
  border: 1.5px solid #cbd5e1;
  color: #475569;

  &:hover {
    background-color: #f8fafc;
    border-color: #94a3b8;
    color: #1e293b;
  }
`;

const ActionButton = styled(ButtonBase)`
  background-color: #555a82;
  border: 1.5px solid #555a82;
  color: white;

  &:hover {
    background-color: #3e4263;
    border-color: #3e4263;
    box-shadow: 0 4px 12px rgba(85, 90, 130, 0.2);
  }
`;
