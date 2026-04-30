import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from '../../../api/axios';
import ResetPasswordModal from '../../ResetPasswordModal';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../../AuthContext';

function UserInfo() {
  const { user: authUser } = useAuth();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);

  const [seePassword, setSeePassword] = useState(false);

  const seePasswordHandler = () => {
    setSeePassword(!seePassword);
  };

  const [user, setUser] = useState({
    name: '',
    username: '',
    email: '',
    phoneNumber: '',
    role: '',
  });

  const handlePasswordCheck = async () => {
    if (!password) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    try {
      const response = await axios.post('/myPage/checkPassword', { password });
      console.log(response.data);
      if (response.data.isSuccess === true) {
        setIsAuthenticated(true);
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('비밀번호 확인 실패', error);
      alert('서버 오류로 비밀번호 확인에 실패했습니다.');
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`/user`);
        console.log(response.data);
        setUser(response.data.result);
      } catch (error) {
        console.error('회원 정보 조회 실패', error);
      }
    };

    if (authUser) {
      fetchUserDetails();
    }
  }, [authUser]);

  const handleOpenResetPasswordModal = () => {
    setIsResetPasswordModalOpen(true);
  };

  const handleCloseResetPasswordModal = () => {
    setIsResetPasswordModalOpen(false);
  };

  // --- 1. 비밀번호 확인 (인증 전) 화면 ---
  if (!isAuthenticated) {
    return (
      <Wrapper>
        <Header>
          <Title>내 정보 확인</Title>
          <Subtitle>
            안전한 개인정보 보호를 위해 비밀번호를 다시 한번 입력해주세요.
          </Subtitle>
        </Header>

        <Card>
          <SectionTitle>비밀번호 인증</SectionTitle>

          <InfoRow>
            <Label>아이디</Label>
            <Value>
              <strong>{authUser?.username || '-'}</strong>
            </Value>
          </InfoRow>

          <InfoRow>
            <Label>비밀번호</Label>
            <Value>
              <Field>
                <Input
                  type={seePassword ? 'text' : 'password'}
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handlePasswordCheck();
                    }
                  }}
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
            </Value>
          </InfoRow>

          <ActionContainer>
            <SubmitButton onClick={handlePasswordCheck}>확인</SubmitButton>
          </ActionContainer>
        </Card>
      </Wrapper>
    );
  }

  // --- 2. 내 정보 관리 (인증 후) 화면 ---
  return (
    <Wrapper>
      <Header>
        <Title>내 정보 관리</Title>
        <Subtitle>등록된 회원 정보를 확인하고 관리할 수 있습니다.</Subtitle>
      </Header>

      <Card>
        <SectionTitle>기본 정보</SectionTitle>

        <InfoRow>
          <Label>이름</Label>
          <Value>{user.name || '-'}</Value>
        </InfoRow>

        <InfoRow>
          <Label>아이디</Label>
          <Value>{user.username || '-'}</Value>
        </InfoRow>

        <InfoRow>
          <Label>비밀번호</Label>
          <Value>
            <ResetButton onClick={handleOpenResetPasswordModal}>
              비밀번호 재설정
            </ResetButton>
          </Value>
        </InfoRow>

        {isResetPasswordModalOpen && (
          <ResetPasswordModal onClose={handleCloseResetPasswordModal} />
        )}

        <InfoRow>
          <Label>이메일</Label>
          <Value>{user.email || '-'}</Value>
        </InfoRow>

        <InfoRow>
          <Label>전화번호</Label>
          <Value>{user.phoneNumber || '-'}</Value>
        </InfoRow>

        <InfoRow>
          <Label>권한</Label>
          <Value>
            <RoleBadge $role={user.role}>
              {user.role === 'ROLE_SELLER'
                ? '판매자'
                : user.role === 'ROLE_USER'
                  ? '구매자'
                  : '미정'}
            </RoleBadge>
          </Value>
        </InfoRow>
      </Card>
    </Wrapper>
  );
}

export default UserInfo;

// --- 전면 개편된 스타일 영역 ---

const Wrapper = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 60px auto;
  padding: 0 20px;
  box-sizing: border-box;
  font-family:
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    sans-serif;

  @media ${({ theme }) => theme.mobile} {
    margin: 30px auto;
    padding: 0 16px;
  }
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 26px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;

  @media ${({ theme }) => theme.mobile} {
    font-size: 22px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin: 0;
`;

const Card = styled.section`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid ${({ theme }) => theme.colors.gray[100]};

  @media ${({ theme }) => theme.mobile} {
    padding: 24px 20px;
    border-radius: 12px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 16px;
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: 4px;
  }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: stretch;
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid ${({ theme }) => theme.colors.gray[100]};
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;

  @media ${({ theme }) => theme.mobile} {
    flex-direction: column;
    border: none;
    border-bottom: 1.5px solid ${({ theme }) => theme.colors.gray[100]};
    border-radius: 0;
    padding-bottom: 12px;
  }
`;

const Label = styled.div`
  background: ${({ theme }) => theme.colors.gray[100]};
  color: ${({ theme }) => theme.colors.gray[650]};
  font-weight: 600;
  font-size: 14px;
  width: 140px;
  padding: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  border-right: 1.5px solid ${({ theme }) => theme.colors.gray[100]};

  @media ${({ theme }) => theme.mobile} {
    width: 100%;
    background: transparent;
    border-right: none;
    padding: 12px 0 8px 0;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.gray[500]};
  }
`;

const Value = styled.div`
  flex: 1;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[700]};
  display: flex;
  align-items: center;
  word-break: keep-all;

  strong {
    color: ${({ theme }) => theme.colors.gray[900]};
  }
  @media ${({ theme }) => theme.mobile} {
    padding: 0;
  }
`;

const Field = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 320px;

  @media ${({ theme }) => theme.mobile} {
    max-width: 100%;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 44px 12px 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[800]};
  transition: all 0.2s ease;
  background-color: ${({ theme }) => theme.colors.white};
  box-sizing: border-box;

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[300]};
  }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary_alpha};
  }
`;

const IconButton = styled.button`
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.gray[500]};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.gray[650]};
  }
  &:focus {
    outline: none;
    color: ${({ theme }) => theme.colors.primary};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ActionContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
`;

const SubmitButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: 14px 32px;
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary_dark};
    border-color: ${({ theme }) => theme.colors.primary_dark};
  }
  @media ${({ theme }) => theme.mobile} {
    width: 100%;
  }
`;

const ResetButton = styled.button`
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray[650]};
  padding: 8px 16px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.gray[800]};
    border-color: ${({ theme }) => theme.colors.gray[500]};
  }
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  background-color: ${(props) =>
    props.$role === 'ROLE_SELLER'
      ? props.theme.colors.sky_light
      : props.theme.colors.gray[100]};
  color: ${(props) =>
    props.$role === 'ROLE_SELLER'
      ? props.theme.colors.sky_dark
      : props.theme.colors.gray[650]};
`;
