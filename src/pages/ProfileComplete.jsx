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
        <Desc>소셜 로그인 계정의 추가 정보를 입력해주세요.</Desc>

        <Form onSubmit={onSubmit} noValidate>
          {needs.name && (
            <Field>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="이름"
                value={name}
                onChange={onChange('name')}
                required
                disabled={phoneNumber.isCheckedPhoneNumber}
              />
            </Field>
          )}

          {needs.phoneNumber && (
            <Field>
              <InputRow>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="01012345678"
                  value={phoneNumber.phoneNumber}
                  onChange={onChange('phoneNumber')}
                  required
                />
                <Button
                  type="button"
                  disabled={
                    !phoneNumber.isRequiredPhoneNumber ||
                    phoneNumber.isCheckedPhoneNumber
                  }
                  onClick={verifyPhoneNumber}
                >
                  인증하기
                </Button>
              </InputRow>
              <Hint>숫자만 입력 (하이픈 없이)</Hint>

              {showPhoneConfirm && (
                <Field>
                  <InputRow>
                    <Input
                      id="confirmPhone"
                      name="confirmPhone"
                      type="text"
                      placeholder="인증번호 입력"
                      value={confirmPhone.confirmPhone}
                      onChange={onChange('confirmPhone')}
                      disabled={phoneNumber.isCheckedPhoneNumber}
                    />
                    <Button
                      type="button"
                      onClick={confirmPhoneVerificationCode}
                      disabled={phoneNumber.isCheckedPhoneNumber}
                    >
                      {phoneNumber.isCheckedPhoneNumber
                        ? '인증완료'
                        : '인증확인'}
                    </Button>
                  </InputRow>
                  {timerActive && (
                    <Timer>
                      인증 유효 시간: {Math.floor(countdown / 60)}:
                      {String(countdown % 60).padStart(2, '0')}
                    </Timer>
                  )}
                </Field>
              )}

              {phoneNumber.error && <ErrorMsg>{phoneNumber.error}</ErrorMsg>}
            </Field>
          )}

          {error && <ErrorMsg role="alert">{error}</ErrorMsg>}

          {isReadyToSubmit && (
            <Button type="submit" disabled={submitting}>
              {submitting ? '저장 중...' : '저장'}
            </Button>
          )}
        </Form>
      </Card>
    </Container>
  );
};

export default ProfileComplete;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fafafa;
  padding: 40px 20px;
`;

const Card = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
  text-align: center;
`;

const Desc = styled.p`
  color: #666;
  margin-bottom: 20px;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px;
  font-size: 16px;
  border: none;
  border-bottom: 2px solid #ccc;
  background: transparent;
  border-radius: 6px 6px 0 0;
  &:focus {
    outline: none;
    border-bottom: 2px solid rgb(105, 111, 148);
  }
  &:disabled {
    background: #f6f6f6;
    color: #aaa;
  }
`;

const Button = styled.button`
  background: rgb(105, 111, 148);
  color: white;
  width: 110px;
  padding: 12px 20px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.1s;
  &:hover:not(:disabled) {
    background: rgb(85, 90, 130);
  }
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const Hint = styled.span`
  font-size: 12px;
  color: #999;
`;

const ErrorMsg = styled.div`
  color: #d93025;
  font-size: 14px;
`;

const Timer = styled.span`
  font-size: 14px;
  color: #555;
  margin-left: 8px;
`;
