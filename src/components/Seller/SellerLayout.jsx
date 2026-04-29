import React, { useRef } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

// 깨끗하고 모던한 SVG Chevron 아이콘 정의
const ChevronLeftIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const SellerLayout = () => {
  const navRef = useRef(null);

  const scrollNav = (direction) => {
    if (navRef.current) {
      const scrollAmount = 180;
      navRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Wrapper>
      <Sidebar>
        <LogoBox>판매자 센터</LogoBox>
        <MobileNavContainer>
          {/* 원 디자인이 제거된 깔끔한 화살표 버튼 */}
          <LeftArrowButton onClick={() => scrollNav('left')}>
            <ChevronLeftIcon />
          </LeftArrowButton>

          <Nav ref={navRef}>
            <StyledNavLink to="productList">상품 관리</StyledNavLink>
            <StyledNavLink to="orderList">주문 관리</StyledNavLink>
            <StyledNavLink to="refundList">환불 관리</StyledNavLink>
            <StyledNavLink to="reviewList">리뷰</StyledNavLink>
            <StyledNavLink to="inquiryList">문의 관리</StyledNavLink>
            <StyledNavLink to="chat">실시간 채팅</StyledNavLink>
            <StyledNavLink to="profile">개인정보확인/수정</StyledNavLink>
          </Nav>

          <RightArrowButton onClick={() => scrollNav('right')}>
            <ChevronRightIcon />
          </RightArrowButton>
        </MobileNavContainer>
      </Sidebar>
      <Content>
        <InnerBox>
          <Outlet />
        </InnerBox>
      </Content>
    </Wrapper>
  );
};

export default SellerLayout;

/* 화살표 버튼 애니메이션 (움직임 유지) */
const moveLeftSubtle = keyframes`
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-4px); }
`;

const moveRightSubtle = keyframes`
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(4px); }
`;

const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme: { colors } }) => colors.gray[100]};
  padding: 20px;
  gap: 20px;

  @media ${({ theme }) => theme.mobile} {
    flex-direction: column;
    padding: 10px;
    gap: 10px;
  }
`;

const Sidebar = styled.div`
  width: 240px;
  background: ${({ theme: { colors } }) => colors.white};
  border-radius: 12px;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 12px ${({ theme: { colors } }) => colors.overlay_line};

  @media ${({ theme }) => theme.mobile} {
    width: 100%;
    padding: 16px 0;
  }
`;

const LogoBox = styled.h2`
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 24px;
  color: ${({ theme: { colors } }) => colors.primary};

  @media ${({ theme }) => theme.mobile} {
    margin-bottom: 12px;
  }
`;

const MobileNavContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  @media ${({ theme }) => theme.mobile} {
    flex-direction: row;
    align-items: center;
    width: 100%;
    position: relative;
    padding: 0 5px; /* 내부 여백 미세 조정 */
  }
`;

/* 화살표 버튼 디자인 수정 (원 제거) */
const ArrowButton = styled.div`
  display: none; // 데스크톱에선 숨김

  @media ${({ theme }) => theme.mobile} {
    display: flex;
    align-items: center;
    justify-content: center;

    /* 원 디자인(배경, 테두리, 그림자) 제거 */
    color: ${({ theme: { colors } }) => colors.primary}; /* 아이콘 색상 유지 */
    background: none; /* 배경 제거 */
    border: none; /* 테두리 제거 */
    border-radius: 0; /* 둥글기 제거 */
    box-shadow: none; /* 그림자 제거 */

    /* 터치 영역 확보를 위한 투명 패딩 추가 */
    padding: 10px 5px;

    cursor: pointer;
    flex-shrink: 0;
    z-index: 10;
    user-select: none;
    transition: all 0.2s ease;

    /* 터치 및 호버 효과 (색상만 살짝 변경) */
    &:active {
      color: ${({ theme: { colors } }) => colors.primary_dark};
      transform: scale(0.9); /* 크기만 살짝 줄임 */
    }

    /* 아이콘 크기 고정 */
    & svg {
      width: 24px; /* 기존보다 아이콘 크기를 살짝 키움 */
      height: 24px;
    }
  }
`;

const LeftArrowButton = styled(ArrowButton)`
  @media ${({ theme }) => theme.mobile} {
    animation: ${moveLeftSubtle} 1.5s infinite ease-in-out;
  }
`;

const RightArrowButton = styled(ArrowButton)`
  @media ${({ theme }) => theme.mobile} {
    animation: ${moveRightSubtle} 1.5s infinite ease-in-out;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  @media ${({ theme }) => theme.mobile} {
    flex-direction: row;
    overflow-x: auto;
    /* 화살표가 원 디자인일 때 필요했던 오버랩 마진과 패딩 제거 */
    padding: 8px 0;
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: ${({ theme: { colors } }) => colors.gray[800]};
  text-decoration: none;
  font-size: 15px;
  border-radius: 8px;
  margin: 0 16px;
  white-space: nowrap;

  &:hover {
    background: ${({ theme: { colors } }) => colors.primary_light};
    color: ${({ theme: { colors } }) => colors.primary};
  }

  &.active {
    background: ${({ theme: { colors } }) => colors.primary_hover};
    font-weight: 700;
    color: ${({ theme: { colors } }) => colors.primary};
  }

  @media ${({ theme }) => theme.mobile} {
    margin: 0 4px;
    padding: 8px 14px;
    font-size: 14px;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
`;

const InnerBox = styled.div`
  flex: 1;
  background: ${({ theme: { colors } }) => colors.white};
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px ${({ theme: { colors } }) => colors.overlay_line};
  overflow-y: auto;

  @media ${({ theme }) => theme.mobile} {
    padding: 15px;
  }
`;
