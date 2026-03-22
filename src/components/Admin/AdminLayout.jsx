import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { useAuth } from '../../AuthContext';

function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isCheck, setIsCheck] = useState(false);

  useEffect(() => {
    const userData = sessionStorage.getItem('userData');

    // 1. 로그인 여부 확인
    if (!userData) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login', { replace: true });
      return;
    }

    // 2. 관리자 권한 확인 (추가된 로직)
    const user = JSON.parse(userData);
    if (user.role !== 'ROLE_ADMIN') {
      alert('관리자 권한이 없습니다.');

      // 일반 유저라면 세션을 비우고 메인으로 보냅니다.
      // (보안을 위해 로그아웃 처리까지 연동하면 더 좋습니다)
      sessionStorage.removeItem('userData');
      navigate('/', { replace: true });
      return;
    }

    // 모든 조건 통과 시 화면 렌더링 허용
    setIsCheck(true);
  }, [navigate]);

  const titleMap = {
    '/admin/members': '회원 관리',
    '/admin/notices': '공지',
  };
  const headerTitle = titleMap[pathname] || '관리자';

  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      try {
        await logout();
        navigate('/adminLogin');
      } catch (error) {
        console.error('로그아웃 에러:', error);
      }
    }
  };

  if (!isCheck) return null;

  return (
    <>
      <Global />
      <Container>
        <Sidebar>
          <Logo>RESPAWN Admin</Logo>
          <Nav>
            <NavItem to="/admin/members">회원 관리</NavItem>
            <NavItem to="/admin/notices">공지</NavItem>
          </Nav>
          <SideFooter>RESPAWN</SideFooter>
        </Sidebar>

        <Main>
          <Header>
            <Title>{headerTitle}</Title>
            <HeaderRight>
              <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
            </HeaderRight>
          </Header>

          <Content>
            <Outlet />
          </Content>
        </Main>
      </Container>
    </>
  );
}

export default AdminLayout;

const colors = {
  pageBg: '#F5F7FA',
  sidebarBg: '#EEF2F7',
  card: '#FFFFFF',
  cardAlt: '#F9FAFC',
  border: 'rgba(15, 23, 42, 0.08)',
  text: '#0F172A',
  textMute: '#6B7280',
  accent: '#25324D',
  accentBorder: 'rgba(37, 50, 77, 0.5)',
  success: '#166534',
  danger: '#9F1239',
};

const Global = createGlobalStyle`
  * { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    margin: 0;
    background: ${colors.pageBg};
    color: ${colors.text};
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans KR", sans-serif;
  }
`;

const Container = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.aside`
  width: 248px;
  background: ${colors.sidebarBg};
  border-right: 1px solid ${colors.border};
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  color: ${colors.accent};
  padding: 8px 8px 16px;
  border-bottom: 1px dashed ${colors.border};
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
`;

const StyledNavLink = styled(NavLink)`
  all: unset;
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${colors.textMute};
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: 160ms ease;

  &:hover {
    background: ${colors.cardAlt};
    color: ${colors.text};
  }

  &.active {
    background: linear-gradient(
      180deg,
      rgba(37, 50, 77, 0.08),
      rgba(37, 50, 77, 0.04)
    );
    border: 1px solid ${colors.accentBorder};
    color: ${colors.accent};
  }
`;

function NavItem({ to, end, children }) {
  return (
    <StyledNavLink
      to={to}
      end={end}
      className={({ isActive }) => (isActive ? 'active' : undefined)}
    >
      {children}
    </StyledNavLink>
  );
}

const SideFooter = styled.div`
  margin-top: auto;
  font-size: 12px;
  color: ${colors.textMute};
  padding: 10px 12px;
  border-top: 1px dashed ${colors.border};
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${colors.border};
  background: #ffffffaa;
  backdrop-filter: saturate(1.2) blur(2px);
`;

const Title = styled.h1`
  font-size: 18px;
  margin: 0;
  letter-spacing: 0.2px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const LogoutButton = styled.button`
  background: none;
  border: 1px solid ${colors.border};
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  color: ${colors.textMute};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${colors.danger};
    color: white;
    border-color: ${colors.danger};
  }
`;

const Content = styled.div`
  padding: 20px;
  overflow: auto;
`;
