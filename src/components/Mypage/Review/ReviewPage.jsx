import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../api/axios';
import TextareaAutosize from 'react-textarea-autosize';

const ReviewPage = () => {
  const navigate = useNavigate();
  const { orderId, itemId: orderItemId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    (async () => {
      try {
        const res = await axios.get(`/orders/history/${orderId}`);
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

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const isValid = useMemo(() => {
    return Boolean(rating && content.trim());
  }, [rating, content]);

  const StarRating = ({ rating, setRating }) => {
    const handleClick = (index) => {
      if (rating === index + 1) {
        setRating(0); // 같은 별 누르면 초기화
      } else {
        setRating(index + 1);
      }
    };

    return (
      <StarWrapper>
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            filled={index < rating}
            onClick={() => handleClick(index)}
          >
            ★
          </Star>
        ))}
      </StarWrapper>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    alert(`⭐ ${rating}점\n\n${content}`);
    e.preventDefault();

    const review = {
      rating,
      content,
    };

    console.log('전송할 데이터:', review);

    try {
      await axios.post(
        `/reviews/order-items/${selectedItem.orderItemId}`,
        review
      );
      alert('리뷰가 작성되었습니다.');
      navigate('/mypage', { state: { refresh: true } });
    } catch (err) {
      console.error('리뷰 작성 오류:', err);
      if (err.response) {
        console.error('응답 상태:', err.response.status);
        console.error('응답 메시지:', err.response.data);
        alert(
          `리뷰 작성 실패: ${err.response.data.message || '알 수 없는 오류'}`
        );
      } else {
        alert('리뷰 작성 중 네트워크 오류가 발생했습니다.');
      }
    }
  };

  const handleGoBack = () => navigate(-1);

  if (!selectedItem) {
    return <div>상품 정보를 불러오는 중입니다...</div>;
  }

  return (
    <Container>
      <Header>
        <Title>리뷰 작성</Title>
        <Desc>상품에 대한 별점과 후기를 남겨주세요.</Desc>
      </Header>

      <Section>
        <SectionTitle>상품 정보</SectionTitle>
        <ItemRow>
          <Thumb
            onClick={() =>
              window.open(`/ProductDetail/${selectedItem.itemId}`, '_blank')
            }
          >
            <img src={selectedItem.imageUrl} alt={selectedItem.itemName} />
          </Thumb>
          <ItemInfo>
            <div className="name">{selectedItem.itemName}</div>
            <div className="meta">
              수량 {selectedItem.count}개 ·{' '}
              {selectedItem.orderPrice?.toLocaleString()}원
            </div>
          </ItemInfo>
        </ItemRow>
      </Section>

      <Section as="form" onSubmit={handleSubmit}>
        <SectionTitle>리뷰 정보</SectionTitle>

        <FormGrid>
          <FormRow>
            <Label htmlFor="rating">
              별점 <RequiredMark>(필수)</RequiredMark>
            </Label>
            <StarRating rating={rating} setRating={setRating} />
          </FormRow>

          <FormRow>
            <Label htmlFor="content">리뷰 내용</Label>
            <TextareaAutosize
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="리뷰를 입력해 주세요"
              required
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
            <Hint>{content.length}/500</Hint>
          </FormRow>
        </FormGrid>

        <Divider />

        <ActionBar>
          <Note>※ 작성하신 리뷰는 마이페이지에서 확인할 수 있습니다.</Note>
          <ButtonGroup>
            <BackButton type="button" onClick={handleGoBack}>
              뒤로가기
            </BackButton>
            <SubmitButton type="submit" disabled={!isValid}>
              리뷰 등록하기
            </SubmitButton>
          </ButtonGroup>
        </ActionBar>
      </Section>
    </Container>
  );
};

export default ReviewPage;

const Container = styled.div`
  max-width: 1000px;
`;

const Header = styled.header`
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 24px;
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

const StarWrapper = styled.div`
  display: flex;
  gap: 4px;
  font-size: 28px;
  cursor: pointer;
`;

const Star = styled.span`
  color: ${({ filled }) =>
    filled ? '#facc15' : '#e5e7eb'}; // 채워진 노랑/회색
  transition: color 0.2s ease;
`;

const RequiredMark = styled.span`
  font-size: 14px;
  color: red;
  margin-left: 4px;
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
