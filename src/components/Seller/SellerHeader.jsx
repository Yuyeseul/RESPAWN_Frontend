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
            <MenuButton onClick={handleLogout}>로그아웃</MenuButton>
            <MenuButton onClick={() => navigate('/customerCenter')}>
              고객센터
            </MenuButton>
          </Right>
        </TopMenu>
      </TopBar>
    </HeaderContainer>
  );
};

export default SellerHeader;

const HeaderContainer = styled.header`
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const TopBar = styled.div`
  padding: 8px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};

  @media ${({ theme }) => theme.mobile} {
    padding: 8px 12px;
  }
`;

const TopMenu = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[600]};

  @media ${({ theme }) => theme.mobile} {
    font-size: 12px;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media ${({ theme }) => theme.mobile} {
    gap: 12px;
  }
`;

const MenuButton = styled.span`
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;
