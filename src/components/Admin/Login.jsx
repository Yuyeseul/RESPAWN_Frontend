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

  // ⭐️ 예쁜 알람(모달)을 위한 상태 추가
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    message: '',
    onClose: null,
  });

  const seePasswordHandler = () => {
    setSeePassword(!seePassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  // 모달 띄우기 함수
  const showModal = (message, onClose = null) => {
    setModalConfig({ isOpen: true, message, onClose });
  };

  // 모달 닫기 함수
  const closeModal = () => {
    const { onClose } = modalConfig;
    setModalConfig({ isOpen: false, message: '', onClose: null });
    if (onClose) onClose();
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
      formData.append('loginType', 'admin');

      const response = await axios.post('/loginProc', formData);
      const data = response.data; // 서버에서 받은 유저 정보

      // ⭐️ 권한 체크 로직 추가
      if (data.role !== 'ROLE_ADMIN') {
        try {
          await axios.post('/logout');
        } catch (logoutError) {
          console.error('강제 로그아웃 중 오류 발생:', logoutError);
        }

        // 세션 스토리지 비우기 및 알림 띄우기 (alert 대신 showModal 사용)
        sessionStorage.clear();
        showModal(
          '접근 권한이 없는 계정입니다.\n관리자 계정으로 로그인해주세요.',
          () => {
            // 모달을 닫을 때 입력창 초기화
            setUser({ username: '', password: '' });
            navigate('/adminlogin');
          }
        );
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

        // ⭐️ 모든 alert를 showModal로 교체
        if (errorCode === 'expired') {
          showModal('계정이 만료되었습니다. 관리자에게 문의하세요.');
        } else if (errorCode === 'locked') {
          showModal(
            '비밀번호 5회 불일치로 계정이 잠겼습니다.\n관리자에게 문의하세요.'
          );
        } else if (errorCode === 'invalid_credentials') {
          showModal(
            `아이디 또는 비밀번호가 올바르지 않습니다.\n(${failedLoginAttempts || 0}회 실패)`
          );
        } else if (errorCode === 'disabled') {
          showModal(`정지된 계정입니다. 관리자에게 문의하세요.`);
        } else {
          showModal(
            '로그인에 실패했습니다. 아이디 및 비밀번호를 확인해주세요.'
          );
        }
      } else {
        showModal('서버와 통신 중 오류가 발생했습니다.');
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

      {/* ⭐️ 모달 렌더링 영역 */}
      {modalConfig.isOpen && (
        <ModalOverlay onClick={closeModal}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalMessage>
              {/* \n 문자를 <br/> 태그로 변환하여 줄바꿈 처리 */}
              {modalConfig.message.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </ModalMessage>
            <ModalButton onClick={closeModal}>확인</ModalButton>
          </ModalBox>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Login;

// === 스타일 영역 (theme.jsx 적용) ===
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${({ theme: { colors } }) => colors.gray[100]};
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
  background: ${({ theme: { colors } }) => colors.white};
  padding: 40px;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  margin-top: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme: { colors } }) => colors.gray[300]};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 24px;
  color: ${({ theme: { colors } }) => colors.gray[800]};
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
  border-bottom: 1px solid ${({ theme: { colors } }) => colors.gray[400]};
  font-size: 16px;
  background: transparent;

  &:focus {
    outline: none;
    border-bottom: 2px solid ${({ theme: { colors } }) => colors.secondary};
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
  color: ${({ theme: { colors } }) => colors.gray[600]};
  font-size: 1.1rem;

  &:hover {
    color: ${({ theme: { colors } }) => colors.secondary};
  }
`;

const Button = styled.button`
  width: 100%;
  background: ${({ theme: { colors } }) => colors.secondary};
  color: ${({ theme: { colors } }) => colors.white};
  padding: 14px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background: ${({ theme: { colors } }) => colors.primary};
  }
`;

const Message = styled.p`
  color: ${({ theme: { colors } }) => colors.danger};
  font-size: 14px;
  margin-top: 8px;
  text-align: center;
`;

const FailCountMessage = styled.p`
  color: ${({ theme: { colors } }) => colors.danger};
  font-size: 14px;
  margin-top: 4px;
  text-align: center;
  font-weight: 600;
`;

// === 모달 스타일 ===
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme: { colors } }) => colors.overlay};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background: ${({ theme: { colors } }) => colors.white};
  padding: 30px 40px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  text-align: center;
  min-width: 320px;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalMessage = styled.div`
  font-size: 16px;
  color: ${({ theme: { colors } }) => colors.gray[800]};
  margin-bottom: 24px;
  line-height: 1.6;
  font-weight: 500;
`;

const ModalButton = styled.button`
  background: ${({ theme: { colors } }) => colors.secondary};
  color: ${({ theme: { colors } }) => colors.white};
  border: none;
  padding: 10px 28px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme: { colors } }) => colors.primary};
  }
`;
