import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../api/axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ReviewList from './ReviewList';
import InquiryList from './InquiryList';
import { useAuth } from '../../AuthContext';
import { BASE_URL } from '../../api/axios';

function ProductDetail() {
  const { user } = useAuth();
  const isSeller = user?.role === 'ROLE_SELLER';
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [count, setCount] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const fetchItem = async () => {
      try {
        const res = await axios.get(`/api/items/${id}`, {
          signal: controller.signal,
        });
        setItem(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchItem();

    return () => {
      controller.abort();
    };
  }, [id]);

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
      const res = await axios.post('/api/orders/prepare', {
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
      await axios.post('/api/cart/add', {
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

  if (!item) return <div>불러오는 중...</div>;

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

                <TotalRow>
                  <span>총 상품 금액</span>
                  <TotalPrice>
                    총 수량 {count}개 | {totalPrice.toLocaleString()} 원
                  </TotalPrice>
                </TotalRow>

                <ButtonRow>
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PageLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 60px;
  padding: 60px 24px;
  max-width: 1200px;
  width: 100%;
  box-sizing: border-box;

  @media ${({ theme }) => theme.mobile} {
    gap: 24px;
    padding: 20px 16px;
  }
`;

const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 60px;
  width: 100%;

  @media ${({ theme }) => theme.mobile} {
    flex-direction: column;
    gap: 20px;
  }
`;

const ImageBox = styled.div`
  flex: 1;
  max-width: 450px;
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: ${({ theme }) => theme.colors.gray[100]};
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 12px;

  @media ${({ theme }) => theme.mobile} {
    max-width: 100%;
    margin-left: 0; // 기존 30px 제거
    height: auto;
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

const DetailBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media ${({ theme }) => theme.mobile} {
    gap: 16px;
  }
`;

const Title = styled.h2`
  font-size: 32px;
  font-size: 40px;
  line-height: 1.2;
  font-weight: 700;

  @media ${({ theme }) => theme.mobile} {
    font-size: 24px;
  }
`;

const Price = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.gray[700]};
`;

const InfoRow = styled.div`
  display: flex;
  gap: 16px;
  font-size: 16px;
  margin-top: ${({ $isSeller }) => ($isSeller ? '20px' : '80px')};

  @media ${({ theme }) => theme.mobile} {
    margin-top: 0;
    padding: 12px 0;
    border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  }
`;

const Value = styled.div`
  color: ${({ theme }) => theme.colors.gray[700]};
`;

const CountRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const CountControls = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 6px;
  overflow: hidden;
`;

const QtyButton = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  background: white;
  font-size: 20px;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.gray[300]};
  }
`;

const QtyDisplay = styled.div`
  width: 40px;
  text-align: center;
  font-size: 16px;
  line-height: 36px;
`;

const TotalRow = styled.div`
  margin-top: 20px;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
`;

const TotalPrice = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 18px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 10px;

  @media ${({ theme }) => theme.mobile} {
    position: sticky;
    bottom: 0;
    background: white;
    padding: 10px 0;
    z-index: 10;
  }
`;

const BuyButton = styled.button`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 14px 0;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
`;

const CartButton = styled.button`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.gray[100]};
  color: ${({ theme }) => theme.colors.gray[700]};
  border: none;
  padding: 14px 0;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[300]};
  }
`;

const TabMenu = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabItem = styled.button`
  flex: 1;
  min-width: 80px;
  background: none;
  border: none;
  padding: 12px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.gray[600]};

  border-bottom: ${({ $active, theme }) =>
    $active ? `2px solid ${theme.colors.primary}` : '2px solid transparent'};

  font-weight: ${({ $active }) => ($active ? '700' : '400')};

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 14px 10px;
    font-size: 15px;
  }
`;

const DescriptionBox = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.colors.gray[100]};
  padding: 30px;
  border-radius: 10px;

  h3 {
    margin-bottom: 10px;
    font-size: 20px;
    color: ${({ theme }) => theme.colors.gray[700]};
  }

  p {
    white-space: pre-wrap;
    line-height: 1.6;
    font-size: 16px;
    color: ${({ theme }) => theme.colors.gray[700]};
  }
`;
