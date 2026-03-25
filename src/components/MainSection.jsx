import React from 'react';
import styled from 'styled-components';
import CategoryProductSection from '../components/Product/CategoryProductSection';

const MainSection = () => (
  <Container>
    <CategoryProductSection
      categoryName="키보드"
      keywords={['독거미', '특가']}
      apiCategoryParam="키보드"
      maxItems={8}
      gridCols={4}
    />
    <CategoryProductSection
      categoryName="마우스"
      keywords={['갤럭시', '혜택', '사은품']}
      apiCategoryParam="마우스"
      maxItems={8}
      gridCols={4}
    />
    <CategoryProductSection
      categoryName="모니터"
      keywords={['게이밍', 'IPS', '고주사율']}
      apiCategoryParam="모니터"
      maxItems={8}
      gridCols={4}
    />
    <CategoryProductSection
      categoryName="스피커"
      keywords={['블루투스', '2.1채널', '가성비']}
      apiCategoryParam="스피커"
      maxItems={8}
      gridCols={4}
    />
  </Container>
);

export default MainSection;

const Container = styled.div`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 60px auto;
  padding: 0 20px;

  display: flex;
  flex-direction: column;

  @media ${({ theme }) => theme.mobile} {
    margin: 40px auto;
    gap: 20px;
  }
`;
