import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
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
  const [isUserLoading, setIsUserLoading] = useState(true);

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

  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

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
      } finally {
        setIsUserLoading(false);
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
            clearInterval(intervalRef.current);
            setPhoneAuth((p) => {
              if (p.isVerified) return p;
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

      return () => {
        clearInterval(intervalRef.current);
      };
    }

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

  if (isUserLoading) {
    return (
      <MypageLayout title="내 정보 관리">
        <LoadingWrapper>
          <Spinner />
          <LoadingText>회원 정보를 확인 중입니다...</LoadingText>
        </LoadingWrapper>
      </MypageLayout>
    );
  }

  if (user.provider === 'local' && !isAuthenticated) {
    return (
      <MypageLayout title="내 정보 확인">
        <Card>
          <SectionTitle>비밀번호 인증</SectionTitle>

          <InfoRow>
            <Label>아이디</Label>
            <Value>
              <strong>{authUser?.username || '-'}</strong>
              <Input
                type="text"
                autoComplete="username"
                value={authUser?.username || '-'}
                readOnly
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
            </Value>
          </InfoRow>

          <InfoRow>
            <Label>비밀번호</Label>
            <Value>
              <Field>
                <Input
                  type={seePassword ? 'text' : 'password'}
                  placeholder="비밀번호 입력"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePasswordCheck();
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
      </MypageLayout>
    );
  }

  return (
    <MypageLayout title="내 정보 관리">
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

        {user.provider === 'local' && (
          <InfoRow>
            <Label>비밀번호</Label>
            <Value>
              <ResetButton onClick={handleOpenResetPasswordModal}>
                비밀번호 재설정
              </ResetButton>
            </Value>
          </InfoRow>
        )}

        {isResetPasswordModalOpen && (
          <ResetPasswordModal onClose={handleCloseResetPasswordModal} />
        )}

        <InfoRow>
          <Label>이메일</Label>
          <Value>{user.email || '-'}</Value>
        </InfoRow>

        <InfoRow>
          <Label>전화번호</Label>
          <Value
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
              }}
            >
              {user.phoneNumber
                ? user.phoneNumber
                : !phoneAuth.isAdding && (
                    <ResetButton onClick={handleAddPhoneNumber}>
                      전화번호 추가하기
                    </ResetButton>
                  )}
            </div>

            {phoneAuth.isAdding && (
              <PhoneAuthWrapper>
                <InputRow>
                  <Input
                    type="text"
                    placeholder="전화번호 입력"
                    value={phoneAuth.newPhoneNumber}
                    onChange={handlePhoneNumberChange}
                    disabled={phoneAuth.isCodeSent}
                  />
                  {!phoneAuth.isCodeSent && (
                    <SubmitButton
                      type="button"
                      onClick={sendVerificationCode}
                      disabled={loading}
                      style={{ whiteSpace: 'nowrap', padding: '12px 20px' }}
                    >
                      {loading ? '발송 중...' : '인증번호 보내기'}
                    </SubmitButton>
                  )}
                </InputRow>

                {phoneAuth.isCodeSent && (
                  <InputRow>
                    <Input
                      type="text"
                      placeholder="인증번호 입력"
                      value={phoneAuth.verificationCode}
                      onChange={handleVerificationCodeChange}
                      disabled={phoneAuth.isVerified}
                    />
                    <SubmitButton
                      type="button"
                      onClick={verifyCode}
                      disabled={loading || phoneAuth.isVerified}
                      style={{ whiteSpace: 'nowrap', padding: '12px 20px' }}
                    >
                      {loading
                        ? '확인 중...'
                        : phoneAuth.isVerified
                          ? '인증완료'
                          : '인증하기'}
                    </SubmitButton>
                  </InputRow>
                )}

                {!phoneAuth.isVerified && phoneAuth.isCodeSent && (
                  <TimerText>남은 시간: {formatTime(timer)}</TimerText>
                )}

                {phoneAuth.isVerified && (
                  <SubmitButton
                    style={{ width: '100%', marginTop: '4px' }}
                    onClick={handleSavePhoneNumber}
                    disabled={loading}
                  >
                    저장하기
                  </SubmitButton>
                )}
              </PhoneAuthWrapper>
            )}
          </Value>
        </InfoRow>

        <InfoRow>
          <Label>권한</Label>
          <Value>
            <RoleBadge $role={user.role}>
              {user.role === 'ROLE_SELLER'
                ? '판매자'
                : user.role === 'ROLE_USER'
                  ? '구매자'
                  : '-'}
            </RoleBadge>
          </Value>
        </InfoRow>

        <InfoRow>
          <Label>주소지</Label>
          <Value>
            <ResetButton onClick={handleOpenAddressModal}>
              주소 설정
            </ResetButton>
          </Value>
        </InfoRow>
      </Card>

      {isAddressModalOpen && (
        <AddressListModal mode="mypage" onClose={handleCloseAddressModal} />
      )}
    </MypageLayout>
  );
}

export default UserInfo;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  gap: 16px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${({ theme }) => theme.colors.gray[300]};
  border-top-color: ${({ theme }) => theme.colors.secondary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  color: ${({ theme }) => theme.colors.gray[550]};
  font-size: 14px;
  font-weight: 600;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const Card = styled.section`
  border-radius: 16px;
  padding: 32px;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};

  @media ${({ theme }) => theme.mobile} {
    padding: 24px 20px;
    border: none;
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
  color: ${({ theme }) => theme.colors.gray[700]};
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
    color: ${({ theme }) => theme.colors.gray[600]};
  }
`;

const Value = styled.div`
  flex: 1;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[800]};
  display: flex;
  align-items: center;
  word-break: keep-all;

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
  border: 1.5px solid ${({ theme }) => theme.colors.gray[300]};
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
    border-color: ${({ theme }) => theme.colors.gray[800]};
  }
  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.gray[600]};
    cursor: not-allowed;
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
    color: ${({ theme }) => theme.colors.gray[800]};
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
  background-color: ${({ theme }) => theme.colors.gray[800]};
  color: ${({ theme }) => theme.colors.white};
  padding: 14px 32px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[800]};
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray[300]};
    border-color: ${({ theme }) => theme.colors.gray[300]};
    cursor: not-allowed;
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

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.gray[800]};
    border-color: ${({ theme }) => theme.colors.gray[500]};
  }
  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray[50]};
    color: ${({ theme }) => theme.colors.gray[400]};
    cursor: not-allowed;
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
      : props.theme.colors.angel_pink};
  color: ${(props) =>
    props.$role === 'ROLE_SELLER'
      ? props.theme.colors.sky_dark
      : props.theme.colors.wish};
`;

const PhoneAuthWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 400px;
  margin-top: 4px;
`;

const InputRow = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  align-items: center;

  @media ${({ theme }) => theme.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TimerText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 0 4px;

  @media ${({ theme }) => theme.mobile} {
    text-align: right;
  }
`;
