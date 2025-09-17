import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';
import TextareaAutosize from 'react-textarea-autosize';

const RefundPage = () => {
  const navigate = useNavigate();
  const { orderId, itemId: orderItemId } = useParams();

  // 주문 정보 상태
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    // 주문 단건 조회 API 호출
    (async () => {
      try {
        const res = await axios.get(`/api/orders/history/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error('주문 정보 불러오기 실패:', err);
      }
    })();
  }, [orderId]);

  const selectedItem = useMemo(() => {
    if (!order?.items) return null;
    return order.items.find(
      (it) => String(it.orderItemId) === String(orderItemId)
    );
  }, [order, orderItemId]);

  const handleGoBack = () => navigate(-1);

  // 폼 상태 (사유/상세내용만)
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');

  // 유효성: 사유만 필수 (orderId도 있어야 함)
  const isValid = useMemo(() => {
    return Boolean(orderId && reason);
  }, [orderId, reason]);

  // 제출 (orderId, reason, detail만 전송)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      reason,
      detail,
    };

    console.log('전송할 데이터:', payload);

    try {
      await axios.post(
        `/api/orders/${orderId}/items/${selectedItem.orderItemId}/refund`,
        payload
      );
      alert('환불 요청이 접수되었습니다.');
      navigate('/mypage');
    } catch (err) {
      console.error(err);
      alert('환불 요청 중 오류가 발생했습니다.');
    }
  };

  // 로딩/에러/빈 orderId 처리
  if (!orderId || !selectedItem) {
    return (
      <PageWrap>
        <Header>
          <Title>환불 신청</Title>
          <Desc>orderId가 없습니다. 주문 내역에서 다시 시도해 주세요.</Desc>
        </Header>
      </PageWrap>
    );
  }

  return (
    <PageWrap>
      <Header>
        <Title>환불 신청</Title>
        <Desc>
          해당 주문 전체 환불을 요청합니다. 사유와 상세 내용을 입력해 주세요.
        </Desc>
      </Header>

      {/* 주문 요약 (읽기 전용) */}
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

            {/* selectedItem만 보여주기 */}
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
                      src={selectedItem.imageUrl}
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

      {/* 환불 사유/내용만 입력 */}
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
            <TextareaAutosize
              id="detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="상세 사유를 작성해 주세요 (선택)"
              minRows={10}
              maxLength={499}
              style={{
                width: '100%',
                padding: 12,
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                resize: 'none',
                fontSize: '16px',
              }}
            />
            <Hint>{detail.length}/500</Hint>
          </FormRow>
        </FormGrid>

        <Divider />

        <ActionBar>
          <Note>※ 환불은 판매자 정책 및 기간에 따라 제한될 수 있습니다.</Note>
          <ButtonGroup>
            <BackButton onClick={handleGoBack}>뒤로가기</BackButton>
            <SubmitButton type="submit" disabled={!isValid}>
              환불 신청하기
            </SubmitButton>
          </ButtonGroup>
        </ActionBar>
      </Section>
    </PageWrap>
  );
};

export default RefundPage;

const PageWrap = styled.div`
  max-width: 920px;
  margin: 0 auto;
  padding: 24px 16px;
`;

const Header = styled.header`
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 6px;
  color: #111827;
`;

const Desc = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 16px;
`;

const Section = styled.section`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  margin: 0 0 12px;
  color: #111827;
`;

const OrderMeta = styled.div`
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
  color: #374151;
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
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
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
  background: #f3f4f6;
  color: #6b7280;
`;

const ItemInfo = styled.div`
  .name {
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
  }
  .meta {
    color: #6b7280;
    font-size: 16px;
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
  color: #111827;
`;

const Select = styled.select`
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
  background: #fff;
  &:focus {
    border-color: #111827;
  }
`;

const Hint = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e5e7eb;
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
  color: #6b7280;
  font-size: 14px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px; /* 버튼 사이 간격 */
  align-items: center;
`;

const BackButton = styled.button`
  padding: 10px 16px;
  font-weight: 700;
  border-radius: 10px;
  background: #333; /* 제출버튼보다 연한 어두운 배경 */
  color: #fff;
  border: none;
  cursor: pointer;
  opacity: 1;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #000; /* 제출버튼 배경색으로 호버 */
  }
`;

const SubmitButton = styled.button`
  padding: 10px 16px;
  font-weight: 700;
  border-radius: 10px;
  background: #333;
  color: #fff;
  border: none;
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #000; /* 호버 시 더 진한 검정 */
  }
`;
