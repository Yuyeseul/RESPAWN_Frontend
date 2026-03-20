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
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px; /* 내부 패딩 고정 */
  margin-block: 24px; /* 섹션 위/아래 간격만 */
  margin-inline: 0;
`;

const Body = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px; /* 사이드와 그리드 간격 */
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 12px; /* 모바일에서 살짝 축소 */
  }
`;

const Side = styled.aside`
  display: grid;
  align-content: start;
  gap: 12px; /* 사이드 내부 요소 간격 */
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
  padding: 12px;
  font-size: 13px;
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0; /* 외부 여백은 부모가 책임 */
`;

const SubTitle = styled.div`
  font-weight: 700;
  margin: 0;
`;

const KeywordList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0; /* 바깥 여백 제거 */
  display: grid;
  gap: 8px; /* 항목 간 간격 */
  li {
    color: #666;
    padding: 4px 0;
    border-bottom: 1px dashed #eee;
  }
  li:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$cols}, 1fr);
  gap: 16px; /* 카드 간 간격 */
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const Card = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s ease;
  /* margin 없음: 간격은 Grid gap이 관리 */
  &:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  }
`;
