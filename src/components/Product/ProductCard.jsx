import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import axios, { BASE_URL } from '../../api/axios';
import CartIconImg from '../../assets/cart_icon.png';

const ProductCard = ({ product, onAddToCart }) => {
  const { user } = useAuth();
  const isBuyer = user?.role === 'ROLE_USER';

  const [isWished, setIsWished] = useState(product.wished || false);

  const handleToggleWishlist = async (e) => {
    e.preventDefault(); // 상세페이지 이동 방지

    if (!user) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }

    try {
      const res = await axios.post(`/wishlists/${product.id}`);
      setIsWished(res.data.isWished);
    } catch (err) {
      console.error(err);
      alert('찜하기 처리에 실패했습니다.');
    }
  };

  return (
    <CardContainer>
      <StyledLink to={`/ProductDetail/${product.id}`}>
        <ImageWrapper>
          <ProductImg
            src={`${BASE_URL}${product.imageUrl}`}
            alt={product.name}
          />
        </ImageWrapper>

        <Info>
          <ProductStoreName>{product.company}</ProductStoreName>
          <ProductName>{product.name}</ProductName>
          <PriceRow>
            <ProcuctPrice>{product.price.toLocaleString()}원</ProcuctPrice>

            {isBuyer && (
              <ButtonGroup>
                <WishButton
                  onClick={handleToggleWishlist}
                  title={isWished ? '찜 취소' : '찜하기'}
                  $isWished={isWished}
                >
                  {isWished ? '❤️' : '🤍'}
                </WishButton>

                <AddToCartButton
                  onClick={(e) => {
                    e.preventDefault();
                    onAddToCart(product);
                  }}
                  title="장바구니에 담기"
                >
                  <img src={CartIconImg} alt="장바구니" />
                </AddToCartButton>
              </ButtonGroup>
            )}
          </PriceRow>
        </Info>
      </StyledLink>
    </CardContainer>
  );
};

export default ProductCard;

const CardContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  padding: 10px;
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.white};

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: 0.3s;
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 0;
    border: none;
  }
`;

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

const Info = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;

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

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between; /* 양 끝으로 밀어내기 */
  align-items: center; /* 수직 중앙 정렬 */
  margin-top: auto; /* Info 컨테이너의 맨 하단으로 밀어줌 */
  padding-top: 10px;
`;

const ProcuctPrice = styled.p`
  margin: 0; /* 기존 margin-top 제거 */
  font-size: 18px;
  font-weight: bold;

  @media ${({ theme }) => theme.mobile} {
    font-size: 16px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px; /* 두 버튼 사이의 간격 */
  align-items: center;
`;

const WishButton = styled.button`
  background-color: ${({ theme, $isWished }) =>
    $isWished ? theme.colors.pink_lace || '#ffe6e6' : theme.colors.gray[100]};
  border: 1px solid
    ${({ theme, $isWished }) =>
      $isWished ? theme.colors.pale_pink || '#ffb3b3' : theme.colors.gray[300]};
  color: ${({ theme, $isWished }) =>
    $isWished ? theme.colors.red || '#ff4757' : theme.colors.gray[600]};

  /* 크기를 명시적으로 고정 */
  width: 28px;
  height: 28px;
  padding: 0;

  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;

  &:hover {
    background-color: ${({ theme, $isWished }) =>
      $isWished ? theme.colors.pale_pink || '#ffcccc' : theme.colors.gray[200]};
  }

  @media ${({ theme }) => theme.mobile} {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }
`;

// 🌟 장바구니 버튼 스타일 수정
const AddToCartButton = styled.button`
  background-color: ${({ theme }) => theme.colors.gray[100]};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};

  /* 크기를 명시적으로 고정 (찜 버튼과 동일하게 설정) */
  width: 28px;
  height: 28px;
  padding: 0;

  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 12px;
    height: 12px;
    object-fit: contain;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[200]};
  }

  @media ${({ theme }) => theme.mobile} {
    width: 30px;
    height: 30px;

    img {
      width: 15px;
      height: 15px;
    }
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  &:focus,
  &:visited,
  &:active {
    outline: none;
    text-decoration: none;
    color: inherit;
  }
`;
