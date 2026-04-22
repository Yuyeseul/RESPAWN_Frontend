import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from '../../api/axios';
import { BASE_URL } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import MypageLayout from './MypageLayout';

const SCROLL_THRESHOLD = 8;

const FillHeartIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/wishlists`);
        setWishlist(res.data?.content ?? res.data ?? []);
      } catch (e) {
        setError('찜 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemove = async (e, itemId) => {
    e.stopPropagation();

    if (!window.confirm('찜 목록에서 삭제하시겠습니까?')) return;

    try {
      await axios.post(`/wishlists/${itemId}`);
      setWishlist((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error(err);
      alert('삭제에 실패했습니다.');
    }
  };

  const renderEmpty = (text) => <Empty>{text}</Empty>;

  const renderWishlistSection = (items) => {
    if (!items || items.length === 0)
      return renderEmpty('찜한 상품이 없습니다.');

    return (
      <CardContainer scrollable={items.length > SCROLL_THRESHOLD}>
        {items.map((item) => {
          return (
            <StyledLink
              key={item.id}
              onClick={() => navigate(`/ProductDetail/${item.id}`)}
            >
              <ImageWrapper>
                {item.imageUrl ? (
                  <ProductImg
                    src={`${BASE_URL}${item.imageUrl}`}
                    alt={item.name}
                  />
                ) : (
                  <Placeholder />
                )}
                <HeartBtn onClick={(e) => handleRemove(e, item.id)}>
                  <StyledHeart />
                </HeartBtn>
              </ImageWrapper>

              <Info>
                <ProductStoreName>{item.company}</ProductStoreName>
                <ProductName>{item.name}</ProductName>
                <ProcuctPrice>{item.price.toLocaleString()}원</ProcuctPrice>
              </Info>
            </StyledLink>
          );
        })}
      </CardContainer>
    );
  };

  return (
    <MypageLayout title="찜 목록" isNarrow={false}>
      <SummaryCard>
        <div className="left">
          <div className="label">총 찜한 상품</div>
          <div className="hint">마음에 드는 상품을 모아보세요</div>
        </div>
        <div className="value">{wishlist.length} 개</div>
      </SummaryCard>

      <ListContainer>
        {loading ? (
          <LoadingWrapper>
            <Spinner />
            <LoadingText>찜 목록을 불러오는 중입니다...</LoadingText>
          </LoadingWrapper>
        ) : error ? (
          renderEmpty(error)
        ) : (
          renderWishlistSection(wishlist)
        )}
      </ListContainer>
    </MypageLayout>
  );
}

export default WishlistPage;

/* ------------- Styled Components ------------- */
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

const SummaryCard = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.gray[50]};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 14px;
  padding: 14px 16px;
  margin-top: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  .left {
    flex: 1;
    .label {
      font-size: 14px;
      color: ${({ theme }) => theme.colors.gray[700]};
      font-weight: 600;
    }
    .hint {
      margin-top: 2px;
      font-size: 12px;
      color: ${({ theme }) => theme.colors.gray[600]};
    }
  }
  .value {
    font-weight: 800;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 18px;
  }
`;

const Empty = styled.div`
  padding: 80px 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.gray[500]};
  font-size: 16px;
`;

const ListContainer = styled.div`
  margin-top: 24px;
  padding-bottom: 40px;
`;

const CardContainer = styled.div`
  display: grid;
  /* 🌟 기본 상태 (768px 초과 화면): 1줄에 4개씩 배치 */
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  width: 100%;

  /* 스크롤 설정 (스크롤이 길어질 경우 대비) */
  max-height: ${({ scrollable }) => (scrollable ? '650px' : 'unset')};
  overflow-y: ${({ scrollable }) => (scrollable ? 'auto' : 'visible')};
  padding-right: ${({ scrollable }) => (scrollable ? '6px' : '0')};

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.gray[300]};
    border-radius: 4px;
  }

  /* 🌟 768px 이하 화면: 1줄에 2개씩 배치 */
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px; /* 모바일에서는 간격을 조금 좁힘 */
  }
`;

const StyledLink = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

/* 🌟 하트 버튼 배치를 위해 position: relative 추가 */
const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 3.5;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};

  @media ${({ theme }) => theme.mobile} {
    border: 1px solid ${({ theme }) => theme.colors.gray[200]};
    border-radius: 6px;
  }
`;

const ProductImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Placeholder = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.gray[100]};
`;

/* 🌟 우측 상단 하트 버튼 스타일 */
const HeartBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  padding: 4px; /* 클릭 영역 확보 */
  cursor: pointer;
  z-index: 2; /* 이미지보다 위에 */
  display: flex;
  align-items: center;
  justify-content: center;

  /* 클릭 시 살짝 커지는 느낌 */
  transition: transform 0.1s ease;
  &:active {
    transform: scale(1.1);
  }
`;

/* 🌟 하트 아이콘 스타일링 */
const StyledHeart = styled(FillHeartIcon)`
  width: 24px;
  height: 24px;
  /* theme의 wish 컬러 (코랄 핑크) 적용 */
  fill: ${({ theme }) => theme.colors.wish};

  /* 밝은 이미지 위에서도 잘 보이도록 흰색 외곽선/그림자 효과 */
  filter: drop-shadow(0px 0px 2px rgba(255, 255, 255, 0.8));

  @media ${({ theme }) => theme.mobile} {
    width: 20px;
    height: 20px;
  }
`;

const Info = styled.div`
  padding: 12px;

  @media ${({ theme }) => theme.mobile} {
    padding: 8px 4px;
  }
`;

const ProductStoreName = styled.div`
  margin-top: 5px;
  font-size: 16px;

  @media ${({ theme }) => theme.mobile} {
    font-size: 12px;
  }
`;

const ProductName = styled.h3`
  margin: 5px 0;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.3;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media ${({ theme }) => theme.mobile} {
    font-size: 14px;
  }
`;

const ProcuctPrice = styled.p`
  margin-top: 5px;
  font-size: 18px;
  font-weight: bold;

  @media ${({ theme }) => theme.mobile} {
    font-size: 16px;
  }
`;
