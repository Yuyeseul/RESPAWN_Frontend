import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import StepProgress from '../common/StepProgress';

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
        const res = await axios.get(`/api/cart`, {
          signal: controller.signal,
        });

        const itemsWithChecked = res.data.cartItems.map((item) => ({
          ...item,
          checked: false,
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
      const res = await axios.post('/api/orders/cart', {
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
      await axios.post(`/api/cart/items/${cartItemId}/${endpoint}`, {
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
      await axios.delete('/api/cart/items/delete', {
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
      await axios.delete('/api/cart'); // 예시

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
                  <img src={item.imageUrl} alt={item.itemName} />
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
        <DeleteButton onClick={handleDeleteSelected}>
          선택 상품 삭제
        </DeleteButton>
        <DeleteButton onClick={handleClearAll}>
          장바구니 전체 비우기
        </DeleteButton>
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
  max-width: 1200px;
  min-height: 500px;
  width: 1200px;
  margin: 0 auto;
`;

const StepProgressWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px; /* 타이틀과 간격 */
`;

const Title = styled.h2`
  font-size: 34px;
  text-align: center;
  margin: 0 0 40px 0; /* 아래쪽 마진 유지 */
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  overflow: hidden;

  th,
  td {
    padding: 20px;
    border-bottom: 1px solid #eee;
    word-break: break-word; /* 긴 단어 줄바꿈 */
    text-align: center;
  }

  th {
    background: #f5f5f5;
  }

  /* 상품명(3번째 열)만 왼쪽 정렬 */
  thead th:nth-child(2),
  tbody td:nth-child(2) {
    text-align: left;
  }
`;

const ItemRow = styled.tr`
  td {
    vertical-align: middle;
    text-align: center;
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
  }

  span {
    font-size: 16px;
    word-break: break-word;
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
    background: #eee;
    border: none;
    cursor: pointer;
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
  margin-top: 50px;
  padding: 20px;
  border-top: 2px solid #222;
  font-size: 16px;

  p {
    margin: 10px 0;
  }
`;

const FinalPrice = styled.p`
  margin-top: 20px;
  font-size: 20px;
  font-weight: bold;
  color: #e60023;

  span {
    margin-left: 20px;
    font-size: 24px;
  }
`;

const GreenButton = styled.button`
  margin-top: 20px;
  width: 200px;
  height: 50px;
  background-color: rgb(85, 90, 130);
  color: white;
  border: none;
  font-size: 18px;
  border-radius: 8px;
  cursor: pointer;
`;

const DeleteButton = styled.button`
  padding: 10px 20px;
  background-color: #eee;
  color: #333;
  border: none;
  font-size: 15px;
  border-radius: 8px;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const EmptyCartMessage = styled.div`
  text-align: center;
  padding: 80px 20px;
  font-size: 18px;
  color: #888;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
`;
