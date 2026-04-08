import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from '../api/axios';
import DaumPostcode from 'react-daum-postcode';

function DeliverModal({ onClose, onSaveComplete, initialData }) {
  const [isDaumPostOpen, setIsDaumPostOpen] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    addressName: '',
    recipient: '',
    zoneCode: '',
    baseAddress: '',
    detailAddress: '',
    phone: '',
    subPhone: '',
    basic: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        basic: Boolean(initialData.basic), // 명확히 boolean 변환
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleZoneCode = (e) => {
    e.preventDefault();
    setIsDaumPostOpen(true);
  };

  const handleComplete = (data) => {
    setFormData({
      ...formData,
      zoneCode: data.zonecode,
      baseAddress: data.roadAddress,
    });
    setIsDaumPostOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (initialData) {
        response = await axios.put(`/addresses/${formData.id}`, formData);
      } else {
        response = await axios.post(`/addresses/add`, formData);
      }
      // 서버에서 저장된 최신 주소 객체를 부모에 전달
      if (onSaveComplete) {
        onSaveComplete(response.data);
        console.log(response.data);
      }
      onClose();
    } catch (error) {
      alert(
        '저장 실패: ' + (error.response?.data?.message || '알 수 없는 오류')
      );
      console.error(error);
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        {!isDaumPostOpen && (
          <>
            <Header>
              <Title>{initialData ? '배송지 수정' : '새 배송지 추가'}</Title>
              <CloseButton onClick={onClose}>×</CloseButton>
            </Header>

            <FormScrollArea onSubmit={handleSubmit}>
              <FormSection>
                <FormRow>
                  <Label>주소지 별칭</Label>
                  <Input
                    name="addressName"
                    placeholder="예: 우리집, 회사"
                    value={formData.addressName}
                    onChange={handleChange}
                    required
                  />
                </FormRow>

                <FormRow>
                  <Label>수령인 이름</Label>
                  <Input
                    name="recipient"
                    placeholder="이름을 입력하세요"
                    value={formData.recipient}
                    onChange={handleChange}
                    required
                  />
                </FormRow>

                <FormRow>
                  <Label>우편 번호</Label>
                  <ZipCodeContainer>
                    <Input
                      name="zoneCode"
                      placeholder="00000"
                      value={formData.zoneCode}
                      onChange={handleChange}
                      readOnly
                      tabIndex="-1"
                    />
                    <AddressButton onClick={handleZoneCode}>검색</AddressButton>
                  </ZipCodeContainer>
                </FormRow>

                <FormRow>
                  <Label>주소</Label>
                  <Input
                    name="baseAddress"
                    placeholder="주소 검색을 이용해 주세요"
                    value={formData.baseAddress}
                    readOnly
                    tabIndex="-1"
                  />
                </FormRow>

                <FormRow>
                  <Label>상세 주소</Label>
                  <Input
                    name="detailAddress"
                    placeholder="나머지 주소를 입력하세요"
                    value={formData.detailAddress}
                    onChange={handleChange}
                    required
                  />
                </FormRow>

                <FormRow>
                  <Label>연락처</Label>
                  <Input
                    name="phone"
                    placeholder="-없이 입력하세요"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </FormRow>

                <FormRow>
                  <Label>추가 연락처(선택)</Label>
                  <Input
                    name="subPhone"
                    placeholder="비상 연락처"
                    value={formData.subPhone}
                    onChange={handleChange}
                  />
                </FormRow>
              </FormSection>

              <CheckboxRow>
                <input
                  type="checkbox"
                  id="basic"
                  name="basic"
                  checked={formData.basic}
                  onChange={handleChange}
                />
                <label htmlFor="basic">기본 배송지로 설정</label>
              </CheckboxRow>

              <SubmitButton type="submit">저장</SubmitButton>
            </FormScrollArea>
          </>
        )}

        {isDaumPostOpen && (
          <PostcodeWrapper>
            <PostcodeHeader>
              <span>주소 검색</span>
              <button onClick={() => setIsDaumPostOpen(false)}>×</button>
            </PostcodeHeader>
            <DaumPostcode
              onComplete={handleComplete}
              style={{ width: '100%', height: '450px' }}
            />
          </PostcodeWrapper>
        )}
      </ModalContent>
    </ModalOverlay>
  );
}

export default DeliverModal;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 16px;
`;

const ModalContent = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  height: auto;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[700]};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: ${({ theme }) => theme.colors.gray[600]};
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.gray[700]};
  }
`;

const FormScrollArea = styled.form`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;

  @media ${({ theme }) => theme.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[700]};
  min-width: 120px;
  margin-top: 12px;
  align-self: flex-start;

  @media ${({ theme }) => theme.mobile} {
    margin-top: 0;
    align-self: stretch;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 6px;
  font-size: 15px;
  background: ${({ readOnly, theme }) =>
    readOnly ? theme.colors.gray[100] : theme.colors.white};

  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  ${({ readOnly, theme }) =>
    readOnly &&
    `
    pointer-events: none; 
    user-select: none;
    cursor: default;
    
    &:focus {
      border-color: ${theme.colors.gray[300]};
    }
  `}
`;

const ZipCodeContainer = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;

  input {
    flex: 1;
  }

  @media ${({ theme }) => theme.mobile} {
    max-width: none;
  }
`;

const AddressButton = styled.button`
  background: ${({ theme }) => theme.colors.gray[800]};
  color: ${({ theme }) => theme.colors.white};
  padding: 0 16px;
  border-radius: 6px;
  border: none;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.gray[700]};
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[700]};

  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  label {
    cursor: pointer;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  margin-top: 32px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: 14px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    padding: 16px;
    opacity: 0.9;
  }
`;

const PostcodeWrapper = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.colors.white};
  display: flex;
  flex-direction: column;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  overflow: hidden;
`;

const PostcodeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: ${({ theme }) => theme.colors.gray[100]};
  span {
    font-weight: 600;
    font-size: 16px;
  }
  button {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
  }
`;
