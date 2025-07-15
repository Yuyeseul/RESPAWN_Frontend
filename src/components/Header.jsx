import React, { useState } from 'react';
import styled from 'styled-components';
import Logo from '../components/Logo';
import userIcon from '../assets/user_icon.png';
import categoryIcon from '../assets/category_icon.png';
import Search from '../components/Search';

const Header = ({ username }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <HeaderContainer>
      <TopBar>
        <TopMenu>
          {username && <span>{username}님</span>}
          <UserIcon src={userIcon} alt="User Icon" />
          <span>장바구니</span>
          <span>고객센터</span>
        </TopMenu>
      </TopBar>

      <MainBar>
        <Logo />
        <Search />
      </MainBar>

      <CateGoryBar>
        <CateGoryMenu>
          <Category>
            <UserIcon src={categoryIcon} onClick={() => setIsOpen(!isOpen)} />
            {isOpen && (
              <Dropdown>
                <Column>
                  <ul>
                    <li>모니터</li>
                    <li>헤드셋</li>
                    <li>키보드</li>
                    <li>마우스</li>
                    <li>스피커</li>
                  </ul>
                </Column>
              </Dropdown>
            )}
          </Category>
          <Menu>
            <ul>
              <li>모니터</li>
              <li>헤드셋</li>
              <li>키보드</li>
              <li>마우스</li>
              <li>스피커</li>
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

const UserIcon = styled.img`
  width: 30px;
  height: 30px;
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
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #666;
`;

const Menu = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 14px;

  ul {
    display: flex;
    gap: 20px;
    list-style: none;
  }

  li {
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #000;
    }
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 38px;
  width: 120px;
  background: white;
  border: 1px solid #ccc;
  display: flex;
  gap: 40px;
  padding: 20px;
  z-index: 999;
`;

const Column = styled.div`
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin: 8px 0;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
`;
