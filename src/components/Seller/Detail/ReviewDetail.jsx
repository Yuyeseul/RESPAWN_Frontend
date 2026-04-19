import React from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';

const ReviewDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const review = location.state?.review;

  if (!review) {
    return (
      <Wrapper>
        <Message>
          리뷰 데이터가 없습니다. 리뷰 목록에서 다시 접근해주세요.
        </Message>
        <BackButton onClick={() => navigate(-1)}>← 뒤로가기</BackButton>
      </Wrapper>
    );
  }

  const renderStars = (rating) => {
    const filled = '★'.repeat(rating);
    const empty = '☆'.repeat(5 - rating);
    return (
      <Stars>
        <span className="filled">{filled}</span>
        <span className="empty">{empty}</span>
        <span className="score">({rating}점)</span>
      </Stars>
    );
  };

  return (
    <Wrapper>
      <BackButton onClick={() => navigate(-1)}>
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
      </BackButton>

      <Header>
        <Title>리뷰 상세 내역</Title>
        <Subtitle>
          고객님이 남기신 소중한 리뷰의 상세 정보를 확인합니다.
        </Subtitle>
      </Header>

      <Card>
        <SectionTitle>상품 및 주문 정보</SectionTitle>
        <GridWrapper $columns={2}>
          <InfoItem>
            <Label>주문번호</Label>
            <Value className="highlight">{review.orderItemId}</Value>
          </InfoItem>
          <InfoItem>
            <Label>주문일시</Label>
            <Value>{new Date(review.orderDate).toLocaleString('ko-KR')}</Value>
          </InfoItem>
        </GridWrapper>

        {review.imageUrl && (
          <ProductBox>
            <img
              src={`http://localhost:8080/api${review.imageUrl}`}
              alt={review.itemName}
            />
            <ProductInfo>
              <ProductName>{review.itemName}</ProductName>
              <ProductPrice>{review.price.toLocaleString()}원</ProductPrice>
            </ProductInfo>
          </ProductBox>
        )}
      </Card>

      <Card>
        <SectionTitle>리뷰 상세 정보</SectionTitle>
        <GridWrapper $columns={2}>
          <InfoItem>
            <Label>작성일</Label>
            <Value>
              {new Date(review.createdDate).toLocaleString('ko-KR')}
            </Value>
          </InfoItem>
          <InfoItem>
            <Label>평점</Label>
            <Value>{renderStars(review.rating)}</Value>
          </InfoItem>
        </GridWrapper>

        <ReviewContentLabel>리뷰 내용</ReviewContentLabel>
        <DetailBox>
          {review.content || '등록된 리뷰 내용이 없습니다.'}
        </DetailBox>
      </Card>

      <ButtonWrapper>
        <SubmitButton onClick={() => navigate(-1)}>확인</SubmitButton>
      </ButtonWrapper>
    </Wrapper>
  );
};

export default ReviewDetail;

// --- 전면 개편된 스타일 영역 ---

const Wrapper = styled.div`
  width: 100%;
  max-width: 1000px; /* 상세 페이지에 맞게 폭 최적화 */
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

const BackButton = styled.button`
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
  gap: 8px;
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

const ProductPrice = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const Stars = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;

  .filled {
    color: #f59e0b; /* 노란색 별 */
    letter-spacing: 2px;
  }
  .empty {
    color: #e2e8f0; /* 회색 별 */
    letter-spacing: 2px;
  }
  .score {
    font-size: 14px;
    color: #64748b;
    margin-left: 6px;
    font-weight: 600;
  }
`;

const ReviewContentLabel = styled.div`
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
  min-height: 120px;
  font-size: 15px;
  color: #334155;
  line-height: 1.6;

  &:focus-within {
    border-color: #555a82;
    box-shadow: 0 0 0 3px rgba(85, 90, 130, 0.1);
  }

  @media (max-width: 768px) {
    padding: 16px;
    font-size: 14px;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
`;

const SubmitButton = styled.button`
  padding: 14px 32px;
  background-color: #555a82;
  color: white;
  border: 1.5px solid #555a82;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #3e4263;
    border-color: #3e4263;
    box-shadow: 0 4px 12px rgba(85, 90, 130, 0.2);
  }

  @media (max-width: 480px) {
    width: 100%; /* 모바일에서는 가로로 꽉 차게 */
  }
`;

const Message = styled.p`
  text-align: center;
  font-size: 16px;
  margin-top: 100px;
  margin-bottom: 30px;
  color: #64748b;
  font-weight: 500;
`;
