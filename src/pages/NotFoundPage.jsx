import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import theme from '../styles/theme'; // theme 파일 경로를 맞춰주세요
import logo from '../assets/respawn_logo.png'; // 로고 파일 경로를 맞춰주세요

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <LogoWrapper>
        <img src={logo} alt="Respawn Logo" />
      </LogoWrapper>

      <ErrorCode>404</ErrorCode>

      <Title>앗! 시스템이 리스폰이 필요해요.</Title>

      <Message>
        요청하신 페이지를 찾을 수 없거나, 이동한 것 같아요.
        <br />
        걱정 마세요. 아래 버튼을 눌러 안전하게 부활할 수 있습니다!
      </Message>

      <ButtonGroup>
        <BackButton onClick={() => navigate(-1)}>
          이전 페이지로 돌아가기
        </BackButton>
        <HomeButton onClick={() => navigate('/')}>홈으로 이동하기</HomeButton>
      </ButtonGroup>
    </PageContainer>
  );
};

export default NotFoundPage;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: ${theme.colors.gray[100]}; // 배경색
  color: ${theme.colors.gray[900]};
  font-family: 'Pretendard', sans-serif; // 혹은 프로젝트 기본 폰트
  text-align: center;
  padding: 20px;
`;

const LogoWrapper = styled.div`
  margin-bottom: 20px;
  img {
    width: 150px; // 로고 크기 조정
    height: auto;
    filter: drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1)); // 살짝 그림자
  }
`;

const ErrorCode = styled.div`
  font-size: 8rem; // 404 강조
  font-weight: 900;
  color: ${theme.colors.primary}; // 브랜드 메인 컬러
  line-height: 1;
  margin-bottom: 20px;
  letter-spacing: -5px;

  // 글자에 그라데이션 효과 (선택사항)
  background: linear-gradient(
    135deg,
    ${theme.colors.primary} 0%,
    ${theme.colors.secondary} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media ${theme.mobile} {
    font-size: 6rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${theme.colors.gray[900]};

  @media ${theme.mobile} {
    font-size: 1.5rem;
  }
`;

const Message = styled.p`
  font-size: 1.1rem;
  color: ${theme.colors.gray[700]};
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 500px;
  word-break: keep-all; // 한글 줄바꿈 최적화

  @media ${theme.mobile} {
    font-size: 1rem;
    margin-bottom: 30px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;

  @media ${theme.mobile} {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
`;

// 공통 버튼 스타일
const ActionButton = styled.button`
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: none;

  @media ${theme.mobile} {
    width: 100%;
  }
`;

// 홈으로 가기 (메인 버튼)
const HomeButton = styled(ActionButton)`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};

  &:hover {
    background-color: ${theme.colors.secondary};
    transform: translateY(-2px);
  }
`;

// 이전 페이지로 (보조 버튼)
const BackButton = styled(ActionButton)`
  background-color: ${theme.colors.white};
  color: ${theme.colors.gray[800]};
  border: 1px solid ${theme.colors.gray[300]};

  &:hover {
    background-color: ${theme.colors.gray[100]};
  }
`;
