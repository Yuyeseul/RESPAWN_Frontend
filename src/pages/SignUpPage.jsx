import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const SignupPage = () => {
  const navigate = useNavigate('');

  const initialUsernameState = {
    username: '',
    isRequiredUsername: false, // 정규식
    isUsernameAvailable: false, // 사용 가능 여부(중복)
    success: '',
    error: '',
  };

  const initialPasswordState = {
    password: '',
    isRequiredPassword: false, // 정규식
    error: '',
  };

  const initialConfirmPasswordState = {
    confirmPassword: '',
    isCheckPassword: false, // 일치 확인
    error: '',
  };

  const initialPhoneNumberState = {
    phoneNumber: '',
    isRequiredPhoneNumber: false, // 정규식
    isPhoneNumberAvailable: false, // 사용 가능 여부(중복)
    isValidPhoneNumber: false, // 인증성공 확인
    isCheckedPhoneNumber: false, // 중복확인 버튼
    error: '',
  };

  const initialConfirmPhoneState = {
    confirmPhone: '',
    isValidConfirmPhone: false, // 인증번호 일치 확인
  };

  const initialEmailState = {
    email: '',
    isRequiredEmail: false, // 정규식
    isEmailAvailable: false, // 사용 가능 여부(중복)
    isValidEmail: false, // 인증성공 확인
    isCheckedEmail: false, // 중복확인 버튼
    error: '',
  };

  const initialConfirmEmailState = {
    confirmEmail: '',
    isValidConfirmEmail: false, // 인증번호 일치 확인
  };

  // 선택 약관
  // const checkHandler = () => {
  //   setIsChecked();
  // }

  const [userType, setUserType] = useState('buyer'); // 'buyer' or 'seller'

  const [name, setName] = useState('');
  const [username, setUsername] = useState(initialUsernameState);
  const [password, setPassword] = useState(initialPasswordState);
  const [confirmPassword, setConfirmPassword] = useState(
    initialConfirmPasswordState
  );
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumberState);
  const [confirmPhone, setConfirmPhone] = useState(initialConfirmPhoneState);
  const [email, setEmail] = useState(initialEmailState);
  const [confirmEmail, setConfirmEmail] = useState(initialConfirmEmailState);

  // const [isChecked, setIsChecked] = useState(false);

  const [showPhoneConfirm, setShowPhoneConfirm] = useState(false);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);

  const expectedPhoneCode = '123456';
  const expectedEmailCode = '123456';

  // 아이디 중복 검사
  const checkId = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/buyers/signup/username/${username.username}`
      );
      if (response.data === false) {
        // 중복이 아닐 경우
        setUsername({
          ...username,
          isUsernameAvailable: true,
          success: '사용 가능한 아이디입니다.',
          error: '',
        });
      } else {
        // 중복일 경우
        setUsername({
          ...username,
          isUsernameAvailable: false,
          success: '',
          error: '이미 사용중인 아이디입니다.',
        });
      }
    } catch (error) {
      setUsername({ ...username, error: ' 중복확인에 오류가 생겼습니다.' });
    }
  };

  // 전화번호 인증하기
  const verifyPhoneNumber = async () => {
    try {
      // 전화번호 중복 검사
      const response = await axios.get(
        `http://localhost:8080/buyers/signup/phoneNumber/${phoneNumber.phoneNumber}`
      );

      if (response.data === true) {
        // 중복일 경우
        setPhoneNumber({
          ...phoneNumber,
          isPhoneNumberAvailable: false,
          error: '이미 가입된 전화번호입니다.',
        });
        return;
      } else {
        // 중복이 아닐 경우
        setPhoneNumber({
          ...phoneNumber,
          isPhoneNumberAvailable: true,
          error: '',
        });

        alert(`전화번호로 인증 코드 [${expectedPhoneCode}]가 전송되었습니다.`);
        setShowPhoneConfirm(true);
      }
    } catch (err) {
      console.error(err);
      setPhoneNumber({
        ...phoneNumber,
        error: '전화번호 중복 확인 중 오류가 발생했습니다.',
      });
    }
  };

  const confirmPhoneVerificationCode = () => {
    const valid = confirmPhone.confirmPhone === expectedPhoneCode;
    setConfirmPhone({ ...confirmPhone, isValidConfirmPhone: valid });
    if (valid) {
      alert('전화번호 인증이 완료되었습니다.');
      setPhoneNumber({
        ...phoneNumber,
        isValidPhoneNumber: true,
        isCheckedPhoneNumber: true,
        error: '',
      });
    } else {
      alert('인증번호가 올바르지 않습니다.');
    }
  };

  // 이메일 인증하기
  const verifyEmail = async () => {
    const requiredEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.email);
    if (!requiredEmail) {
      alert('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    try {
      // 2. 중복 검사
      const response = await axios.get(
        `http://localhost:8080/buyers/signup/email/${email.email}`
      );

      if (response.data === true) {
        // 3. 중복일 경우
        setEmail({
          ...email,
          isEmailAvailable: false,
          error: '이미 가입된 이메일입니다.',
        });
        return;
      } else {
        // 4. 중복이 아니면 인증번호 발송
        setEmail({
          ...email,
          isEmailAvailable: true,
          error: '',
        });

        alert(`이메일로 인증 코드 [${expectedEmailCode}]가 전송되었습니다.`);

        setEmail({ ...email, isValidEmail: true });
        setShowEmailConfirm(true); // 인증코드 입력창 보이기
      }
    } catch (err) {
      console.error(err);
      setEmail({
        ...email,
        error: '이메일 중복 확인 중 오류가 발생했습니다.',
      });
    }
  };

  const confirmEmailVerificationCode = (code) => {
    const valid = confirmEmail.confirmEmail === expectedEmailCode;
    setConfirmEmail({ ...confirmEmail, isValidConfirmEmail: valid });
    if (valid) {
      alert('이메일 인증이 완료되었습니다.');
      setEmail({
        ...email,
        isValidEmail: true,
        isCheckedEmail: true,
        error: '',
      });
    } else {
      alert('인증번호가 올바르지 않습니다.');
    }
  };

  // 유효성 검사
  const onChangeHandler = (name) => (e) => {
    const value = e.target.value;

    switch (name) {
      case 'name':
        setName(value);
        break;
      case 'username':
        const requiredUsername = /^[a-zA-Z0-9]{5,15}$/.test(value);
        setUsername({
          ...username,
          username: value,
          isRequiredUsername: requiredUsername,
          isUsernameAvailable: false,
          success: '',
          error: requiredUsername
            ? ''
            : '5~15자의 영문자, 숫자만 사용 가능합니다.',
        });
        break;
      case 'password':
        const requiredPassword =
          /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/.test(value);
        setPassword({
          ...password,
          password: value,
          isRequiredPassword: requiredPassword,
          error: requiredPassword
            ? ''
            : '8자 이상의 영문자, 숫자, 특수문자를 사용해야합니다.',
        });
        break;
      case 'confirmPassword':
        setConfirmPassword({
          ...confirmPassword,
          confirmPassword: value,
          isCheckPassword: value === password.password,
          error:
            value === password.password ? '' : '비밀번호가 일치하지 않습니다.',
        });
        break;
      case 'phoneNumber':
        const requiredPhoneNumber = /^\d{11}$/.test(value);
        setPhoneNumber({
          ...phoneNumber,
          phoneNumber: value,
          isRequiredPhoneNumber: requiredPhoneNumber,
          isPhoneNumberAvailable: false,
          isCheckedPhoneNumber: false, // 다시 입력하면 중복확인 초기화
          isValidPhoneNumber: false, // 인증 초기화
          error: requiredPhoneNumber ? '' : '유효한 전화번호를 입력해주세요.',
        });
        break;
      case 'confirmPhone':
        setConfirmPhone({
          ...confirmPhone,
          confirmPhone: value,
          isValidConfirmPhone: false, // 매번 입력 변경 시 인증 초기화
        });
        break;
      case 'email':
        const requiredEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        setEmail({
          ...email,
          email: value,
          isRequiredEmail: requiredEmail,
          isEmailAvailable: false,
          isCheckedEmail: false, // 다시 입력하면 중복확인 초기화
          isValidEmail: false, // 인증 초기화
          error: requiredEmail ? '' : '유효한 이메일을 입력해주세요.',
        });
        break;
      case 'confirmEmail':
        setConfirmEmail({
          ...confirmEmail,
          confirmEmail: value,
          isValidConfirmEmail: false, // 매번 입력 변경 시 인증 초기화
        });
        break;
      default:
        break;
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault(); // 새로고침 방지

    const signupData = {
      name,
      username: username.username,
      password: password.password,
      phoneNumber: phoneNumber.phoneNumber,
      email: email.email,
    };

    try {
      const response = await axios.post(
        `http://localhost:8080/join`,
        signupData
      );
      console.log('회원가입 성공', response.data);
      navigate('/login');
    } catch (error) {
      if (error.response) {
        alert(
          '회원가입 실패: ' + (error.response.data.message || '알 수 없는 오류')
        );
      } else {
        alert('서버와 통신 중 오류가 발생했습니다.');
      }
      console.error('Axios error:', error);
    }

    console.log(`[${userType}] 회원가입 정보:`, {
      userType,
      name,
      username,
      password,
      phoneNumber,
      email,
    });
  };

  return (
    <Container>
      <SignupBox>
        <TabHeader>
          <Tab
            active={userType === 'buyer'}
            onClick={() => setUserType('buyer')}
          >
            구매회원 가입
          </Tab>
          <Tab
            active={userType === 'seller'}
            onClick={() => setUserType('seller')}
          >
            판매회원 가입
          </Tab>
        </TabHeader>

        <form onSubmit={handleSignup}>
          <Input
            name="name"
            type="text"
            placeholder="이름"
            value={name}
            onChange={onChangeHandler('name')}
            required
          />

          <CheckWrapper>
            <CheckInput
              name="username"
              type="text"
              placeholder="아이디"
              value={username.username}
              onChange={onChangeHandler('username')}
              required
            />
            <CheckButton
              type="button"
              onClick={checkId}
              disabled={!username.isRequiredUsername}
            >
              중복확인
            </CheckButton>
          </CheckWrapper>
          {username.success && <SuccessText>{username.success}</SuccessText>}
          {username.error && <ErrorText>{username.error}</ErrorText>}

          <Input
            name="password"
            type="password"
            placeholder="비밀번호"
            value={password.password}
            onChange={onChangeHandler('password')}
            required
          />
          {password.error && <ErrorText>{password.error}</ErrorText>}

          <Input
            name="confirmPassword"
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword.confirmPassword}
            onChange={onChangeHandler('confirmPassword')}
            required
          />
          {confirmPassword.error && (
            <ErrorText>{confirmPassword.error}</ErrorText>
          )}

          <CheckWrapper>
            <CheckInput
              name="phoneNumber"
              type="text"
              placeholder="전화번호"
              value={phoneNumber.phoneNumber}
              onChange={onChangeHandler('phoneNumber')}
              required
            />
            <CheckButton
              type="button"
              onClick={verifyPhoneNumber}
              disabled={!phoneNumber.isRequiredPhoneNumber}
            >
              인증하기
            </CheckButton>
          </CheckWrapper>
          {phoneNumber.error && <ErrorText>{phoneNumber.error}</ErrorText>}

          {/* 전화번호 인증코드 입력칸: 인증하기 누른 후 보임 */}
          {showPhoneConfirm && (
            <CheckWrapper>
              <CheckInput
                name="confirmPhone"
                type="text"
                placeholder="전화번호 인증코드 입력"
                value={confirmPhone.confirmPhone}
                onChange={onChangeHandler('confirmPhone')}
                required
              />
              <CheckButton type="button" onClick={confirmPhoneVerificationCode}>
                인증확인
              </CheckButton>
            </CheckWrapper>
          )}

          <CheckWrapper>
            <CheckInput
              name="email"
              type="email"
              placeholder="이메일"
              value={email.email}
              onChange={onChangeHandler('email')}
              required
            />
            <CheckButton
              type="button"
              onClick={verifyEmail}
              disabled={!email.isRequiredEmail}
            >
              인증하기
            </CheckButton>
          </CheckWrapper>
          {email.error && <ErrorText>{email.error}</ErrorText>}

          {/* 이메일 인증코드 입력칸: 인증하기 누른 후 보임 */}
          {showEmailConfirm && (
            <CheckWrapper>
              <CheckInput
                name="confirmEmail"
                type="text"
                placeholder="이메일 인증코드 입력"
                value={confirmEmail.confirmEmail}
                onChange={onChangeHandler('confirmEmail')}
                required
              />
              <CheckButton type="button" onClick={confirmEmailVerificationCode}>
                인증확인
              </CheckButton>
            </CheckWrapper>
          )}

          <JoinButton type="submit">회원가입</JoinButton>
        </form>
      </SignupBox>
    </Container>
  );
};

export default SignupPage;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fafafa;
`;

const SignupBox = styled.div`
  background: white;
  padding: 32px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
`;

const TabHeader = styled.div`
  display: flex;
  margin-bottom: 24px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 12px 0;
  background: ${({ active }) => (active ? '#fff' : '#f1f1f1')};
  border: none;
  border-bottom: ${({ active }) =>
    active ? '2px solid rgb(105, 111, 148)' : '1px solid #ddd'};
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
  cursor: pointer;
  border-radius: 8px 8px 0 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: none;
  border-bottom: 1px solid #ccc;
  font-size: 16px;
  background: transparent;

  &:focus {
    outline: none;
    border-bottom: 2px solid rgb(105, 111, 148);
  }
`;

const CheckInput = styled.input`
  flex: 1;
  padding: 12px;
  border: none;
  border-bottom: 1px solid #ccc;
  font-size: 16px;
  background: transparent;

  &:focus {
    border-bottom: 2px solid rgb(105, 111, 148);
    outline: none;
  }
`;

const CheckButton = styled.button`
  margin-left: 12px;
  height: 44px;
  background: rgb(105, 111, 148);
  color: white;
  padding: 0 16px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: rgb(85, 90, 130);
  }
`;

const JoinButton = styled.button`
  width: 100%;
  background: rgb(105, 111, 148);
  color: white;
  padding: 14px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: rgb(105, 111, 148);
  }
`;

const CheckWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const ErrorText = styled.p`
  color: red;
  font-size: 12px;
  margin-top: -12px;
  margin-bottom: 12px;
`;

const SuccessText = styled.p`
  color: green;
  font-size: 12px;
  margin-top: -12px;
  margin-bottom: 12px;
`;
