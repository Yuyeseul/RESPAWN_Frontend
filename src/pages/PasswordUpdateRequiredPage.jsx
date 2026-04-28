import React, { useState } from 'react';
import styled from 'styled-components';
import axios from '../api/axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/;

const initialPasswordState = {
  password: '',
  isRequiredPassword: false,
  error: '',
};

const initialConfirmPasswordState = {
  confirmPassword: '',
  isCheckPassword: false,
  error: '',
};

const PasswordUpdateRequiredPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  const [password, setPassword] = useState(initialPasswordState);
  const [confirmPassword, setConfirmPassword] = useState(
    initialConfirmPasswordState
  );
  const [loading, setLoading] = useState(false);

  // 유효성 검사
  const onChangeHandler = (name) => (e) => {
    const value = e.target.value;
    if (name === 'password') {
      const valid = PASSWORD_REGEX.test(value);
      setPassword({
        ...password,
        password: value,
        isRequiredPassword: valid,
        error: valid
          ? ''
          : '8~25자의 영문, 숫자, 특수문자를 모두 포함해야 합니다.',
      });
      // 비밀번호 변경 시 확인 비밀번호도 재검증
      if (confirmPassword.confirmPassword) {
        setConfirmPassword({
          ...confirmPassword,
          isCheckPassword: value === confirmPassword.confirmPassword,
          error:
            value === confirmPassword.confirmPassword
              ? ''
              : '비밀번호가 일치하지 않습니다.',
        });
      }
    } else if (name === 'confirmPassword') {
      setConfirmPassword({
        ...confirmPassword,
        confirmPassword: value,
        isCheckPassword: value === password.password,
        error:
          value === password.password ? '' : '비밀번호가 일치하지 않습니다.',
      });
    }
  };

  const handleDelay = async () => {
    try {
      await axios.post('/password-change/snooze');
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('비밀번호 변경 연기 요청에 실패했습니다.');
    }
  };

  const handleSubmit = async () => {
    if (!password.isRequiredPassword) {
      alert('비밀번호 조건을 확인해주세요.');
      return;
    }
    if (!confirmPassword.isCheckPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!token) {
      alert('유효하지 않은 요청입니다.');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/reset-password', {
        token,
        newPassword: password.password,
      });
      alert('비밀번호가 성공적으로 변경되었습니다.');
      setPassword(initialPasswordState);
      setConfirmPassword(initialConfirmPasswordState);
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert('비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container>
        <Box>
          <Title>비밀번호 재설정</Title>

          <NoticeBox>
            <NoticeIcon>🔒</NoticeIcon>
            <NoticeText>
              고객님의 안전한 서비스 이용을 위해 비밀번호 변경을 안내해
              드립니다.
              <br />
              새로운 비밀번호로 변경하시면 모든 기기에서 자동 로그아웃됩니다.
            </NoticeText>
          </NoticeBox>

          <FormGroup>
            <Label>새 비밀번호</Label>
            <Input
              name="password"
              type="password"
              placeholder="영문, 숫자, 특수문자 포함 8~25자"
              value={password.password}
              onChange={onChangeHandler('password')}
              autoComplete="new-password"
              $hasError={!!password.error}
              required
            />
            {password.error && <ErrorText>{password.error}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>새 비밀번호 확인</Label>
            <Input
              name="confirmPassword"
              type="password"
              placeholder="비밀번호를 한번 더 입력해주세요"
              value={confirmPassword.confirmPassword}
              onChange={onChangeHandler('confirmPassword')}
              autoComplete="new-password"
              $hasError={!!confirmPassword.error}
              required
            />
            {confirmPassword.error && (
              <ErrorText>{confirmPassword.error}</ErrorText>
            )}
          </FormGroup>

          <ButtonContainer>
            <PrimaryButton
              type="button"
              onClick={handleSubmit}
              disabled={
                !password.isRequiredPassword ||
                !confirmPassword.isCheckPassword ||
                loading
              }
            >
              {loading ? '처리 중...' : '비밀번호 변경하기'}
            </PrimaryButton>

            <TextButton type="button" onClick={handleDelay}>
              다음에 변경하기
            </TextButton>
          </ButtonContainer>
        </Box>
      </Container>
      <Footer />
    </>
  );
};

export default PasswordUpdateRequiredPage;

const Container = styled.div`
  min-height: 80vh;
  padding: 60px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => theme.colors.white};
  box-sizing: border-box;

  @media ${({ theme }) => theme.mobile} {
    padding: 30px 16px;
    align-items: flex-start;
  }
`;

const Box = styled.div`
  padding: 48px;
  border-radius: 20px;
  width: 100%;
  max-width: 460px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  @media ${({ theme }) => theme.mobile} {
    padding: 32px 24px;
    border-radius: 16px;
  }
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.gray[900]};
  margin: 0 0 32px 0;
  text-align: center;
  letter-spacing: -0.5px;

  @media ${({ theme }) => theme.mobile} {
    font-size: 22px;
    margin-bottom: 24px;
  }
`;

const NoticeBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background-color: ${({ theme }) => theme.colors.gray[100]};
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 32px;
`;

const NoticeIcon = styled.div`
  font-size: 18px;
  margin-top: 2px;
`;

const NoticeText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.gray[700]};
  word-break: keep-all;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[700]};
  margin-bottom: 8px;
  margin-left: 2px;
`;

const Input = styled.input`
  width: 100%;
  height: 52px;
  padding: 0 16px;
  border: 1px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.danger : theme.colors.gray[300]};
  border-radius: 10px;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.gray[900]};
  box-sizing: border-box;
  transition: all 0.2s ease;
  background-color: ${({ theme }) => theme.colors.white};

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.danger : theme.colors.primary};
  }
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 12px;
  margin: 6px 0 0 4px;
  font-weight: 500;
`;

const ButtonContainer = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PrimaryButton = styled.button`
  width: 100%;
  height: 54px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary_dark};
    box-shadow: 0 4px 12px rgba(85, 90, 130, 0.2);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.gray[300]};
    color: ${({ theme }) => theme.colors.gray[500]};
    cursor: not-allowed;
  }
`;

const TextButton = styled.button`
  width: 100%;
  height: 48px;
  background: transparent;
  color: ${({ theme }) => theme.colors.gray[550]};
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.gray[800]};
    background: ${({ theme }) => theme.colors.gray[100]};
  }
`;
