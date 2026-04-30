import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import axios from '../api/axios';

const SignupPage = () => {
  const navigate = useNavigate('');

  // isRequired => 정규식
  // duPlicate => 중복
  // Check => 일치 확인 (비번)
  // checked => 인증 확인 여부
  // isVaild => 인증 성공 여부
  // Available => 사용가능 여부

  const initialUsernameState = {
    username: '',
    isRequiredUsername: false, // 정규식
    isUsernameAvailable: false, // 사용 가능 (중복)
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
    isCheckPassword: false, // 비밀번호 일치
    error: '',
  };

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

  const initialEmailState = {
    email: '',
    isRequiredEmail: false, // 정규식
    isEmailAvailable: false, // 사용가능 (중복)
    isValidEmail: false, // 인증 성공
    isCheckedEmail: false, // 인증 완료
    error: '',
  };

  const initialConfirmEmailState = {
    confirmEmail: '',
    isValidConfirmEmail: false, // 인증 성공(인증번호 )
  };

  const initialCompanyState = {
    company: '',
    error: '',
  };

  const initialCompanyNumberState = {
    companyNumber: '',
    isRequiredCompanyNumber: false, // 정규식
    error: '',
  };

  const [userType, setUserType] = useState('buyer');
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
  const [company, setCompany] = useState(initialCompanyState);
  const [companyNumber, setCompanyNumber] = useState(initialCompanyNumberState);

  //이메일 도메인 선택 코드
  const [emailId, setEmailId] = useState(''); // 사용자 입력
  const [emailDomain, setEmailDomain] = useState(''); // 선택한 도메인

  //이메일 도메인 직접 입력
  const [isCustomDomain, setIsCustomDomain] = useState(false); // 도메인 직접입력 선택 여부
  const [customDomain, setCustomDomain] = useState(''); // 도메인 직접 입력

  // 인증번호 UI
  const [showPhoneConfirm, setShowPhoneConfirm] = useState(false);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);

  // 전화번호 인증 타이머 상태
  const [countdown, setCountdown] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // 이메일 인증 타이머 상태
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [emailTimerActive, setEmailTimerActive] = useState(false);

  // 아이디 중복 검사 (응답값 false -> 중복X)
  const checkId = async () => {
    try {
      const duplicateCheck = await axios.get(
        `/signup/username/${username.username}`
      );
      if (duplicateCheck.data === false) {
        setUsername({
          ...username,
          isUsernameAvailable: true,
          success: '사용 가능한 아이디입니다.',
          error: '',
        });
      } else {
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
        setShowPhoneConfirm(false);
        setTimerActive(false);
        alert('전화번호 인증이 완료되었습니다.');
      }
    } catch (error) {
      alert('인증번호가 올바르지 않거나, 인증에 실패했습니다.');
      setConfirmPhone({ ...confirmPhone, isValidConfirmPhone: false });
    }
  };

  // 이메일 인증 요청
  const verifyEmail = async () => {
    if (!isCustomDomain && !emailDomain) {
      setEmail((prev) => ({ ...prev, error: '이메일 도메인을 선택해주세요.' }));
      return;
    }
    if (isCustomDomain && !customDomain.trim()) {
      setEmail((prev) => ({
        ...prev,
        error: '직접 입력 도메인을 입력해주세요.',
      }));
      return;
    }

    // 2) 형식 검증
    if (!email.isRequiredEmail) {
      setEmail((prev) => ({
        ...prev,
        error: '유효한 이메일 주소를 입력해주세요.',
      }));
      return;
    }

    try {
      const duplicateCheck = await axios.get(`/signup/email/${email.email}`);

      console.log(duplicateCheck.data);
      if (duplicateCheck.data === true) {
        setEmail((prev) => ({
          ...prev,
          error: '이미 등록된 이메일입니다. 다른 이메일을 입력해주세요.',
        }));
        return;
      }

      // 중복이 아니면 인증 요청 시작
      const response = await axios.get('/email/auth', {
        params: {
          address: email.email,
        },
      });

      if (response.data.success) {
        setEmail((prev) => ({
          ...prev,
          isEmailAvailable: true,
          error: '',
        }));
        alert('이메일로 인증코드가 전송되었습니다.');
        setShowEmailConfirm(true);
        setEmailCountdown(600);
        setEmailTimerActive(true);
      } else {
        setEmail((prev) => ({
          ...prev,
          error: response.data.message || '이메일 인증코드 발송 실패',
        }));
      }
    } catch (err) {
      console.error(err);
      setEmail((prev) => ({
        ...prev,
        error: '이메일 요청 중 오류가 발생했습니다.',
      }));
    }
  };

  // 이메일 인증코드 확인
  const confirmEmailVerificationCode = async () => {
    try {
      const response = await axios.post('/email/auth', null, {
        params: {
          address: email.email,
          authCode: confirmEmail.confirmEmail,
        },
      });

      if (response.data.success) {
        setConfirmEmail({ ...confirmEmail, isValidConfirmEmail: true });
        setEmail({
          ...email,
          isValidEmail: true,
          isCheckedEmail: true,
          error: '',
        });
        setShowEmailConfirm(false);
        setEmailTimerActive(false); // 타이머 종료
        alert('이메일 인증이 완료되었습니다.');
      } else {
        alert('인증번호가 올바르지 않거나, 인증에 실패했습니다.');
        setConfirmEmail({ ...confirmEmail, isValidConfirmEmail: false });
      }
    } catch (err) {
      console.error(err);
      alert('이메일 인증 확인 중 오류가 발생했습니다.');
    }
  };

  // 사업자등록번호 포맷
  const formatCompanyNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 10); // 최대 10자리
    const len = digits.length;
    if (len < 4) return digits;
    if (len < 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  };

  // 비밀번호 , 비밀번호 재확인 일치
  useEffect(() => {
    const pwd = password.password || '';
    const confirm = confirmPassword.confirmPassword || '';
    const match = confirm === pwd;

    setConfirmPassword((prev) => ({
      ...prev,
      isCheckPassword: match,
      error: match ? '' : '비밀번호가 일치하지 않습니다.',
    }));
  }, [password.password, confirmPassword.confirmPassword]);

  //이메일 도메인 선택 코드
  useEffect(() => {
    let selectedDomain = emailDomain;
    if (isCustomDomain) selectedDomain = customDomain;

    if (emailId && selectedDomain) {
      const fullEmail = `${emailId}@${selectedDomain}`;
      const requiredEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fullEmail);
      setEmail((prev) => ({
        ...prev,
        email: fullEmail,
        isRequiredEmail: requiredEmail,
        isEmailAvailable: false,
        isCheckedEmail: false,
        isValidEmail: false,
        error: requiredEmail ? '' : '유효한 이메일 주소를 입력해주세요.',
      }));
    }
  }, [emailId, emailDomain, isCustomDomain, customDomain]);

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

  // 이메일 인증 타이머 useEffect
  useEffect(() => {
    let emailTimer = null;
    if (emailTimerActive && emailCountdown > 0) {
      emailTimer = setInterval(() => {
        setEmailCountdown((prev) => prev - 1);
      }, 1000);
    } else if (emailCountdown === 0 && emailTimerActive) {
      setEmailTimerActive(false);
      setShowEmailConfirm(false);
      alert('이메일 인증 시간이 만료되었습니다. 다시 시도해주세요.');
    }
    return () => clearInterval(emailTimer);
  }, [emailTimerActive, emailCountdown]);

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
            : '8~25자의 영문자, 숫자, 특수문자를 사용해야합니다.',
        });
        setConfirmPassword({
          isCheckPassword: false,
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
      case 'company':
        setCompany({
          ...company,
          company: value,
          error: value.trim() ? '' : '스토어 이름을 입력해주세요.',
        });
        break;
      case 'companyNumber': {
        const formatted = formatCompanyNumber(value);
        const isValid = /^\d{3}-\d{2}-\d{5}$/.test(formatted);
        setCompanyNumber({
          ...companyNumber,
          companyNumber: formatted,
          isRequiredCompanyNumber: isValid,
          error: isValid ? '' : '사업자등록번호 10자리를 입력해주세요.',
        });
        break;
      }
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
      case 'email':
        const requiredEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        setEmail({
          ...email,
          email: value,
          isRequiredEmail: requiredEmail,
          isEmailAvailable: false,
          isCheckedEmail: false,
          isValidEmail: false,
          error: requiredEmail ? '' : '유효한 이메일 주소를 입력해주세요.',
        });
        break;
      case 'confirmEmail':
        setConfirmEmail({
          ...confirmEmail,
          confirmEmail: value,
          isValidConfirmEmail: false,
        });
        break;
      default:
        break;
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const trimmedName = name?.trim() || '';
    const trimmedCompany = company?.company?.trim() || '';

    // 1) 기본 필수값
    if (!trimmedName) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!username.username) {
      alert('아이디를 입력해주세요.');
      return;
    }
    if (!password.password) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    if (!email.email) {
      alert('이메일을 입력해주세요.');
      return;
    }
    if (!phoneNumber.phoneNumber) {
      alert('전화번호를 입력해주세요.');
      return;
    }

    // 2) 형식 유효성
    if (!username.isRequiredUsername) {
      alert('아이디 형식을 확인해주세요. (5~15자의 영문자/숫자)');
      return;
    }
    if (!password.isRequiredPassword) {
      alert('비밀번호 형식을 확인해주세요. (영문/숫자/특수문자 포함 8~25자)');
      return;
    }
    if (!confirmPassword.isCheckPassword) {
      alert('비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    if (!phoneNumber.isRequiredPhoneNumber) {
      alert('전화번호 형식을 확인해주세요. (숫자 11자리)');
      return;
    }
    if (!email.isRequiredEmail) {
      alert('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    // 3) 중복 검사 완료 여부 && 인증 완료 여부(코드 검증까지 끝났는지)
    if (!username.isUsernameAvailable) {
      alert('아이디 중복확인을 완료해주세요.');
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

    if (!email.isEmailAvailable) {
      alert('이메일 인증 요청을 진행해주세요.');
      return;
    }
    if (
      !email.isValidEmail ||
      !confirmEmail.isValidConfirmEmail ||
      !email.isCheckedEmail
    ) {
      alert('이메일 인증을 완료해주세요.');
      return;
    }

    // 5) 판매회원 전용
    if (userType === 'seller') {
      if (!trimmedCompany) {
        setCompany((p) => ({ ...p, error: '스토어 이름을 입력해주세요.' }));
        alert('스토어 이름을 입력해주세요.');
        return;
      }
      if (!companyNumber.isRequiredCompanyNumber) {
        setCompanyNumber((p) => ({
          ...p,
          error: '사업자등록번호 형식(예: 123-45-67890)에 맞게 입력해주세요.',
        }));
        alert('사업자등록번호 형식을 확인해주세요.');
        return;
      }
    }

    const signupData = {
      userType,
      name,
      username: username.username,
      password: password.password,
      phoneNumber: phoneNumber.phoneNumber,
      email: email.email,
    };
    if (userType === 'seller') {
      signupData.company = company.company;
      signupData.companyNumber = Number(
        companyNumber.companyNumber.replace(/\D/g, '')
      );
    }
    try {
      const response = await axios.post(`/join`, signupData);
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
  };

  return (
    <Container>
      <TopBar>
        <BackButton onClick={() => navigate(-1)}>← 뒤로가기</BackButton>
      </TopBar>
      <LogoWrapper>
        <Logo />
      </LogoWrapper>
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
              autoComplete="off"
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
            autoComplete="new-password"
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

          {userType === 'seller' && (
            <>
              <Input
                name="company"
                type="text"
                placeholder="스토어 이름"
                value={company.company}
                onChange={onChangeHandler('company')}
                required
              />
              {company.error && <ErrorText>{company.error}</ErrorText>}

              <Input
                name="companyNumber"
                type="text"
                placeholder="사업자등록번호 (예: 1234567890)"
                value={companyNumber.companyNumber}
                onChange={onChangeHandler('companyNumber')}
                required
              />
              {companyNumber.error && (
                <ErrorText>{companyNumber.error}</ErrorText>
              )}
            </>
          )}

          <CheckWrapper>
            <CheckInput
              name="phoneNumber"
              type="text"
              placeholder="전화번호 (숫자만 입력)"
              value={phoneNumber.phoneNumber}
              onChange={onChangeHandler('phoneNumber')}
              required
              disabled={phoneNumber.isValidPhoneNumber}
            />
            {phoneNumber.isValidPhoneNumber ? (
              <SuccessText>전화번호 인증 완료</SuccessText>
            ) : (
              <CheckButton
                type="button"
                onClick={verifyPhoneNumber}
                disabled={!phoneNumber.isRequiredPhoneNumber}
              >
                인증하기
              </CheckButton>
            )}
          </CheckWrapper>
          {phoneNumber.error && <ErrorText>{phoneNumber.error}</ErrorText>}

          {/* 인증번호 입력칸 및 타이머 */}
          {showPhoneConfirm && !phoneNumber.isValidPhoneNumber && (
            <>
              <TimerText>
                인증 유효 시간: {Math.floor(countdown / 60)}:
                {String(countdown % 60).padStart(2, '0')}
              </TimerText>
              <CheckWrapper>
                <CheckInput
                  name="confirmPhone"
                  type="text"
                  placeholder="전화번호 인증코드 입력"
                  value={confirmPhone.confirmPhone}
                  onChange={onChangeHandler('confirmPhone')}
                  required
                />
                <CheckButton
                  type="button"
                  onClick={confirmPhoneVerificationCode}
                >
                  인증확인
                </CheckButton>
              </CheckWrapper>
            </>
          )}

          <EmailWrapper>
            <div className="id-row">
              <CheckInput
                type="text"
                placeholder="이메일 아이디"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                required
                disabled={email.isValidEmail}
              />
              <AtSymbol>@</AtSymbol>
            </div>
            <div className="domain-row">
              <DomainSelect
                value={isCustomDomain ? 'custom' : emailDomain}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'custom') {
                    setIsCustomDomain(true);
                    setEmailDomain('');
                    setCustomDomain('');
                  } else {
                    setIsCustomDomain(false);
                    setEmailDomain(value);
                    setCustomDomain(''); // <- 혹시 모를 이전 값 초기화
                  }
                }}
                disabled={email.isValidEmail}
              >
                <option value="">도메인 선택</option>
                <option value="gmail.com">gmail.com</option>
                <option value="naver.com">naver.com</option>
                <option value="daum.net">daum.net</option>
                <option value="nate.com">nate.com</option>
                <option value="kakao.com">kakao.com</option>
                <option value="custom">직접입력</option>
              </DomainSelect>

              {/* 인증 버튼 또는 완료 메시지 */}
              {email.isValidEmail ? (
                <SuccessTextInRow>이메일 인증 완료</SuccessTextInRow>
              ) : (
                <CheckButton
                  type="button"
                  onClick={verifyEmail}
                  disabled={!emailId}
                >
                  인증하기
                </CheckButton>
              )}
            </div>
          </EmailWrapper>
          {email.error && <ErrorText>{email.error}</ErrorText>}

          {/* 직접입력란 추가 표시 (선택된 경우만!) */}
          {isCustomDomain && (
            <CheckWrapper>
              <CheckInput
                type="text"
                placeholder="직접 도메인 입력 (예: example.com)"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                disabled={email.isValidEmail}
              />
            </CheckWrapper>
          )}

          {showEmailConfirm && (
            <>
              <TimerText>
                인증 유효 시간: {Math.floor(emailCountdown / 60)}:
                {String(emailCountdown % 60).padStart(2, '0')}
              </TimerText>
              <CheckWrapper>
                <CheckInput
                  name="confirmEmail"
                  type="text"
                  placeholder="이메일 인증코드 입력"
                  value={confirmEmail.confirmEmail}
                  onChange={onChangeHandler('confirmEmail')}
                  required
                />
                <CheckButton
                  type="button"
                  onClick={confirmEmailVerificationCode}
                >
                  인증확인
                </CheckButton>
              </CheckWrapper>
            </>
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => theme.colors.gray[50]};
  padding: 40px 20px;
`;

const TopBar = styled.div`
  width: 100%;
  max-width: 480px;
  padding: 10px 0 5px 10px;
  display: flex;
  align-items: center;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(105, 111, 148, 0.15);
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  & > div img {
    height: 80px;
    object-fit: contain;

    @media ${({ theme }) => theme.mobile} {
      height: 56px;
    }
  }

  @media ${({ theme }) => theme.mobile} {
    margin-top: 27px;
  }
`;

const SignupBox = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 32px;
  border-radius: 12px;
  box-sizing: border-box;
  width: 100%;
  max-width: 500px;
  margin-top: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};

  @media ${({ theme }) => theme.mobile} {
    border: none;
    box-shadow: none;
    margin-top: 0px;
    background: ${({ theme }) => theme.colors.gray[50]};
  }
`;

const TabHeader = styled.div`
  display: flex;
  margin-bottom: 24px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 12px 0;
  background: ${({ active, theme }) =>
    active ? theme.colors.white : theme.colors.gray[300]};
  border: none;
  border-bottom: ${({ active, theme }) =>
    active
      ? `2px solid ${theme.colors.secondary}`
      : `1px solid ${theme.colors.gray[300]}`};
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
  color: ${({ active, theme }) =>
    active ? theme.colors.gray[900] : theme.colors.gray[600]};
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: all 0.2s ease;

  @media ${({ theme }) => theme.mobile} {
    background: ${({ theme }) => theme.colors.gray[50]};
    border-radius: 0;
    border-bottom: ${({ active, theme }) =>
      active
        ? `3px solid ${theme.colors.secondary}`
        : `1px solid ${theme.colors.gray[300]}`};
  }
`;

const Input = styled.input`
  width: 100%;
  min-width: 0;
  min-height: 44px;
  box-sizing: border-box;
  padding: 12px;
  margin-bottom: 16px;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
  font-size: 16px;
  background: transparent;

  &:focus {
    outline: none;
    border-bottom: 2px solid ${({ theme }) => theme.colors.secondary};
  }
`;

const SuccessText = styled.p`
  color: ${({ theme }) => theme.colors.success};
  font-size: 12px;
  margin-top: -12px;
  margin-bottom: 12px;
  word-break: keep-all;
  white-space: pre-line;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 12px;
  margin-top: -12px;
  margin-bottom: 12px;
  word-break: keep-all;
  white-space: pre-line;
`;

const CheckWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  min-width: 0;
  gap: 8px;
`;

const CheckInput = styled(Input)`
  margin-bottom: 0;
  flex: 1;
  min-width: 0;
`;

const CheckButton = styled.button`
  min-width: 80px;
  height: 44px;
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  padding: 0 16px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.gray[500]};
    cursor: not-allowed;
  }
`;

const TimerText = styled.p`
  font-size: 12px;
  text-align: right;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: 8px;
  white-space: nowrap;
`;

const EmailWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;

  .id-row,
  .domain-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .id-row {
    flex: 1;
  }

  @media ${({ theme }) => theme.mobile} {
    flex-direction: column;
    align-items: flex-start;

    .id-row,
    .domain-row {
      width: 100%;
    }

    .domain-row {
      margin-top: 4px;
    }

    select {
      flex: 1;
      width: auto;
    }

    button {
      flex-shrink: 0;
    }
  }
`;

const AtSymbol = styled.span`
  display: flex;
  align-items: center;
  padding: 0 8px;
  white-space: nowrap;
  user-select: none;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[700]};
  flex-shrink: 0;
`;

const DomainSelect = styled.select`
  height: 44px;
  font-size: 14px;
  border-radius: 6px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  width: 140px;
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.colors.white};

  @media ${({ theme }) => theme.mobile} {
    width: 110px;
    padding: 0 8px;
  }
`;

const SuccessTextInRow = styled(SuccessText)`
  margin: 0;
  display: flex;
  align-items: center;
  white-space: nowrap;
`;

const JoinButton = styled.button`
  margin-top: 16px;
  width: 100%;
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  padding: 14px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  box-sizing: border-box;
  font-weight: bold;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;
