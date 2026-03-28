import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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
          // 계정 잠김 안내
          alert('계정이 만료되었습니다. 관리자에게 문의하세요.');
        } else if (errorCode === 'locked') {
          // 계정 잠김 안내
          alert(
            '비밀번호 5회 불일치로 계정이 잠겼습니다. 관리자에게 문의하세요. '
          );
        } else if (errorCode === 'invalid_credentials') {
          // 비밀번호/아이디 불일치 안내
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
    }
  };

  useEffect(() => {
    // 팝업창에서 보내준 메시지 처리
    const handleMessage = async (event) => {
      const data = event.data || {};
      // origin 검증(권장): 동일 오리진만 허용
      // if (event.origin !== 'http://localhost:3000') return;

      // 1) 소셜 로그인 성공
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

      // 2) 소셜 로그인 실패 (서버 failure handler에서 postMessage로 전달)
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
          // 필요 시 UI 상태 초기화
          // setMsg('소셜 로그인 실패'); // 선택
          // navigate('/'); // 필요 시 라우팅
        } finally {
          setPopup(null); // 팝업 상태 정리
        }
        return;
      }
    };

    // 다른 탭에서 로그인/로그아웃이 일어났을 때
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

  // 팝업창 닫힘 감지용 effect
  useEffect(() => {
    if (!popup) return;

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setPopup(null);
        // 팝업이 닫혔을 때 로그인이 안 됐으면 (서버에서 상태 확인이 안 된 상태) 현재 로그인 화면 유지하거나 알림 띄우는 등 처리 가능
        // 여기선 아무 처리 안 함 (선택적)
      }
    }, 500);

    return () => clearInterval(timer);
  }, [popup]);

  const handleSocialLogin = (provider) => {
    const win = window.open(
      `http://${BASE_URL}/oauth2/authorization/${provider}`,
      '_blank',
      'width=600,height=700,resizable=yes,scrollbars=yes'
    );
    if (!win) {
      alert(
        '팝업이 차단되어 새 창을 열 수 없습니다. 팝업 차단을 해제해주세요.'
      );
      return;
    }
    setPopup(win); // 팝업 레퍼런스 저장 (닫힘 감지 useEffect가 동작하도록)
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
              autocomplete="username"
              value={user.username}
              onChange={handleChange}
              required
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

          {msg && <Message>{msg}</Message>}
          {failCount > 0 && (
            <FailCountMessage>
              로그인 실패 횟수: {failCount}회 (5회 실패 시 계정이 잠깁니다)
            </FailCountMessage>
          )}
          <Button type="submit">로그인</Button>
        </form>
        <LWrap>
          <LLink href="/signup">회원가입</LLink>
          <LLink href="/findid">아이디 찾기</LLink>
          <LLink href="/findpw">비밀번호 찾기</LLink>
        </LWrap>

        <SocialButton onClick={() => handleSocialLogin('google')}>
          <img src={google_icon} alt="google" />
        </SocialButton>

        <SocialButton onClick={() => handleSocialLogin('kakao')}>
          <img src={kakao_icon} alt="kakao" />
        </SocialButton>

        <SocialButton onClick={() => handleSocialLogin('naver')}>
          <img src={naver_icon} alt="naver" />
        </SocialButton>
      </LogInBox>
    </Container>
  );
};

export default LoginPage;

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

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
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

  &:hover img {
    transform: scale(1.03);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const FailCountMessage = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
  margin-top: 4px;
  text-align: center;
  font-weight: 600;
`;
