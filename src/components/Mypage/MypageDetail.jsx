import React from 'react';
import styled from 'styled-components';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  {
    title: 'MY 쇼핑',
    items: [
      { key: 'coupon', label: '쿠폰' },
      { key: 'orders', label: '주문목록/배송조회' },
    ],
  },
  {
    title: 'MY 활동',
    items: [
      { key: 'inquiry_history', label: '문의내역 확인' },
      { key: 'refund', label: '환불내역 확인' },
      { key: 'review', label: '구매후기' },
      { key: 'point', label: '적립금' },
    ],
  },
  {
    title: 'MY 정보',
    items: [{ key: 'profile', label: '개인정보확인/수정' }],
  },
];

function MypageDetail() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Container>
      <Sidebar>
        <MenuTitle
          className={location.pathname === '/mypage' ? 'active' : ''}
          onClick={() => navigate('/mypage')}
        >
          My Page
        </MenuTitle>

        {menuItems.map(({ title, items }) => (
          <div key={title}>
            <SubMenuTitle>{title}</SubMenuTitle>
            <MenuList>
              {items.map(({ key, label }) => {
                const segments = location.pathname.split('/');
                const currentKey = segments[2] || ''; // /mypage/:key/
                return (
                  <MenuItem
                    key={key}
                    $active={currentKey === key}
                    onClick={() => navigate(`/mypage/${key}`)}
                  >
                    {label}
                  </MenuItem>
                );
              })}
            </MenuList>
          </div>
        ))}
      </Sidebar>

      <MainContent>
        <Outlet />
      </MainContent>
    </Container>
  );
}

export default MypageDetail;

const Container = styled.div`
  display: flex;
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 40px auto;
  font-family: 'Noto Sans KR', sans-serif;
`;

const Sidebar = styled.aside`
  width: 280px;
  padding: 20px 40px;
  border-right: 1px solid ${({ theme }) => theme.colors.gray[300]};

  @media ${({ theme }) => theme.mobile} {
    display: none;
  }
`;

const MenuTitle = styled.h1`
  font-size: 32px;
  margin-bottom: 30px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.gray[700]};
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SubMenuTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 10px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[700]};
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 25px 0;
`;

const MenuItem = styled.li`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  margin-bottom: 5px;
  cursor: pointer;
  font-weight: ${(props) => (props.$active ? '700' : '500')};
  font-size: 16px;
  color: ${(props) =>
    props.$active ? props.theme.colors.primary : props.theme.colors.gray[900]};
  border-radius: 8px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &::before {
    content: '▶';
    font-size: 13px;
    color: ${(props) =>
      props.$active ? props.theme.colors.primary : 'transparent'};
    transition: color 0.2s ease;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.primary};

    &::before {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px 40px;
  min-height: calc(100vh - 120px);
  overflow-y: auto;
  border-radius: 8px;
  @media ${({ theme }) => theme.mobile} {
    padding: 0;
  }
`;
