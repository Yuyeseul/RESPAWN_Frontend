import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import OrderDetailModal from './OrderDetailModal';
import { BASE_URL } from '../../../api/axios';

const OrderCard = ({ order }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);

  const openDetail = () => setOpen(true);
  const closeDetail = () => setOpen(false);

  return (
    <CardContainer>
      <Header>
        <Left>
          <OrderDate>
            {new Date(order.orderDate).toLocaleDateString()}
          </OrderDate>
          <OrderId>주문번호: {order.orderId}</OrderId>
        </Left>
        <Right>
          <DetailButton type="button" onClick={openDetail} ref={triggerRef}>
            상세보기 &gt;
          </DetailButton>
        </Right>
      </Header>

      <SummarySection onClick={openDetail}>
        <ImageWrapper>
          <img
            src={`${BASE_URL}${order.representativeImageUrl}`}
            alt={order.orderName}
          />
        </ImageWrapper>
        <InfoWrapper>
          <StatusBadge status={order.status}>
            {order.status === 'PAID' ? '결제완료' : order.status}
          </StatusBadge>
          <OrderName>{order.orderName}</OrderName>
        </InfoWrapper>
      </SummarySection>

      <FooterSection>
        <OrderPrice>
          <span className="label">총 결제 금액</span>
          <span className="price">{order.totalAmount.toLocaleString()}원</span>
        </OrderPrice>
      </FooterSection>

      <OrderDetailModal
        open={open}
        onClose={closeDetail}
        orderId={order.orderId}
        triggerRef={triggerRef}
      />
    </CardContainer>
  );
};

export default OrderCard;

const CardContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 12px;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.white};
  margin-bottom: 16px;

  @media ${({ theme }) => theme.mobile} {
    padding: 16px;
  }
`;

const SummarySection = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  cursor: pointer;
  padding: 8px 0;
`;

const ImageWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media ${({ theme }) => theme.mobile} {
    width: 60px;
    height: 60px;
  }
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatusBadge = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${({ status, theme }) =>
    status === 'PAID' ? theme.colors.primary : theme.colors.gray[600]};
  margin-bottom: 4px;
`;

const OrderName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[700]};

  @media ${({ theme }) => theme.mobile} {
    font-size: 14px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media ${({ theme }) => theme.mobile} {
    margin-bottom: 16px;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media ${({ theme }) => theme.mobile} {
    gap: 8px;
  }
`;

const OrderDate = styled.div`
  font-weight: 700;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray[700]};

  &::after {
    content: '|';
    margin-left: 10px;
    color: ${({ theme }) => theme.colors.gray[300]};
    font-weight: normal;
  }

  @media ${({ theme }) => theme.mobile} {
    font-size: 15px;
  }
`;

const OrderId = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[600]};

  @media ${({ theme }) => theme.mobile} {
    font-size: 12px;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: start;
`;

const DetailButton = styled.button`
  padding: 8px 0;
  color: ${({ theme }) => theme.colors.gray[600]};
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  @media ${({ theme }) => theme.mobile} {
    font-size: 13px;
  }
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FooterSection = styled.div`
  margin-top: 16px;

  @media ${({ theme }) => theme.mobile} {
    margin-top: 14px;
  }
`;

const OrderPrice = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .label {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.gray[600]};
  }

  .price {
    font-weight: 800;
    font-size: 20px;
    color: ${({ theme }) => theme.colors.primary};
  }

  @media ${({ theme }) => theme.mobile} {
    .price {
      font-size: 16px;
    }
  }
`;
