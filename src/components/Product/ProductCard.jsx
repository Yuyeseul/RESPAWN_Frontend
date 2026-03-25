import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { BASE_URL } from '../../api/axios';

const ProductCard = ({ product, onAddToCart }) => {
  const { user } = useAuth();
  const isBuyer = user?.role === 'ROLE_USER';

  return (
    <CardContainer>
      <StyledLink to={`/ProductDetail/${product.id}`}>
        <ImageWrapper>
          <ProductImg
            src={`${BASE_URL}${product.imageUrl}`}
            alt={product.name}
          />
          {isBuyer && (
            <Overlay>
              <AddToCartButton
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart(product);
                }}
              >
                장바구니
              </AddToCartButton>
            </Overlay>
          )}
        </ImageWrapper>
        <Info>
          <ProductStoreName>{product.company}</ProductStoreName>
          <ProductName>{product.name}</ProductName>
          <ProcuctPrice>{product.price.toLocaleString()}원</ProcuctPrice>
        </Info>
      </StyledLink>
    </CardContainer>
  );
};

export default ProductCard;

const CardContainer = styled.div`
  width: 100%;
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

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  opacity: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s ease;

  ${CardContainer}:hover & {
    opacity: 1;
  }

  @media (hover: none) and (pointer: coarse) {
    display: none;
  }
`;

const AddToCartButton = styled.button`
  background-color: ${({ theme }) => theme.colors.gray[100]};
  color: ${({ theme }) => theme.colors.gray[700]};
  border: none;
  padding: 14px 28px;
  font-size: 16px;
  border-radius: 24px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[300]};
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
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

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;

  &:focus,
  &:visited,
  &:active {
    outline: none;
    text-decoration: none;
    color: inherit;
  }
`;
