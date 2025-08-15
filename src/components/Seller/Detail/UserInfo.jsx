import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from '../../../api/axios';
import ResetPasswordModal from '../../ResetPasswordModal';

function UserInfo() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);

  const userData = JSON.parse(sessionStorage.getItem('userData'));
  const username = userData?.username;

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
      if (response.data === true) {
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
        setUser(response.data);
      } catch (error) {
        console.error('회원 정보 조회 실패', error);
      }
    };

    if (username) {
      fetchUserDetails();
    }
  }, [username]);

  const handleOpenResetPasswordModal = () => {
    setIsResetPasswordModalOpen(true);
  };

  const handleCloseResetPasswordModal = () => {
    setIsResetPasswordModalOpen(false);
  };

  if (user.provider === 'local' && !isAuthenticated) {
    return (
      <Wrapper>
        <Section>
          <SectionTitle>내 정보 확인</SectionTitle>
          <UserDetail>
            <Label>아이디</Label>
            <Value>{userData?.username || '-'}</Value>
          </UserDetail>
          <UserDetail>
            <Label>비밀번호</Label>
            <Input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </UserDetail>
          <Button onClick={handlePasswordCheck}>확인</Button>
        </Section>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Section>
        <SectionTitle>내 정보 관리</SectionTitle>
        <UserDetail>
          <Label>이름</Label> <Value>{user.name || '-'}</Value>
        </UserDetail>
        <UserDetail>
          <Label>유저네임</Label> <Value>{user.username || '-'}</Value>
        </UserDetail>
        <UserDetail>
          <Label>비밀번호</Label>
          <Button onClick={handleOpenResetPasswordModal}>재설정</Button>
        </UserDetail>

        {isResetPasswordModalOpen && (
          <ResetPasswordModal onClose={handleCloseResetPasswordModal} />
        )}

        <UserDetail>
          <Label>이메일</Label> <Value>{user.email || '-'}</Value>
        </UserDetail>
        <UserDetail>
          <Label>전화번호</Label>
          <Value>{user.phoneNumber || '-'}</Value>
        </UserDetail>

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
      </Section>
    </Wrapper>
  );
}

export default UserInfo;

/* 기존 태그 유지 + 색상/느낌 변경 */
const Wrapper = styled.div`
  max-width: 860px;
  font-family: 'Noto Sans KR', sans-serif;
  color: #222;
  margin: 60px auto;
  padding: 0 20px;
`;

const Section = styled.section`
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e6e8f4;
  padding: 20px;
`;

const SectionTitle = styled.h2`
  font-weight: 700;
  font-size: 20px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e6e8f4;
  color: #555a82;
`;

const UserDetail = styled.p`
  font-size: 1rem;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  &:hover {
    background: #f5f7fa;
  }
`;

const Label = styled.div`
  flex: 0 0 150px;
  background-color: #e6e8f4;
  padding: 12px 16px;
  font-weight: 600;
  color: #555a82;
  text-align: left;
  box-sizing: border-box;
`;

const Value = styled.div`
  flex: 1;
  padding: 12px 16px;
  color: #333;
`;

const Button = styled.button`
  background-color: #555a82;
  color: #fff;
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  font-weight: 700;
  cursor: pointer;
  min-width: 100px;
  margin-left: 5px;
  transition: background 0.3s;

  &:hover:enabled {
    background-color: #4a4e70;
  }
  &:disabled {
    background-color: #999;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  flex-grow: 1;
  min-width: 200px;
  padding: 8px 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  &:focus {
    outline: none;
    border-color: #555a82;
  }
`;
