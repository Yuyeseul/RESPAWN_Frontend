import React, { useState, useMemo } from 'react';
import NoticeBox from '../Upload/NoticeBox';
import axios from '../../../api/axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import TiptapEditor from '../Upload/TiptapEditor';
import Select from 'react-select';

const categoryGroups = [
  {
    title: '콘솔 / 컨트롤러',
    items: [
      '게임 컨트롤러',
      'umpc',
      '플레이스테이션 액세서리',
      'XBOX 액세서리',
      '닌텐도 스위치',
    ],
  },
  {
    title: '게이밍 PC / 부품',
    items: [
      '그래픽카드',
      'CPU',
      'RAM',
      'SSD / HDD',
      '파워서플라이',
      '메인보드',
    ],
  },
  {
    title: '게이밍 주변기기',
    items: [
      '마우스',
      '키보드',
      '헤드셋',
      '모니터',
      '스피커',
      '마이크',
      '레이싱 휠',
    ],
  },
  {
    title: '게이밍 환경',
    items: [
      '게이밍 체어',
      '게이밍 데스크',
      '노트북 쿨러 / 스탠드',
      'RGB 조명',
      '방음 패드',
    ],
  },
  {
    title: '악세서리 / 기타',
    items: [
      '마우스패드',
      '손목 보호대',
      '케이블 정리 용품',
      '에어 블로워',
      '멀티탭 / 허브',
    ],
  },
];

// 드롭다운(react-select) 커스텀 디자인
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '44px',
    borderRadius: '8px',
    borderColor: state.isFocused ? '#555a82' : '#e2e8f0',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(85, 90, 130, 0.1)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#555a82' : '#cbd5e1',
    },
    cursor: 'pointer',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#555a82'
      : state.isFocused
        ? '#f0f2f8'
        : 'white',
    color: state.isSelected ? 'white' : '#333',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#555a82',
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  }),
};

function UploadProduct() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [item, setItem] = useState({
    name: '',
    deliveryType: '',
    deliveryFee: '',
    price: '',
    stockQuantity: '',
    company: '',
    companyNumber: '',
    categoryName: '',
    description: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const categoryOptions = useMemo(
    () =>
      categoryGroups.map((group) => ({
        label: group.title,
        options: group.items.map((item) => ({
          value: item,
          label: item,
        })),
      })),
    []
  );

  const allCategoryItems = useMemo(
    () => categoryOptions.flatMap((group) => group.options),
    [categoryOptions]
  );

  const handleCategoryChange = (selectedOption) => {
    setItem((prev) => ({
      ...prev,
      categoryName: selectedOption ? selectedOption.value : '',
    }));
  };

  const handleDescriptionChange = (html) => {
    setItem((prev) => ({
      ...prev,
      description: html,
    }));
  };

  // 입력 변경 처리
  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  // 이미지 파일 선택 시
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  // 폼 제출
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    const formData = new FormData();
    formData.append(
      'itemDto',
      new Blob([JSON.stringify({ ...item })], { type: 'application/json' })
    );
    if (image) formData.append('image', image);

    try {
      await axios.post('/items/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('등록 성공!');
      navigate('/sellerCenter');
    } catch (err) {
      alert('등록 실패: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsModalOpen(false);
    }
  };

  function ConfirmationModal({ isOpen, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
      <ModalBackdrop onClick={onCancel}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalMessage>상품을 등록하시겠습니까?</ModalMessage>
          <ModalButtonContainer>
            <ModalCancelBtn onClick={onCancel}>취소</ModalCancelBtn>
            <ModalConfirmBtn onClick={onConfirm}>확인</ModalConfirmBtn>
          </ModalButtonContainer>
        </ModalContent>
      </ModalBackdrop>
    );
  }

  const selectedCategory = allCategoryItems.find(
    (opt) => opt.value === item.categoryName
  );

  return (
    <Container>
      <PageLayout>
        {/* 주의사항 박스를 화면 상단 전체 넓이로 띄움 */}
        <NoticeBoxWrapper>
          <NoticeBox />
        </NoticeBoxWrapper>

        <ContentWrapper>
          <Header>
            <Title>상품 등록</Title>
            <Subtitle>새로운 상품의 상세 정보를 입력하고 등록하세요.</Subtitle>
          </Header>

          <FormContainer onSubmit={handleSubmit} encType="multipart/form-data">
            <FormTopRow>
              <ImageUploadSection>
                <Label>상품 썸네일</Label>
                <ImageUploadWrapper>
                  <ImageBox htmlFor="image-upload">
                    {preview ? (
                      <PreviewImage src={preview} alt="미리보기" />
                    ) : (
                      <ImagePlaceholder>
                        <UploadIcon>📷</UploadIcon>
                        <span>이미지 등록</span>
                      </ImagePlaceholder>
                    )}
                  </ImageBox>
                  <HiddenInput
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </ImageUploadWrapper>
              </ImageUploadSection>

              <Inputs>
                <InputGroup>
                  <Label>상품명</Label>
                  <Input
                    name="name"
                    placeholder="상품명을 입력하세요"
                    value={item.name}
                    onChange={handleChange}
                  />
                </InputGroup>

                <InputGroupRow>
                  <InputGroup>
                    <Label>판매가</Label>
                    <InputWrapper>
                      <Input
                        name="price"
                        type="number"
                        placeholder="0"
                        value={item.price}
                        onChange={handleChange}
                        $hasUnit
                      />
                      <UnitAbsolute>원</UnitAbsolute>
                    </InputWrapper>
                  </InputGroup>

                  <InputGroup>
                    <Label>재고 수량</Label>
                    <InputWrapper>
                      <Input
                        name="stockQuantity"
                        placeholder="0"
                        type="number"
                        value={item.stockQuantity}
                        onChange={handleChange}
                        $hasUnit
                      />
                      <UnitAbsolute>개</UnitAbsolute>
                    </InputWrapper>
                  </InputGroup>
                </InputGroupRow>

                <InputGroupRow>
                  <InputGroup>
                    <Label>기본 배송비</Label>
                    <InputWrapper>
                      <Input
                        name="deliveryFee"
                        type="number"
                        placeholder="0"
                        value={item.deliveryFee}
                        onChange={handleChange}
                        $hasUnit
                      />
                      <UnitAbsolute>원</UnitAbsolute>
                    </InputWrapper>
                  </InputGroup>

                  <InputGroup>
                    <Label>배송 방식</Label>
                    <Select
                      name="deliveryType"
                      styles={customSelectStyles}
                      value={
                        item.deliveryType
                          ? {
                              label: item.deliveryType,
                              value: item.deliveryType,
                            }
                          : null
                      }
                      options={[
                        { value: '택배', label: '택배' },
                        { value: '퀵', label: '퀵배송' },
                        { value: '직접배송', label: '직접배송' },
                      ]}
                      onChange={(selected) =>
                        handleChange({
                          target: {
                            name: 'deliveryType',
                            value: selected?.value || '',
                          },
                        })
                      }
                      placeholder="선택"
                      isSearchable={false}
                    />
                  </InputGroup>
                </InputGroupRow>

                <InputGroup>
                  <Label>카테고리</Label>
                  <Select
                    name="categoryName"
                    styles={customSelectStyles}
                    options={categoryOptions}
                    onChange={handleCategoryChange}
                    value={selectedCategory}
                    placeholder="카테고리를 선택하세요"
                  />
                </InputGroup>
              </Inputs>
            </FormTopRow>

            <Divider />

            <EditorBox>
              <Label>상품 상세 설명</Label>
              <TiptapWrapper>
                <TiptapEditor
                  value={item.description}
                  onChange={handleDescriptionChange}
                />
              </TiptapWrapper>
            </EditorBox>

            <BottomActions>
              <CancelButton type="button" onClick={handleCancel}>
                취소
              </CancelButton>
              <SubmitButton type="submit">등록 완료</SubmitButton>
            </BottomActions>
          </FormContainer>
        </ContentWrapper>
      </PageLayout>

      <ConfirmationModal
        isOpen={isModalOpen}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setIsModalOpen(false)}
      />
    </Container>
  );
}

export default UploadProduct;

// --- 전면 개편된 스타일 영역 ---

const Container = styled.div`
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 40px 20px;
  box-sizing: border-box;
  font-family:
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    sans-serif;

  @media (max-width: 768px) {
    padding: 20px 10px;
  }
`;

const PageLayout = styled.div`
  display: flex;
  flex-direction: column; /* 세로 정렬 */
  gap: 30px;
  align-items: center;
  width: 100%;
`;

const NoticeBoxWrapper = styled.div`
  width: 100%;

  /* NoticeBox 컴포넌트 내부 너비 강제 확장 */
  & > div,
  & > section,
  & > article {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    margin: 0 !important;

    @media (max-width: 768px) {
      padding: 16px !important;
    }
  }

  /* 내부 목록(ul)을 2단(Grid)으로 분할 */
  ul {
    display: grid !important;
    grid-template-columns: repeat(
      2,
      1fr
    ) !important; /* 공간을 정확히 반씩 나눔 (2줄) */
    gap: 12px 24px !important; /* 세로 간격 12px, 가로 간격 24px */
    margin-bottom: 0 !important;

    /* 화면이 좁은 모바일(600px 이하)에서는 다시 1칸(4줄)으로 변경 */
    @media (max-width: 600px) {
      grid-template-columns: 1fr !important;
    }
  }

  /* 목록 항목(li) 텍스트 스타일 최적화 */
  li {
    margin-bottom: 0 !important; /* 기존 마진 제거하고 Grid gap으로 관리 */
    line-height: 1.5;
    word-break: keep-all; /* 단어가 중간에 잘리지 않게 보호 */
  }
`;

const ContentWrapper = styled.div`
  width: 100%;
  background: #ffffff;
  padding: 40px 50px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 16px;
  }
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h2`
  font-size: 26px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #888;
  margin: 0;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

/* 1. 썸네일과 입력창을 감싸는 전체 행 */
const FormTopRow = styled.div`
  display: flex;
  gap: 40px;

  /* 1100px 분기점에서 세로로 분리 */
  @media (max-width: 1100px) {
    flex-direction: column;
    gap: 32px;
  }
`;

const ImageUploadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
`;

const ImageUploadWrapper = styled.div`
  position: relative;
`;

/* 2. 썸네일 이미지 박스 */
const ImageBox = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 280px;
  aspect-ratio: 1 / 1;
  background-color: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
    border-color: #555a82;
  }

  @media (max-width: 1100px) {
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ImagePlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
`;

const UploadIcon = styled.span`
  font-size: 28px;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Inputs = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

/* 3. 판매가, 재고수량 등 나란히 있는 입력창 그룹 */
const InputGroupRow = styled.div`
  display: flex;
  gap: 20px;
  width: 100%;

  @media (max-width: 650px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 13px;
  color: #475569;
`;

/* 단위(원, 개)가 입력창 밖으로 밀려나지 않도록 감싸는 Wrapper */
const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px ${(props) => (props.$hasUnit ? '36px' : '14px')} 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  transition: all 0.2s ease;
  background-color: #ffffff;
  box-sizing: border-box;

  &::placeholder {
    color: #cbd5e1;
  }

  &:focus {
    outline: none;
    border-color: #555a82;
    box-shadow: 0 0 0 3px rgba(85, 90, 130, 0.1);
  }

  /* 숫자 입력 스피너 제거 */
  &[type='number'] {
    -moz-appearance: textfield;
  }
  &[type='number']::-webkit-outer-spin-button,
  &[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

/* 단위를 입력창 안쪽 우측에 고정 (Absolute) */
const UnitAbsolute = styled.span`
  position: absolute;
  right: 14px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  pointer-events: none;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #f1f5f9;
  margin: 0;
  width: 100%;
`;

const EditorBox = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TiptapWrapper = styled.div`
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;

  &:focus-within {
    border-color: #555a82;
    box-shadow: 0 0 0 3px rgba(85, 90, 130, 0.1);
  }

  /* 🔥 TiptapEditor 내부의 여백과 테두리를 완벽하게 없앰 */
  & > div {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
  }

  .ProseMirror {
    min-height: 400px;
  }
`;

const BottomActions = styled.div`
  display: flex;
  justify-content: flex-end; /* 등록 페이지는 삭제 버튼이 없으므로 우측 정렬 유지 */
  gap: 12px;
  align-items: center;
  padding-top: 10px;

  @media (max-width: 600px) {
    flex-direction: column-reverse;
    gap: 16px;

    button {
      width: 100%;
    }
  }
`;

const ButtonBase = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const CancelButton = styled(ButtonBase)`
  background: white;
  border: 1.5px solid #cbd5e1;
  color: #475569;

  &:hover {
    background-color: #f8fafc;
    border-color: #94a3b8;
    color: #1e293b;
  }
`;

const SubmitButton = styled(ButtonBase)`
  background-color: #555a82;
  border: 1.5px solid #555a82;
  color: white;

  &:hover {
    background-color: #3e4263;
    border-color: #3e4263;
    box-shadow: 0 4px 12px rgba(85, 90, 130, 0.2);
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  padding: 32px 24px 24px;
  border-radius: 16px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  text-align: center;
  width: 100%;
  max-width: 340px;
  animation: modalScale 0.2s ease-out;

  @keyframes modalScale {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const ModalMessage = styled.p`
  margin: 0 0 24px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.5;
`;

const ModalButtonContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const ModalCancelBtn = styled(ButtonBase)`
  flex: 1;
  background: #f1f5f9;
  border: none;
  color: #475569;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }
`;

const ModalConfirmBtn = styled(ButtonBase)`
  flex: 1;
  background: #555a82;
  border: none;
  color: white;

  &:hover {
    background: #3e4263;
  }
`;
