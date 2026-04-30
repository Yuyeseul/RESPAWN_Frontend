import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from '../api/axios';

const initialPhoneNumberState = {
  phoneNumber: '',
  isRequiredPhoneNumber: false, // 정규식
  isPhoneNumberAvailable: false, // 사용 가능 (중복)
  isValidPhoneNumber: false, // 인증 성공
  isCheckedPhoneNumber: false, // 인증 완료
  error: '',
};

const initialConfirmPhoneState = {
  confirmPhone: '',
  isValidConfirmPhone: false, // 인증 성공(인증번호 )
};

const ProfileComplete = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const missing = useMemo(() => {
    const raw = params.get('missing') || '';
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s === 'name' || s === 'phoneNumber'); // 허용 목록 화이트리스트
  }, [params]); // [5][1]

  // 폼 상태
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumberState);
  const [confirmPhone, setConfirmPhone] = useState(initialConfirmPhoneState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // 인증번호 UI
  const [showPhoneConfirm, setShowPhoneConfirm] = useState(false);

  // 전화번호 인증 타이머 상태
  const [countdown, setCountdown] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // 표시/검증 헬퍼
  const needs = {
    name: missing.includes('name'),
    phoneNumber: missing.includes('phoneNumber'),
  };

  const isReadyToSubmit =
    (!needs.name || name.trim() !== '') &&
    (!needs.phoneNumber || phoneNumber.isCheckedPhoneNumber);

  // 전화번호 인증 요청 (응답값 false -> 중복X)
  const verifyPhoneNumber = async () => {
    if (isVerifying) return; // 실행 중이면 블록
    setIsVerifying(true);
    try {
      const duplicateCheck = await axios.get(
        `/signup/phoneNumber/${phoneNumber.phoneNumber}`
      );

      if (duplicateCheck.data === true) {
        setPhoneNumber((prev) => ({
          ...prev,
          error: '이미 등록된 전화번호입니다. 다른 번호를 입력해주세요.',
        }));
      } else {
        // 중복이 아님 -> 인증 요청 시작
        await axios.post('/verify-phone-number', {
          phoneNumber: phoneNumber.phoneNumber,
        });
        setPhoneNumber((prev) => ({
          ...prev,
          isPhoneNumberAvailable: true,
          error: '',
        }));
        alert('인증번호가 입력하신 전화번호로 전송되었습니다.');
        setCountdown(300); // 5분
        setTimerActive(true);
        setShowPhoneConfirm(true);
      }
    } catch (err) {
      console.error(err);
      setPhoneNumber((prev) => ({
        ...prev,
        isPhoneNumberAvailable: false,
        error: '전화번호 인증 요청 중 오류가 발생했습니다.',
      }));
    } finally {
      setIsVerifying(false); // 💡 종료 시 해제
    }
  };

  // 전화번호 인증 확인
  const confirmPhoneVerificationCode = async () => {
    try {
      const response = await axios.post('/phone-number/verification-code', {
        code: confirmPhone.confirmPhone,
      });
      if (response.data.isSuccess) {
        setConfirmPhone({ ...confirmPhone, isValidConfirmPhone: true });
        setPhoneNumber({
          ...phoneNumber,
          isValidPhoneNumber: true,
          isCheckedPhoneNumber: true,
          error: '',
        });
        setTimerActive(false);
        alert('전화번호 인증이 완료되었습니다.');
      }
    } catch (error) {
      alert('인증번호가 올바르지 않거나, 인증에 실패했습니다.');
      setConfirmPhone({ ...confirmPhone, isValidConfirmPhone: false });
    }
  };

  // 전화번호 인증 타이머 useEffect
  useEffect(() => {
    let timer = null;
    if (timerActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && timerActive) {
      setTimerActive(false);
      setShowPhoneConfirm(false);
      alert('인증 시간이 만료되었습니다. 다시 요청해주세요.');
    }
    return () => clearInterval(timer);
  }, [timerActive, countdown]);

  const onChange = (name) => (e) => {
    const value = e.target.value;
    switch (name) {
      case 'name':
        setName(value);
        break;
      case 'phoneNumber':
        const requiredPhoneNumber = /^\d{11}$/.test(value);
        setPhoneNumber({
          ...phoneNumber,
          phoneNumber: value,
          isRequiredPhoneNumber: requiredPhoneNumber,
          isPhoneNumberAvailable: false,
          isCheckedPhoneNumber: false,
          isValidPhoneNumber: false,
          error: requiredPhoneNumber ? '' : '유효한 전화번호를 입력하세요.',
        });
        setShowPhoneConfirm(false);
        setTimerActive(false);
        setCountdown(0);
        break;
      case 'confirmPhone':
        setConfirmPhone({
          ...confirmPhone,
          confirmPhone: value,
          isValidConfirmPhone: false,
        });
        break;
      default:
        break;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (needs.name) {
      if (!name?.trim()) {
        alert('이름을 입력해주세요.');
        return;
      }
    }

    // 전화번호가 필요한 경우에만 체크
    if (needs.phoneNumber) {
      if (!phoneNumber.phoneNumber) {
        alert('전화번호를 입력해주세요.');
        return;
      }
      if (!phoneNumber.isRequiredPhoneNumber) {
        alert('전화번호 형식을 확인해주세요. (숫자 11자리)');
        return;
      }
      if (!phoneNumber.isPhoneNumberAvailable) {
        alert('전화번호 인증 요청을 진행해주세요.');
        return;
      }
      if (
        !phoneNumber.isValidPhoneNumber ||
        !confirmPhone.isValidConfirmPhone ||
        !phoneNumber.isCheckedPhoneNumber
      ) {
        alert('전화번호 인증을 완료해주세요.');
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    const userData = {
      ...(needs.phoneNumber && { phoneNumber: phoneNumber.phoneNumber }),
      ...(needs.name && { name }),
    };

    try {
      // 서버 연동 예시
      await axios.post('/profile/update', userData);
      console.log(userData);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('정보 저장 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title>추가 정보 입력</Title>
        <Desc>원활한 서비스 이용을 위해 추가 정보를 입력해주세요.</Desc>

        <Form onSubmit={onSubmit} noValidate>
          {needs.name && (
            <Field>
              <Label>이름</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="이름을 입력해주세요"
                value={name}
                onChange={onChange('name')}
                required
                disabled={phoneNumber.isCheckedPhoneNumber}
              />
            </Field>
          )}

          {needs.phoneNumber && (
            <Field>
              <Label>휴대폰 번호</Label>
              <InputRow>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="숫자만 입력"
                  value={phoneNumber.phoneNumber}
                  onChange={onChange('phoneNumber')}
                  $hasError={!!phoneNumber.error}
                  required
                />
                <InlineButton
                  type="button"
                  disabled={
                    !phoneNumber.isRequiredPhoneNumber ||
                    phoneNumber.isCheckedPhoneNumber ||
                    isVerifying
                  }
                  onClick={verifyPhoneNumber}
                >
                  {isVerifying ? '요청 중...' : '인증하기'}
                </InlineButton>
              </InputRow>

              {showPhoneConfirm && (
                <InputRow style={{ marginTop: '8px' }}>
                  <Input
                    id="confirmPhone"
                    name="confirmPhone"
                    type="text"
                    placeholder="인증번호 6자리 입력"
                    value={confirmPhone.confirmPhone}
                    onChange={onChange('confirmPhone')}
                    disabled={phoneNumber.isCheckedPhoneNumber}
                  />
                  <InlineButton
                    type="button"
                    onClick={confirmPhoneVerificationCode}
                    disabled={phoneNumber.isCheckedPhoneNumber}
                  >
                    {phoneNumber.isCheckedPhoneNumber ? '인증완료' : '인증확인'}
                  </InlineButton>
                </InputRow>
              )}

              {timerActive && (
                <Timer>
                  남은 시간: {Math.floor(countdown / 60)}:
                  {String(countdown % 60).padStart(2, '0')}
                </Timer>
              )}
              {phoneNumber.error && <ErrorMsg>{phoneNumber.error}</ErrorMsg>}
            </Field>
          )}

          {error && <ErrorMsg role="alert">{error}</ErrorMsg>}

          {isReadyToSubmit && (
            <SubmitButton type="submit" disabled={submitting}>
              {submitting ? '저장 중...' : '정보 저장하기'}
            </SubmitButton>
          )}
        </Form>
      </Card>
    </Container>
  );
};

export default ProfileComplete;

const Container = styled.div`
  min-height: 100vh;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => theme.colors.white};
  box-sizing: border-box;

  @media ${({ theme }) => theme.mobile} {
    padding: 16px;
    align-items: center;
  }
`;

const Card = styled.div`
  padding: 48px;
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};

  @media ${({ theme }) => theme.mobile} {
    padding: 32px 24px;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.gray[900]};
  margin: 0 0 12px 0;
  text-align: center;
  letter-spacing: -0.5px;

  @media ${({ theme }) => theme.mobile} {
    font-size: 24px;
    margin-bottom: 8px;
  }
`;

const Desc = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin: 0 0 32px 0;
  text-align: center;
  word-break: keep-all;

  @media ${({ theme }) => theme.mobile} {
    font-size: 13px;
    margin-bottom: 24px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[700]};
  margin-bottom: 8px;
  margin-left: 2px;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
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
    /* 모바일에서 글씨가 길면 ...으로 처리되도록 방어코드 추가 */
    text-overflow: ellipsis;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.danger : theme.colors.primary};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.gray[500]};
    cursor: not-allowed;
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 0 12px;
    font-size: 14px;
  }
`;

const InlineButton = styled.button`
  width: 100px;
  height: 52px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary_dark};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.gray[300]};
    color: ${({ theme }) => theme.colors.white};
    cursor: not-allowed;
  }

  @media ${({ theme }) => theme.mobile} {
    width: 84px;
    font-size: 13px;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 54px;
  margin-top: 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors?.primary_dark};
    box-shadow: 0 4px 12px rgba(85, 90, 130, 0.2);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.gray[300]};
    color: ${({ theme }) => theme.colors.white};
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 12px;
  margin: 6px 0 0 4px;
  font-weight: 500;
`;

const Timer = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  margin: 6px 0 0 4px;
`;
