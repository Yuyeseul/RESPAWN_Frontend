import React, { useEffect, useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';
import TextareaAutosize from 'react-textarea-autosize';
import MypageLayout from '../MypageLayout';
import { BASE_URL } from '../../../api/axios';

const RefundPage = () => {
  const navigate = useNavigate();
  const { orderId, itemId: orderItemId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    (async () => {
      try {
        const res = await axios.get(`/orders/history/${orderId}`);
        const orderData = res.data;

        const item = orderData.items?.find(
          (it) => String(it.orderItemId) === String(orderItemId)
        );

        if (item && item.refundStatus && item.refundStatus !== 'NONE') {
          alert('이미 환불 신청이 완료된 상품입니다.');
          navigate('/mypage', { replace: true });
          return;
        }

        setOrder(orderData);
      } catch (err) {
        console.error('주문 정보 불러오기 실패:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [orderId, orderItemId, navigate]);

  const selectedItem = useMemo(() => {
    if (!order?.items) return null;
    return order.items.find(
      (it) => String(it.orderItemId) === String(orderItemId)
    );
  }, [order, orderItemId]);

  const handleGoBack = () => navigate(-1);

  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');

  const isValid = useMemo(() => {
    return Boolean(orderId && reason);
  }, [orderId, reason]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      reason,
      detail,
    };

    console.log('전송할 데이터:', payload);

    try {
      await axios.post(
        `/orders/${orderId}/items/${selectedItem.orderItemId}/refund`,
        payload
      );
      alert('환불 요청이 접수되었습니다.');
      navigate('/mypage');
    } catch (err) {
      console.error(err);
      alert('환불 요청 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <MypageLayout title="환불 신청">
        <LoadingWrapper>
          <Spinner />
          <LoadingText>데이터를 확인 중입니다...</LoadingText>
        </LoadingWrapper>
      </MypageLayout>
    );
  }

  if (!orderId || !selectedItem) {
    return (
      <MypageLayout title="환불 신청">
        <Desc>orderId가 없습니다. 주문 내역에서 다시 시도해 주세요.</Desc>
      </MypageLayout>
    );
  }

  return (
    <MypageLayout title="환불 신청">
      <Desc>환불을 요청합니다. 사유와 상세 내용을 입력해 주세요.</Desc>
      <Section>
        <SectionTitle>주문 정보</SectionTitle>
        {order && selectedItem && (
          <>
            <OrderMeta>
              <div>주문번호: {order.orderId}</div>
              {order.orderDate && (
                <div>
                  주문일시: {new Date(order.orderDate).toLocaleString()}
                </div>
              )}
            </OrderMeta>

            <ItemList>
              <ItemRow key={selectedItem.itemId}>
                <Thumb
                  onClick={() =>
                    window.open(
                      `/ProductDetail/${selectedItem.itemId}`,
                      '_blank'
                    )
                  }
                >
                  {selectedItem.imageUrl ? (
                    <img
                      src={`${BASE_URL}${selectedItem.imageUrl}`}
                      alt={selectedItem.itemName}
                    />
                  ) : (
                    <NoImage>NO IMAGE</NoImage>
                  )}
                </Thumb>
                <ItemInfo>
                  <div className="name">{selectedItem.itemName}</div>
                  <div className="meta">
                    수량 {selectedItem.count}개 ·{' '}
                    {selectedItem.orderPrice?.toLocaleString()}원
                  </div>
                </ItemInfo>
              </ItemRow>
            </ItemList>
          </>
        )}
      </Section>

      <Section as="form" onSubmit={handleSubmit}>
        <SectionTitle>환불 정보</SectionTitle>

        <FormGrid>
          <FormRow>
            <Label htmlFor="reason">사유</Label>
            <Select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            >
              <option value="">사유를 선택하세요.</option>
              <option value="불량/하자">불량/하자</option>
              <option value="단순 변심">단순 변심</option>
              <option value="오배송">오배송</option>
              <option value="기타">기타</option>
            </Select>
          </FormRow>

          <FormRow>
            <Label htmlFor="detail">상세 내용</Label>
            <StyledTextarea
              id="detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="상세 사유를 작성해 주세요 (선택)"
              minRows={10}
              maxLength={499}
            />
            <Hint>{detail.length}/500</Hint>
          </FormRow>
        </FormGrid>

        <Divider />

        <ActionBar>
          <Note>※ 환불은 판매자 정책 및 기간에 따라 제한될 수 있습니다.</Note>
          <ButtonGroup>
            <BackButton type="button" onClick={handleGoBack}>
              뒤로가기
            </BackButton>
            <SubmitButton type="submit" disabled={!isValid}>
              환불 신청하기
            </SubmitButton>
          </ButtonGroup>
        </ActionBar>
      </Section>
    </MypageLayout>
  );
};

export default RefundPage;

// === 스타일 영역 ===
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 16px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${({ theme }) => theme.colors.gray[200]};
  border-top-color: ${({ theme }) => theme.colors.secondary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  color: ${({ theme }) => theme.colors.gray[550]};
  font-size: 14px;
  font-weight: 600;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const Desc = styled.p`
  margin: 0 0 16px;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: 16px;

  @media ${({ theme }) => theme.mobile} {
    font-size: 14px;
  }
`;

const Section = styled.section`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;

  @media ${({ theme }) => theme.mobile} {
    padding: 16px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  margin: 0 0 12px;
  color: ${({ theme }) => theme.colors.gray[700]};

  @media ${({ theme }) => theme.mobile} {
    font-size: 18px;
  }
`;

const OrderMeta = styled.div`
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray[700]};

  @media ${({ theme }) => theme.mobile} {
    font-size: 14px;
  }
`;

const ItemList = styled.div`
  display: grid;
  gap: 12px;
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 84px 1fr;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.white};
`;

const Thumb = styled.div`
  width: 84px;
  height: 84px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const NoImage = styled.div`
  width: 100%;
  height: 100%;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.gray[100]};
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const ItemInfo = styled.div`
  .name {
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.gray[700]};
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .meta {
    color: ${({ theme }) => theme.colors.gray[600]};
    font-size: 16px;
  }

  @media ${({ theme }) => theme.mobile} {
    .name {
      font-size: 16px;
    }
    .meta {
      font-size: 14px;
    }
  }
`;

const FormGrid = styled.div`
  display: grid;
  gap: 14px;
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[700]};
`;

const Select = styled.select`
  height: 40px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 8px;
  outline: none;
  background: ${({ theme }) => theme.colors.white};
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Hint = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[300]};
  margin: 16px 0 8px;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;

const Note = styled.div`
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: 14px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ButtonBase = styled.button`
  padding: 10px 16px;
  font-weight: 700;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${({ theme }) => theme.colors.white};
`;

const BackButton = styled(ButtonBase)`
  background: ${({ theme }) => theme.colors.gray[600]};
  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[700]};
  }
`;

const SubmitButton = styled(ButtonBase)`
  background: ${({ theme }) => theme.colors.gray[700]};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[800]};
  }
`;

const StyledTextarea = styled(TextareaAutosize)`
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 8px;
  resize: none;
  font-size: 16px;
  outline: none;
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;
