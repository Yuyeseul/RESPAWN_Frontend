import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import DeliveryModal from './DeliveryModal';
import axios from '../api/axios';

function AddressListModal({
  onClose,
  onConfirm,
  preSelectedId,
  mode = 'order',
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(
    preSelectedId || null
  );

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const fetchAddresses = useCallback(async () => {
    try {
      const response = await axios.get('/addresses');
      const data = Array.isArray(response.data) ? response.data : [];
      setAddresses(data);
      if (preSelectedId) {
        setSelectedAddressId(preSelectedId);
      }
    } catch (error) {
      console.error('주소 목록 불러오기 실패:', error);
      alert('주소 데이터를 불러오는 데 실패했습니다.');
    }
  }, [preSelectedId]); // 내부에 쓰인 preSelectedId도 의존성으로 추가

  // 2. useEffect 배열 안에 fetchAddresses를 넣어줍니다.
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const deleteAddresses = async () => {
    if (!selectedAddressId) {
      alert('삭제할 주소를 선택해주세요.');
      return;
    }
    try {
      await axios.delete(`/addresses/${selectedAddressId}`);
      fetchAddresses();
    } catch (error) {
      console.error('주소 목록 불러오기 실패:', error);
      alert('주소 데이터를 불러오는 데 실패했습니다.');
    }
  };

  // 확인 버튼 클릭 핸들러
  const handleConfirm = () => {
    if (!selectedAddressId) {
      alert('배송지를 선택해주세요.');
      return;
    }
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddress) {
      alert('선택한 배송지를 찾을 수 없습니다.');
      return;
    }
    onConfirm(selectedAddress); // 주소 객체 전체 전달
    onClose();
  };

  return (
    <Overlay>
      <ModalBox>
        <CloseButton onClick={onClose}>×</CloseButton>
        <Header>배송지 관리</Header>

        <ContentScrollArea>
          <Table>
            <thead>
              <tr>
                {/* {mode === 'order' && (
                  <th style={{ width: '60px', textAlign: 'center' }}>선택</th>
                )} */}
                <th>배송지명 / 수령인</th>
                <th>주소</th>
                <th>연락처</th>
              </tr>
            </thead>
            <tbody>
              {addresses.map((item) => (
                <Tr
                  key={item.id}
                  isSelectable={
                    true
                  } /* 항상 마우스 포인터가 손가락 모양으로 보이게 변경 */
                  isSelected={selectedAddressId === item.id}
                  onClick={() =>
                    setSelectedAddressId(item.id)
                  } /* mode 조건 제거: 누르면 무조건 선택되게 변경 */
                >
                  {/* {mode === 'order' && (
                    <TdRadio>
                      <input
                        type="radio"
                        name="selectedAddress"
                        value={item.id}
                        checked={selectedAddressId === item.id}
                        onChange={() => setSelectedAddressId(item.id)}
                        onClick={(e) => e.stopPropagation()} // 행 클릭과 중복 이벤트 방지
                      />
                    </TdRadio>
                  )} */}
                  <TdAddressName>
                    <span className="name-text">
                      {item.addressName} / {item.recipient}
                    </span>
                    {item.basic && <DefaultBadge>기본</DefaultBadge>}
                  </TdAddressName>
                  <TdAddress>
                    {item.baseAddress} {item.detailAddress}
                  </TdAddress>
                  <TdPhone>{item.phone}</TdPhone>
                </Tr>
              ))}
            </tbody>
          </Table>
        </ContentScrollArea>

        <ButtonWrapper>
          <Left>
            <AddButton
              onClick={() => {
                setIsEditMode(false);
                setIsAddModalOpen(true);
              }}
            >
              배송지 추가
            </AddButton>
          </Left>
          <Right>
            <ModifyButton
              onClick={() => {
                if (!selectedAddressId) {
                  alert('수정할 주소를 선택해주세요.');
                  return;
                }
                setIsEditMode(true); // 수정 모드
                setIsAddModalOpen(true);
              }}
            >
              수정
            </ModifyButton>
            <DeleteButton onClick={deleteAddresses}>삭제</DeleteButton>
            {mode === 'order' && (
              <ConfirmButton onClick={handleConfirm}>확인</ConfirmButton>
            )}
          </Right>
        </ButtonWrapper>
        {isAddModalOpen && (
          <DeliveryModal
            onClose={() => {
              setIsAddModalOpen(false);
              fetchAddresses(); // 목록 갱신
            }}
            initialData={isEditMode ? selectedAddress : null}
          />
        )}
      </ModalBox>
    </Overlay>
  );
}

export default AddressListModal;

// --- Styled Components ---

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlay};
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;

  @media ${({ theme }) => theme.mobile} {
    padding: 0; /* 모바일에서는 꽉 차게 */
  }
`;

const ModalBox = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.white};
  width: 800px;
  max-width: 100%;
  max-height: 90vh;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 20px ${({ theme }) => theme.colors.overlay_line};
  display: flex;
  flex-direction: column;

  @media ${({ theme }) => theme.mobile} {
    width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    padding: 20px;
  }
`;

const Header = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
  padding-bottom: 16px;
  color: ${({ theme }) => theme.colors.gray[800]};

  @media ${({ theme }) => theme.mobile} {
    font-size: 18px;
    padding-top: 8px;
  }
`;

const ContentScrollArea = styled.div`
  overflow-y: auto;
  flex: 1;
  margin-bottom: 20px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.gray[400]};
    border-radius: 4px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    border: 1px solid ${({ theme }) => theme.colors.gray[200]};
    padding: 14px 12px;
    text-align: left;
    vertical-align: middle;
  }

  th {
    background: ${({ theme }) => theme.colors.gray[100]};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.gray[700]};
  }

  @media ${({ theme }) => theme.mobile} {
    display: block;

    thead {
      display: none;
    }

    tbody {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    td {
      border: none;
      padding: 4px 0;
    }
  }
`;

const Tr = styled.tr`
  background-color: ${({ theme }) => theme.colors.white};
  transition: background-color all 0.2s ease-in-out;

  ${({ isSelectable, theme }) =>
    isSelectable &&
    `
      cursor: pointer;
      &:hover {
        background-color: ${theme.colors.mouse_over};
      }
    `}

  @media ${({ theme }) => theme.mobile} {
    display: flex;
    flex-direction: column;
    border: 2px solid ${({ theme }) => theme.colors.gray[300]};
    border-radius: 8px;
    padding: 16px;
    position: relative;
  }

  /* 선택된 행/카드 스타일 */
  ${({ isSelected, theme }) =>
    isSelected &&
    `
    outline: 2px solid ${theme.colors.black};
    outline-offset: -2px;
    position: relative; 
    z-index: 10;

    @media ${({ theme }) => theme.mobile} {
      outline: none;
      border-color: ${theme.colors.black};
      border-width: 2px;
      padding: 15px;
    }
  `}
`;

const TdAddressName = styled.td`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  .name-text {
    font-weight: 500;
  }

  @media ${({ theme }) => theme.mobile} {
    padding-right: 30px;
    margin-bottom: 6px;

    .name-text {
      font-size: 16px;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.black};
    }
  }
`;

const TdAddress = styled.td`
  @media ${({ theme }) => theme.mobile} {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.gray[650]};
    line-height: 1.5;
  }
`;

const TdPhone = styled.td`
  color: ${({ theme }) => theme.colors.gray[600]};
  @media ${({ theme }) => theme.mobile} {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.gray[800]};
    margin-top: 2px;
  }
`;

const DefaultBadge = styled.span`
  background-color: ${({ theme }) => theme.colors.gray[800]};
  color: white;
  font-size: 11px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[300]};
  gap: 16px;

  @media ${({ theme }) => theme.mobile} {
    flex-direction: column;
    padding-top: 0;
    border-top: none;
    gap: 10px;
  }
`;

const Left = styled.div`
  display: flex;
  justify-content: flex-start;

  @media ${({ theme }) => theme.mobile} {
    width: 100%;
    button {
      width: 100%;
    }
  }
`;

const Right = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  @media ${({ theme }) => theme.mobile} {
    width: 100%;
    gap: 10px;
    button {
      flex: 1; /* 우측 버튼들 동일한 비율로 꽉 차게 */
      padding: 12px 0;
    }
  }
`;

const BaseButton = styled.button`
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
`;

const AddButton = styled(BaseButton)`
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[100]};
  }
`;

const ModifyButton = styled(BaseButton)`
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[100]};
  }
`;

const DeleteButton = styled(BaseButton)`
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.red};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};

  &:hover {
    background-color: ${({ theme }) => theme.colors.pale_pink};
  }
`;

const ConfirmButton = styled(BaseButton)`
  background-color: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.black};

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[800]};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 20px;
  font-size: 28px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[550]};
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.black};
  }

  @media ${({ theme }) => theme.mobile} {
    top: 14px;
    right: 16px;
  }
`;
