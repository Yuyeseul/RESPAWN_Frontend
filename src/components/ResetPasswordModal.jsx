import React, { useState } from 'react';
import styled from 'styled-components';
import axios from '../api/axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

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

function ResetPasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState(initialPasswordState);
  const [confirmPassword, setConfirmPassword] = useState(
    initialConfirmPasswordState
  );
  const [loading, setLoading] = useState(false);

  const [seeCurrentPassword, setSeeCurrentPassword] = useState(false);
  const [seePassword, setSeePassword] = useState(false);
  const [seeConfirmPassword, setSeeConfirmPassword] = useState(false);

  const seeCurrentPasswordHandler = () => {
    setSeeCurrentPassword(!seeCurrentPassword);
  };

  const seePasswordHandler = () => {
    setSeePassword(!seePassword);
  };

  const seeConfirmPasswordHandler = () => {
    setSeeConfirmPassword(!seeConfirmPassword);
  };

  // 입력 핸들러
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
      // 새 비밀번호 변경 시 확인 필드도 재검증
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
    } else if (name === 'currentPassword') {
      setCurrentPassword(value);
    }
  };

  // 비밀번호 변경 요청
  const handleSubmit = async () => {
    if (!currentPassword) {
      alert('현재 비밀번호를 입력해주세요.');
      return;
    }
    if (!password.isRequiredPassword) {
      alert(password.error || '비밀번호 형식을 확인해주세요.');
      return;
    }
    if (!confirmPassword.isCheckPassword) {
      alert(confirmPassword.error || '비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put('/myPage/setPassword', {
        currentPassword,
        newPassword: password.password,
      });
      alert(response.data.message || '비밀번호가 변경되었습니다.');
      onClose();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay>
      <ModalBox>
        <CloseButton onClick={onClose}>×</CloseButton>
        <Header>비밀번호 변경</Header>

        <FormGroup>
          <label>현재 비밀번호</label>
          <input
            type="text"
            autoComplete="username"
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              margin: -1,
              overflow: 'hidden',
              clip: 'rect(0,0,0,0)',
              border: 0,
            }}
          />
          <Field>
            <Input
              type={seeCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={onChangeHandler('currentPassword')}
              placeholder="현재 비밀번호"
              autoComplete="new-password"
            />
            <IconButton
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={seeCurrentPasswordHandler}
              aria-label="비밀번호 보기 전환"
            >
              {seeCurrentPassword ? <FaEyeSlash /> : <FaEye />}
            </IconButton>
          </Field>
        </FormGroup>

        <FormGroup>
          <label>새 비밀번호</label>
          <Field>
            <Input
              type={seePassword ? 'text' : 'password'}
              value={password.password}
              onChange={onChangeHandler('password')}
              placeholder="새 비밀번호"
              autoComplete="new-password"
            />
            <IconButton
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={seePasswordHandler}
              aria-label="비밀번호 보기 전환"
            >
              {seePassword ? <FaEyeSlash /> : <FaEye />}
            </IconButton>
          </Field>
          {password.error && <ErrorMsg>{password.error}</ErrorMsg>}
        </FormGroup>

        <FormGroup>
          <label>비밀번호 확인</label>
          <Field>
            <Input
              type={seeConfirmPassword ? 'text' : 'password'}
              value={confirmPassword.confirmPassword}
              onChange={onChangeHandler('confirmPassword')}
              placeholder="비밀번호 확인"
              autoComplete="new-password"
            />
            <IconButton
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={seeConfirmPasswordHandler}
              aria-label="비밀번호 보기 전환"
            >
              {seeConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </IconButton>
          </Field>
          {confirmPassword.error && (
            <ErrorMsg>{confirmPassword.error}</ErrorMsg>
          )}
        </FormGroup>

        <ButtonWrapper>
          <Right>
            <CancelButton onClick={onClose}>취소</CancelButton>
            <ConfirmButton onClick={handleSubmit} disabled={loading}>
              {loading ? '처리 중...' : '변경'}
            </ConfirmButton>
          </Right>
        </ButtonWrapper>
      </ModalBox>
    </Overlay>
  );
}

export default ResetPasswordModal;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: ${({ theme }) => theme.colors.overlay};
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;
`;

const ModalBox = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.white};
  width: 100%;
  max-width: 460px;
  padding: 32px;
  border-radius: 10px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;

  @media ${({ theme }) => theme.mobile} {
    padding: 24px 20px;
  }
`;

const Header = styled.h2`
  font-size: 20px;
  margin-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
  padding-bottom: 12px;
  color: ${({ theme }) => theme.colors.gray[800]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  width: 100%;

  label {
    font-size: 14px;
    margin-bottom: 6px;
    color: ${({ theme }) => theme.colors.gray[700]};
  }

  input {
    padding: 10px;
    border: 1px solid ${({ theme }) => theme.colors.gray[300]};
    border-radius: 6px;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
    color: ${({ theme }) => theme.colors.gray[700]};

    &:focus {
      border-color: ${({ theme }) => theme.colors.gray[600]};
    }
  }
`;

const Field = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 40px 12px 12px;
  border: none !important;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[400]} !important;
  border-radius: 0 !important;
  font-size: 16px;
  background: transparent;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-bottom-color: ${({ theme }) => theme.colors.gray[550]} !important;
  }
`;

const IconButton = styled.button`
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: 1.1rem;

  &:hover {
    color: ${({ theme }) => theme.colors.gray[800]};
  }
`;

const ErrorMsg = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.danger};
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
`;

const Right = styled.div`
  display: flex;
  gap: 10px;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray[500]};
  border: 1px solid ${({ theme }) => theme.colors.gray[500]};

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[100]};
  }
`;

const ConfirmButton = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  border: 1px solid ${({ theme }) => theme.colors.black};

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[100]};
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.gray[400]};
    border-color: ${({ theme }) => theme.colors.gray[300]};
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colors.white};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[550]};

  &:hover {
    color: ${({ theme }) => theme.colors.black};
  }
`;
