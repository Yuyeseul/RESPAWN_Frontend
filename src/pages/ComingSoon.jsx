import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const ComingSoon = ({ title }) => {
  const navigate = useNavigate();

  return (
    <Container>
      <Title>{title} 페이지는 현재 준비 중입니다.</Title>
      <Description>
        더 나은 서비스를 위해 열심히 개발하고 있습니다. <br />
        조금만 기다려 주세요!
      </Description>
      <HomeButton onClick={() => navigate('/')}>홈으로 돌아가기</HomeButton>
    </Container>
  );
};

export default ComingSoon;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  text-align: center;
  padding: 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 15px;
`;

const Description = styled.p`
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 30px;
`;

const HomeButton = styled.button`
  padding: 12px 24px;
  background-color: #222;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;
