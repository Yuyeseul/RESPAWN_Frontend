import React, { useState, useMemo } from 'react';
import NoticeBox from './NoticeBox';
import axios from '../../../api/axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import TiptapEditor from './TiptapEditor';
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
    setImage(file);
    setPreview(URL.createObjectURL(file));
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
      alert('등록 실패: ' + err.response?.data?.message || err.message);
    } finally {
      setIsModalOpen(false);
    }
  };

  function ConfirmationModal({ isOpen, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
      <ModalBackdrop>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <p>상품을 등록하시겠습니까?</p>
          <ModalButtonContainer>
            <ModalButton onClick={onCancel}>취소</ModalButton>
            <ConfirmButton onClick={onConfirm}>확인</ConfirmButton>
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
        <NoticeBox />
        <ContentWrapper>
          <Title>상품 등록</Title>

          <FormContainer onSubmit={handleSubmit} encType="multipart/form-data">
            <FormTopRow>
              <ImageUpload>
                <ImageBox>
                  {preview ? (
                    <PreviewImage src={preview} alt="미리보기" />
                  ) : (
                    <ImagePlaceholder>이미지</ImagePlaceholder>
                  )}
                </ImageBox>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </ImageUpload>
              <Inputs>
                <InputGroup>
                  <Label>상품명</Label>
                  <Input
                    name="name"
                    value={item.name}
                    onChange={handleChange}
                  />
                </InputGroup>

                <Row>
                  <InputGroup style={{ flex: 1 }}>
                    <Label>판매가</Label>
                    <FlexRow>
                      <Input
                        name="price"
                        type="number"
                        value={item.price}
                        onChange={handleChange}
                      />
                      <Unit>원</Unit>
                    </FlexRow>
                  </InputGroup>
                </Row>

                <Row>
                  <InputGroup style={{ flex: 1 }}>
                    <Label>재고</Label>
                    <FlexRow>
                      <Input
                        name="stockQuantity"
                        type="number"
                        value={item.stockQuantity}
                        onChange={handleChange}
                      />
                      <Unit>개</Unit>
                    </FlexRow>
                  </InputGroup>
                </Row>

                <Row>
                  <InputGroup style={{ flex: 1 }}>
                    <Label>배송비</Label>
                    <FlexRow>
                      <Input
                        name="deliveryFee"
                        type="number"
                        value={item.deliveryFee}
                        onChange={handleChange}
                      />
                      <Unit>원</Unit>
                    </FlexRow>
                  </InputGroup>
                </Row>

                <InputGroup>
                  <Label>배송방식</Label>
                  <SelectStyled
                    name="deliveryType"
                    value={
                      item.deliveryType
                        ? { label: item.deliveryType, value: item.deliveryType }
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
                    placeholder="배송방식을 선택하세요"
                  />
                </InputGroup>

                <InputGroup>
                  <Label>카테고리</Label>
                  <SelectStyled
                    name="categoryName"
                    options={categoryOptions}
                    onChange={handleCategoryChange}
                    value={selectedCategory}
                    placeholder="카테고리를 선택하세요"
                  />
                </InputGroup>
              </Inputs>
            </FormTopRow>

            <EditorBox>
              <EditorTitle>상품 상세 정보</EditorTitle>
              <TiptapEditor
                value={item.description}
                onChange={handleDescriptionChange}
              />
            </EditorBox>

            <BottomActions>
              <CancelButton type="button" onClick={handleCancel}>
                취소
              </CancelButton>
              <SubmitButton type="submit">등록하기</SubmitButton>
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const PageLayout = styled.div`
  display: flex;
  gap: 80px;
  justify-content: center;
  margin-left: -170px;
`;

const ContentWrapper = styled.div`
  padding: 40px;
`;

const Title = styled.h2`
  margin-bottom: 30px;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const FormTopRow = styled.div`
  display: flex;
  gap: 60px;
`;

const ImageUpload = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ImageBox = styled.div`
  width: 300px;
  height: 320px;
  background-color: #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ImagePlaceholder = styled.div`
  color: #aaa;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const FlexRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Inputs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  width: 300px;
  &[type='number'] {
    -moz-appearance: textfield;
  }
  &[type='number']::-webkit-outer-spin-button,
  &[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Unit = styled.span`
  color: #555;
`;

export const EditorBox = styled.div`
  max-width: 800px;
  background: #fff;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
`;

export const EditorTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
`;

const BottomActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const CancelButton = styled.button`
  background: #fff;
  border: 1px solid #ccc;
  padding: 10px 20px;
  cursor: pointer;
`;

const SubmitButton = styled.button`
  background: rgb(105, 111, 148);
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 14px;
`;

const SelectStyled = styled(Select)`
  width: 300px;
  font-size: 14px;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 360px;
`;

const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
`;

const ModalButton = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
`;

const ConfirmButton = styled(ModalButton)`
  background-color: rgb(105, 111, 148);
  color: white;
  border: none;
`;
