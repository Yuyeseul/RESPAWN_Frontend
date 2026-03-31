import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import axios from '../../api/axios';
import AddressListModal from '../AddressListModal';
import ResetPasswordModal from '../ResetPasswordModal';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../AuthContext';
import MypageLayout from './MypageLayout';

function UserInfo() {
  const { user: authUser } = useAuth();
  const [password, setPassword] = useState('');
  const [seePassword, setSeePassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [user, setUser] = useState({
    name: '',
    username: '',
    email: '',
    phoneNumber: '',
    role: '',
  });

  const [phoneAuth, setPhoneAuth] = useState({
    isAdding: false,
    newPhoneNumber: '',
    isCodeSent: false,
    verificationCode: '',
    isVerified: false,
  });

  const [loading, setLoading] = useState(false);

  // 타이머
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);

  // 주소지입력
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // 비밀번호 재설정 모달
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);

  const seePasswordHandler = () => {
    setSeePassword(!seePassword);
  };

  const handlePasswordCheck = async () => {
    if (!password) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    try {
      const response = await axios.post('/myPage/checkPassword', { password });
      if (response.data.isSuccess) {
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
        setUser(response.data.result);
      } catch (error) {
        console.error('회원 정보 조회 실패', error);
      }
    };

    if (authUser) {
      fetchUserDetails();
    }
  }, [authUser]);

  useEffect(() => {
    if (timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            // 만료 시 인터벌 정리
            clearInterval(intervalRef.current);
            // phoneAuth 통합 상태로 만료 처리
            setPhoneAuth((p) => {
              if (p.isVerified) return p; // 이미 인증완료면 아무것도 하지 않음
              alert('인증 시간이 만료되었습니다. 다시 시도해주세요.');
              return {
                ...p,
                isCodeSent: false,
                verificationCode: '',
                isVerified: false,
              };
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 변경된 타이머 틱마다 이전 인터벌 정리
      return () => {
        clearInterval(intervalRef.current);
      };
    }

    // timer가 0 이하인 상태에서의 정리
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [timer, setPhoneAuth]);

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setTimer(0);
  };

  const handleAddPhoneNumber = () => {
    setPhoneAuth({
      isAdding: true,
      newPhoneNumber: '',
      isCodeSent: false,
      verificationCode: '',
      isVerified: false,
    });
    resetTimer();
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneAuth((prev) => ({ ...prev, newPhoneNumber: e.target.value }));
  };

  // 인증번호 발송 요청
  const sendVerificationCode = async () => {
    if (phoneAuth.newPhoneNumber.trim() === '') {
      alert('전화번호를 입력하세요.');
      return;
    }
    try {
      setLoading(true);
      await axios.post('/verify-phone-number', {
        phoneNumber: phoneAuth.newPhoneNumber,
      });
      setPhoneAuth((prev) => ({ ...prev, isCodeSent: true }));
      setTimer(300);
      alert('인증번호가 발송되었습니다. 메시지를 확인해주세요.');
    } catch (error) {
      console.error('인증번호 발송 실패', error);
      alert('인증번호 발송 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationCodeChange = (e) => {
    setPhoneAuth((prev) => ({ ...prev, verificationCode: e.target.value }));
  };

  // 인증번호 확인
  const verifyCode = async () => {
    if (phoneAuth.verificationCode.trim() === '') {
      alert('인증번호를 입력하세요.');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post('/phone-number/verification-code', {
        code: phoneAuth.verificationCode,
      });
      if (response.data?.isSuccess) {
        setPhoneAuth((prev) => ({ ...prev, isVerified: true }));
        resetTimer();
        alert('전화번호가 성공적으로 인증되었습니다.');
      }
    } catch (error) {
      console.error('인증 실패', error);
      alert('인증번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 인증 완료 후 전화번호 저장
  const handleSavePhoneNumber = async () => {
    if (!phoneAuth.isVerified) {
      alert('전화번호 인증을 먼저 완료하세요.');
      return;
    }
    try {
      setLoading(true);
      await axios.put('/myPage/setPhoneNumber', {
        phoneNumber: phoneAuth.newPhoneNumber,
      });
      alert('전화번호가 추가되었습니다.');
      const response = await axios.get('/user');
      setUser(response.data.result);
      setPhoneAuth({
        isAdding: false,
        newPhoneNumber: '',
        isCodeSent: false,
        verificationCode: '',
        isVerified: false,
      });
      resetTimer();
    } catch (error) {
      console.error('전화번호 추가 실패:', error);
      alert('전화번호 추가 실패');
    } finally {
      setLoading(false);
    }
  };

  // const handleCancelAddPhoneNumber = () => {
  //   setIsAddingPhone(false);
  //   setNewPhoneNumber('');
  //   setVerificationCode('');
  //   setIsCodeSent(false);
  //   setIsVerified(false);
  //   resetTimer();
  // };

  // 시간 형식 변환(분:초)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleOpenAddressModal = () => {
    setIsAddressModalOpen(true);
  };

  const handleCloseAddressModal = () => {
    setIsAddressModalOpen(false);
  };

  const handleOpenResetPasswordModal = () => {
    setIsResetPasswordModalOpen(true);
  };

  const handleCloseResetPasswordModal = () => {
    setIsResetPasswordModalOpen(false);
  };

  if (user.provider === 'local' && !isAuthenticated) {
    return (
      <MypageLayout title="내 정보 확인">
        <Section>
          <UserDetail>
            <Label>아이디</Label>
            <Value>{authUser?.username || '-'}</Value>
            <Input
              type={'text'}
              autoComplete="username"
              value={authUser?.username || '-'}
              style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                border: 0,
              }}
            />
          </UserDetail>
          <UserDetail>
            <Label>비밀번호</Label>
            <Field>
              <Input
                type={seePassword ? 'text' : 'password'}
                placeholder="비밀번호 입력"
                autoComplete="new-password"
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
          </UserDetail>
          <Button onClick={handlePasswordCheck}>확인</Button>
        </Section>
      </MypageLayout>
    );
  }

  return (
    <MypageLayout title="내 정보 관리">
      <Section>
        <UserDetail>
          <Label>이름</Label> <Value>{user.name || '-'}</Value>
        </UserDetail>
        <UserDetail>
          <Label>유저네임</Label> <Value>{user.username || '-'}</Value>
        </UserDetail>
        {user.provider === 'local' && (
          <UserDetail>
            <Label>비밀번호</Label>
            <Button onClick={handleOpenResetPasswordModal}>재설정</Button>
          </UserDetail>
        )}

        {isResetPasswordModalOpen && (
          <ResetPasswordModal onClose={handleCloseResetPasswordModal} />
        )}

        <UserDetail>
          <Label>이메일</Label> <Value>{user.email || '-'}</Value>
        </UserDetail>
        <UserDetail>
          <Label>전화번호</Label>{' '}
          <Value>
            {user.phoneNumber
              ? user.phoneNumber
              : !phoneAuth.isAdding && (
                  <Button
                    onClick={handleAddPhoneNumber}
                    style={{ marginLeft: 0 }}
                  >
                    전화번호 추가하기
                  </Button>
                )}
          </Value>
        </UserDetail>

        {phoneAuth.isAdding && (
          <PhoneInputContainer>
            <Input
              type="text"
              placeholder="전화번호 입력"
              value={phoneAuth.newPhoneNumber}
              onChange={handlePhoneNumberChange}
              disabled={phoneAuth.isCodeSent}
            />
            {!phoneAuth.isCodeSent ? (
              <Button onClick={sendVerificationCode} disabled={loading}>
                {loading ? '발송 중...' : '인증번호 보내기'}
              </Button>
            ) : (
              <>
                <Input
                  type="text"
                  placeholder="인증번호"
                  value={phoneAuth.verificationCode}
                  onChange={handleVerificationCodeChange}
                  disabled={phoneAuth.isVerified}
                />
                <Button
                  onClick={verifyCode}
                  disabled={loading || phoneAuth.isVerified}
                >
                  {loading
                    ? '확인 중...'
                    : phoneAuth.isVerified
                      ? '인증완료'
                      : '인증번호 확인'}
                </Button>
                {!phoneAuth.isVerified && (
                  <TimerText>남은 시간: {formatTime(timer)}</TimerText>
                )}
              </>
            )}
          </PhoneInputContainer>
        )}

        {phoneAuth.isVerified && (
          <Button onClick={handleSavePhoneNumber} disabled={loading}>
            저장
          </Button>
        )}

        <UserDetail>
          <Label>권한</Label>
          <Value>
            {user.role === 'ROLE_SELLER'
              ? '판매자'
              : user.role === 'ROLE_USER'
                ? '구매자'
                : '-'}
          </Value>
        </UserDetail>

        <UserDetail>
          <Label>주소지</Label>
          <Button onClick={handleOpenAddressModal}>설정</Button>
        </UserDetail>
      </Section>
      {isAddressModalOpen && (
        <AddressListModal mode="mypage" onClose={handleCloseAddressModal} />
      )}
    </MypageLayout>
  );
}

export default UserInfo;

const Section = styled.section`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 8px;
`;

const UserDetail = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray[700]};
  margin: 12px 0 5px 0;
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
`;

const Label = styled.div`
  flex: 0 0 150px;
  background-color: ${({ theme }) => theme.colors.gray[100]};
  padding: 10px 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[700]};
  border-right: 1px solid ${({ theme }) => theme.colors.gray[300]};
  box-sizing: border-box;
  text-align: left;
  display: flex;
  align-items: center;

  @media ${({ theme }) => theme.mobile} {
    flex: 0 0 80px;
    padding: 10px 8px;
    font-size: 14px;
    word-break: keep-all;
  }
`;

const Value = styled.div`
  flex: 1;
  padding: 10px 16px;
  color: ${({ theme }) => theme.colors.gray[700]};
  flex-wrap: wrap;
  align-items: center;
  flex-wrap: wrap;

  @media ${({ theme }) => theme.mobile} {
    padding: 8px 10px;
    font-size: 14px;
  }
`;

const Input = styled.input`
  flex: 1;
  width: 100%;
  padding: 8px 40px 8px 12px;
  font-size: 16px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 4px;
  min-width: 0;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.gray[800]};
  }
`;

const Field = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const IconButton = styled.button`
  position: absolute;
  right: 8px;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.gray[600]};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.gray[800]};
  }
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.gray[300]};
    outline-offset: 2px;
    border-radius: 4px;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.gray[800]};
  color: ${({ theme }) => theme.colors.white};
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  margin-left: 5px;
  min-width: 100px;
  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray[300]};
    cursor: not-allowed;
  }
`;

const PhoneInputContainer = styled.div`
  display: flex;
  flex-direction: column; /* 기본적으로 세로로 쌓기 (모바일 우선) */
  gap: 10px;
  width: 100%;
  padding: 10px 0;

  /* PC 환경 (화면이 넓을 때) */
  @media (min-width: 768px) {
    flex-direction: row; /* 가로로 나열 */
    flex-wrap: wrap;
    align-items: center;
  }
`;

const TimerText = styled.p`
  color: ${({ theme }) => theme.colors.red};
  margin-left: 12px;
  font-size: 16px;
  font-weight: bold;

  @media ${({ theme }) => theme.mobile} {
    text-align: right;
  }
`;
