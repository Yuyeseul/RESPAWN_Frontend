import React from 'react';
import styled from 'styled-components';
import Logo from '../common/Logo';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const SellerHeader = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      alert('로그아웃 완료');
      navigate('/');
    } catch (error) {
      console.error('로그아웃 에러:', error);
    }
  };

  return (
    <HeaderContainer>
      <TopBar>
        <TopMenu>
          <Left>
            <Logo />
          </Left>
          <Right>
            <span>{user?.name}님</span>
            <span onClick={handleLogout} style={{ cursor: 'pointer' }}>
              로그아웃
            </span>
            <span>고객센터</span>
          </Right>
        </TopMenu>
      </TopBar>
    </HeaderContainer>
  );
};

export default SellerHeader;

const HeaderContainer = styled.header`
  width: 100%;
  border-bottom: 1px solid #eee;
`;

const TopBar = styled.div`
  padding: 8px 20px;
  border-bottom: 1px solid #ddd;
`;

const TopMenu = styled.div`
  display: flex;
  justify-content: space-between; // 변경
  align-items: center;
  font-size: 13px;
  color: #666;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;
