import React, { useState } from 'react';
import styled from 'styled-components';
import ProductCard from '../Product/ProductCard';
import axios from '../../api/axios';
import CartConfirmModal from '../Cart/CartConfirmModal';

const SearchResultList = ({ query, items, resultsCount, loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);

  const handleAddToCart = async (product) => {
    try {
      await axios.post('/cart/add', {
        itemId: product.id,
        count: 1,
      });
      setLastAddedProduct(product);
      setIsModalOpen(true);
    } catch (err) {
      console.error('장바구니 담기 실패:', err);

      const errorMessage = err.response?.data?.message;

      alert(errorMessage || '장바구니 담기에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <Wrapper>
      <Header>
        <Title>
          {query ? (
            <>
              <span>"{query}"</span> 에 대한 검색 결과
            </>
          ) : (
            '전체 상품'
          )}
        </Title>
        <ResultCount>총 {resultsCount}개</ResultCount>
      </Header>

      {loading ? (
        <LoadingState>상품을 불러오는 중입니다... 🕵️‍♂️</LoadingState>
      ) : items.length === 0 ? (
        <EmptyState>
          <p>검색 결과가 없습니다 😥</p>
        </EmptyState>
      ) : (
        <Grid>
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => handleAddToCart(product)}
            />
          ))}
        </Grid>
      )}

      <CartConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={lastAddedProduct?.name || lastAddedProduct?.itemName}
      />
    </Wrapper>
  );
};

export default SearchResultList;

const Wrapper = styled.main`
  padding-top: 4px;
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;

  @media ${({ theme }) => theme.mobile} {
    padding-left: 16px;
    padding-right: 16px;
  }
`;

const Header = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.gray[800]};

  span {
    color: ${({ theme }) => theme.colors.secondary};
  }

  @media ${({ theme }) => theme.mobile} {
    font-size: 20px;
  }
`;

const ResultCount = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;

  @media ${({ theme }) => theme.mobile} {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`;

const sharedStateStyle = `
  margin-top: 60px;
  text-align: center;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.gray[600]};
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyState = styled.div`
  ${sharedStateStyle}
`;
const LoadingState = styled.div`
  ${sharedStateStyle}
`;
