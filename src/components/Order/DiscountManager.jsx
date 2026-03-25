import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import axios from '../../api/axios';
import CouponModal from '../CouponModal';

const POINT_UNIT = 10;

const DiscountManager = ({ orderData, onUpdate, onPaymentRequest }) => {
  const [availablePoints, setAvailablePoints] = useState(0);
  const [usedPointInput, setUsedPointInput] = useState('');
  const [appliedUsedPoint, setAppliedUsedPoint] = useState(0);
  const [usedPoint, setUsedPoint] = useState(0);

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [cancelLoading, setCancelLoading] = useState(false);

  const finalAmount = Math.max(
    0,
    (orderData?.itemTotalAmount || 0) +
      (orderData?.totalDeliveryFee || 0) -
      usedPoint -
      couponDiscount
  );

  const getPayableMaxPoint = useCallback(() => {
    const orderAmount = orderData?.itemTotalAmount || 0;
    const deliveryFee = orderData?.totalDeliveryFee || 0;
    const totalBeforeDiscount = orderAmount + deliveryFee;
    return Math.max(0, totalBeforeDiscount - couponDiscount);
  }, [orderData, couponDiscount]);

  const clampUsedPoint = useCallback(
    (val) => {
      const raw = Number(String(val).replace(/[^\d]/g, ''));
      const unitAdjusted = Math.floor(raw / POINT_UNIT) * POINT_UNIT;
      const maxByBalance = availablePoints;
      const maxByPayable = getPayableMaxPoint();
      return Math.max(0, Math.min(unitAdjusted, maxByBalance, maxByPayable));
    },
    [availablePoints, getPayableMaxPoint]
  );

  // 포인트/쿠폰 상태 변경 시 부모 컴포넌트에 업데이트된 정보 전달
  useEffect(() => {
    onUpdate({
      usedPoint,
      couponCode,
      couponDiscount,
      finalAmount,
    });
  }, [usedPoint, couponCode, couponDiscount, finalAmount, onUpdate]);

  // 보유 포인트 조회
  useEffect(() => {
    const fetchAvailablePoints = async () => {
      try {
        const response = await axios.get('/points/total/active');
        setAvailablePoints(Number(response.data) || 0);
      } catch (err) {
        console.error('포인트 조회 실패', err);
        alert('보유 포인트를 불러오는 데 실패했습니다.');
        setAvailablePoints(0);
      }
    };

    fetchAvailablePoints();
  }, []);

  // 쿠폰 적용 후 포인트 재계산
  useEffect(() => {
    const reClampedPoint = clampUsedPoint(usedPoint);
    if (reClampedPoint !== usedPoint) {
      setUsedPoint(reClampedPoint);
      setUsedPointInput(reClampedPoint > 0 ? String(reClampedPoint) : '');
    }
  }, [couponDiscount, usedPoint, clampUsedPoint]);

  const handlePointChange = (e) => {
    setUsedPointInput(e.target.value.replace(/[^\d]/g, ''));
  };

  const handlePointBlur = () => {
    const clamped = clampUsedPoint(usedPointInput);
    setUsedPointInput(clamped === 0 ? '' : String(clamped));
  };

  const handleUseMaxPoint = () => {
    const maxCandidate = clampUsedPoint(getPayableMaxPoint());
    setUsedPointInput(maxCandidate === 0 ? '' : String(maxCandidate));
  };

  const handleApplyPoint = async (overrideValue) => {
    if (!orderData) {
      alert('주문정보를 불러오는 중입니다.');
      return;
    }

    const candidate = overrideValue != null ? overrideValue : usedPointInput;
    const clampedClient = clampUsedPoint(candidate);

    try {
      const formData = new URLSearchParams();
      formData.append('orderId', orderData.orderId);
      formData.append('buyerId', orderData.buyerId);
      formData.append('usePointAmount', String(clampedClient));

      // 서버가 문자열을 반환하므로, 응답 본문은 사용하지 않음
      await axios.post('/points/apply', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          Accept: 'application/json',
        },
      });

      setUsedPoint(clampedClient);
      setAppliedUsedPoint(clampedClient);
      setUsedPointInput(clampedClient > 0 ? String(clampedClient) : '');
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        '포인트 적용 중 오류가 발생했습니다.';
      alert(msg);
    }
  };

  const handleCancelCoupon = async () => {
    try {
      setCancelLoading(true);
      // 1) 서버 호출: 필요 시 method/바디 수정
      await axios.post(`/coupons/cancel?orderId=${orderData.orderId}`);

      // 2) 성공 시 기존 로직 실행
      setCouponCode(null);
      setCouponDiscount(0);
      const clamped = clampUsedPoint(usedPoint);
      setUsedPoint(clamped);
      setUsedPointInput(clamped === 0 ? '' : String(clamped));
    } catch (err) {
      console.error(err);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleApplyCoupon = ({ coupon, discountAmount }) => {
    setCouponCode(coupon);
    setCouponDiscount(discountAmount);
    setIsCouponModalOpen(false);
  };

  const handlePaymentRequest = () => {
    // ✨ 유효성 검사 로직을 이곳으로 이동!
    // isDirty: 입력된 값과 실제 적용된 값이 다른지 여부
    const isDirty = clampUsedPoint(usedPointInput) !== (appliedUsedPoint || 0);

    if (isDirty) {
      alert('적립금 적용 버튼을 눌러주세요.');
      return; // 결제 요청 중단
    }

    // 유효성 검사 통과 시, 부모의 결제 함수 호출
    onPaymentRequest();
  };

  const isDirty = clampUsedPoint(usedPointInput) !== (appliedUsedPoint || 0);

  if (!orderData) {
    return (
      <Summary>
        <h3>최종 결제 정보</h3>
        <p>주문 정보를 불러오는 중입니다...</p>
      </Summary>
    );
  }

  return (
    <>
      <Summary>
        <h3>주문자 정보</h3>
        <PriceRow>
          <span>이름</span>
          <span>{orderData.name}</span>
        </PriceRow>
        <PriceRow>
          <span>전화번호</span>
          <span>{orderData.phoneNumber}</span>
        </PriceRow>
        <PriceRow>
          <span>이메일</span>
          <span>{orderData.email}</span>
        </PriceRow>
      </Summary>

      <Summary>
        <h3>최종 결제 정보</h3>
        <PriceRow>
          <span>상품금액</span>
          <span>{orderData?.itemTotalAmount.toLocaleString()}원</span>
        </PriceRow>
        <PointsBox>
          <PointsInlineRow>
            <InlineItem>
              <span>사용가능</span>
              <PointsStrong>
                {Math.max(
                  0,
                  (availablePoints || 0) - (usedPoint || 0)
                ).toLocaleString()}
                원
              </PointsStrong>
            </InlineItem>

            <InlineItem>
              <span>보유 적립금</span>
              <PointsStrong>
                {Number(availablePoints || 0).toLocaleString()}원
              </PointsStrong>
            </InlineItem>
          </PointsInlineRow>

          <PointsControl>
            <input
              type="text"
              value={
                usedPointInput ? Number(usedPointInput).toLocaleString() : ''
              }
              onChange={handlePointChange}
              onBlur={handlePointBlur}
              placeholder="사용 금액 입력"
              inputMode="numeric"
              disabled={!orderData}
            />
            <button
              type="button"
              onClick={
                isDirty || appliedUsedPoint === 0
                  ? () => handleApplyPoint()
                  : () => handleApplyPoint(0)
              }
              disabled={!orderData}
            >
              {isDirty || appliedUsedPoint === 0 ? '적용' : '취소'}
            </button>
            <button
              type="button"
              onClick={handleUseMaxPoint}
              disabled={!orderData}
            >
              모두사용
            </button>
          </PointsControl>

          <PointsHelp>
            {POINT_UNIT > 1
              ? `적립금은 ${POINT_UNIT.toLocaleString()}원 단위로 사용 가능합니다.`
              : '적립금은 1원 단위로 사용 가능합니다.'}
          </PointsHelp>
        </PointsBox>
        <PriceRow>
          <span>적립금 사용</span>
          <span>-{usedPoint.toLocaleString()}원</span>
        </PriceRow>
        <PriceRow>
          <span>쿠폰할인</span>
          <span>
            {couponCode ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <strong>
                  -{Number(couponDiscount ?? 0).toLocaleString()}원
                </strong>
                <button
                  type="button"
                  onClick={() => {
                    handleCancelCoupon();
                  }}
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  {cancelLoading ? '취소 중...' : '취소'}
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(true)}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  background: '#fff',
                  cursor: 'pointer',
                }}
                disabled={!orderData}
              >
                쿠폰 선택
              </button>
            )}
          </span>
        </PriceRow>
        <PriceRow>
          <span>배송비</span>
          <span>{orderData?.totalDeliveryFee}원</span>
        </PriceRow>
        <PriceRow total>
          <span>최종 결제금액</span>
          <span>{finalAmount.toLocaleString()}원</span>
        </PriceRow>
        <PayButton onClick={handlePaymentRequest}>
          {finalAmount.toLocaleString()}원 결제하기
        </PayButton>
      </Summary>

      {isCouponModalOpen && (
        <CouponModal
          onClose={() => setIsCouponModalOpen(false)}
          orderSummary={{ orderId: orderData.orderId }}
          onApply={handleApplyCoupon}
        />
      )}
    </>
  );
};

export default DiscountManager;

const Summary = styled.div`
  padding: 20px;
  border: 1px solid #ddd;
  background-color: #fafafa;
  max-width: 400px;
  margin: 10px;

  h3 {
    margin-bottom: 20px;
    font-size: 20px;
  }
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  font-size: ${({ $total }) => ($total ? '18px' : '16px')};
  font-weight: ${({ $total }) => ($total ? 'bold' : 'normal')};
  color: ${({ $total }) => ($total ? '#e60023' : '#000')};
`;

const PayButton = styled.button`
  width: 100%;
  padding: 16px;
  background-color: #000;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border: none;
  margin-top: 20px;
  cursor: pointer;
`;

const PointsBox = styled.div`
  width: 100%; /* 너비를 100%로 설정 */
  box-sizing: border-box; /* 패딩과 보더를 너비에 포함 */
  margin: 12px 0;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const PointsInlineRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px; /* 구분자와의 간격 */
  margin: 6px 0;
  flex-wrap: wrap; /* 모바일에서 줄바꿈 허용 */
`;

const InlineItem = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 6px;

  span {
    font-size: 12px;
    color: #666;
  }
`;
const PointsStrong = styled.strong`
  font-weight: 600; /* 지나치게 튀지 않게 600 */
  color: #222; /* Summary 텍스트 톤과 유사 */
  font-size: 14px;
`;

const PointsControl = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;

  input {
    min-width: 90px;
    padding: 10px 12px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 14px;
    background: #fff;
  }

  button {
    padding: 10px 12px;
    min-width: 90px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: #fff;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: #f5f7ff; /* 기존 버튼 hover와 톤 맞춤 */
      border-color: rgb(85, 90, 130);
      color: rgb(85, 90, 130);
    }

    &:disabled {
      background: #f2f2f2;
      color: #999;
      border-color: #ddd;
      cursor: not-allowed;
    }
  }
`;

const PointsHelp = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #777; /* NoticeBox보다 톤을 낮춰 부드럽게 */
`;
