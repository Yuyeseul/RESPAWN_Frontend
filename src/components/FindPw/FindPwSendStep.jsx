import React from 'react';
import Logo from '../../components/common/Logo';
import { useSendForm } from '../../hooks/useSendForm';
import { sendPw } from '../../utils/FindSendApi';
import {
  Container,
  LogoWrapper,
  Card,
  Title,
  ErrorMsg,
  SendOptions,
  Option,
  OptionLabel,
  OptionValue,
  SendButton,
  ButtonRow,
  BackButton,
  UserInfo,
  Label,
  Value,
} from '../../styles/FindSendStyles';

const FindPwSendStep = ({ userInfo, onNext, onPrev }) => {
  const { loading, error, setError, sendEmail, sendPhone } = useSendForm({
    sendApi: async ({ type }) => {
      const userId = sessionStorage.getItem('userId');
      return sendPw({ userId, type });
    },
    onNext,
  });

  return (
    <Container>
      <LogoWrapper>
        <Logo />
      </LogoWrapper>

      <Card>
        <Title>비밀번호 찾기</Title>

        <UserInfo>
          <Label>이름</Label>
          <Value>{userInfo.name}</Value>
        </UserInfo>

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <SendOptions>
          <Option>
            <OptionLabel>이메일 주소로 받기</OptionLabel>
            <OptionValue title={userInfo.email}>{userInfo.email}</OptionValue>
            <SendButton onClick={() => sendEmail()} disabled={loading}>
              {loading ? '발송중...' : '발송하기'}
            </SendButton>
          </Option>

          <Option>
            <OptionLabel>휴대폰 번호로 받기</OptionLabel>
            <OptionValue title={userInfo.phoneNumber}>
              {userInfo.phoneNumber}
            </OptionValue>
            <SendButton onClick={() => sendPhone()} disabled={loading}>
              {loading ? '발송중...' : '발송하기'}
            </SendButton>
          </Option>
        </SendOptions>

        <ButtonRow>
          <BackButton onClick={onPrev} disabled={loading}>
            이전
          </BackButton>
        </ButtonRow>
      </Card>
    </Container>
  );
};

export default FindPwSendStep;
