import React from 'react';
import styled from 'styled-components';

const Footer = () => {
  return (
    <Container>
      <Content>
        <Brand>RESPAWN</Brand>
        <Info>
          <InfoRow>
            <InfoItem>
              <InfoLabel>대표</InfoLabel>
              <InfoValue>ooo</InfoValue>
            </InfoItem>
            <Separator>|</Separator>
            <InfoItem>
              <InfoLabel>사업자등록번호</InfoLabel>
              <InfoValue>123-45-67890</InfoValue>
            </InfoItem>
          </InfoRow>
          <InfoRow>
            <InfoItem>
              <InfoLabel>주소</InfoLabel>
              <InfoValue>서울특별시 어디구 어디동 123</InfoValue>
            </InfoItem>
          </InfoRow>
          <InfoRow>
            <InfoItem>
              <InfoLabel>고객센터</InfoLabel>
              <InfoValue>0000-0000</InfoValue>
            </InfoItem>
            <Separator>|</Separator>
            <InfoItem>
              <InfoLabel>이메일</InfoLabel>
              <InfoValue>hello@respawn.com</InfoValue>
            </InfoItem>
          </InfoRow>
        </Info>
        <Copyright>ⓒ 2025 RESPAWN. All rights reserved.</Copyright>
      </Content>
    </Container>
  );
};

export default Footer;

const Container = styled.footer`
  background-color: ${({ theme }) => theme.colors.gray[50]};
  border-top: 1px solid ${({ theme }) => theme.colors.gray[300]};
  padding: 60px 20px;
  @media ${({ theme }) => theme.mobile} {
    padding: 40px 20px;
  }
`;

const Content = styled.div`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
`;

const Brand = styled.h2`
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.gray[900]};
  letter-spacing: 1px;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 24px;
`;

const InfoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 12px;
  @media ${({ theme }) => theme.mobile} {
    gap: 4px 10px;
  }
`;

const InfoItem = styled.div`
  display: flex;
  gap: 8px;
`;

const InfoLabel = styled.span`
  color: ${({ theme }) => theme.colors.gray[600]};
  font-weight: 500;
`;

const InfoValue = styled.span`
  color: ${({ theme }) => theme.colors.gray[800]};
`;

const Separator = styled.span`
  color: ${({ theme }) => theme.colors.gray[300]};
  font-size: 12px;
  @media ${({ theme }) => theme.mobile} {
    display: none;
  }
`;

const Copyright = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 20px;
`;
