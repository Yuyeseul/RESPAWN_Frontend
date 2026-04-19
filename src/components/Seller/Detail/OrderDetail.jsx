import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from '../../../api/axios';

function OrderDetail() {
  const { orderItemId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  const statusMap = {
    TEMPORARY: '임시주문',
    ORDERED: '주문접수',
    PAID: '결제완료',
    CANCELED: '주문취소',
    RETURNED: '반품',
    REFUND_REQUESTED: '환불신청',
    REFUNDED: '환불',
  };

  const deliveryStatusMap = {
    PROCESSING: '상품준비중',
    READY: '배송준비중',
    SHIPPING: '배송중',
    DELIVERED: '배송완료',
  };

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await axios.get(
          `/orders/seller/orders/${orderItemId}`
        );
        setOrder(response.data);
      } catch (error) {
        console.error('주문 상세 정보 조회 실패:', error);
      }
    };

    fetchOrderDetail();
  }, [orderItemId]);

  if (!order) return <Wrapper>로딩 중...</Wrapper>;

  return (
    <Wrapper>
      <BackButton onClick={() => navigate(-1)}>← 뒤로가기</BackButton>
      <Title>주문서 상세 내역</Title>

      <Section>
        <SectionTitle>주문 정보</SectionTitle>
        <Table>
          <tbody>
            <tr>
              <th>주문번호</th>
              <td className="highlight">{order.orderId}</td>
              <th>주문일시</th>
              <td>{new Date(order.orderDate).toLocaleString('ko-KR')}</td>
            </tr>
            <tr>
              <th>상품명</th>
              <td className="highlight">{order.itemName}</td>
              <th>수량</th>
              <td>{order.count}</td>
            </tr>
            <tr>
              <th>총 결제금액</th>
              <td className="highlight">
                {order.totalPrice.toLocaleString()}원
              </td>
              <th>주문상태</th>
              <td>
                <StatusBadge status={order.orderStatus}>
                  {statusMap[order.orderStatus]}
                </StatusBadge>
              </td>
            </tr>
          </tbody>
        </Table>
      </Section>

      <FlexContainer>
        <Section>
          <SectionTitle>구매자 정보</SectionTitle>
          <Table>
            <tbody>
              <tr>
                <th>이름</th>
                <td>{order.buyerName || '정보 없음'}</td>
              </tr>
              <tr>
                <th>전화번호</th>
                <td>{order.buyerPhone || '정보 없음'}</td>
              </tr>
              <tr>
                <th>이메일</th>
                <td>{order.buyerEmail || '정보 없음'}</td>
              </tr>
            </tbody>
          </Table>
        </Section>

        <Section>
          <SectionTitle>배송지 정보</SectionTitle>
          <Table>
            <tbody>
              <tr>
                <th>수령인</th>
                <td>{order.recipient || '정보 없음'}</td>
              </tr>
              <tr>
                <th>우편번호</th>
                <td>{order.zoneCode || '정보 없음'}</td>
              </tr>
              <tr>
                <th>주소</th>
                <td>
                  {order.baseAddress || ''} {order.detailAddress || ''}
                </td>
              </tr>
              <tr>
                <th>전화번호</th>
                <td>{order.phone || '정보 없음'}</td>
              </tr>
              <tr>
                <th>보조전화번호</th>
                <td>{order.subPhone || '정보 없음'}</td>
              </tr>
              <tr>
                <th>배송상태</th>
                <td>
                  {deliveryStatusMap[order.deliveryStatus] || '정보 없음'}
                </td>
              </tr>
            </tbody>
          </Table>
        </Section>
      </FlexContainer>
    </Wrapper>
  );
}

export default OrderDetail;

const Wrapper = styled.div`
  max-width: 1100px;
  margin: 40px auto 80px;
  padding: 0 20px;
  font-family: 'Noto Sans KR', sans-serif;
  color: #333;

  /* 모바일 여백 축소 */
  @media (max-width: 768px) {
    margin: 20px auto 40px;
    padding: 0 15px;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #111;
  margin-bottom: 40px;
  letter-spacing: -0.02em;

  /* 모바일 폰트 축소 */
  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 24px;
  }
`;

const Section = styled.section`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 24px 32px;
  margin-bottom: 32px;
  box-shadow: 0 6px 15px rgb(0 0 0 / 0.07);

  /* 모바일 섹션 여백 축소 */
  @media (max-width: 768px) {
    padding: 20px 20px;
    margin-bottom: 24px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 28px;
  color: #000;
  border-bottom: 2px solid #555a82;
  padding-bottom: 10px;

  /* 모바일 폰트 축소 */
  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 20px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;

  th,
  td {
    padding: 14px 16px;
    font-size: 15px;
    vertical-align: middle;
    word-break: keep-all; /* 모바일에서 단어 잘림 방지 */
  }

  th {
    width: 130px;
    font-weight: 600;
    color: #555a82;
    text-align: left;
    background: #f3f4f6;
    border-radius: 6px 0 0 6px;
  }

  td {
    background: #f9fafb;
    border-radius: 0 6px 6px 0;
    font-weight: 500;
    color: #111;
  }

  .highlight {
    font-weight: 700;
    font-size: 16px;
    color: #000;
  }

  /* 🔥 모바일 반응형 처리: 테이블 구조를 유지하면서 2열 리스트로 변환 */
  @media (max-width: 768px) {
    border-spacing: 0;
    display: block;

    tbody {
      display: block;
      width: 100%;
    }

    tr {
      display: grid;
      grid-template-columns: 110px 1fr; /* 제목 110px, 나머지 값 */
      gap: 8px 0; /* 주문 정보처럼 4칸(2쌍)인 경우 위아래 8px 간격 생성 */
      margin-bottom: 16px;
    }

    th,
    td {
      display: flex;
      align-items: center;
      padding: 12px;
      font-size: 14px;
    }

    th {
      width: auto;
      border-radius: 6px 0 0 6px;
    }

    td {
      border-radius: 0 6px 6px 0;
    }

    .highlight {
      font-size: 15px;
    }
  }
`;

const FlexContainer = styled.div`
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  justify-content: space-between;

  & > section {
    flex: 1;
    min-width: 400px;

    /* 모바일에서는 섹션이 세로로 떨어지고 100% 꽉 차도록 변경 */
    @media (max-width: 768px) {
      min-width: 100%;
      margin-bottom: 0;
    }
  }

  @media (max-width: 768px) {
    gap: 24px;
    flex-direction: column;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #555a82;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 24px;
  padding: 0;
  &:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    font-size: 15px;
    margin-bottom: 16px;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 5px 14px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  color: white;
  white-space: nowrap; /* 글자 줄바꿈 방지 */

  background-color: ${(props) => {
    switch (props.status) {
      case 'TEMPORARY':
        return '#bdbdbd';
      case 'ORDERED':
        return '#4caf50';
      case 'PAID':
        return '#2196f3';
      case 'CANCELED':
        return '#f44336';
      case 'RETURNED':
        return '#ff9800';
      case 'REFUND_REQUESTED':
        return '#673ab7';
      case 'REFUNDED':
        return '#9c27b0';
      default:
        return '#696f94';
    }
  }};
`;
