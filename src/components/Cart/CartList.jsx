import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import StepProgress from '../common/StepProgress';
import { BASE_URL } from '../../api/axios';

const CartList = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const allChecked =
    cartItems.length > 0 && cartItems.every((item) => item.checked);

  const handleCheckAll = () => {
    const nextChecked = !allChecked;
    setCartItems((prev) =>
      prev.map((item) => ({ ...item, checked: nextChecked }))
    );
  };

  const handleCheck = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchCartItems = async () => {
      try {
        const res = await axios.get(`/cart`, {
          signal: controller.signal,
        });

        const itemsWithChecked = res.data.cartItems.map((item) => ({
          ...item,
          checked: true,
        }));

        setCartItems(itemsWithChecked);
      } catch (err) {
        console.error('장바구니 데이터 로드 실패', err);
      }
    };

    fetchCartItems();

    return () => {
      controller.abort();
    };
  }, []);

  const handleBuySelectedItems = async () => {
    const selectedItems = cartItems.filter((item) => item.checked);
    const itemIds = selectedItems.map((item) => item.cartItemId);

    if (itemIds.length === 0) {
      alert('선택된 상품이 없습니다.');
      return;
    }

    try {
      const res = await axios.post('/orders/cart', {
        cartItemIds: itemIds,
      });

      const orderId = res.data.orderId;
      navigate(`/order/${orderId}`);
    } catch (err) {
      console.error(err);
      alert('주문 생성에 실패했습니다.');
    }
  };

  const handleCountChange = async (cartItemId, amount) => {
    const item = cartItems.find((item) => item.cartItemId === cartItemId);
    if (!item || (item.count <= 1 && amount < 0)) return;

    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, count: item.count + amount }
          : item
      )
    );

    try {
      const endpoint = amount > 0 ? 'increase' : 'decrease';
      await axios.post(`/cart/items/${cartItemId}/${endpoint}`, {
        amount: Math.abs(amount),
      });
    } catch (error) {
      console.error('수량 변경 실패:', error);
      alert('수량 변경에 실패했습니다. 다시 시도해주세요.');
      setCartItems((prev) =>
        prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, count: item.count - amount }
            : item
        )
      );
    }
  };

  const totalPrice = useMemo(() => {
    return cartItems
      .filter((item) => item.checked)
      .reduce((acc, item) => acc + item.itemPrice * item.count, 0);
  }, [cartItems]);

  const handleDeleteSelected = async () => {
    const selectedIds = cartItems
      .filter((it) => it.checked)
      .map((it) => it.cartItemId);
    if (selectedIds.length === 0) {
      alert('선택된 상품이 없습니다.');
      return;
    }
    const ok = window.confirm(
      `선택한 ${selectedIds.length}개 상품을 삭제할까요?`
    );
    if (!ok) return;

    try {
      await axios.delete('/cart/items/delete', {
        headers: { 'Content-Type': 'application/json' },
        data: {
          cartItemIds: selectedIds,
        },
      });

      setCartItems((prev) =>
        prev.filter((it) => !selectedIds.includes(it.cartItemId))
      );
    } catch (e) {
      console.error('선택 삭제 실패:', e);
      alert('선택 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleClearAll = async () => {
    if (cartItems.length === 0) {
      alert('장바구니가 비어 있습니다.');
      return;
    }
    const ok = window.confirm('장바구니를 모두 비우시겠습니까?');
    if (!ok) return;

    try {
      await axios.delete('/cart'); // 예시

      setCartItems([]);
    } catch (e) {
      console.error('전체 비우기 실패:', e);
      alert('전체 비우기에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container>
        <StepProgressWrapper>
          <StepProgress currentStep={1} />
        </StepProgressWrapper>
        <Title>장바구니</Title>
        <EmptyCartMessage>장바구니에 담긴 상품이 없습니다.</EmptyCartMessage>
      </Container>
    );
  }

  return (
    <Container>
      <StepProgressWrapper>
        <StepProgress currentStep={1} />
      </StepProgressWrapper>
      <Title>장바구니</Title>

      <MobileSelectAllBar>
        <Checkbox
          type="checkbox"
          id="mobile-all-check"
          checked={allChecked}
          onChange={handleCheckAll}
        />
        <label htmlFor="mobile-all-check">
          전체 선택 ({cartItems.filter((i) => i.checked).length}/
          {cartItems.length})
        </label>
      </MobileSelectAllBar>

      <Table>
        <thead>
          <tr>
            <th>
              <Checkbox
                type="checkbox"
                checked={allChecked}
                onChange={handleCheckAll}
              />
            </th>
            <th>상품정보</th>
            <th>수량</th>
            <th>상품금액</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => (
            <ItemRow key={item.cartItemId}>
              <td>
                <Checkbox
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleCheck(item.cartItemId)}
                />
              </td>
              <td>
                <ProductInfo>
                  <img
                    src={`${BASE_URL}${item.imageUrl}`}
                    alt={item.itemName}
                  />
                  <span>{item.itemName}</span>
                </ProductInfo>
              </td>
              <td>
                <CountControl>
                  <button
                    onClick={() => handleCountChange(item.cartItemId, -1)}
                  >
                    -
                  </button>
                  <span>{item.count}</span>
                  <button onClick={() => handleCountChange(item.cartItemId, 1)}>
                    +
                  </button>
                </CountControl>
              </td>
              <td>
                <Price>
                  {(item.itemPrice * item.count).toLocaleString()}원
                </Price>
              </td>
            </ItemRow>
          ))}
        </tbody>
      </Table>

      <ButtonActions>
        <DeleteButton onClick={handleDeleteSelected}>선택 삭제</DeleteButton>
        <DeleteButton onClick={handleClearAll}>전체 삭제</DeleteButton>
      </ButtonActions>

      <Summary>
        <FinalPrice>
          결제 예정 금액 <span>{totalPrice.toLocaleString()}원</span>
        </FinalPrice>
        <GreenButton onClick={handleBuySelectedItems}>주문하기</GreenButton>
      </Summary>
    </Container>
  );
};

export default CartList;

const Container = styled.div`
  padding: 40px;
  max-width: ${({ theme }) => theme.maxWidth};
  min-height: 500px;
  width: 100%;
  margin: 0 auto;

  @media ${({ theme }) => theme.mobile} {
    padding: 20px 15px;
  }
`;

const StepProgressWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;

  @media ${({ theme }) => theme.mobile} {
    margin-bottom: 30px;
  }
`;

const Title = styled.h2`
  font-size: 34px;
  text-align: center;
  margin: 0 0 40px 0;
  color: ${({ theme }) => theme.colors.gray[700]};

  @media ${({ theme }) => theme.mobile} {
    font-size: 24px;
    margin-bottom: 20px;
  }
`;

const MobileSelectAllBar = styled.div`
  display: none; /* 기본 숨김 */

  @media ${({ theme }) => theme.mobile} {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px;
    background: ${({ theme }) => theme.colors.gray[100]};
    border-radius: 8px;
    margin-bottom: 10px;

    label {
      font-size: 14px;
      font-weight: bold;
      color: ${({ theme }) => theme.colors.gray[700]};
      cursor: pointer;
    }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  overflow: hidden;

  thead {
    @media ${({ theme }) => theme.mobile} {
      display: none;
    }
  }

  th,
  td {
    padding: 20px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
    word-break: break-word;
    text-align: center;
  }

  th {
    background: ${({ theme }) => theme.colors.gray[100]};
  }

  /* 상품명(3번째 열)만 왼쪽 정렬 */
  thead th:nth-child(2),
  tbody td:nth-child(2) {
    text-align: left;
  }

  @media ${({ theme }) => theme.mobile} {
    display: block;
    tbody {
      display: block;
    }
  }
`;

const ItemRow = styled.tr`
  td {
    vertical-align: middle;
    text-align: center;
  }

  @media ${({ theme }) => theme.mobile} {
    display: grid;
    grid-template-columns: 40px 1.2fr 1fr;
    grid-template-areas:
      'check info info'
      'check count price';
    padding: 15px 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};

    td {
      display: block;
      padding: 5px;
      border: none;
      text-align: left !important;
    }

    /* 1. 체크박스 영역 (왼쪽 고정) */
    td:nth-child(1) {
      grid-area: check;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }

    /* 2. 상품 정보 영역 */
    td:nth-child(2) {
      grid-area: info;
      margin-bottom: 5px;
    }

    /* 3. 수량 조절 영역 (왼쪽 하단) */
    td:nth-child(3) {
      grid-area: count;
      display: flex;
      align-items: center;
      z-index: 10;
    }

    /* 4. 금액 영역 (오른쪽 하단) */
    td:nth-child(4) {
      grid-area: price;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-top: 0;
      font-weight: bold;
    }
  }
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  img {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  }

  span {
    font-size: 16px;
    word-break: break-word;
  }

  @media ${({ theme }) => theme.mobile} {
    gap: 10px;
    img {
      width: 60px;
      height: 60px;
    }
    span {
      font-size: 14px;
    }
  }
`;

const CountControl = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  button {
    width: 30px;
    height: 30px;
    font-size: 18px;
    background: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.gray[600]};
    border: none;
    cursor: pointer;
  }

  @media ${({ theme }) => theme.mobile} {
    justify-content: flex-start;
  }
`;

const Price = styled.div`
  font-weight: bold;
`;

const ButtonActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
`;

const Summary = styled.div`
  margin-top: 40px;
  padding: 30px 20px;
  border-top: 2px solid ${({ theme }) => theme.colors.gray[700]};
  background-color: ${({ theme }) => theme.colors.white};
  font-size: 16px;

  @media ${({ theme }) => theme.mobile} {
    margin-top: 20px;
    padding: 20px 15px;
    text-align: center;
  }
`;

const FinalPrice = styled.p`
  display: flex;
  justify-content: space-between; /* 양 끝으로 배치 */
  align-items: center;
  margin-bottom: 25px; /* 버튼과의 간격 확보 */
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.gray[800]};

  span {
    font-size: 24px;
    color: ${({ theme }) => theme.colors.red};
  }

  @media ${({ theme }) => theme.mobile} {
    font-size: 16px;
    span {
      font-size: 22px;
    }
  }
`;

const GreenButton = styled.button`
  width: 100%;
  max-width: 400px;
  height: 56px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  font-size: 18px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  display: block;
  margin: 0 auto;

  &:hover {
    filter: brightness(1.1);
  }

  @media ${({ theme }) => theme.mobile} {
    height: 52px;
    font-size: 17px;
  }
`;

const DeleteButton = styled.button`
  padding: 10px 20px;
  background-color: ${({ theme }) => theme.colors.gray[200]};
  color: ${({ theme }) => theme.colors.gray[700]};
  border: none;
  font-size: 15px;
  border-radius: 8px;
  cursor: pointer;

  @media ${({ theme }) => theme.mobile} {
    width: 100%;
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

const EmptyCartMessage = styled.div`
  text-align: center;
  padding: 80px 20px;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.gray[600]};
  border-top: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
`;
