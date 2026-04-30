import React, { useState, useMemo, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../api/axios';
import TextareaAutosize from 'react-textarea-autosize';
import MypageLayout from '../MypageLayout';
import { BASE_URL } from '../../../api/axios';

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
    return (
      <MypageLayout title="리뷰 작성">
        <LoadingWrapper>
          <Spinner />
          <LoadingText>상품 정보를 불러오는 중입니다...</LoadingText>
        </LoadingWrapper>
      </MypageLayout>
    );
  }

  return (
    <MypageLayout title="리뷰 작성">
      <Desc>상품에 대한 별점과 후기를 남겨주세요.</Desc>
      <Section>
        <SectionTitle>상품 정보</SectionTitle>
        <ItemRow>
          <Thumb
            onClick={() =>
              window.open(`/ProductDetail/${selectedItem.itemId}`, '_blank')
            }
          >
            <img
              src={`${BASE_URL}${selectedItem.imageUrl}`}
              alt={selectedItem.itemName}
            />
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
            <StyledTextarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="리뷰를 입력해 주세요"
              required
              minRows={10}
              maxLength={499}
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
    </MypageLayout>
  );
};

export default ReviewPage;

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
  font-size: 18px;
  margin: 0 0 12px;
  color: ${({ theme }) => theme.colors.gray[700]};
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
const ItemInfo = styled.div`
  .name {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.gray[700]};
    margin-bottom: 4px;
  }
  .meta {
    color: ${({ theme }) => theme.colors.gray[600]};
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
  color: ${({ theme }) => theme.colors.gray[700]};
`;

const StarWrapper = styled.div`
  display: flex;
  gap: 4px;
  font-size: 28px;
  cursor: pointer;
`;

const Star = styled.span`
  color: ${({ filled, theme }) =>
    filled ? theme.colors.yellow : theme.colors.gray[300]};
  transition: color 0.2s ease;
`;

const RequiredMark = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.red};
  margin-left: 4px;
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
