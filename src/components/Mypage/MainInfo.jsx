import React, { useEffect, useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from '../../api/axios';
import OrderCard from './OrderHistory/OrderCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

import icon_basic from '../../assets/grade_BASIC.png';
import icon_vip from '../../assets/grade_VIP.png';
import icon_vvip from '../../assets/grade_VVIP.png';
import icon_vvip_plus from '../../assets/grade_VVIP_PLUS.png';
import icon_default from '../../assets/grade_default.png';

const Order_Months = 3;

const menuItems = [
  {
    title: 'MY 쇼핑',
    items: [
      { key: 'coupon', label: '쿠폰' },
      { key: 'orders', label: '주문목록/배송조회' },
      { key: 'wishlist', label: '관심상품' },
    ],
  },
  {
    title: 'MY 활동',
    items: [
      { key: 'inquiry_history', label: '문의내역 확인' },
      { key: 'chat', label: '실시간 문의' },
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

const getGradeImage = (grade) => {
  if (!grade) return icon_default;

  switch (grade.toUpperCase()) {
    case 'BASIC':
      return icon_basic;
    case 'VIP':
      return icon_vip;
    case 'VVIP':
      return icon_vvip;
    case 'VVIP_PLUS':
      return icon_vvip_plus;
    default:
      return icon_default;
  }
};

function MainInfo() {
  const navigate = useNavigate();
  const { user: loginUser } = useAuth();
  const [user, setUser] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState('MY 쇼핑');
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 3,
    totalPages: 0,
    totalElements: 0,
    isFirst: true,
    isLast: true,
  });

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const [userRes, orderRes] = await Promise.allSettled([
          axios.get('/mypage/summary', { signal: controller.signal }),
          axios.get('/orders/history/summary', {
            params: { page: pageInfo.page, size: pageInfo.size },
            signal: controller.signal,
            months: Order_Months,
          }),
        ]);

        if (!active) return;

        console.log('userRes', userRes.value.data);
        console.log('orderRes', orderRes.value.data);
        console.log('loginUser', loginUser);

        setUser(userRes.value.data);

        const ordersData = orderRes.value.data;
        setRecentOrders(ordersData.content || []);
        setPageInfo((prev) => ({
          ...prev,
          totalPages: ordersData.totalPages,
          totalElements: ordersData.totalElements,
          isFirst: ordersData.first,
          isLast: ordersData.last,
        }));
      } catch (error) {
        console.error('유저 또는 주문 정보 불러오기 실패', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchData();

    return () => {
      active = false;
      controller.abort();
    };
  }, [pageInfo.page, pageInfo.size, loginUser]);

  // 정렬: 최신 주문이 먼저
  const sortedOrders = useMemo(
    () =>
      recentOrders
        .slice()
        .sort(
          (a, b) =>
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        ),
    [recentOrders]
  );

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>내 정보를 불러오는 중입니다...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <MainContent>
        <TopInfoBox>
          <ProfileSection>
            <Avatar>
              <img
                src={getGradeImage(user?.grade)}
                alt={`${user?.grade} 등급`}
              />
            </Avatar>
            <UserInfoSection>
              <div className="grade">{user?.grade}</div>
              <div className="name">{loginUser.name}님</div>
            </UserInfoSection>
            <SettingButton onClick={() => navigate('/mypage/profile')}>
              설정
            </SettingButton>
          </ProfileSection>

          <PointBar onClick={() => navigate('/mypage/point')}>
            <label>적립금</label>
            <span className="amount">
              {Number(user?.activePoint).toLocaleString()} P
              <i className="arrow">〉</i>
            </span>
          </PointBar>

          <SummaryGrid>
            <SummaryItem onClick={() => navigate('/mypage/orders')}>
              <span className="count">{user?.orderCount || 0}</span>
              <label>주문/배송</label>
            </SummaryItem>
            <SummaryItem onClick={() => navigate('/mypage/coupon')}>
              <span className="count">{user?.couponCount || 0}</span>
              <label>쿠폰</label>
            </SummaryItem>
            <SummaryItem onClick={() => navigate('/mypage/wishlist')}>
              <span className="count">{user?.wishlistCount || 0}</span>
              <label>관심상품</label>
            </SummaryItem>
            <SummaryItem onClick={() => navigate('/mypage/review')}>
              <span className="count">{user?.reviewCount || 0}</span>
              <label>구매후기</label>
            </SummaryItem>
          </SummaryGrid>
        </TopInfoBox>

        <OrderSection>
          <SectionHeader onClick={() => navigate('/mypage/orders')}>
            <SectionTitle>최근 주문 내역</SectionTitle>
            <MoreButton>〉</MoreButton>
          </SectionHeader>

          {sortedOrders.length > 0 ? (
            sortedOrders.map((o) => <OrderCard key={o.orderId} order={o} />)
          ) : (
            <NoOrderText>최근 주문 내역이 없습니다.</NoOrderText>
          )}
        </OrderSection>

        <MobileMenuContainer>
          {menuItems.map((section) => (
            <MenuCategory key={section.title}>
              <div
                className="category-title"
                onClick={() =>
                  setOpenCategory(
                    openCategory === section.title ? '' : section.title
                  )
                }
              >
                {section.title}
                <span>{openCategory === section.title ? '−' : '+'}</span>
              </div>

              {openCategory === section.title && (
                <ul className="sub-menu">
                  {section.items.map((item) => (
                    <li
                      key={item.key}
                      onClick={() => navigate(`/mypage/${item.key}`)}
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              )}
            </MenuCategory>
          ))}
        </MobileMenuContainer>
      </MainContent>
    </Container>
  );
}

export default MainInfo;

// === 스타일 영역 ===
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 100px 20px;
  min-height: 50vh;
  gap: 16px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${({ theme }) => theme.colors.gray[200]};
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

const Container = styled.div`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  font-family: 'Noto Sans KR', sans-serif;
  @media ${({ theme }) => theme.mobile} {
    margin: 0;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  @media ${({ theme }) => theme.mobile} {
    gap: 12px;
  }
`;

const TopInfoBox = styled.div`
  background: ${({ theme }) => theme.colors.white};
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  @media ${({ theme }) => theme.mobile} {
    padding: 20px;
    border-bottom: 8px solid ${({ theme }) => theme.colors.gray[100]};
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 5px;
  position: relative;

  .grade {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.gray[600]};
    margin-bottom: 4px;
  }
  .name {
    font-size: 18px;
    font-weight: 700;
  }
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.gray[100]};
  margin-right: 15px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserInfoSection = styled.div`
  flex: 1;
`;

const SettingButton = styled.button`
  padding: 6px 12px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.white};
  font-size: 13px;
  cursor: pointer;
`;

const PointBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.colors.gray[100]};
  padding: 16px 20px;
  border-radius: 12px;
  cursor: pointer;

  label {
    font-weight: 700;
    font-size: 15px;
  }
  .amount {
    font-weight: 700;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .arrow {
    color: ${({ theme }) => theme.colors.gray[600]};
    font-style: normal;
    padding: 10px;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 10px 0;
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  .count {
    font-size: 18px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.gray[700]};
  }
  label {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.gray[600]};
  }
`;

const OrderSection = styled.div`
  @media ${({ theme }) => theme.mobile} {
    padding: 20px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const SectionTitle = styled.h3`
  font-size: 22px;
`;

const MoreButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.gray[600]};
  cursor: pointer;
`;

const MobileMenuContainer = styled.div`
  display: none;
  @media ${({ theme }) => theme.mobile} {
    display: block;
    border-top: 1px solid ${({ theme }) => theme.colors.gray[300]};
    margin-top: 10px;
  }
`;

const MenuCategory = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};

  .category-title {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 700;
    font-size: 16px;
    color: ${({ theme }) => theme.colors.gray[700]};
    cursor: pointer;

    span {
      font-size: 20px;
      color: ${({ theme }) => theme.colors.gray[600]};
      font-weight: normal;
    }
  }

  .sub-menu {
    list-style: none;
    padding: 0 20px 20px 20px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;

    li {
      font-size: 14px;
      color: ${({ theme }) => theme.colors.gray[700]};
      cursor: pointer;
      padding: 5px 0;
    }
  }
`;

const NoOrderText = styled.p`
  color: ${({ theme }) => theme.colors.gray[700]};
  text-align: center;
  font-size: 16px;
`;
