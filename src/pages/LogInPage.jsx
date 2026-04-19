import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components'; // keyframes 추가
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Logo from '../components/common/Logo';
import naver_icon from '../assets/login_naver.png';
import google_icon from '../assets/login_google.png';
import kakao_icon from '../assets/login_kakao.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../AuthContext';
import { BASE_URL } from '../api/axios';

const LoginPage = (e) => {
  const { login, fetchUser } = useAuth();
  const [failCount, setFailCount] = useState(0);
  const [user, setUser] = useState({
    username: '',
    password: '',
  });
  const [popup, setPopup] = useState(null);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const [seePassword, setSeePassword] = useState(false);
  // 🔥 로딩 상태를 관리할 state 추가
  const [isLoading, setIsLoading] = useState(false);

  const seePasswordHandler = () => {
    setSeePassword(!seePassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleLogIn = async (e) => {
    e.preventDefault();
    if (!user.username) {
      setMsg('아이디를 입력해주세요.');
      return;
    }
    if (!user.password) {
      setMsg('비밀번호를 입력해주세요.');
      return;
    }

    // 🔥 로그인 요청 시작 시 로딩 상태를 true로 변경
    setIsLoading(true);
    setMsg(''); // 기존 메시지 초기화

    try {
      const formData = new FormData();
      formData.append('username', user.username);
      formData.append('password', user.password);

      const response = await axios.post('/loginProc', formData);
      await fetchUser();
      console.log('일반 로그인 성공', response.data);

      setFailCount(0);

      if (
        response.data.passwordChangeDue &&
        !response.data.passwordChangeSnoozed
      ) {
        navigate('/update-password');
      } else {
        navigate('/');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const { error: errorCode, failedLoginAttempts } = error.response.data;

        if (failedLoginAttempts !== undefined) {
          setFailCount(failedLoginAttempts);
        }

        if (errorCode === 'expired') {
          alert('계정이 만료되었습니다. 관리자에게 문의하세요.');
        } else if (errorCode === 'locked') {
          alert(
            '비밀번호 5회 불일치로 계정이 잠겼습니다. 관리자에게 문의하세요. '
          );
        } else if (errorCode === 'invalid_credentials') {
          alert(
            `아이디 또는 비밀번호가 올바르지 않습니다.(${
              failedLoginAttempts || 0
            }회 실패)`
          );
        } else if (errorCode === 'disabled') {
          alert(`정지된 계정입니다. 관리자에게 문의하세요.`);
        } else {
          alert('로그인 실패: ' + JSON.stringify(error.response.data));
        }
      } else {
        alert('서버와 통신 중 오류가 발생했습니다.');
      }
      console.error('Axios error:', error);
    } finally {
      // 🔥 성공하든 실패하든 통신이 끝나면 로딩 상태를 false로 변경
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = async (event) => {
      const data = event.data || {};

      if (data.type === 'LOGIN_SUCCESS') {
        try {
          const res = await axios.get('/loginOk');
          login(res.data);
          console.log('소셜 로그인 성공');
          navigate('/');
        } catch (err) {
          console.error('로그인 세션 확인 실패:', err);
          alert('로그인 상태 확인에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
          setPopup(null);
        }
        return;
      }

      if (data.type === 'OAUTH_FAIL') {
        console.log(data.reason);
        try {
          switch (data.reason) {
            case 'account_conflict':
              alert(
                '이미 다른 소셜 계정과 연결된 이메일입니다. 다른 방법을 선택해 주세요.'
              );
              break;
            default:
              alert('소셜 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
          }
        } finally {
          setPopup(null);
        }
        return;
      }
    };

    const onStorage = async (e) => {
      if (e.key === 'auth:updated') {
        try {
          const res = await axios.get('/loginOk');
          login(res.data);
        } catch {
          sessionStorage.removeItem('userData');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', onStorage);
    };
  }, [navigate, login]);

  useEffect(() => {
    if (!popup) return;

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setPopup(null);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [popup]);

  const handleSocialLogin = (provider) => {
    const win = window.open(
      `${BASE_URL}/oauth2/authorization/${provider}`,
      '_blank',
      'width=600,height=700,resizable=yes,scrollbars=yes'
    );
    if (!win) {
      alert(
        '팝업이 차단되어 새 창을 열 수 없습니다. 팝업 차단을 해제해주세요.'
      );
      return;
    }
    setPopup(win);
  };

  return (
    <Container>
      <LogoWrapper>
        <Logo />
      </LogoWrapper>
      <LogInBox>
        <form onSubmit={handleLogIn}>
          <Field>
            <Input
              type="text"
              name="username"
              placeholder="아이디"
              autoComplete="username"
              value={user.username}
              onChange={handleChange}
              required
              disabled={isLoading} // 로딩 중 입력 방지
            />
          </Field>

          <Field>
            <Input
              type={seePassword ? 'text' : 'password'}
              name="password"
              placeholder="비밀번호"
              autoComplete="current-password"
              value={user.password}
              onChange={handleChange}
              required
              disabled={isLoading} // 로딩 중 입력 방지
            />
            <IconButton
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={seePasswordHandler}
              aria-label="비밀번호 보기 전환"
              disabled={isLoading}
            >
              {seePassword ? <FaEyeSlash /> : <FaEye />}
            </IconButton>
          </Field>

          {msg && <Message>{msg}</Message>}
          {failCount > 0 && (
            <FailCountMessage>
              로그인 실패 횟수: {failCount}회 (5회 실패 시 계정이 잠깁니다)
            </FailCountMessage>
          )}

          {/* 🔥 로딩 상태에 따라 버튼 내용과 비활성화 처리 */}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner /> 로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </Button>
        </form>
        <LWrap>
          <LLink href="/signup">회원가입</LLink>
          <LLink href="/findid">아이디 찾기</LLink>
          <LLink href="/findpw">비밀번호 찾기</LLink>
        </LWrap>

        <SocialButton
          onClick={() => handleSocialLogin('google')}
          disabled={isLoading}
        >
          <img src={google_icon} alt="google" />
        </SocialButton>

        <SocialButton
          onClick={() => handleSocialLogin('kakao')}
          disabled={isLoading}
        >
          <img src={kakao_icon} alt="kakao" />
        </SocialButton>

        <SocialButton
          onClick={() => handleSocialLogin('naver')}
          disabled={isLoading}
        >
          <img src={naver_icon} alt="naver" />
        </SocialButton>
      </LogInBox>
    </Container>
  );
};

export default LoginPage;

// --- 스타일 컴포넌트 영역 ---

// 🔥 스피너(로딩) 애니메이션 추가
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: ${spin} 1s linear infinite;
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => theme.colors.gray[50]};
  padding: 40px 20px;
`;

const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  & > div img {
    height: 80px;
    object-fit: contain;
    transition: height 0.2s ease;

    @media ${({ theme }) => theme.mobile} {
      height: 56px;
    }
  }
`;

const LogInBox = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 40px;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  margin-top: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  display: flex;
  flex-direction: column;
  align-items: center;

  form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 24px 16px;
    margin-top: 20px;
    border: none;
    box-shadow: none;
    background: transparent;
  }
`;

const Field = styled.div`
  position: relative;
  width: 100%;
  max-width: 260px;
  margin-bottom: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 40px 12px 12px;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
  font-size: 16px;
  background: transparent;

  &:focus {
    outline: none;
    border-bottom: 2px solid ${({ theme }) => theme.colors.secondary};
  }

  &:disabled {
    background: transparent;
    color: ${({ theme }) => theme.colors.gray[400]};
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
  font-size: 18px;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }

  &:disabled {
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.gray[300]};
  }
`;

const Button = styled.button`
  width: 100%;
  max-width: 260px;
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  padding: 14px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;

  /* 🔥 로딩 아이콘과 텍스트를 나란히 배치하기 위해 Flex 사용 */
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  transition: background 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary};
  }

  /* 🔥 비활성화(로딩 중)일 때 스타일 */
  &:disabled {
    background: ${({ theme }) => theme.colors.gray[400]};
    cursor: not-allowed;
    opacity: 0.8;
  }
`;

const LWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 32px;
  gap: 12px;
  flex-wrap: wrap;
`;

const LLink = styled.a`
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[600]};
  text-decoration: none;
  font-size: 14px;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
    text-decoration: underline;
  }
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
  margin-top: 8px;
  text-align: center;
`;

const SocialButton = styled.button`
  margin-top: 12px;
  width: 100%;
  max-width: 260px;
  height: 48px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  &:hover:not(:disabled) img {
    transform: scale(1.03);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const FailCountMessage = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
  margin-top: 4px;
  text-align: center;
  font-weight: 600;
`;
