import React from 'react';
import Logo from '../../components/common/Logo';
import { useSendForm } from '../../hooks/useSendForm';
import { sendId } from '../../utils/FindSendApi';
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

const FindIdSendStep = ({ userInfo, onNext, onPrev }) => {
  const { loading, error, sendEmail, sendPhone } = useSendForm({
    sendApi: async ({ type }) => {
      const token = sessionStorage.getItem('token');
      const userId = sessionStorage.getItem('userId');
      const userType = sessionStorage.getItem('userType');
      return sendId({ userId, token, type, userType });
    },
    onNext,
  });

  return (
    <Container>
      <LogoWrapper>
        <Logo />
      </LogoWrapper>

      <Card>
        <Title>아이디 찾기</Title>

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

export default FindIdSendStep;
