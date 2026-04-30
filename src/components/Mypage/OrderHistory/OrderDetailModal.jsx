import React, { useEffect, useRef, useCallback, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';
import { BASE_URL } from '../../../api/axios';

const OrderDetailModal = ({ open, onClose, orderId, triggerRef }) => {
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewsStatus, setReviewsStatus] = useState({});

  const formatCurrency = (v) => {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n.toLocaleString() : '0';
  };

  const deliveryStatusLabel = (status) => {
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

  const orderStatusMap = {
    TEMPORARY: '임시주문',
    ORDERED: '주문접수',
    PAID: '결제완료',
    CANCELED: '주문취소',
    RETURNED: '반품',
    REFUND_REQUESTED: '환불신청',
    REFUNDED: '환불완료',
  };

  const refundStatusMap = {
    NONE: '',
    REQUESTED: '환불요청',
    REFUNDED: '환불완료',
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

    const loadData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await axios.get(`/orders/${orderId}/complete-info`);
        console.log('--- Order Full Data ---', res.data);
        setData(res.data);

        if (res.data.orderItems) {
          const statusMap = {};
          await Promise.all(
            res.data.orderItems.map(async (item) => {
              console.log(
                `--- Item (ID: ${item.orderItemId}) Fields ---`,
                item
              );
              try {
                const reviewRes = await axios.get(
                  `/reviews/order-items/${item.orderItemId}`
                );
                statusMap[item.orderItemId] = reviewRes.data.exists;
              } catch (e) {
                statusMap[item.orderItemId] = false;
              }
            })
          );
          setReviewsStatus(statusMap);
        }
      } catch (e) {
        setError('정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [open, orderId]);

  const handleAction = (type, item) => {
    const path =
      type === 'refund'
        ? `/mypage/orders/${orderId}/items/${item.orderItemId}/registerRefund`
        : `/mypage/orders/${orderId}/items/${item.orderItemId}/registerReview`;
    navigate(path);
    onClose();
  };

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
          {isLoading && (
            <LoadingWrapper>
              <Spinner />
              <LoadingText>주문 상세 정보를 불러오는 중입니다...</LoadingText>
            </LoadingWrapper>
          )}
          {error && <ErrorText>{error}</ErrorText>}
          {!isLoading && !error && data && (
            <>
              <OrderInfo>
                <span>
                  주문일시{' '}
                  <b>{new Date(data.orderDate).toLocaleString('ko-KR')}</b>
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
                    <th style={{ textAlign: 'center' }}>상태</th>
                    <th style={{ textAlign: 'center' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orderItems.map((item) => {
                    const deliveryItem = data.deliveryInfo?.find(
                      (d) => d.orderItemId === item.orderItemId
                    );
                    const deliveryStatus = (
                      deliveryItem?.status || ''
                    ).toUpperCase();

                    const canRequestRefund =
                      (data.status || '').toUpperCase() === 'PAID' &&
                      (!item.refund || item.refund === 'NONE');
                    const isDelivered = deliveryStatus === 'DELIVERED';
                    const hasReview = reviewsStatus[item.orderItemId];

                    return (
                      <tr key={item.orderItemId}>
                        <td style={{ textAlign: 'center' }}>
                          <img
                            src={`${BASE_URL}${item.imageUrl}`}
                            alt=""
                            width={64}
                            style={{ borderRadius: '4px' }}
                          />
                        </td>
                        <td>{item.itemName}</td>
                        <td style={{ textAlign: 'center' }}>{item.count}</td>
                        <td style={{ textAlign: 'center' }}>
                          {formatCurrency(item.orderPrice)}원
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {formatCurrency(item.orderPrice * item.count)}원
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <StatusWrapper>
                            <span className="delivery">
                              {deliveryStatusLabel(deliveryStatus)}
                            </span>
                            <span className="order">
                              {orderStatusMap[item.status] || item.status}
                            </span>
                          </StatusWrapper>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <ActionGroup>
                            {canRequestRefund ? (
                              <ActionButton
                                onClick={() => handleAction('refund', item)}
                              >
                                환불신청
                              </ActionButton>
                            ) : item.refund && item.refund !== 'NONE' ? (
                              <DoneText>
                                {refundStatusMap[item.refund]}
                              </DoneText>
                            ) : null}

                            {isDelivered && !hasReview ? (
                              <ActionButton
                                onClick={() => handleAction('review', item)}
                              >
                                리뷰작성
                              </ActionButton>
                            ) : hasReview ? (
                              <DoneText>리뷰완료</DoneText>
                            ) : null}
                          </ActionGroup>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              <MobileItemList>
                {data.orderItems.map((item) => {
                  const deliveryItem = data.deliveryInfo?.find(
                    (d) => d.orderItemId === item.orderItemId
                  );
                  const deliveryStatus = (
                    deliveryItem?.status || ''
                  ).toUpperCase();
                  const isPaymentSuccess =
                    (data.paymentStatus || '').toUpperCase() === 'SUCCESS';
                  const itemRefundSt = item.refund;
                  const canRequestRefund =
                    isPaymentSuccess && itemRefundSt === 'NONE';
                  const isDelivered = deliveryStatus === 'DELIVERED';
                  const hasReview = reviewsStatus[item.orderItemId];

                  return (
                    <MobileItemCard key={item.orderItemId}>
                      <img src={`${BASE_URL}${item.imageUrl}`} alt="" />
                      <div className="content">
                        <div className="name">{item.itemName}</div>
                        <div className="info">
                          {item.count}개 / {formatCurrency(item.orderPrice)}원
                        </div>
                        <StatusWrapper
                          style={{
                            flexDirection: 'row',
                            gap: '8px',
                            marginTop: '4px',
                          }}
                        >
                          <span className="delivery">
                            {deliveryStatusLabel(deliveryStatus)}
                          </span>
                          <span className="order">
                            {orderStatusMap[item.status] || item.status}
                          </span>
                        </StatusWrapper>
                      </div>
                      <ActionGroup>
                        {canRequestRefund ? (
                          <ActionButton
                            onClick={() => handleAction('refund', item)}
                          >
                            환불신청
                          </ActionButton>
                        ) : itemRefundSt !== 'NONE' ? (
                          <DoneText>{refundStatusMap[itemRefundSt]}</DoneText>
                        ) : null}
                        {hasReview ? (
                          <DoneText>리뷰완료</DoneText>
                        ) : isDelivered ? (
                          <ActionButton
                            primary
                            onClick={() => handleAction('review', item)}
                          >
                            리뷰작성
                          </ActionButton>
                        ) : null}
                      </ActionGroup>
                    </MobileItemCard>
                  );
                })}
              </MobileItemList>

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

// === 스타일 영역 ===
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
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
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  max-height: 90vh;

  @media ${({ theme }) => theme.mobile} {
    width: 95%;
    max-height: 95vh;
  }
`;

const DialogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
`;

const DialogTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[700]};
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
  max-height: calc(90vh - 130px);

  @media ${({ theme }) => theme.mobile} {
    padding: 16px;
  }
`;

const DialogFooter = styled.div`
  padding: 12px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[300]};
  display: flex;
  justify-content: flex-end;
`;

const PrimaryButton = styled.button`
  min-width: 100px;
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  padding: 40px 0;
  text-align: center;
`;

const OrderInfo = styled.div`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.gray[700]};
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
    color: ${({ theme }) => theme.colors.gray[700]};
  }
`;

const OrderNum = styled.span`
  color: ${({ theme }) => theme.colors.gray[700]};
  font-size: 16px;
  margin-left: 6px;
  font-weight: 700;
  letter-spacing: 0.05em;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[700]};
  margin-top: 24px;
  margin-bottom: 8px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
  margin-bottom: 24px;

  @media ${({ theme }) => theme.mobile} {
    display: none;
  }

  thead th {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.gray[700]};
    padding: 16px 12px;
    border-bottom: 2px solid ${({ theme }) => theme.colors.lightNavy};
  }

  thead th:nth-child(1) {
    width: 80px;
  } /* 이미지 */
  thead th:nth-child(2) {
    width: auto;
  } /* 상품명 (남은 공간 차지) */
  thead th:nth-child(3) {
    width: 60px;
  } /* 수량 */
  thead th:nth-child(4) {
    width: 100px;
  } /* 단가 */
  thead th:nth-child(5) {
    width: 110px;
  } /* 금액 */
  thead th:nth-child(6) {
    width: 100px;
  } /* 상태 */
  thead th:nth-child(7) {
    width: 100px;
  } /* 관리 */

  tbody tr {
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
  }

  tbody td {
    padding: 16px 12px;
    vertical-align: middle;
    color: ${({ theme }) => theme.colors.gray[700]};

    &:nth-child(2) {
      white-space: nowrap; /* 한 줄로 유지 */
      overflow: hidden; /* 넘치는 부분 숨김 */
      text-overflow: ellipsis; /* ... 표시 */
      text-align: left;
    }
  }
`;

const MobileItemList = styled.div`
  display: none;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  @media ${({ theme }) => theme.mobile} {
    display: flex;
  }
`;

const MobileItemCard = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 8px;
  align-items: center;
  justify-content: space-between;

  img {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    object-fit: cover;
  }
  .content {
    flex: 1;
    min-width: 0;
  }
  .name {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 2px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .info {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.gray[600]};
  }
`;

const StatusWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;

  .delivery {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.gray[700]};
  }
  .order {
    font-size: 11px;
    color: ${({ theme }) => theme.colors.gray[600]};
  }
`;

const ActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  min-height: 48px;
`;

const ActionButton = styled.button`
  width: 76px;
  padding: 5px 0;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  &:hover {
    opacity: 0.8;
  }
`;

const DoneText = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[600]};
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 5px 0;
  text-align: center;
`;

const RowSection = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 36px;
  flex-direction: column;

  @media ${({ theme }) => theme.mobile} {
    flex-direction: column;
  }
`;

const InfoCard = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 16px;
  padding: 24px;
`;

const InfoHeading = styled.div`
  font-size: 17px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[700]};
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.lightNavy};
`;

const PaymentDetailsGrid = styled.div`
  display: flex;
  gap: 24px;

  @media ${({ theme }) => theme.mobile} {
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
  color: ${({ theme }) => theme.colors.gray[700]};
  margin: 0 0 4px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
`;

const PaymentRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
`;

const PaymentLabel = styled.span`
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const PaymentValue = styled.span`
  font-weight: 600;
  color: ${(props) =>
    props.isDiscount
      ? props.theme.colors.danger
      : props.theme.colors.gray[700]};
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[300]};
`;

const PaymentDivider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[300]};
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
  color: ${({ theme }) => theme.colors.primary};
`;

const InfoTable = styled.table`
  width: 100%;
  font-size: 15px;
  border-collapse: collapse;
`;

const InfoTh = styled.th`
  text-align: left;
  width: 110px;
  color: ${({ theme }) => theme.colors.gray[700]};
  font-weight: 500;
  padding: 8px 0;
  vertical-align: top;
`;

const InfoTd = styled.td`
  text-align: left;
  padding: 8px 0;
  color: ${({ theme }) => theme.colors.gray[700]};
  font-weight: 600;
`;

const TotalAmount = styled.div`
  font-size: 18px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.gray[700]};
`;
