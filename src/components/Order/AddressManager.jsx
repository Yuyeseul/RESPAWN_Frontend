import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import DeliveryModal from '../DeliveryModal';
import AddressListModal from '../AddressListModal';

const AddressManager = ({ defaultAddress, onAddressSelect }) => {
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    zoneCode: '',
    baseAddress: '',
    detailAddress: '',
    recipient: '',
    phone: '',
  });
  const [showAddressForm, setShowAddressForm] = useState(true);
  const [selectedAddressType, setSelectedAddressType] = useState('basic');
  const [prevAddressType, setPrevAddressType] = useState('basic');

  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isAddressListModalOpen, setIsAddressListModalOpen] = useState(false);
  const [preSelectedAddressId, setPreSelectedAddressId] = useState(null);

  // orderData로부터 defaultAddress가 전달되면 상태를 초기화합니다.
  useEffect(() => {
    if (defaultAddress) {
      setAddressForm(defaultAddress);
      setSelectedAddressId(defaultAddress.id || null);
      setSelectedAddressType('basic');
    } else {
      setAddressForm({
        zoneCode: '',
        baseAddress: '',
        detailAddress: '',
        recipient: '',
        phone: '',
      });
      setSelectedAddressId(null);
      setSelectedAddressType(null);
    }
  }, [defaultAddress]);

  // 선택된 주소 ID가 변경될 때마다 부모 컴포넌트로 알립니다.
  useEffect(() => {
    onAddressSelect(selectedAddressId);
  }, [selectedAddressId, onAddressSelect]);

  // 배송지 타입 변경
  const handleAddressTypeChange = (type) => {
    setPrevAddressType(selectedAddressType);

    if (type === 'basic') {
      if (defaultAddress) {
        setAddressForm(defaultAddress);
        setSelectedAddressId(defaultAddress.id || null);
        setSelectedAddressType('basic');
      }
      setIsDeliveryModalOpen(false);
      setIsAddressListModalOpen(false);
    } else if (type === 'select') {
      setIsAddressListModalOpen(true);
      setIsDeliveryModalOpen(false);
      setSelectedAddressType('select');
    } else if (type === 'new') {
      setIsDeliveryModalOpen(true);
      setIsAddressListModalOpen(false);
      setSelectedAddressType('new');
    }
  };

  // 배송지 목록 모달에서 주소 선택 시 처리
  const handleAddressListConfirm = (address) => {
    setSelectedAddressId(address.id);
    setAddressForm({
      zoneCode: address.zoneCode || '',
      baseAddress: address.baseAddress || '',
      detailAddress: address.detailAddress || '',
      recipient: address.recipient || '',
      phone: address.phone || '',
    });
    setSelectedAddressType('select');
    setIsAddressListModalOpen(false);
  };

  return (
    <AddressSection>
      <AddressHeader onClick={() => setShowAddressForm(!showAddressForm)}>
        배송정보
        <span>{showAddressForm ? '▲' : '▼'}</span>
      </AddressHeader>
      <AddressRadioGroup>
        <label>
          <input
            type="radio"
            name="addressType"
            checked={selectedAddressType === 'basic'}
            onChange={() => handleAddressTypeChange('basic')}
            disabled={!defaultAddress}
          />{' '}
          기본 배송지
        </label>

        <label>
          <input
            type="radio"
            name="addressType"
            checked={selectedAddressType === 'select'}
            onChange={() => handleAddressTypeChange('select')}
          />{' '}
          선택 배송지
        </label>

        <AddressListButton
          type="button"
          onClick={() => handleAddressTypeChange('new')}
        >
          새로운 배송지 추가
        </AddressListButton>
      </AddressRadioGroup>

      {isDeliveryModalOpen && (
        <DeliveryModal
          onClose={() => {
            setIsDeliveryModalOpen(false);
            setSelectedAddressType(prevAddressType);
          }}
          onSaveComplete={(savedAddress) => {
            setIsDeliveryModalOpen(false);
            setPreSelectedAddressId(savedAddress.id);
            setIsAddressListModalOpen(true);
          }}
        />
      )}

      {isAddressListModalOpen && (
        <AddressListModal
          onClose={() => setIsAddressListModalOpen(false)}
          preSelectedId={preSelectedAddressId}
          onConfirm={handleAddressListConfirm}
          mode="order"
        />
      )}

      {showAddressForm && (
        <AddressForm>
          <FormGroup>
            <label>우편번호</label>
            <Input type="text" value={addressForm.zoneCode} readOnly />
          </FormGroup>
          <FormGroup>
            <label>기본주소</label>
            <Input type="text" value={addressForm.baseAddress} readOnly />
          </FormGroup>
          <FormGroup>
            <label>상세주소</label>
            <Input type="text" value={addressForm.detailAddress} readOnly />
          </FormGroup>
          <FormGroup>
            <label>받는 사람</label>
            <Input type="text" value={addressForm.recipient} readOnly />
          </FormGroup>
          <FormGroup>
            <label>전화번호</label>
            <Input type="text" value={addressForm.phone} readOnly />
          </FormGroup>
        </AddressForm>
      )}
    </AddressSection>
  );
};

export default AddressManager;

const AddressSection = styled.div`
  margin: 40px 0;
`;

const AddressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  padding: 10px 0;
  border-bottom: 1px solid #ccc;
`;

const AddressRadioGroup = styled.div`
  display: flex;
  gap: 20px;
  margin: 20px 0;

  label {
    font-size: 14px;
  }
`;

const AddressListButton = styled.button`
  padding: 8px 14px;
  font-size: 14px;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const AddressForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
  }

  input {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.95rem;
  }

  button {
    background: #222;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    cursor: pointer;
    &:hover {
      background: #444;
    }
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: ${({ readOnly }) => (readOnly ? '#f5f5f5' : 'white')};
  cursor: ${({ readOnly }) => (readOnly ? 'default' : 'text')};
  font-size: 16px;

  &:focus {
    border-color: ${({ readOnly }) => (readOnly ? '#ccc' : '#0056ff')};
    outline: none;
  }
`;
