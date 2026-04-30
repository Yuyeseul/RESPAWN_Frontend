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

  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const selectType = (type, label) => {
    setFormData({ ...formData, inquiryType: type });
    setIsSelectOpen(false);
  };

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
            <CustomSelectContainer>
              <SelectLabel
                onClick={() => setIsSelectOpen(!isSelectOpen)}
                $isOpen={isSelectOpen}
              >
                {formData.inquiryType
                  ? formData.inquiryType === 'DELIVERY'
                    ? '배송 문의'
                    : formData.inquiryType === 'PRODUCT'
                      ? '상품 문의'
                      : '기타'
                  : '선택하세요'}
              </SelectLabel>

              {isSelectOpen && (
                <SelectList>
                  <OptionItem onClick={() => selectType('DELIVERY')}>
                    배송 문의
                  </OptionItem>
                  <OptionItem onClick={() => selectType('PRODUCT')}>
                    상품 문의
                  </OptionItem>
                  <OptionItem onClick={() => selectType('ETC')}>
                    기타
                  </OptionItem>
                </SelectList>
              )}
            </CustomSelectContainer>
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
            <StyledTextarea
              name="questionDetail"
              placeholder="문의 내용을 입력해주세요."
              value={formData.questionDetail}
              onChange={handleChange}
              minRows={5}
              required
            />
          </FormRow>

          <CheckboxRow>
            <input
              type="checkbox"
              id="openToPublic"
              name="openToPublic"
              checked={!formData.openToPublic}
              onChange={() =>
                setFormData({
                  ...formData,
                  openToPublic: !formData.openToPublic,
                })
              }
            />
            <label htmlFor="openToPublic">비밀글로 문의하기</label>
          </CheckboxRow>

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
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.white};
  padding: 32px;
  border-radius: 20px;
  width: 100%;
  max-width: 540px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  @media ${({ theme }) => theme.mobile} {
    padding: 24px 20px;
    border-radius: 16px;
    max-height: 90vh;
    overflow-y: auto;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 28px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: 1;

  &:hover {
    color: ${({ theme }) => theme.colors.black};
  }
`;

const Title = styled.h2`
  font-weight: 700;
  font-size: 1.25rem;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.colors.gray[900]};
  text-align: center;

  @media ${({ theme }) => theme.mobile} {
    font-size: 1.2rem;
    margin-bottom: 20px;
    text-align: left;
  }
`;

const FormRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;

  @media ${({ theme }) => theme.mobile} {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }
`;

const Label = styled.label`
  width: 100px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  padding-top: 12px;
  font-size: 14px;

  @media ${({ theme }) => theme.mobile} {
    width: 100%;
    padding-top: 0;
  }
`;

const inputStyles = `
  flex: 1;
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 15px;
  background-color: #fff;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.secondary};
    box-shadow: 0 0 0 3px rgba(85, 90, 130, 0.1);
  }
`;

const Input = styled.input`
  ${inputStyles}
`;

const CustomSelectContainer = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
`;

const SelectLabel = styled.div`
  width: 100%;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid
    ${({ theme, $isOpen }) =>
      $isOpen ? theme.colors.primary : theme.colors.gray[300]};
  border-radius: 12px;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;

  /* 커스텀 화살표 아이콘 */
  &::after {
    content: '';
    width: 10px;
    height: 10px;
    border-bottom: 2px solid ${({ theme }) => theme.colors.gray[550]};
    border-right: 2px solid ${({ theme }) => theme.colors.gray[550]};
    transform: ${({ $isOpen }) =>
      $isOpen ? 'rotate(-135deg)' : 'rotate(45deg)'};
    transition: transform 0.2s;
    margin-top: ${({ $isOpen }) => ($isOpen ? '4px' : '-4px')};
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.gray[400]};
  }
`;

const SelectList = styled.ul`
  position: absolute;
  top: 55px; /* 약간 띄워서 배치 */
  left: 0;
  width: 100%;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 10;
  padding: 8px;
  list-style: none;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const OptionItem = styled.li`
  padding: 12px 16px;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[700]};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary_light};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const StyledTextarea = styled(TextareaAutosize)`
  ${inputStyles}
  resize: none;
  min-height: 120px;
  line-height: 1.6;
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0 24px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[700]};

  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  label {
    cursor: pointer;
    user-select: none;
  }

  @media ${({ theme }) => theme.mobile} {
    margin: 8px 0 20px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  @media ${({ theme }) => theme.mobile} {
    flex-direction: row;
    button {
      flex: 1;
    }
  }
`;

const baseButton = `
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
`;

const SubmitButton = styled.button`
  ${baseButton}
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary_dark};
  }
`;

const CancelButton = styled.button`
  ${baseButton}
  background-color: ${({ theme }) => theme.colors.gray[100]};
  color: ${({ theme }) => theme.colors.gray[700]};

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[200]};
  }
`;
