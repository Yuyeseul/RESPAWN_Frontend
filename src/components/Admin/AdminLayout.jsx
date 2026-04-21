import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { useAuth } from '../../AuthContext';
// ⭐️ 이쁜 UI를 위해 아이콘 추가
import { FaUsers, FaBullhorn, FaSignOutAlt } from 'react-icons/fa';

function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isCheck, setIsCheck] = useState(false);

  useEffect(() => {
    const userData = sessionStorage.getItem('userData');

    if (!userData) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login', { replace: true });
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'ROLE_ADMIN') {
      alert('관리자 권한이 없습니다.');
      sessionStorage.removeItem('userData');
      navigate('/', { replace: true });
      return;
    }

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
            <NavItem to="/admin/members">
              <FaUsers />
              <span>회원 관리</span>
            </NavItem>
            <NavItem to="/admin/notices">
              <FaBullhorn />
              <span>공지</span>
            </NavItem>
          </Nav>
          <SideFooter>RESPAWN TEAM</SideFooter>
        </Sidebar>

        <Main>
          <Header>
            <HeaderLeft>
              <MobileLogo>RESPAWN</MobileLogo>
              <Title>{headerTitle}</Title>
            </HeaderLeft>
            <HeaderRight>
              <LogoutButton onClick={handleLogout}>
                <FaSignOutAlt />
                <span>로그아웃</span>
              </LogoutButton>
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

// === ⭐️ 테마 연동 및 반응형 스타일 영역 ===

const Global = createGlobalStyle`
  * { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    margin: 0;
    /* 테마의 배경색과 글자색 적용 */
    background: ${({ theme: { colors } }) => colors.gray[50]};
    color: ${({ theme: { colors } }) => colors.gray[900]};
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans KR", sans-serif;
  }
`;

const Container = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.aside`
  width: 248px;
  background: ${({ theme: { colors } }) => colors.white};
  border-right: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 100;

  /* ⭐️ 모바일: 하단 네비게이션(Bottom Nav) 바 형태로 변신 */
  @media ${({ theme }) => theme.mobile} {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 64px;
    flex-direction: row;
    padding: 0;
    border-right: none;
    border-top: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme: { colors } }) => colors.secondary};
  padding: 8px 8px 24px;
  border-bottom: 1px dashed ${({ theme: { colors } }) => colors.gray[200]};

  @media ${({ theme }) => theme.mobile} {
    display: none; /* 모바일 하단바에서는 로고 숨김 */
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;

  @media ${({ theme }) => theme.mobile} {
    flex-direction: row;
    margin: 0;
    width: 100%;
    justify-content: space-around;
    align-items: center;
  }
`;

const StyledNavLink = styled(NavLink)`
  all: unset;
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${({ theme: { colors } }) => colors.gray[600]};
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  svg {
    font-size: 18px;
  }

  &:hover {
    background: ${({ theme: { colors } }) => colors.gray[100]};
    color: ${({ theme: { colors } }) => colors.gray[900]};
  }

  &.active {
    background: ${({ theme: { colors } }) => colors.primary_light};
    color: ${({ theme: { colors } }) => colors.secondary};
    font-weight: 700;
  }

  /* ⭐️ 모바일 하단 탭 버튼 스타일 */
  @media ${({ theme }) => theme.mobile} {
    flex: 1;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    padding: 8px 0;
    border-radius: 0;
    font-size: 11px;

    svg {
      font-size: 22px;
    }

    &:hover {
      background: transparent;
      color: ${({ theme: { colors } }) => colors.secondary};
    }

    &.active {
      background: transparent;
      color: ${({ theme: { colors } }) => colors.secondary};
      border-top: 2px solid ${({ theme: { colors } }) => colors.secondary};
    }
  }
`;

// NavItem 컴포넌트를 좀 더 쓰기 편하게 리팩토링
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
  font-weight: 600;
  color: ${({ theme: { colors } }) => colors.gray[400]};
  padding: 16px 12px 0;
  border-top: 1px dashed ${({ theme: { colors } }) => colors.gray[200]};

  @media ${({ theme }) => theme.mobile} {
    display: none;
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media ${({ theme }) => theme.mobile} {
    padding-bottom: 64px; /* 하단 네비게이션 바 높이만큼 여백 확보 */
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: ${({ theme: { colors } }) => colors.white};
  border-bottom: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
  z-index: 10;

  @media ${({ theme }) => theme.mobile} {
    padding: 12px 16px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MobileLogo = styled.div`
  display: none;
  font-weight: 800;
  color: ${({ theme: { colors } }) => colors.secondary};
  font-size: 16px;

  /* 모바일에서는 사이드바 로고가 사라지므로 헤더에 노출 */
  @media ${({ theme }) => theme.mobile} {
    display: block;
  }
`;

const Title = styled.h1`
  font-size: 18px;
  margin: 0;
  font-weight: 700;
  color: ${({ theme: { colors } }) => colors.gray[800]};

  @media ${({ theme }) => theme.mobile} {
    font-size: 15px;
    color: ${({ theme: { colors } }) => colors.gray[600]};
    border-left: 1px solid ${({ theme: { colors } }) => colors.gray[300]};
    padding-left: 12px;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid ${({ theme: { colors } }) => colors.gray[300]};
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme: { colors } }) => colors.gray[600]};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme: { colors } }) => colors.danger_bg};
    color: ${({ theme: { colors } }) => colors.danger};
    border-color: ${({ theme: { colors } }) => colors.danger_border};
  }

  /* 모바일에서는 글자를 숨기고 아이콘만 예쁘게 표시 */
  @media ${({ theme }) => theme.mobile} {
    border: none;
    padding: 4px;

    span {
      display: none;
    }

    svg {
      font-size: 20px;
      color: ${({ theme: { colors } }) => colors.gray[550]};
    }

    &:hover {
      background: transparent;
      svg {
        color: ${({ theme: { colors } }) => colors.danger};
      }
    }
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 24px;
  overflow: auto;

  @media ${({ theme }) => theme.mobile} {
    padding: 16px;
  }
`;
