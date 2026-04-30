import React, { useState } from 'react';
import styled from 'styled-components';
import Logo from '../components/common/Logo';
import axios from '../api/axios';
import { useLocation, useNavigate } from 'react-router-dom';

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

const ResetPasswordPage = () => {
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
    <Container>
      <LogoWrapper>
        <Logo />
      </LogoWrapper>
      <Box>
        <Title>비밀번호 재설정</Title>

        <FormGroup>
          <Label>새 비밀번호</Label>
          <Input
            name="password"
            type="password"
            placeholder="영문, 숫자, 특수문자 포함 8~25자"
            value={password.password}
            onChange={onChangeHandler('password')}
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
            {loading ? '처리 중...' : '확인'}
          </PrimaryButton>
        </ButtonContainer>

        <GuideText>
          다른 서비스에서 사용한 적 없는 안전한 비밀번호를 사용하세요.
          <br />
          비밀번호는 8~25자의 영문, 숫자, 특수문자를 포함하며 공백 없이
          입력해주세요.
        </GuideText>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;

const Container = styled.div`
  min-height: 100vh;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => theme.colors.white};
  box-sizing: border-box;

  @media ${({ theme }) => theme.mobile} {
    padding: 30px 16px;
    align-items: center;
  }
`;

const LogoWrapper = styled.div`
  width: 100%;
  max-width: 460px;
  display: flex;
  justify-content: center;
  margin-bottom: 32px;

  & > div img {
    height: 70px;
    object-fit: contain;
  }

  @media ${({ theme }) => theme.mobile} {
    margin-bottom: 24px;
    & > div img {
      height: 56px;
    }
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
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};

  @media ${({ theme }) => theme.mobile} {
    padding: 32px 24px;
    border-radius: 16px;
    box-shadow: none;
    border: 1px solid ${({ theme }) => theme.colors.gray[200]};
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

const GuideText = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 24px;
  line-height: 1.6;
  word-break: keep-all;
  white-space: normal;
  text-align: center;
`;
