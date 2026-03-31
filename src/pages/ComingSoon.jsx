import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import theme from '../styles/theme';
import logo from '../assets/respawn_logo.png';

const ComingSoon = ({ title }) => {
  const navigate = useNavigate();

  return (
    <Container>
      <LogoWrapper>
        <img src={logo} alt="Respawn Logo" />
      </LogoWrapper>

      <CraftingZone>
        <StatusTitle>
          '{title}' {title && '필드가'} 로딩 중...
        </StatusTitle>

        <LoadingBarContainer>
          <LoadingBarFill />
        </LoadingBarContainer>
      </CraftingZone>

      <Description>
        더 쾌적하고 원활한 사용을 위해 새로운 시스템을 구축 중입니다.
        <br />곧 완벽한 모습으로 리스폰 하겠습니다!
      </Description>

      <HomeButton onClick={() => navigate('/')}>홈으로 돌아가기</HomeButton>
    </Container>
  );
};

export default ComingSoon;

// 1. 점 3개 깜빡임 애니메이션
const dotPulse = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
`;

// 2. 게이지가 차오르는 애니메이션
const fillProgress = keyframes`
  from { width: 0%; }
  to { width: 75%; } // 원하는 최종 게이지 퍼센트
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: ${theme.colors.gray[100]};
  text-align: center;
  padding: 40px 20px;
`;

const LogoWrapper = styled.div`
  margin-bottom: 50px;
  img {
    width: 130px;
    height: auto;
    display: block;
  }
`;

const CraftingZone = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
`;

const StatusTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${theme.colors.gray[900]};
  margin-bottom: 16px;

  @media ${theme.mobile} {
    font-size: 1.5rem;
  }
`;

const LoadingBarContainer = styled.div`
  width: 280px;
  height: 10px;
  background-color: ${theme.colors.gray[300]};
  border-radius: 20px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const LoadingBarFill = styled.div`
  height: 100%;
  background: linear-gradient(
    90deg,
    ${theme.colors.lightNavy} 0%,
    ${theme.colors.primary} 50%,
    ${theme.colors.secondary} 100%
  );
  border-radius: 20px;

  /* 애니메이션 적용 */
  animation: ${fillProgress} 2s ease-out forwards;
  /* forwards: 애니메이션이 끝난 후 마지막 상태(75%)를 유지합니다 */
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: ${theme.colors.gray[700]};
  line-height: 1.7;
  margin-bottom: 50px;
  max-width: 550px;
  word-break: keep-all;
`;

const HomeButton = styled.button`
  padding: 14px 32px;
  font-size: 1rem;
  font-weight: 700;
  color: ${theme.colors.white};
  background-color: ${theme.colors.primary};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${theme.colors.secondary};
    transform: translateY(-2px);
  }
`;
