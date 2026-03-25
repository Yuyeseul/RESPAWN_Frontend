import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Logo from '../common/Logo';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = (e) => {
  const [failCount, setFailCount] = useState(0);
  const [user, setUser] = useState({
    username: '',
    password: '',
  });
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
      const data = response.data; // 서버에서 받은 유저 정보
      // ⭐️ 권한 체크 로직 추가
      // role 값이 'ROLE_ADMIN'이 아니면 로그인을 무산시킵니다.
      if (data.role !== 'ROLE_ADMIN') {
        alert('접근 권한이 없는 계정입니다.\n관리자 계정으로 로그인해주세요.');
        try {
          await axios.post('/logout');
        } catch (logoutError) {
          console.error('강제 로그아웃 중 오류 발생:', logoutError);
        }

        // 세션 스토리지 비우기 및 메인 이동
        sessionStorage.clear();
        navigate('/adminlogin');
        return;
      }

      console.log('로그인 성공', response.data);

      sessionStorage.setItem('userData', JSON.stringify(response.data));
      setFailCount(0);
      navigate('/admin/members');
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
            '비밀번호 5회 불일치로 계정이 잠겼습니다. 관리자에게 문의하세요. ',
          );
        } else if (errorCode === 'invalid_credentials') {
          // 비밀번호/아이디 불일치 안내
          alert(
            `아이디 또는 비밀번호가 올바르지 않습니다.(${
              failedLoginAttempts || 0
            }회 실패)`,
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
    function handleMessage(event) {
      if (event.data?.type === 'LOGIN_SUCCESS') {
        console.log('로그인 성공');
        navigate('/');
      }
    }
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [navigate]);

  return (
    <Container>
      <LogoWrapper>
        <Logo />
      </LogoWrapper>
      <LogInBox>
        <Title>관리자 로그인</Title>
        <form onSubmit={handleLogIn}>
          <Field>
            <Input
              type="text"
              name="username"
              placeholder="아이디"
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
      </LogInBox>
    </Container>
  );
};

export default Login;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fafafa;
  padding: 40px 20px;
`;

const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  & > div img {
    height: 80px;
    object-fit: contain;
  }
`;

const LogInBox = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  margin-top: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #333;
  text-align: center;
`;

const Field = styled.div`
  position: relative;
  width: 300px;
  margin-bottom: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 40px 12px 12px;
  border: none;
  border-bottom: 1px solid #ccc;
  font-size: 16px;
  background: transparent;

  &:focus {
    outline: none;
    border-bottom: 2px solid rgb(105, 111, 148);
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
  color: #666;
  font-size: 1.1rem;

  &:hover {
    color: rgb(105, 111, 148);
  }
`;

const Button = styled.button`
  width: 100%;
  background: rgb(105, 111, 148);
  color: white;
  padding: 14px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background: rgb(85, 90, 130);
  }
`;

const Message = styled.p`
  color: red;
  font-size: 14px;
  margin-top: 8px;
  text-align: center;
`;

const FailCountMessage = styled.p`
  color: #d93025; /* 빨간색 */
  font-size: 14px;
  margin-top: 4px;
  text-align: center;
  font-weight: 600;
`;
