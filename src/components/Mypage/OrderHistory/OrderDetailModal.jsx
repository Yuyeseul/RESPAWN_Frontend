import React, { useEffect, useRef, useCallback, useState } from 'react';
import styled from 'styled-components';
import axios from '../../../api/axios';
import { BASE_URL } from '../../../api/axios';

const OrderDetailModal = ({ open, onClose, orderId, triggerRef }) => {
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (v) => {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n.toLocaleString() : '0';
  };

  const orderStatusLabel = (status) => {
    switch (status) {
      case 'PROCESSING':
        return '상품준비';
      case 'READY':
        return '배송준비';
      case 'SHIPPING':
        return '배송중';
      case 'DELIVERED':
        return '배송완료';
      default:
        return status ?? '상태없음';
    }
  };

  const paymentMethodLabel = (code) => {
    switch (code) {
      case 'card':
        return '신용/체크카드';
      case 'trans':
        return '계좌이체';
      case 'vbank':
        return '가상계좌';
      case 'phone':
        return '휴대폰 결제';
      default:
        return code ?? '-';
    }
  };

  useEffect(() => {
    if (!open || !orderId) return;

    const controller = new AbortController();
    const load = async () => {
      setIsLoading(true);
      setError('');
      setData(null);
      try {
        const res = await axios.get(`/orders/${orderId}/complete-info`, {
          signal: controller.signal,
        });
        console.log(res.data);
        setData(res.data);
      } catch (e) {
        if (axios.isCancel?.(e) || e.name === 'CanceledError') return; // 취소는 무시
        const status = e.response?.status;
        if (status === 401 || status === 403)
          setError('접근 권한이 없습니다. 로그인 상태를 확인해주세요.');
        else if (status === 404) setError('주문을 찾을 수 없습니다.');
        else setError('주문 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    load();

    return () => controller.abort();
  }, [open, orderId]);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => triggerRef?.current?.focus(), 0);
  }, [onClose, triggerRef]);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') return handleClose();
      if (e.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const list = Array.from(focusable);
      const first = list[0];
      const last = list[list.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [handleClose]
  );

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onKeyDown]);

  if (!open) return null;

  const stop = (e) => e.stopPropagation();

  return (
    <Overlay>
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        aria-describedby="order-detail-desc"
        ref={dialogRef}
        onClick={stop}
      >
        <DialogHeader>
          <DialogTitle id="order-detail-title">주문내역서</DialogTitle>
          <CloseButton
            type="button"
            onClick={handleClose}
            aria-label="닫기"
            ref={closeBtnRef}
          >
            ×
          </CloseButton>
        </DialogHeader>

        <DialogBody id="order-detail-desc">
          {isLoading && <Muted>불러오는 중...</Muted>}
          {error && <ErrorText>{error}</ErrorText>}
          {!isLoading && !error && data && (
            <>
              <OrderInfo>
                <span>
                  주문일시{' '}
                  <b>
                    {data?.orderDate
                      ? new Date(data.orderDate).toLocaleString('ko-KR')
                      : '-'}
                  </b>
                </span>
                <span>
                  주문번호 <OrderNum>{data.orderId}</OrderNum>
                </span>
              </OrderInfo>
              <SectionTitle>주문 상품</SectionTitle>
              <Table>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center' }}>이미지</th>
                    <th style={{ textAlign: 'left' }}>상품명</th>
                    <th style={{ textAlign: 'center' }}>수량</th>
                    <th style={{ textAlign: 'center' }}>단가</th>
                    <th style={{ textAlign: 'center' }}>금액</th>
                    <th style={{ textAlign: 'center' }}>주문상태</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.orderItems?.map((item) => {
                    const unit = item?.orderPrice;
                    const qty = item?.count;
                    const lineTotal = (Number(unit) || 0) * (Number(qty) || 0);

                    const deliveryItem = data?.deliveryInfo?.find(
                      (d) => d.orderItemId === item.orderItemId
                    );

                    return (
                      <tr key={item.orderItemId}>
                        <td style={{ textAlign: 'center' }}>
                          <img
                            src={`${BASE_URL}${item.imageUrl}`}
                            alt=""
                            width={64}
                          />
                        </td>
                        <td>{item.itemName ?? '-'}</td>
                        <td style={{ textAlign: 'center' }}>{qty ?? 0}</td>
                        <td style={{ textAlign: 'center' }}>
                          {formatCurrency(unit)}원
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {formatCurrency(lineTotal)}원
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {orderStatusLabel(deliveryItem?.status)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              <RowSection>
                <InfoCard>
                  <InfoHeading>주문자 정보</InfoHeading>
                  <InfoTable>
                    <tbody>
                      <tr>
                        <InfoTh>주문자</InfoTh>
                        <td>{data.name}</td>
                      </tr>
                      <tr>
                        <InfoTh>연락처</InfoTh>
                        <td>{data.phoneNumber}</td>
                      </tr>
                      <tr>
                        <InfoTh>이메일</InfoTh>
                        <td>{data.email}</td>
                      </tr>
                    </tbody>
                  </InfoTable>
                </InfoCard>
                <InfoCard>
                  <InfoHeading>배송지 정보</InfoHeading>
                  <InfoTable>
                    <tbody>
                      <tr>
                        <InfoTh>수령인</InfoTh>
                        <td>{data.deliveryInfo[0].address.recipient}</td>
                      </tr>
                      <tr>
                        <InfoTh>연락처</InfoTh>
                        <td>{data.deliveryInfo[0].address.phone}</td>
                      </tr>
                      <tr>
                        <InfoTh>추가연락처</InfoTh>
                        <td>{data.deliveryInfo[0].address.subPhone}</td>
                      </tr>
                      <tr>
                        <InfoTh>주소</InfoTh>
                        <td>
                          [{data.deliveryInfo[0].address.zoneCode}]{' '}
                          {data.deliveryInfo[0].address.baseAddress}{' '}
                          {data.deliveryInfo[0].address.detailAddress}
                        </td>
                      </tr>
                    </tbody>
                  </InfoTable>
                </InfoCard>
                <InfoCard>
                  <InfoHeading>결제 정보</InfoHeading>
                  <PaymentDetailsGrid>
                    {/* 왼쪽 컬럼 */}
                    <PaymentColumn>
                      <ColumnTitle>금액</ColumnTitle>
                      <PaymentRow>
                        <PaymentLabel>상품 합계</PaymentLabel>
                        <PaymentValue>
                          {formatCurrency(data.itemTotalPrice ?? 0)}원
                        </PaymentValue>
                      </PaymentRow>
                      <PaymentRow>
                        <PaymentLabel>배송비</PaymentLabel>
                        <PaymentValue>
                          {formatCurrency(data.deliveryFee ?? 0)}원
                        </PaymentValue>
                      </PaymentRow>
                      <Divider />
                      <PaymentRow>
                        <PaymentLabel>합계</PaymentLabel>
                        <PaymentValue>
                          {formatCurrency(data.originalAmount ?? 0)}원
                        </PaymentValue>
                      </PaymentRow>
                    </PaymentColumn>

                    {/* 오른쪽 컬럼 */}
                    <PaymentColumn>
                      <ColumnTitle>할인 및 적립</ColumnTitle>
                      <PaymentRow>
                        <PaymentLabel>포인트 사용</PaymentLabel>
                        <PaymentValue isDiscount>
                          {formatCurrency(data.usedPointAmount ?? 0)}원
                        </PaymentValue>
                      </PaymentRow>
                      <PaymentRow>
                        <PaymentLabel>쿠폰 사용</PaymentLabel>
                        <PaymentValue isDiscount>
                          {data.usedCouponAmount ? '-' : ''}
                          {formatCurrency(data.usedCouponAmount ?? 0)}원
                        </PaymentValue>
                      </PaymentRow>
                      <PaymentRow>
                        <PaymentLabel>추후 적립금</PaymentLabel>
                        <PaymentValue>
                          {formatCurrency(data.pointBenefit?.savedAmount ?? 0)}
                          원
                        </PaymentValue>
                      </PaymentRow>
                    </PaymentColumn>
                  </PaymentDetailsGrid>

                  <PaymentDivider />

                  <InfoTable>
                    <tbody>
                      <tr>
                        <InfoTh>결제수단</InfoTh>
                        <InfoTd>
                          {paymentMethodLabel(data?.paymentInfo?.paymentMethod)}
                        </InfoTd>
                      </tr>
                      <tr>
                        <InfoTh>PG사</InfoTh>
                        <InfoTd>
                          {data?.paymentInfo?.pgProvider ?? '정보 없음'}
                        </InfoTd>
                      </tr>
                    </tbody>
                  </InfoTable>

                  <PaymentDivider />
                  <FinalTotalRow>
                    <FinalTotalLabel>총 결제금액</FinalTotalLabel>
                    <TotalAmount>
                      {formatCurrency(data.totalAmount)}원
                    </TotalAmount>
                  </FinalTotalRow>
                </InfoCard>
              </RowSection>
            </>
          )}
        </DialogBody>

        <DialogFooter>
          <PrimaryButton type="button" onClick={handleClose}>
            확인
          </PrimaryButton>
        </DialogFooter>
      </Dialog>
    </Overlay>
  );
};

export default OrderDetailModal;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const Dialog = styled.div`
  width: 100%;
  max-width: 900px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  max-height: 90vh;
`;

const DialogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const DialogTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
`;

const CloseButton = styled.button`
  border: none;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
`;

const DialogBody = styled.div`
  padding: 24px 36px;
  overflow-y: auto;
  max-height: calc(90vh - 130px); // 헤더, 푸터 높이 제외
`;

const DialogFooter = styled.div`
  padding: 12px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
`;

const PrimaryButton = styled.button`
  min-width: 100px;
  background: rgb(105, 111, 148);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:hover {
    background: rgb(85, 90, 130);
  }
`;

const Muted = styled.div`
  color: #6b7280;
  padding: 40px 0;
  text-align: center;
`;

const ErrorText = styled.div`
  color: #ef4444;
  padding: 40px 0;
  text-align: center;
`;

const OrderInfo = styled.div`
  font-size: 15px;
  color: #607d8b;
  margin-top: 6px;
  margin-bottom: 24px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  span {
    display: flex;
    align-items: center;
  }
  b {
    margin-left: 4px;
    font-weight: 600;
    color: #34495e;
  }
`;

const OrderNum = styled.span`
  color: #34495e;
  font-size: 16px;
  margin-left: 6px;
  font-weight: 700;
  letter-spacing: 0.05em;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #34495e;
  margin-top: 24px;
  margin-bottom: 8px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
  margin-bottom: 24px;

  thead th {
    font-weight: 700;
    color: #2c3e50;
    padding: 16px 12px;
    border-bottom: 2px solid #b0bec5;
  }

  tbody tr {
    border-bottom: 1px solid #eceff1;
  }

  tbody td {
    padding: 16px 12px;
    vertical-align: middle;
    color: #34495e;
  }
`;

const RowSection = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 36px;
  flex-direction: column;
`;

const InfoCard = styled.div`
  flex: 1;
  background: #fcfdff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`;

const InfoHeading = styled.div`
  font-size: 17px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #b0bec5;
`;

const PaymentDetailsGrid = styled.div`
  display: flex;
  gap: 24px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const PaymentColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ColumnTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: #34495e;
  margin: 0 0 4px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
`;

const PaymentRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
`;

const PaymentLabel = styled.span`
  color: #607d8b;
`;

const PaymentValue = styled.span`
  font-weight: 600;
  color: ${(props) => (props.isDiscount ? '#e53935' : '#2c3e50')};
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #cfd8dc;
`;

const PaymentDivider = styled.hr`
  border: none;
  border-top: 1px solid #cfd8dc;
  margin: 20px 0;
`;

const FinalTotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FinalTotalLabel = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
`;

const InfoTable = styled.table`
  width: 100%;
  font-size: 15px;
  border-collapse: collapse; /* 테이블 셀 사이의 간격을 없애줍니다 */
`;

const InfoTh = styled.th`
  text-align: left;
  width: 110px;
  color: #607d8b;
  font-weight: 500;
  padding: 8px 0;
  vertical-align: top;
`;

const InfoTd = styled.td`
  text-align: left;
  padding: 8px 0;
  color: #2c3e50;
  font-weight: 600;
`;

const TotalAmount = styled.div`
  font-size: 18px;
  font-weight: 900;
  color: #1a2935;
`;
