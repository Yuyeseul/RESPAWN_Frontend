import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from '../api/axios';

const CouponModal = ({ onClose, onApply, orderSummary }) => {
  const [usableCoupons, setUsableCoupons] = useState([]);
  const [unusableCoupons, setUnusableCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const { data } = await axios.get('/coupons/view', {
          params: {
            orderId: orderSummary.orderId,
          },
          signal: controller.signal,
        });
        console.log(data);
        if (Array.isArray(data)) {
          // usable: true인 쿠폰만 필터링
          setUsableCoupons(data.filter((c) => c.usable));
          // usable: false인 쿠폰만 필터링
          setUnusableCoupons(data.filter((c) => !c.usable));
        }
      } catch (e) {
        if (e.name !== 'CanceledError') {
          console.error(e);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      controller.abort();
    };
  }, [orderSummary.orderId]);

  const handleApply = async (coupon) => {
    // API 호출 중이면 중복 실행 방지
    if (isChecking) return;

    // orderId가 없으면 실행 중단 (오류 방지)
    if (!orderSummary?.orderId) {
      alert('주문 정보가 없어 쿠폰을 확인할 수 없습니다.');
      return;
    }

    setIsChecking(true); // 확인 시작

    try {
      // 백엔드의 /check API 호출
      const res = await axios.get('/coupons/check', {
        params: {
          orderId: orderSummary.orderId,
          code: coupon.coupon.code,
        },
      });
      console.log(res.data);

      if (res.data.usable) {
        onApply({
          coupon: coupon.coupon.code,
          discountAmount: coupon.coupon.couponAmount,
        });
      } else {
        alert(res.data.reason || '쿠폰을 적용할 수 없습니다.');
      }
    } catch (e) {
      console.error('쿠폰 적용 확인 중 오류 발생:', e);
      alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsChecking(false); // 확인 종료
    }
  };

  return (
    <Backdrop>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>쿠폰함</Header>
        <Body>
          {loading ? (
            <div>불러오는 중...</div>
          ) : usableCoupons.length === 0 && unusableCoupons.length === 0 ? (
            <div>사용 가능한 쿠폰이 없습니다.</div>
          ) : (
            <>
              {' '}
              {usableCoupons.length > 0 && (
                <SectionTitle>사용 가능한 쿠폰</SectionTitle>
              )}
              {usableCoupons.map((c) => (
                <Row key={c.coupon.id}>
                  <CouponInfo>
                    <CouponName>{c.coupon.name}</CouponName>
                    <CouponCondition>
                      {c.coupon.couponAmount.toLocaleString()}원
                    </CouponCondition>
                    <CouponExpire>
                      {formatDate(c.coupon.expiresAt)} 까지 사용 가능
                    </CouponExpire>
                  </CouponInfo>
                  <SmallBtn onClick={() => handleApply(c)}>적용하기</SmallBtn>
                </Row>
              ))}
              {unusableCoupons.length > 0 && (
                <SectionTitle>사용 불가능한 쿠폰</SectionTitle>
              )}
              {unusableCoupons.map((c) => (
                <Row key={c.coupon.id} disabled>
                  <CouponInfo>
                    <CouponName>{c.coupon.name}</CouponName>
                    <Reason>{c.reason}</Reason>
                    <CouponExpire>
                      {formatDate(c.coupon.expiresAt)} 까지
                    </CouponExpire>
                  </CouponInfo>
                </Row>
              ))}
            </>
          )}
        </Body>
        <Footer>
          <SmallBtn onClick={onClose}>닫기</SmallBtn>
        </Footer>
      </Modal>
    </Backdrop>
  );
};

export default CouponModal;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  width: 520px;
  max-width: 100%;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 80vh;

  @media ${({ theme }) => theme.mobile} {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    position: fixed;
    inset: 0;
  }
`;

const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
  font-weight: 700;
  font-size: 18px;
`;

const Body = styled.div`
  padding: 16px 20px;
  flex: 1;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.gray[600]};
    border-radius: 10px;
  }
`;

const Footer = styled.div`
  padding: 12px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[300]};
  display: flex;
  justify-content: flex-end;

  @media ${({ theme }) => theme.mobile} {
    padding: 16px 20px;
    button {
      width: 100%;
      height: 52px;
    }
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-top: 20px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};

  &:first-child {
    margin-top: 0;
  }
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const CouponInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CouponName = styled.div`
  font-weight: 600;
  font-size: 15px;
`;

const CouponCondition = styled.div`
  font-weight: 400;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const CouponExpire = styled.div`
  font-weight: 400;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[700]};
`;

const SmallBtn = styled.button`
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${({ $primary, theme }) =>
    $primary
      ? `
    background: ${theme.colors.primary};
    color: ${theme.colors.white};
    border: none;
    &:hover { background: ${theme.colors.secondary}; }
  `
      : `
    background: ${theme.colors.white};
    color: ${theme.colors.gray[700]};
    border: 1px solid ${theme.colors.gray[300]};
    &:hover { background: ${theme.colors.gray[100]}; }
  `}

  &:disabled {
    background: ${({ theme }) => theme.colors.gray[200]};
    color: ${({ theme }) => theme.colors.gray[400]};
    cursor: not-allowed;
  }
`;

const Reason = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.red};
  font-weight: 500;
`;
