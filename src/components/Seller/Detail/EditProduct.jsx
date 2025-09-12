import React, { useEffect, useState, useMemo } from 'react';
import NoticeBox from '../Upload/NoticeBox';
import axios from '../../../api/axios';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
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

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams(); // 상품 ID

  const [item, setItem] = useState(null);
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

  const STATUS = {
    SALE: 'SALE', // 판매중
    PAUSED: 'PAUSED', // 일시중지(일시품절)
    STOPPED: 'STOPPED', // 판매중지(품절)
  };

  const handleStatusChange = async (newStatus) => {
    try {
      let endpoint;
      if (newStatus === STATUS.PAUSED) endpoint = `/api/items/${item.id}/pause`;
      else if (newStatus === STATUS.STOPPED)
        endpoint = `/api/items/${item.id}/stop`;
      else if (newStatus === STATUS.SALE)
        endpoint = `/api/items/${item.id}/resume`;

      await axios.post(endpoint);
      alert('상태 변경 성공!');
      setItem((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert('상태 변경 실패: ' + (err.response?.data?.message || err.message));
    }
  };

  const renderStatusButtons = () => {
    if (!item) return null;
    switch (item.status) {
      case STATUS.SALE:
        return (
          <>
            <StatusButton
              type="button"
              active={false}
              onClick={() => handleStatusChange(STATUS.PAUSED)}
            >
              일시 품절
            </StatusButton>
            <StatusButton
              type="button"
              active={false}
              onClick={() => handleStatusChange(STATUS.STOPPED)}
            >
              품절
            </StatusButton>
          </>
        );
      case STATUS.PAUSED:
        return (
          <StatusButton
            type="button"
            active={true}
            onClick={() => handleStatusChange(STATUS.SALE)}
          >
            판매 재개
          </StatusButton>
        );
      case STATUS.STOPPED:
        return (
          <StatusButton
            type="button"
            active={true}
            onClick={() => handleStatusChange(STATUS.SALE)}
          >
            판매 재개
          </StatusButton>
        );
      default:
        return null;
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('정말로 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/items/${item.id}`);
      alert('삭제 성공!');
      navigate('/sellerCenter');
    } catch (err) {
      alert('삭제 실패: ' + (err.response?.data?.error || err.message));
    }
  };

  // 초기 데이터 불러오기
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`/api/items/${id}`);
        console.log(res.data);
        setItem(res.data);
        setPreview(res.data.imageUrl);
      } catch (err) {
        alert('상품 정보를 불러오지 못했습니다.');
        navigate(-1);
      }
    };
    fetchItem();
  }, [id, navigate]);

  const handleChange = (e) => {
    setItem((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append(
      'itemDto',
      new Blob(
        [
          JSON.stringify({
            ...item,
            category: item.categoryName,
          }),
        ],
        { type: 'application/json' }
      )
    );

    // 이미지가 선택되어 있을 때만 formData에 append
    if (image) {
      formData.append('image', image);
    } else {
      // 이미지 파일이 없으면 빈 Blob으로라도 보내야할지 API에 따라 다름
      // 백엔드에서 이미지 선택적 처리 가능하면 아래 부분 삭제 가능
      // formData.append('image', new Blob([]));
    }

    try {
      await axios.put(`/api/items/${item.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('수정 성공!');
      navigate('/sellerCenter');
    } catch (err) {
      alert('수정 실패: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!item) return <div>로딩 중...</div>;

  const selectedCategory = allCategoryItems.find(
    (opt) => opt.value === item.categoryName
  );

  return (
    <Container>
      <PageLayout>
        <NoticeBox />
        <ContentWrapper>
          <Title>상품 수정</Title>

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
                <Input
                  name="name"
                  placeholder="상품명"
                  value={item.name}
                  onChange={handleChange}
                />

                <Row>
                  <FlexRow>
                    <Input
                      name="price"
                      type="number"
                      placeholder="판매가"
                      value={item.price}
                      onChange={handleChange}
                    />
                    <Unit>원</Unit>
                  </FlexRow>
                </Row>

                <Row>
                  <FlexRow>
                    <Input
                      name="stockQuantity"
                      placeholder="재고"
                      type="number"
                      value={item.stockQuantity}
                      onChange={handleChange}
                    />
                    <Unit>개</Unit>
                  </FlexRow>
                </Row>

                <Row>
                  <FlexRow>
                    <Input
                      name="deliveryFee"
                      type="number"
                      placeholder="기본 배송비"
                      value={item.deliveryFee}
                      onChange={handleChange}
                    />
                    <Unit>원</Unit>
                  </FlexRow>
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

            <StatusButtons>{renderStatusButtons()}</StatusButtons>

            <BottomActions>
              <CancelButton type="button" onClick={handleCancel}>
                취소
              </CancelButton>
              <SubmitButton type="submit">수정하기</SubmitButton>
              <DeleteButton
                type="button"
                onClick={handleDelete}
                disabled={item.status === STATUS.SALE}
                title={
                  item.status === STATUS.SALE
                    ? '배송 완료 후 품절 상태일 때만 삭제할 수 있습니다.'
                    : '삭제하기'
                }
              >
                삭제하기
              </DeleteButton>
            </BottomActions>
            <NoticeMessage>
              모든 배송이 완료되고 품절 상태일 때만 삭제할 수 있습니다.
            </NoticeMessage>
          </FormContainer>
        </ContentWrapper>
      </PageLayout>
    </Container>
  );
}

export default EditProduct;

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

const Inputs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  width: 300px;
`;

const FlexRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
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
  gap: 12px;
  align-items: center;
  margin-top: 10px;
  border-top: 1px solid #eee;
  padding-top: 30px;
`;

const CancelButton = styled.button`
  background: transparent;
  border: 1.8px solid #999;
  padding: 10px 26px;
  border-radius: 6px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #eee;
    border-color: #666;
    color: #333;
  }
`;

const SubmitButton = styled.button`
  background-color: #3b5998;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(59, 89, 152, 0.6);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2d4373;
  }
`;

const StatusButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 24px 0 40px 0;
`;

const StatusButton = styled.button`
  padding: 12px 28px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 16px;
  border: 2px solid ${(props) => (props.active ? '#3b5998' : '#ccc')};
  background-color: ${(props) => (props.active ? '#3b5998' : 'white')};
  color: ${(props) => (props.active ? 'white' : '#444')};
  cursor: pointer;
  box-shadow: ${(props) =>
    props.active ? '0 4px 10px rgba(59, 89, 152, 0.4)' : 'none'};
  transition: all 0.25s ease;

  &:hover {
    background-color: #3b5998;
    color: white;
    border-color: #3b5998;
    box-shadow: 0 6px 14px rgba(59, 89, 152, 0.5);
  }
`;

const DeleteButton = styled.button`
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 4px;
`;

const NoticeMessage = styled.div`
  margin-top: 28px;
  font-size: 14px;
  color: #555;
  background-color: #f0f4ff;
  padding: 16px 24px;
  border-radius: 10px;
  border: 1px solid #c3d0ff;
  max-width: 440px;
  font-family: 'Pretendard', sans-serif;
  text-align: center;
  box-shadow: 0 0 8px rgba(195, 208, 255, 0.5);
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
