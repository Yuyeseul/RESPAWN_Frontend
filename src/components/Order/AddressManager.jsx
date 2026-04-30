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
    <SectionContainer>
      <SectionHeader>
        <Title>배송 정보</Title>
      </SectionHeader>

      <ContentBody>
        <ButtonGroup>
          <TabButton
            active={selectedAddressType === 'basic'}
            onClick={() => handleAddressTypeChange('basic')}
            disabled={!defaultAddress}
          >
            기본 배송지
          </TabButton>
          <TabButton
            active={selectedAddressType === 'select'}
            onClick={() => handleAddressTypeChange('select')}
          >
            배송지 변경
          </TabButton>
          <AddLink onClick={() => handleAddressTypeChange('new')}>
            + 새 배송지 등록
          </AddLink>
        </ButtonGroup>

        <DisplayCard>
          <InfoGrid>
            <div className="label">받는 분</div>
            <div className="value bold">{addressForm.recipient || '-'}</div>
            <div className="label">연락처</div>
            <div className="value">{addressForm.phone || '-'}</div>
            <div className="label">주소</div>
            <div className="value">
              <ZipCode>({addressForm.zoneCode || '00000'})</ZipCode>
              <AddressText>
                {addressForm.baseAddress} {addressForm.detailAddress}
              </AddressText>
            </div>
          </InfoGrid>
        </DisplayCard>
      </ContentBody>

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
    </SectionContainer>
  );
};

export default AddressManager;

const SectionContainer = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 0;
`;

const SectionHeader = styled.div`
  padding: 20px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[900]};
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.gray[900]};
`;

const ContentBody = styled.div`
  padding: 24px 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const TabButton = styled.button`
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid
    ${({ active, theme }) =>
      active ? theme.colors.primary : theme.colors.gray[300]};
  background: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.white};
  color: ${({ active, theme }) =>
    active ? theme.colors.white : theme.colors.gray[600]};
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 6px 10px;
    font-size: 12px;
    flex: 1;
    max-width: fit-content;
  }
`;

const AddLink = styled.button`
  margin-left: auto;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[600]};
  background: none;
  border: none;
  cursor: pointer;
  white-space: nowrap;

  @media ${({ theme }) => theme.mobile} {
    font-size: 12px;
    padding: 4px 0;
  }
`;

const DisplayCard = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  padding: 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr;
  row-gap: 10px;
  font-size: 14px;
  line-height: 1.5;

  .label {
    color: ${({ theme }) => theme.colors.gray[600]};
  }
  .value {
    color: ${({ theme }) => theme.colors.gray[900]};
    &.bold {
      font-weight: 600;
    }
  }

  @media ${({ theme }) => theme.mobile} {
    grid-template-columns: 70px 1fr;
  }
`;

const ZipCode = styled.span`
  display: block;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[700]};
  margin-bottom: 2px;
`;

const AddressText = styled.p`
  margin: 0;
  word-break: break-all;
  color: ${({ theme }) => theme.colors.gray[800]};
`;
