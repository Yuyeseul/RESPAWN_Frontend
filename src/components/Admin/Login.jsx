import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Logo from '../common/Logo';
import { FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';

const Login = (e) => {
  const [failCount, setFailCount] = useState(0);
  const [user, setUser] = useState({
    username: '',
    password: '',
  });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const [seePassword, setSeePassword] = useState(false);

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

  const showModal = (message, onClose = null) => {
    setModalConfig({ isOpen: true, message, onClose });
  };

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
      const data = response.data;

      if (data.role !== 'ROLE_ADMIN') {
        try {
          await axios.post('/logout');
        } catch (logoutError) {
          console.error('강제 로그아웃 중 오류 발생:', logoutError);
        }

        sessionStorage.clear();
        showModal(
          '접근 권한이 없는 계정입니다.\n관리자 계정으로 로그인해주세요.',
          () => {
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
      <UserLoginLink onClick={() => navigate('/login')}>
        <FaUser /> 일반 로그인
      </UserLoginLink>

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

      {modalConfig.isOpen && (
        <ModalOverlay onClick={closeModal}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalMessage>
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

// === 스타일 영역 ===

const UserLoginLink = styled.div`
  position: absolute;
  top: 24px;
  right: 32px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme: { colors } }) => colors.gray[600]};
  background: ${({ theme: { colors } }) => colors.white};
  border: 1px solid ${({ theme: { colors } }) => colors.gray[300]};
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  svg {
    font-size: 14px;
  }

  &:hover {
    color: ${({ theme: { colors } }) => colors.secondary};
    border-color: ${({ theme: { colors } }) => colors.secondary};
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  @media ${({ theme }) => theme.mobile} {
    top: 16px;
    right: 16px;
    padding: 6px 12px;
    font-size: 12px;

    svg {
      font-size: 12px;
    }
  }
`;

const Container = styled.div`
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${({ theme: { colors } }) => colors.gray[50]};
  padding: 40px 20px;

  @media ${({ theme }) => theme.mobile} {
    justify-content: flex-start;
    padding-top: 120px;
    background: ${({ theme: { colors } }) => colors.white};
  }
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
  background: ${({ theme: { colors } }) => colors.white};
  padding: 40px;
  border-radius: 12px;
  width: 100%;
  max-width: 440px; /* 조금 더 타이트하게 잡아 모던함 강조 */
  margin-top: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* 은은한 그림자 */
  border: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
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
    padding: 32px 16px;
    margin-top: 24px;
    border: none;
    box-shadow: none;
  }
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 24px;
  color: ${({ theme: { colors } }) => colors.gray[800]};
  text-align: center;

  @media ${({ theme }) => theme.mobile} {
    font-size: 18px;
    margin-bottom: 20px;
  }
`;

const Field = styled.div`
  position: relative;
  width: 100%; /* 고정값(300px)에서 반응형으로 변경 */
  max-width: 320px;
  margin-bottom: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 40px 12px 12px;
  border: none;
  border-bottom: 1px solid ${({ theme: { colors } }) => colors.gray[300]};
  font-size: 16px;
  background: transparent;
  color: ${({ theme: { colors } }) => colors.gray[800]};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-bottom: 2px solid ${({ theme: { colors } }) => colors.secondary};
  }

  &::placeholder {
    color: ${({ theme: { colors } }) => colors.gray[400]};
  }

  @media ${({ theme }) => theme.mobile} {
    font-size: 15px;
    padding: 10px 36px 10px 10px;
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
  color: ${({ theme: { colors } }) => colors.gray[500]};
  font-size: 1.1rem;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme: { colors } }) => colors.secondary};
  }

  @media ${({ theme }) => theme.mobile} {
    font-size: 1rem;
  }
`;

const Button = styled.button`
  width: 100%;
  max-width: 320px; /* Field와 동일한 크기로 매칭 */
  background: ${({ theme: { colors } }) => colors.secondary};
  color: ${({ theme: { colors } }) => colors.white};
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 16px;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme: { colors } }) => colors.primary};
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 12px;
    font-size: 15px;
    margin-top: 12px;
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
  background: ${({ theme: { colors } }) => colors.overlay || 'rgba(0,0,0,0.5)'};
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

  @media ${({ theme }) => theme.mobile} {
    min-width: 280px;
    padding: 24px 20px;
  }
`;

const ModalMessage = styled.div`
  font-size: 16px;
  color: ${({ theme: { colors } }) => colors.gray[800]};
  margin-bottom: 24px;
  line-height: 1.6;
  font-weight: 500;

  @media ${({ theme }) => theme.mobile} {
    font-size: 15px;
  }
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

  @media ${({ theme }) => theme.mobile} {
    padding: 8px 24px;
    font-size: 14px;
  }
`;
