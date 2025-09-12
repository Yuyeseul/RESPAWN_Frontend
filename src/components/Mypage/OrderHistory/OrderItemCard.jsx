// OrderItemCard.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';

const OrderItemCard = ({ item, orderId, orderStatus }) => {
  const navigate = useNavigate();
  const [reviewExists, setReviewExists] = useState(null);

  useEffect(() => {
    const checkReview = async () => {
      try {
        const res = await axios.get(
          `/api/reviews/order-items/${item.orderItemId}`
        );
        setReviewExists(res.data.reviewExists);
      } catch (error) {
        console.error('리뷰 존재 여부 확인 실패', error);
        setReviewExists(false); // 오류 시 버튼 보여줄지 말지 결정 가능
      }
    };

    if (item.orderItemId) {
      checkReview();
    }
  }, [item.orderItemId]);

  const status = String(item?.status ?? '').toUpperCase();
  const statusMap = {
    TEMPORARY: '임시주문',
    ORDERED: '주문접수',
    PAID: '결제완료',
    CANCELED: '주문취소',
    RETURNED: '반품',
    REFUND_REQUESTED: '환불신청',
    REFUNDED: '환불완료',
  };
  const statusText = statusMap[status] || status;

  const orderSt = String(orderStatus ?? '').toUpperCase();
  const itemRefundSt = String(item?.refundStatus ?? 'NONE').toUpperCase();
  const canRequestRefund = orderSt === 'PAID' && itemRefundSt === 'NONE';

  const canWriteReview =
    String(item?.deliveryStatus ?? '').toUpperCase() === 'DELIVERED' &&
    reviewExists === false;

  const goToRefundPage = () => {
    navigate(
      `/mypage/orders/${orderId}/items/${item.orderItemId}/registerRefund`
    );
  };

  const goToReviewPage = () => {
    navigate(
      `/mypage/orders/${orderId}/items/${item.orderItemId}/registerReview`
    );
  };

  const openProductPage = () => {
    window.open(`/ProductDetail/${item.itemId}`, '_blank');
  };

  return (
    <ItemContainer>
      <ImageWrapper onClick={openProductPage}>
        <img src={item.imageUrl} alt={item.itemName} />
      </ImageWrapper>
      <Info>
        <Name onClick={openProductPage}>{item.itemName}</Name>
        <Quantity>{item.count}개</Quantity>
        <Price>{(item.orderPrice * item.count).toLocaleString()}원</Price>
      </Info>
      <ButtonGroup>
        <StatusText>{statusText}</StatusText>
        <ButtonsRow>
          {canRequestRefund && (
            <RefundButton onClick={goToRefundPage}>환불 신청</RefundButton>
          )}
          {canWriteReview && (
            <ReviewButton onClick={goToReviewPage}>리뷰 작성하기</ReviewButton>
          )}
        </ButtonsRow>
      </ButtonGroup>
    </ItemContainer>
  );
};

export default OrderItemCard;

const ItemContainer = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 16px;
  background-color: #ffffff;
  align-items: center;
`;

const ImageWrapper = styled.div`
  width: 100px;
  height: 100px;
  cursor: pointer;
  img {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    object-fit: cover;
  }
`;

const Info = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
`;

const Name = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
  color: #222;
  cursor: pointer;
`;

const Quantity = styled.div`
  font-size: 14px;
  color: #555;
`;

const Price = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-top: 6px;
  color: #111;
`;

const StatusText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  min-width: 140px;
`;

const ButtonsRow = styled.div`
  display: flex;
  gap: 12px;
  flex-direction: column;
  margin-top: 6px;
`;

const ButtonBase = styled.button`
  font-size: 14px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  height: fit-content;
  transition: all 0.2s ease;
  background: transparent;
  border: 1.5px solid;
`;

const RefundButton = styled(ButtonBase)`
  min-width: 120px;
  border-color: rgb(105, 111, 148);
  color: rgb(105, 111, 148);

  &:hover {
    background-color: rgba(105, 111, 148, 0.1);
  }
`;

const ReviewButton = styled(ButtonBase)`
  min-width: 120px;
  border-color: #4b5563;
  color: #4b5563;

  &:hover {
    background-color: rgba(75, 85, 99, 0.1);
  }
`;
