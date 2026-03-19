import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
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
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [isOpen]);

  return (
    <HeaderContainer>
      <TopBar>
        <TopMenu>
          {user ? (
            <>
              <TopTextButton onClick={handleLogout}>로그아웃</TopTextButton>
            </>
          ) : (
            <TopTextLink to="/login">로그인</TopTextLink>
          )}

          {user?.role === 'ROLE_USER' && (
            <TopTextLink to="/mypage">마이페이지</TopTextLink>
          )}

          {user?.role === 'ROLE_USER' && (
            <TopTextLink to="/cart">장바구니</TopTextLink>
          )}

          {user?.role === 'ROLE_SELLER' && (
            <TopTextLink to="/sellerCenter">판매자센터</TopTextLink>
          )}
          <TopTextLink to="/customerCenter">고객센터</TopTextLink>
        </TopMenu>
      </TopBar>

      <MainBar>
        <Logo />
        <Search />
      </MainBar>

      <CateGoryBar>
        <CateGoryMenu>
          <Category ref={dropdownRef}>
            <IconButton
              type="button"
              onClick={toggleCategory}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              aria-controls="category-menu"
              aria-label={isOpen ? '카테고리 닫기' : '카테고리 열기'}
            >
              <CategoryIcon
                src={isOpen ? closeIcon : categoryIcon}
                alt=""
                aria-hidden="true"
              />
            </IconButton>
            {isOpen && (
              <DropdownWrapper
                id="category-menu"
                role="menu"
                aria-label="카테고리"
              >
                <CategoryList>
                  {categoryGroups.map((group, idx) => (
                    <CategoryItem
                      key={idx}
                      onMouseEnter={() => setActiveGroup(idx)}
                      isActive={activeGroup === idx}
                      role="menuitem"
                      tabIndex={0}
                    >
                      {group.title}
                    </CategoryItem>
                  ))}
                </CategoryList>

                <SubCategoryList>
                  <SubTitle>{categoryGroups[activeGroup].title}</SubTitle>
                  <ul>
                    {categoryGroups[activeGroup].items.map((item, i) => (
                      <li
                        key={i}
                        role="menuitem"
                        tabIndex={0}
                        onClick={() => goToCategory(item)}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </SubCategoryList>
              </DropdownWrapper>
            )}
          </Category>
          <Menu>
            <ul>
              {menuItems.map((item, idx) => (
                <li key={idx} onClick={() => handleMenuClick(item)}>
                  {item.name}
                </li>
              ))}
            </ul>
          </Menu>
        </CateGoryMenu>
      </CateGoryBar>
    </HeaderContainer>
  );
};

export default Header;

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
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  font-size: 13px;
  color: #666;
`;

const TopTextLink = styled(Link)`
  text-decoration: none;
  color: #666;
  font-size: 13px;
`;

const TopTextButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: #666;
  font-size: 13px;
  cursor: pointer;
`;

const MainBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  transform: translateX(-5%);
`;

const CateGoryBar = styled.div`
  position: relative;
  padding: 8px 20px;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
`;

const CateGoryMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  font-size: 13px;
  color: #666;
`;

const Category = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #666;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:focus-visible {
    outline: 2px solid rgb(105, 111, 148);
    outline-offset: 2px;
  }
`;

const CategoryIcon = styled.img`
  width: 30px;
  height: 30px;
  cursor: pointer;
`;

const Menu = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 15px;
  font-weight: 500;
  color: #444;

  ul {
    display: flex;
    gap: 24px;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    position: relative;
    cursor: pointer;
    transition: color 0.3s ease;
    padding: 6px 0;

    &:hover {
      color: rgb(85, 90, 130);
    }
  }
`;

const DropdownWrapper = styled.div`
  display: flex;
  position: absolute;
  top: 100%;
  left: 0;
  width: 600px;
  height: 300px;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  z-index: 10;
`;

const CategoryList = styled.div`
  width: 200px;
  border-right: 1px solid #eee;
  background: rgba(85, 90, 130, 0.1);
  padding: 12px 0;
`;

const CategoryItem = styled.div`
  padding: 12px 20px;
  background: ${({ isActive }) => (isActive ? '#fff' : 'transparent')};
  font-weight: ${({ isActive }) => (isActive ? 'bold' : 'normal')};
  color: ${({ isActive }) => (isActive ? 'rgb(85, 90, 130)' : '#666')};
  transition: color 0.2s;

  &:hover {
    background: #fff;
    color: rgb(85, 90, 130);
  }
`;

const SubCategoryList = styled.div`
  flex: 1;
  padding: 24px 30px; /* 패딩 좀 크게 */
  font-size: 14px;
  color: #444;
  background: #fff;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 10px;
    cursor: pointer;
    transition: color 0.2s;
    color: #444; /* 기본 글자색 */

    &:hover {
      color: rgb(85, 90, 130);
      background: #fff;
    }
  }
`;

const SubTitle = styled.div`
  font-weight: 700;
  margin-bottom: 20px;
  font-size: 16px;
  color: #222;
`;
