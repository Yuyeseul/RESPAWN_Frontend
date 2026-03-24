import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from '../../api/axios';
import styled from 'styled-components';
import ProductCard from '../Product/ProductCard';

const CategoryProductSection = ({
  categoryName,
  keywords = [],
  apiCategoryParam,
  maxItems = 8,
  gridCols = 4,
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestedRef = useRef(false);

  const handleAddToCart = useCallback(async (product) => {
    try {
      await axios.post('/api/cart/add', {
        itemId: product.id,
        count: 1,
      });

      alert(`${product.name}이(가) 장바구니에 담겼습니다.`);
    } catch (err) {
      console.error('장바구니 담기 실패:', err);

      const serverErrorMessage = err.response?.data?.message;

      alert(
        serverErrorMessage || '장바구니 담기에 실패했습니다. 다시 시도해주세요.'
      );
    }
  }, []);

  useEffect(() => {
    requestedRef.current = false;
    let ignore = false; // 언마운트 가드
    const fetchItems = async () => {
      if (requestedRef.current) return;
      requestedRef.current = true;

      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/items', {
          params: {
            ...(apiCategoryParam ? { category: apiCategoryParam } : {}),
            size: maxItems,
            page: 0,
          },
        });
        console.log(res.data);
        if (!ignore) {
          const items = Array.isArray(res.data?.content)
            ? res.data.content
            : [];
          setProducts(items); // 덮어쓰기
        }
      } catch (e) {
        if (!ignore) setError('상품을 불러오는 중 오류가 발생했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchItems();

    return () => {
      ignore = true;
    };
  }, [apiCategoryParam, maxItems]);

  if (loading) {
    return (
      <Section>
        <Body>
          <Side>
            <Title>{categoryName}</Title>
            <SubTitle>HOT 키워드</SubTitle>
            <KeywordList>
              {keywords.map((k) => (
                <li key={k}>#{k}</li>
              ))}
            </KeywordList>
          </Side>
          <Grid $cols={gridCols}>
            {Array.from({ length: maxItems }).map((_, i) => (
              <Card key={i} aria-busy="true" />
            ))}
          </Grid>
        </Body>
      </Section>
    );
  }
  if (error) return <Section>{error}</Section>;

  return (
    <Section>
      <Body>
        <Side>
          <Title>{categoryName}</Title>
          <SubTitle>HOT 키워드</SubTitle>
          <KeywordList>
            {keywords.map((k) => (
              <li key={k}>#{k}</li>
            ))}
          </KeywordList>
        </Side>
        <Grid $cols={gridCols}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </Grid>
      </Body>
    </Section>
  );
};

export default CategoryProductSection;

const Section = styled.section`
  width: 100%;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 12px;
  padding: 24px;
  margin-block: 40px;

  @media ${({ theme }) => theme.mobile} {
    padding: 16px;
    margin-block: 12px;
    border-radius: 0;
    border: none;
  }
`;

const Body = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
  @media ${({ theme }) => theme.mobile} {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const Side = styled.aside`
  display: grid;
  align-content: start;
  gap: 12px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.gray[100]};
  padding: 12px;
  font-size: 13px;

  @media ${({ theme }) => theme.mobile} {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px 16px;
  }
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0;
`;

const SubTitle = styled.div`
  font-weight: 700;
  margin: 0;
`;

const KeywordList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
  li {
    color: ${({ theme }) => theme.colors.gray[600]};
    padding: 4px 0;
    border-bottom: 1px dashed ${({ theme }) => theme.colors.gray[300]};
  }
  li:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  @media ${({ theme }) => theme.mobile} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;

    li {
      padding: 0;
      border-bottom: none;
    }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$cols}, minmax(0, 1fr));
  gap: 16px;

  @media ${({ theme }) => theme.mobile} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
`;

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.white};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s ease;
  &:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  }
`;
