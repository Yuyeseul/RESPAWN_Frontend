import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (preSelectedId) {
      setSelectedAddressId(preSelectedId);
    }
  }, [preSelectedId]);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get('/addresses');
      const data = Array.isArray(response.data) ? response.data : [];
      console.log(response.data);
      setAddresses(data);
      if (preSelectedId) {
        setSelectedAddressId(preSelectedId);
      }
    } catch (error) {
      console.error('주소 목록 불러오기 실패:', error);
      alert('주소 데이터를 불러오는 데 실패했습니다.');
    }
  };

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
        <Table>
          <thead>
            <tr>
              {mode === 'order' && <th>선택</th>}
              <th>배송지명 / 수령인</th>
              <th>주소</th>
              <th>연락처</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((item) => (
              <tr key={item.id}>
                {mode === 'order' && (
                  <td>
                    <input
                      type="radio"
                      name="selectedAddress"
                      value={item.id}
                      checked={selectedAddressId === item.id}
                      onChange={() => setSelectedAddressId(item.id)}
                    />
                  </td>
                )}
                <TdAddressName>
                  {item.addressName} / {item.recipient}
                  {item.basic && <DefaultBadge>기본</DefaultBadge>}
                </TdAddressName>
                <td>
                  {item.baseAddress} {item.detailAddress}
                </td>
                <td>{item.phone}</td>
              </tr>
            ))}
          </tbody>
        </Table>
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

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalBox = styled.div`
  position: relative;
  background: #fff;
  width: 800px;
  padding: 32px;
  border-radius: 10px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
`;

const Header = styled.h2`
  font-size: 20px;
  margin-bottom: 24px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 12px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;

  th,
  td {
    border: 1px solid #eee;
    padding: 12px;
    text-align: left;
  }

  th {
    background: #f7f7f7;
    font-weight: bold;
  }

  button {
    background: none;
    border: none;
    color: #0056ff;
    cursor: pointer;
    padding: 0;
  }
`;

const TdAddressName = styled.td`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DefaultBadge = styled.span`
  background-color: #333;
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
`;

const AddButton = styled.button`
  padding: 12px 24px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #333;
  }
`;

const ModifyButton = styled.button`
  padding: 12px 24px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #333;
  }
`;

const DeleteButton = styled.button`
  padding: 12px 24px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #333;
  }
`;

const ConfirmButton = styled.button`
  padding: 12px 24px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #333;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`;

const Left = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const Right = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px; /* 버튼 사이 간격 */
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #888;
  z-index: 1001;

  &:hover {
    color: #000;
  }
`;
