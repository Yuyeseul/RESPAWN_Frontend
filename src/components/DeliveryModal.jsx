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

  const handleZoneCode = () => {
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
        <CloseButton onClick={onClose}>×</CloseButton>
        <Title>주소지 설정</Title>
        <form onSubmit={handleSubmit}>
          <FormRow>
            <Label>주소지 별칭</Label>
            <Input
              name="addressName"
              placeholder="주소지 별칭"
              value={formData.addressName}
              onChange={handleChange}
              required
            />
          </FormRow>

          <FormRow>
            <Label>수령인 이름</Label>
            <Input
              name="recipient"
              type="text"
              placeholder="수령인 이름"
              value={formData.recipient}
              onChange={handleChange}
              required
            />
          </FormRow>

          <FormRow>
            <Label>우편 번호</Label>
            <FlexContainer>
              <Input
                name="zoneCode"
                placeholder="우편 번호"
                value={formData.zoneCode}
                onChange={handleChange}
                readOnly
              />
              <AddressButton onClick={handleZoneCode}>
                우편번호 검색
              </AddressButton>
            </FlexContainer>
          </FormRow>
          <FormRow>
            <Label>주소</Label>
            <Input
              name="baseAddress"
              placeholder="주소"
              value={formData.baseAddress}
              readOnly
            />
          </FormRow>

          <FormRow>
            <Label>상세 주소</Label>
            <Input
              name="detailAddress"
              placeholder="상세 주소"
              value={formData.detailAddress}
              onChange={handleChange}
              required
            />
          </FormRow>

          <FormRow>
            <Label>연락처</Label>
            <Input
              name="phone"
              placeholder="연락처"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </FormRow>

          <FormRow>
            <Label>추가 연락처</Label>
            <Input
              name="subPhone"
              placeholder="추가 연락처"
              value={formData.subPhone}
              onChange={handleChange}
            />
          </FormRow>
          <FormRow>
            <input
              type="checkbox"
              name="basic"
              checked={formData.basic}
              onChange={handleChange}
            />
            &nbsp;기본 배송지로 설정
          </FormRow>

          <SubmitButton type="submit">저장</SubmitButton>
        </form>

        {isDaumPostOpen && (
          <PostcodeWrapper>
            <PostcodeCloseButton onClick={() => setIsDaumPostOpen(false)}>
              ×
            </PostcodeCloseButton>
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  position: relative;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  width: 600px;
  max-width: 90%;
`;

const SubmitButton = styled.button`
  margin-top: 16px;
  background-color: #222;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #555;
  }
`;

const Title = styled.h2`
  font-weight: 700;
  font-size: 1.25rem;
  margin-bottom: 24px;
  color: #222;
`;

const FormRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
`;

const Label = styled.label`
  width: 120px;
  font-weight: bold;
  color: #444;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: rgb(105, 111, 148);
  }
`;

const AddressButton = styled.button`
  margin-left: 12px;
  min-width: 80px;
  height: 44px;
  background: rgb(105, 111, 148);
  color: white;
  padding: 0 16px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background: rgb(85, 90, 130);
  }
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const PostcodeWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1100;
  background-color: white;
  border-radius: 8px;
  width: 450px;
  height: 500px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
  padding: 40px 16px 16px 16px;
  box-sizing: border-box;
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

const PostcodeCloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1200;
  font-size: 20px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;

  &:hover {
    background: #eee;
  }
`;
