import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import Logo from './Logo';
import categoryIcon from '../../assets/category_icon.png';
import closeIcon from '../../assets/close_icon.png';
import Search from './Search';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const Header = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);
  const [mobileActiveIdx, setMobileActiveIdx] = useState(null);
  const dropdownRef = useRef(null);
  const sideDrawerRef = useRef(null);

  const categoryGroups = [
    {
      title: '콘솔 / 컨트롤러',
      items: [
        '게임 컨트롤러',
        'umpc',
        '플레이스테이션 액세서리',
        'XBOX 액세서리',
        '닌텐도 스위치',
      ],
    },
    {
      title: '게이밍 PC / 부품',
      items: [
        '그래픽카드',
        'CPU',
        'RAM',
        'SSD / HDD',
        '파워서플라이',
        '메인보드',
      ],
    },
    {
      title: '게이밍 주변기기',
      items: [
        '마우스',
        '키보드',
        '헤드셋',
        '모니터',
        '스피커',
        '마이크',
        '레이싱 휠',
      ],
    },
    {
      title: '게이밍 환경',
      items: [
        '게이밍 체어',
        '게이밍 데스크',
        '노트북 쿨러 / 스탠드',
        'RGB 조명',
        '방음 패드',
      ],
    },
    {
      title: '악세서리 / 기타',
      items: [
        '마우스패드',
        '손목 보호대',
        '케이블 정리 용품',
        '에어 블로워',
        '멀티탭 / 허브',
      ],
    },
  ];

  const menuItems = [
    { name: '모니터', type: 'search' },
    { name: '헤드셋', type: 'search' },
    { name: '키보드', type: 'search' },
    { name: '마우스', type: 'search' },
    { name: '스피커', type: 'search' },
    { name: '신상품', type: 'link', path: '/new-products' },
    { name: '베스트셀러', type: 'link', path: '/best-seller' },
    { name: '브랜드', type: 'link', path: '/brands' },
    { name: '이벤트', type: 'link', path: '/events' },
  ];

  const goToCategory = (name) => {
    navigate(`/search?query=${encodeURIComponent(name)}`);
    setIsOpen(false);
  };

  const handleMenuClick = (item) => {
    if (item.type === 'search') {
      navigate(`/search?query=${encodeURIComponent(item.name)}`);
    } else if (item.type === 'link') {
      navigate(item.path);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      alert('로그아웃 완료');
      navigate('/');
    } catch (error) {
      console.error('로그아웃 에러:', error);
    }
  };

  const toggleCategory = (e) => {
    e.stopPropagation();
    setIsOpen((v) => !v);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setMobileActiveIdx(null);
  };

  const handleMobileCategoryClick = (e, idx) => {
    e.stopPropagation();
    setMobileActiveIdx(mobileActiveIdx === idx ? null : idx);
  };

  const renderUserInfo = (isMobile = false) => {
    if (!user) {
      return isMobile ? (
        <MobileLoginArea>
          <p>로그인이 필요합니다.</p>
          <LoginLink to="/login" onClick={closeMenu}>
            로그인 / 회원가입
          </LoginLink>
        </MobileLoginArea>
      ) : (
        <>
          <TopTextLink to="/login">로그인</TopTextLink>
          <TopTextLink to="/customerCenter">고객센터</TopTextLink>
        </>
      );
    }

    if (isMobile) {
      return (
        <UserActionGroup $isMobile={true}>
          <WelcomeMsg>
            안녕하세요, <strong>{user.name || '사용자'}</strong>님!
          </WelcomeMsg>
          <UserLinks $isMobile={true}>
            {user.role === 'ROLE_USER' && (
              <>
                <Link to="/mypage" onClick={closeMenu}>
                  마이페이지
                </Link>
                <Link to="/cart" onClick={closeMenu}>
                  장바구니
                </Link>
              </>
            )}
            {user.role === 'ROLE_SELLER' && (
              <Link to="/sellerCenter" onClick={closeMenu}>
                판매자센터
              </Link>
            )}
            <button onClick={handleLogout}>로그아웃</button>
          </UserLinks>
        </UserActionGroup>
      );
    }
    return (
      <>
        {user.role === 'ROLE_USER' && (
          <>
            <TopTextLink to="/mypage">마이페이지</TopTextLink>
            <TopTextLink to="/cart">장바구니</TopTextLink>
          </>
        )}
        {user.role === 'ROLE_SELLER' && (
          <TopTextLink to="/sellerCenter">판매자센터</TopTextLink>
        )}
        <TopTextButton onClick={handleLogout}>로그아웃</TopTextButton>
        <TopTextLink to="/customerCenter">고객센터</TopTextLink>
      </>
    );
  };

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e) => {
      const isClickInsidePC =
        dropdownRef.current && dropdownRef.current.contains(e.target);
      const isClickInsideMobile =
        sideDrawerRef.current && sideDrawerRef.current.contains(e.target);

      if (!isClickInsidePC && !isClickInsideMobile) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [isOpen]);

  return (
    <HeaderContainer>
      <TopBar>
        <TopMenu>{renderUserInfo(false)}</TopMenu>
      </TopBar>

      <MainBar>
        <MobileOnly>
          <HamburgerBtn onClick={toggleCategory}>
            <span />
            <span />
            <span />
          </HamburgerBtn>

          {isOpen && (
            <>
              <MenuOverlay onClick={closeMenu} />
              <SideDrawer ref={sideDrawerRef}>
                <MobileUserSection>{renderUserInfo(true)}</MobileUserSection>
                <MobileScrollArea>
                  {categoryGroups.map((group, idx) => (
                    <React.Fragment key={idx}>
                      <CategoryItem
                        onClick={(e) => handleMobileCategoryClick(e, idx)}
                        isActive={mobileActiveIdx === idx}
                      >
                        {group.title}
                        <span className="mobile-arrow">
                          {mobileActiveIdx === idx ? '-' : '+'}
                        </span>
                      </CategoryItem>
                      <MobileSubMenu isOpen={mobileActiveIdx === idx}>
                        <ul className="sub-grid">
                          {group.items.map((item, i) => (
                            <li key={i} onClick={() => goToCategory(item)}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </MobileSubMenu>
                    </React.Fragment>
                  ))}
                  <MobileExtraMenu>
                    <hr />
                    {menuItems
                      .filter((i) => i.type === 'link')
                      .map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            navigate(item.path);
                            setIsOpen(false);
                          }}
                        >
                          {item.name}
                        </div>
                      ))}
                    <div
                      onClick={() => {
                        navigate('/customerCenter');
                        setIsOpen(false);
                      }}
                    >
                      고객센터
                    </div>
                  </MobileExtraMenu>
                </MobileScrollArea>
              </SideDrawer>
            </>
          )}
        </MobileOnly>

        <LogoWrapper>
          <Logo />
        </LogoWrapper>

        <SearchWrapper>
          <Search />
        </SearchWrapper>
      </MainBar>

      <CateGoryBar>
        <CateGoryMenuInner>
          <DesktopOnly ref={dropdownRef}>
            <PCCategoryBtn onClick={toggleCategory}>
              <CategoryIcon src={isOpen ? closeIcon : categoryIcon} alt="" />
            </PCCategoryBtn>

            {isOpen && (
              <DropdownWrapper id="category-menu" role="menu">
                <CategoryList>
                  {categoryGroups.map((group, idx) => (
                    <CategoryItem
                      key={idx}
                      onMouseEnter={() => setActiveGroup(idx)}
                      isActive={activeGroup === idx}
                    >
                      {group.title}
                    </CategoryItem>
                  ))}
                </CategoryList>
                <SubCategoryList>
                  <SubTitle>{categoryGroups[activeGroup].title}</SubTitle>
                  <ul>
                    {categoryGroups[activeGroup].items.map((item, i) => (
                      <li key={i} onClick={() => goToCategory(item)}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </SubCategoryList>
              </DropdownWrapper>
            )}
          </DesktopOnly>

          <Menu>
            <ul>
              {menuItems.map((item, idx) => (
                <li key={idx} onClick={() => handleMenuClick(item)}>
                  {item.name}
                </li>
              ))}
            </ul>
          </Menu>
        </CateGoryMenuInner>
      </CateGoryBar>
    </HeaderContainer>
  );
};

export default Header;

const HeaderContainer = styled.header`
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
`;

const TopBar = styled.div`
  padding: 8px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
  @media ${({ theme }) => theme.mobile} {
    display: none;
  }
`;

const TopMenu = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
`;

const MobileLoginArea = styled.div`
  p {
    margin-bottom: 14px;
    font-size: 16px;
  }
`;

const LoginLink = styled(Link)`
  display: inline-block;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  color: ${({ theme }) => theme.colors.gray[200]};
  padding: 8px 18px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 12px;
`;

const TopTextLink = styled(Link)`
  text-decoration: none;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: 16px;
`;

const UserActionGroup = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  ${({ $isMobile }) =>
    $isMobile && 'flex-direction: column; align-items: flex-start;'}
`;

const WelcomeMsg = styled.p`
  font-size: 16px;
  strong {
    font-weight: 600;
  }
`;

const UserLinks = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  a,
  button {
    background: rgba(255, 255, 255, 0.2);
    color: ${({ theme }) => theme.colors.gray[200]} !important;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    text-decoration: none !important;
    cursor: pointer;
    font-family: inherit;

    &:visited,
    &:hover,
    &:active {
      color: ${({ theme }) => theme.colors.gray[200]} !important;
      text-decoration: none !important;
    }
  }
`;

const TopTextButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: 16px;
  font-family: inherit;
  line-height: inherit;

  &:focus {
    outline: none;
  }
`;

const MainBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 16px 20px;
  position: relative;

  @media ${({ theme }) => theme.mobile} {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 10px 15px;
    gap: 0;
  }
`;

const MobileOnly = styled.div`
  display: none;
  @media ${({ theme }) => theme.mobile} {
    display: block;
    margin-right: 15px;
  }
`;

const HamburgerBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  span {
    width: 24px;
    height: 2px;
    background: ${({ theme }) => theme.colors.gray[900]};
    border-radius: 2px;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const MenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1000;
  animation: ${fadeIn} 0.4s ease-out;
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

const SideDrawer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 300px;
  height: 100vh;
  background: ${({ theme }) => theme.colors.gray[100]};
  z-index: 1001;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
  animation: ${slideIn} 0.3s ease-out;
`;

const MobileUserSection = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  padding: 35px 20px;
  color: white;
`;

const MobileScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 40px;
`;

const CategoryItem = styled.div`
  padding: 15px 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ isActive, theme }) =>
    isActive ? theme.colors.lightNavy : 'transparent'};
  color: ${({ isActive, theme }) =>
    isActive ? theme.colors.primary : theme.colors.gray[700]};
  font-weight: ${({ isActive }) => (isActive ? '700' : '400')};
`;

const MobileSubMenu = styled.div`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  background: ${({ theme }) => theme.colors.gray[100]};
  padding: 10px 15px;
  .sub-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 1fr;
    gap: 10px;
  }
  li {
    background: ${({ theme }) => theme.colors.gray[50]};
    border: 1px solid ${({ theme }) => theme.colors.gray[300]};
    color: ${({ theme }) => theme.colors.gray[700]};
    padding: 12px 8px;
    text-align: center;
    font-size: 14px;
    border-radius: 4px;

    display: flex;
    align-items: center;
    justify-content: center;
    word-break: keep-all;

    &:active {
      background: ${({ theme }) => theme.colors.gray[100]};
      border-color: ${({ theme }) => theme.colors.secondary};
    }
  }
`;

const MobileExtraMenu = styled.div`
  padding: 10px 20px;
  div {
    padding: 12px 0;
    color: ${({ theme }) => theme.colors.gray[700]};
    font-size: 14px;
    cursor: pointer;
  }
  hr {
    border: 0;
    border-top: 1px solid ${({ theme }) => theme.colors.gray[300]};
    margin: 10px 0;
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  @media ${({ theme }) => theme.mobile} {
    grid-column: 2;
  }
`;

const SearchWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex: 0 1 500px;
  width: 100%;

  @media ${({ theme }) => theme.mobile} {
    grid-column: 3;
  }
`;

const CateGoryBar = styled.div`
  padding: 8px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
  @media ${({ theme }) => theme.mobile} {
    display: none;
  }
`;

const CateGoryMenuInner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
`;

const DesktopOnly = styled.div`
  position: relative;
  @media ${({ theme }) => theme.mobile} {
    display: none;
  }
`;

const PCCategoryBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 2px;
`;

const CategoryIcon = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;

const DropdownWrapper = styled.div`
  display: flex;
  position: absolute;
  top: 100%;
  left: 0;
  width: 600px;
  height: 300px;
  background: ${({ theme }) => theme.colors.gray[100]};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  z-index: 1001;
  margin-top: 10px;
`;

const CategoryList = styled.div`
  width: 200px;
  border-right: 1px solid ${({ theme }) => theme.colors.gray[300]};
  background: ${({ theme }) => theme.colors.gray[100]};
  padding: 12px 0;
`;

const SubCategoryList = styled.div`
  flex: 1;
  padding: 24px 30px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[700]};
  background: ${({ theme }) => theme.colors.white};
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    margin-bottom: 12px;
    cursor: pointer;
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
      font-weight: 700;
    }
  }
`;

const SubTitle = styled.div`
  font-weight: 700;
  margin-bottom: 20px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray[900]};
`;

const Menu = styled.div`
  ul {
    display: flex;
    gap: 24px;
    list-style: none;
  }
  li {
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.gray[700]};
  }
`;
