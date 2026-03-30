import React from 'react';
import styled, { css } from 'styled-components';
import { useNavigate } from 'react-router-dom';

const MyPageLayout = ({ title, children, isNarrow = false }) => {
  const navigate = useNavigate();

  return (
    <Container>
      <HeaderSection>
        <MobileBackButton onClick={() => navigate(-1)}>〈</MobileBackButton>
        <Title>{title}</Title>
      </HeaderSection>
      <Content $isNarrow={isNarrow}>{children}</Content>
    </Container>
  );
};

export default MyPageLayout;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;

  @media ${({ theme }) => theme.mobile} {
    padding: 0 16px;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;

  @media ${({ theme }) => theme.mobile} {
    margin-bottom: 20px;
  }
`;

const MobileBackButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px 8px 4px 0;
  color: ${({ theme }) => theme.colors.gray[700]};

  @media ${({ theme }) => theme.mobile} {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: bold;

  @media ${({ theme }) => theme.mobile} {
    font-size: 24px;
  }
`;

const Content = styled.div`
  ${({ $isNarrow }) =>
    $isNarrow &&
    css`
      max-width: 700px;
      margin: 0 auto;
    `}
`;
