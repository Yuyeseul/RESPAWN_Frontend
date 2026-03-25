import React, { useState } from 'react';
import styled from 'styled-components';
import axios from '../../api/axios';
import TextareaAutosize from 'react-textarea-autosize';

function InquiryModal({ itemId, onClose }) {
  const [formData, setFormData] = useState({
    inquiryType: '',
    question: '',
    questionDetail: '',
    openToPublic: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`/inquiries`, {
        ...formData,
        itemId,
      });
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
        <Title>상품 Q&A 작성</Title>
        <form onSubmit={handleSubmit}>
          <FormRow>
            <Label>문의 유형</Label>
            <Select
              name="inquiryType"
              value={formData.inquiryType}
              onChange={handleChange}
              required
            >
              <option value="">선택하세요</option>
              <option value="DELIVERY">배송 문의</option>
              <option value="PRODUCT">상품 문의</option>
              <option value="ETC">기타</option>
            </Select>
          </FormRow>

          <FormRow>
            <Label>제목</Label>
            <Input
              name="question"
              placeholder="문의 제목"
              value={formData.question}
              onChange={handleChange}
              required
            />
          </FormRow>

          <FormRow>
            <Label>내용</Label>
            <TextareaAutosize
              name="questionDetail"
              placeholder="문의 내용"
              value={formData.questionDetail}
              onChange={handleChange}
              minRows={5}
              required
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #ccc',
                borderRadius: 6,
                resize: 'none',
                fontSize: '16px',
              }}
            />
          </FormRow>

          <FormRow>
            <input
              type="checkbox"
              name="openToPublic"
              checked={!formData.openToPublic}
              onChange={() =>
                setFormData({
                  ...formData,
                  openToPublic: !formData.openToPublic,
                })
              }
            />
            &nbsp;비밀글로 문의하기
          </FormRow>

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>
              취소
            </CancelButton>
            <SubmitButton type="submit">등록</SubmitButton>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
}

export default InquiryModal;

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

const Select = styled.select`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
  background: white;

  &:focus {
    outline: none;
    border-color: rgb(105, 111, 148);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const SubmitButton = styled.button`
  background-color: #222;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #444;
  }
`;

const CancelButton = styled.button`
  background-color: #eee;
  color: #333;
  border: none;
  padding: 10px 18px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #ddd;
  }
`;
