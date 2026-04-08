import React, { useEffect } from 'react';
import Logo from '../../components/common/Logo';
import {
  Container,
  LogoWrapper,
  ResultContainer,
  SuccessText,
  ButtonWrapper,
  BackButton,
} from '../../styles/FindDoneStyles';

const FindPwDoneStep = ({ onPrev }) => {
  // ✨ 추가: 완료 화면 진입 시 세션 스토리지 정리
  useEffect(() => {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userType');
  }, []);

  return (
    <Container>
      <LogoWrapper>
        <Logo />
      </LogoWrapper>
      <ResultContainer>
        <SuccessText>비밀번호 안내가 정상적으로 발송되었습니다!</SuccessText>
        <ButtonWrapper>
          <BackButton onClick={onPrev}>메인으로</BackButton>
        </ButtonWrapper>
      </ResultContainer>
    </Container>
  );
};

export default FindPwDoneStep;
