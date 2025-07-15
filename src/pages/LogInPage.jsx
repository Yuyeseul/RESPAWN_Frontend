import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Logo from '../components/Logo';
import naver_icon from '../assets/login_naver.png';
import google_icon from '../assets/login_google.png';
import kakao_icon from '../assets/login_kakao.png';

const LogInPage = (e) => {
  // const [userType, setUserType] = useState('buyer'); // 'buyer' or 'seller'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleLogIn = async () => {
    if (!username) {
      setMsg('아이디를 입력해주세요.');
      return;
    }
    if (!password) {
      setMsg('비밀번호를 입력해주세요.');
      return;
    }

    const formData = {
      username,
      password,
    };

    try {
      const response = await axios.post(
        'http://localhost:8080/login',
        formData,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      console.log('로그인 성공', response.data);
      navigate('/');
    } catch (error) {
      if (error.response) {
        alert(
          '로그인 실패: ' + (error.response.data.message || '알 수 없는 오류')
        );
      } else {
        alert('서버와 통신 중 오류가 발생했습니다.');
      }
      console.error('Axios error:', error);
    }
  };

  return (
    <Container>
      <LogoWrapper>
        <Logo />
      </LogoWrapper>
      <LogInBox>
        {/* <TabHeader>
          <Tab
            active={userType === 'buyer'}
            onClick={() => setUserType('buyer')}
          >
            구매회원 로그인
          </Tab>
          <Tab
            active={userType === 'seller'}
            onClick={() => setUserType('seller')}
          >
            판매회원 로그인
          </Tab>
        </TabHeader> */}

        <form
          onSubmit={(e) => {
            e.preventDefault(); // 폼 기본 제출 막기
            handleLogIn(); // 로그인 로직 실행
          }}
        >
          <Input
            type="text"
            placeholder="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {msg && <Message>{msg}</Message>}
          <Button type="submit">로그인</Button>
        </form>
        <LWrap>
          <LLink href="/signup">회원가입</LLink>
          <LLink href="/findid">아이디 찾기</LLink>
          <LLink href="/findpw">비밀번호 찾기</LLink>
        </LWrap>

        <SocialButton>
          <a href="http://localhost:8080/oauth2/authorization/google">
            <img src={google_icon} alt="google" />
          </a>
        </SocialButton>
        <SocialButton>
          <a href="http://localhost:8080/oauth2/authorization/kakao">
            <img src={kakao_icon} alt="kakao" />
          </a>
        </SocialButton>
        <SocialButton>
          <a href="http://localhost:8080/oauth2/authorization/naver">
            <img src={naver_icon} alt="naver" />
          </a>
        </SocialButton>
      </LogInBox>
    </Container>
  );
};

export default LogInPage;

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

// const TabHeader = styled.div`
//   display: flex;
//   margin-bottom: 24px;
// `;

// const Tab = styled.button`
//   flex: 1;
//   padding: 12px 0;
//   background: ${({ active }) => (active ? '#fff' : '#f1f1f1')};
//   border: none;
//   border-bottom: ${({ active }) =>
//     active ? '2px solid rgb(105, 111, 148);' : '1px solid #ddd'};
//   font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
//   cursor: pointer;
//   border-radius: 8px 8px 0 0;
// `;

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

const LWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  gap: 12px;
  flex-wrap: wrap;
`;

const LLink = styled.a`
  cursor: pointer;
  color: #666;
  text-decoration: none;
  font-size: 14px;

  &:hover {
    color: rgb(105, 111, 148);
    text-decoration: underline;
  }
`;

const Message = styled.p`
  color: red;
  font-size: 14px;
  margin-top: 8px;
  text-align: center;
`;

const SocialButton = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: center;
  width: 100%;

  a {
    display: inline-block;
    width: 240px;
    height: 48px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* ← 이 부분 수정! */
    border-radius: 8px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  img:hover {
    transform: scale(1.03);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;
