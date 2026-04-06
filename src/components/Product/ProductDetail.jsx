import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import ReviewList from './ReviewList';
import InquiryList from './InquiryList';
import { useAuth } from '../../AuthContext';
import { BASE_URL } from '../../api/axios';
import theme from '../../styles/theme';
import styled, { keyframes } from 'styled-components';

function ProductDetail() {
  const { user } = useAuth();
  const isSeller = user?.role === 'ROLE_SELLER';
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [count, setCount] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const [isWished, setIsWished] = useState(false);
  const [wishCount, setWishCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchItem = async () => {
      try {
        const res = await axios.get(`/items/${id}`, {
          signal: controller.signal,
        });
        setItem(res.data);

        if (res.data.wished !== undefined) setIsWished(res.data.wished);
        if (res.data.wishCount !== undefined) setWishCount(res.data.wishCount);
      } catch (err) {
        console.error(err);
      }
    };

    fetchItem();

    return () => {
      controller.abort();
    };
  }, [id]);

  const handleToggleWishlist = async () => {
    if (!user) {
      if (
        window.confirm(
          '로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?'
        )
      ) {
        navigate('/login');
      }
      return;
    }

    try {
      const res = await axios.post(`/wishlists/${item.id}`);
      const newIsWished = res.data.isWished;

      setIsWished(newIsWished);
      setWishCount((prev) => (newIsWished ? prev + 1 : prev - 1));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || '찜하기 처리에 실패했습니다.');
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      if (
        window.confirm(
          '로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?'
        )
      ) {
        navigate('/login');
      }
      return;
    }

    try {
      const res = await axios.post('/orders/prepare', {
        itemId: item.id,
        count: count,
      });
      const orderId = res.data.orderId;
      navigate(`/order/${orderId}`);
    } catch (err) {
      console.error(err);
      alert('주문 생성에 실패했습니다.');
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      if (
        window.confirm(
          '로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?'
        )
      ) {
        navigate('/login');
      }
      return;
    }

    try {
      await axios.post('/cart/add', {
        itemId: item.id,
        count: count,
      });
      alert('장바구니에 담겼습니다.');
    } catch (err) {
      console.error(err);
      alert('장바구니 추가 실패');
    }
  };

  const handleDecrease = () => {
    if (count > 1) setCount(count - 1);
  };

  const handleIncrease = () => {
    if (count < item.stockQuantity) setCount(count + 1);
  };

  const totalPrice = item ? item.price * count : 0;

  if (!item) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>상품 정보를 불러오는 중입니다...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <PageLayout>
        <TopSection>
          {item.imageUrl && (
            <ImageBox>
              <ProductImage
                src={`${BASE_URL}${item.imageUrl}`}
                width={300}
                alt={item.name}
              />
            </ImageBox>
          )}
          <DetailBox>
            <Title>{item.name}</Title>

            {/* 가격 부분 원복 */}
            <Price>{item.price.toLocaleString()} 원</Price>

            <InfoRow $isSeller={isSeller}>
              <Value>
                {item.deliveryType} / {item.deliveryFee.toLocaleString()} 원
              </Value>
            </InfoRow>

            {!isSeller && (
              <>
                <CountRow>
                  <span>수량</span>
                  <CountControls>
                    <QtyButton onClick={handleDecrease}>-</QtyButton>
                    <QtyDisplay>{count}</QtyDisplay>
                    <QtyButton onClick={handleIncrease}>+</QtyButton>
                  </CountControls>
                </CountRow>

                {/* 🌟 예쁘게 꾸민 찜 개수 알림 배너 (총 수량 위에 배치) 🌟 */}
                <WishNotice $isWished={isWished}>
                  <HeartIcon $isWished={isWished}>
                    {isWished ? '❤️' : '🤍'}
                  </HeartIcon>
                  <span>
                    현재 <strong>{wishCount.toLocaleString()}</strong>명이 이
                    상품을 찜하고 있어요!
                  </span>
                </WishNotice>

                <TotalRow>
                  <span>총 상품 금액</span>
                  <TotalPrice>
                    총 수량 {count}개 | {totalPrice.toLocaleString()} 원
                  </TotalPrice>
                </TotalRow>

                <ButtonRow>
                  <WishButton
                    onClick={handleToggleWishlist}
                    $isWished={isWished}
                  >
                    {isWished ? '❤️ 찜 취소' : '🤍 찜하기'}
                  </WishButton>
                  <BuyButton onClick={handleBuyNow}>바로 구매</BuyButton>
                  <CartButton onClick={handleAddToCart}>장바구니</CartButton>
                </ButtonRow>
              </>
            )}
          </DetailBox>
        </TopSection>

        <TabMenu>
          <TabItem
            $active={activeTab === 'description'}
            onClick={() => setActiveTab('description')}
          >
            설명
          </TabItem>
          <TabItem
            $active={activeTab === 'additional'}
            onClick={() => setActiveTab('additional')}
          >
            추가 정보
          </TabItem>
          <TabItem
            $active={activeTab === 'reviews'}
            onClick={() => setActiveTab('reviews')}
          >
            상품평
          </TabItem>
          <TabItem
            $active={activeTab === 'inquiry'}
            onClick={() => setActiveTab('inquiry')}
          >
            문의
          </TabItem>
        </TabMenu>

        {activeTab === 'description' && (
          <DescriptionBox>
            <h3>상품 상세 설명</h3>
            <div dangerouslySetInnerHTML={{ __html: item.description }} />
          </DescriptionBox>
        )}

        {activeTab === 'additional' && (
          <DescriptionBox>
            <h3>추가 정보</h3>
          </DescriptionBox>
        )}

        {activeTab === 'reviews' && (
          <DescriptionBox>
            <ReviewList itemId={id} />
          </DescriptionBox>
        )}

        {activeTab === 'inquiry' && (
          <DescriptionBox>
            <InquiryList itemId={id} />
          </DescriptionBox>
        )}
      </PageLayout>
    </Container>
  );
}

export default ProductDetail;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const PageLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 60px;
  padding: 60px 24px;
  max-width: 1200px;
  width: 100%;
  box-sizing: border-box;

  @media ${theme.mobile} {
    gap: 24px;
    padding: 20px 16px;
  }
`;

export const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 60px;
  width: 100%;

  @media ${theme.mobile} {
    flex-direction: column;
    gap: 20px;
  }
`;

export const ImageBox = styled.div`
  flex: 1;
  max-width: 450px;
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: ${theme.colors.gray[100]};
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 12px;

  @media ${theme.mobile} {
    max-width: 100%;
    margin-left: 0;
    height: auto;
  }
`;

export const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

export const DetailBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media ${theme.mobile} {
    gap: 16px;
  }
`;

export const Title = styled.h2`
  font-size: 32px;
  line-height: 1.2;
  font-weight: 700;

  @media ${theme.mobile} {
    font-size: 24px;
  }
`;

export const Price = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: ${theme.colors.gray[700]};
`;

export const InfoRow = styled.div`
  display: flex;
  gap: 16px;
  font-size: 16px;
  margin-top: ${({ $isSeller }) => ($isSeller ? '20px' : '80px')};

  @media ${theme.mobile} {
    margin-top: 0;
    padding: 12px 0;
    border-top: 1px solid ${theme.colors.gray[200]};
    border-bottom: 1px solid ${theme.colors.gray[200]};
  }
`;

export const Value = styled.div`
  color: ${theme.colors.gray[700]};
`;

export const CountRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

export const CountControls = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 6px;
  overflow: hidden;
`;

export const QtyButton = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  background: ${theme.colors.white};
  font-size: 20px;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.gray[300]};
  }
`;

export const QtyDisplay = styled.div`
  width: 40px;
  text-align: center;
  font-size: 16px;
  line-height: 36px;
`;

export const WishNotice = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 14px 16px;
  /* 동적 상태($isWished)가 필요한 곳에서만 콜백을 씁니다 */
  background-color: ${({ $isWished }) =>
    $isWished ? theme.colors.pink_lace : theme.colors.gray[100]};
  border: 1px solid
    ${({ $isWished }) =>
      $isWished ? theme.colors.pale_pink : theme.colors.gray[300]};
  border-radius: 8px;
  color: ${theme.colors.gray[700]};
  font-size: 15px;
  transition: all 0.3s ease;

  strong {
    color: ${theme.colors.red};
    font-weight: bold;
  }
`;

export const HeartIcon = styled.span`
  font-size: 16px;
  display: inline-block;
  animation: ${({ $isWished }) => ($isWished ? 'pop 0.3s ease' : 'none')};

  @keyframes pop {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.3);
    }
    100% {
      transform: scale(1);
    }
  }
`;

export const TotalRow = styled.div`
  margin-top: 20px;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
`;

export const TotalPrice = styled.div`
  color: ${theme.colors.primary};
  font-size: 18px;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 10px;

  @media ${theme.mobile} {
    position: sticky;
    bottom: 0;
    background: ${theme.colors.white};
    padding: 10px 0;
    z-index: 10;
  }
`;

export const WishButton = styled.button`
  flex: 0.6;
  background-color: ${({ $isWished }) =>
    $isWished ? theme.colors.angel_pink : theme.colors.white};
  color: ${({ $isWished }) =>
    $isWished ? theme.colors.coral_sunset : theme.colors.gray[700]};
  border: 1px solid
    ${({ $isWished }) =>
      $isWished ? theme.colors.coral_sunset : theme.colors.gray[300]};
  padding: 14px 0;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: ${({ $isWished }) => ($isWished ? 'bold' : 'normal')};
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${({ $isWished }) =>
      $isWished ? theme.colors.pale_pink : theme.colors.gray[100]};
  }
`;

export const BuyButton = styled.button`
  flex: 1.2;
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  padding: 14px 0;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
`;

export const CartButton = styled.button`
  flex: 1;
  background-color: ${theme.colors.gray[100]};
  color: ${theme.colors.gray[700]};
  border: none;
  padding: 14px 0;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: ${theme.colors.gray[300]};
  }
`;

export const TabMenu = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 1px solid ${theme.colors.gray[300]};
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const TabItem = styled.button`
  flex: 1;
  min-width: 80px;
  background: none;
  border: none;
  padding: 12px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  color: ${({ $active }) =>
    $active ? theme.colors.primary : theme.colors.gray[600]};

  border-bottom: ${({ $active }) =>
    $active ? `2px solid ${theme.colors.primary}` : '2px solid transparent'};

  font-weight: ${({ $active }) => ($active ? '700' : '400')};

  &:hover {
    color: ${theme.colors.secondary};
  }

  @media ${theme.mobile} {
    padding: 14px 10px;
    font-size: 15px;
  }
`;

export const DescriptionBox = styled.div`
  width: 100%;
  background: ${theme.colors.gray[100]};
  padding: 30px;
  border-radius: 10px;

  h3 {
    margin-bottom: 10px;
    font-size: 20px;
    color: ${theme.colors.gray[700]};
  }

  p {
    white-space: pre-wrap;
    line-height: 1.6;
    font-size: 16px;
    color: ${theme.colors.gray[700]};
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh; /* 화면 중앙에 오도록 높이 설정 */
  gap: 20px;
`;

export const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid ${theme.colors.gray[200]};
  border-top: 5px solid ${theme.colors.primary}; /* 메인 컬러로 포인트 */
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const LoadingText = styled.div`
  font-size: 18px;
  color: ${theme.colors.gray[600]};
  font-weight: 500;
  letter-spacing: -0.5px;
  animation: pulse 1.5s infinite ease-in-out;

  @keyframes pulse {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.6;
    }
  }
`;
