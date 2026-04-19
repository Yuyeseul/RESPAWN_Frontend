import React, { useEffect, useState } from 'react';
import axios from '../../../api/axios';
import styled from 'styled-components';
import ItemSelector from './ItemSelector';
import Pagination from '../../Pagination';

const inquiryTypeMap = {
  DELIVERY: '배송 문의',
  PRODUCT: '상품 문의',
  ETC: '기타',
};

const InquiryList = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [inquiries, setInquiries] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedDetail, setExpandedDetail] = useState({});
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
    isFirst: true,
    isLast: true,
  });

  const handlePageChange = (page) => {
    if (page < 1 || (pageInfo.totalPages > 0 && page > pageInfo.totalPages))
      return;
    setPageInfo((p) => ({ ...p, page: page - 1 }));
  };

  // 상품 목록 불러오기 (마운트 시 1회)
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get('/items/my-items/summary');
        setItems(res.data);
      } catch (err) {
        console.error('상품 목록 불러오기 실패:', err);
      }
    };
    fetchItems();
  }, []);

  // 문의 리스트 가져오기 (선택된 상품이나 페이지 변경 시)
  useEffect(() => {
    const fetchInquiries = async (itemId) => {
      try {
        const res = await axios.get('/inquiries/seller', {
          params: { page: pageInfo.page, size: pageInfo.size, itemId },
        });
        const data = res.data;
        setInquiries(data.content);
        setPageInfo((prev) => ({
          ...prev,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          isFirst: data.first,
          isLast: data.last,
        }));
      } catch (err) {
        console.error('문의 리스트 불러오기 실패:', err);
      }
    };
    fetchInquiries(selectedItem);
  }, [selectedItem, pageInfo.page, pageInfo.size]);

  // 상세 조회 (아코디언 토글)
  const handleToggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    if (!expandedDetail[id]) {
      try {
        const res = await axios.get(`/inquiries/${id}/detail`);
        setExpandedDetail((prev) => ({ ...prev, [id]: res.data }));
      } catch (err) {
        console.error('상세 조회 실패:', err);
        return;
      }
    }
    setExpandedId(id);
  };

  // 답변 등록
  const handleAnswerSubmit = async (id, answer) => {
    try {
      const res = await axios.post(`/inquiries/${id}/answer`, { answer });
      setExpandedDetail((prev) => ({
        ...prev,
        [id]: res.data.inquiry,
      }));
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: 'ANSWERED' } : item
        )
      );
      alert('답변이 등록되었습니다.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || '답변 등록 실패');
    }
  };

  return (
    <Container>
      <Header>
        <Title>판매자 문의 관리</Title>
        <SelectorWrapper>
          <ItemSelector
            value={selectedItem}
            onChange={setSelectedItem}
            productList={items}
          />
        </SelectorWrapper>
      </Header>

      {/* PC 환경: 기존 테이블 뷰 (디자인 업그레이드) */}
      <DesktopTableWrapper>
        <Table>
          <thead>
            <tr>
              <th>상품명</th>
              <th>제목</th>
              <th>작성자</th>
              <th>작성일</th>
              <th>문의유형</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length > 0 ? (
              inquiries.map((item) => (
                <React.Fragment key={item.id}>
                  <tr
                    onClick={() => handleToggleExpand(item.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{item.itemName}</td>
                    <td>{item.question}</td>
                    <td>{item.buyerUsername}</td>
                    <td>{new Date(item.questionDate).toLocaleDateString()}</td>
                    <td>{inquiryTypeMap[item.inquiryType]}</td>
                    <td>
                      <StatusBadge $status={item.status}>
                        {item.status === 'ANSWERED' ? '답변 완료' : '대기'}
                      </StatusBadge>
                    </td>
                  </tr>

                  {/* PC 펼쳐짐 영역 */}
                  {expandedId === item.id && expandedDetail[item.id] && (
                    <tr>
                      <td colSpan={6} style={{ padding: 0, border: 'none' }}>
                        <DetailWrapper onClick={(e) => e.stopPropagation()}>
                          <DetailBox>
                            <DetailRow>
                              <DetailLabel>문의 내용</DetailLabel>
                              <DetailContent>
                                {expandedDetail[item.id].questionDetail}
                              </DetailContent>
                            </DetailRow>

                            <DetailRow>
                              <DetailLabel>답변 내용</DetailLabel>
                              <DetailContent $isAnswer>
                                {expandedDetail[item.id].answer || '미등록'}
                              </DetailContent>
                            </DetailRow>

                            <AnswerForm
                              onSubmit={(e) => {
                                e.preventDefault();
                                const answer = e.target.answer.value;
                                if (!answer.trim())
                                  return alert('답변을 입력해주세요.');
                                handleAnswerSubmit(item.id, answer);
                                e.target.answer.value = '';
                              }}
                            >
                              <AnswerInput
                                name="answer"
                                placeholder="답변을 입력하세요"
                                defaultValue={
                                  expandedDetail[item.id].answer || ''
                                }
                              />
                              <AnswerButton type="submit">등록</AnswerButton>
                            </AnswerForm>
                          </DetailBox>
                        </DetailWrapper>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <NoDataCell colSpan="6">{'문의 내역이 없습니다.'}</NoDataCell>
              </tr>
            )}
          </tbody>
        </Table>
      </DesktopTableWrapper>

      {/* 모바일 환경: 카드형 뷰 */}
      <MobileListWrapper>
        {inquiries.length > 0 ? (
          inquiries.map((item) => (
            <React.Fragment key={item.id}>
              <MobileCard onClick={() => handleToggleExpand(item.id)}>
                <CardHeader>
                  <ItemName>{item.itemName}</ItemName>
                  <DateText>
                    {new Date(item.questionDate).toLocaleDateString()}
                  </DateText>
                </CardHeader>

                <CardBody>
                  <QuestionTitle>{item.question}</QuestionTitle>
                  <MetaInfo>
                    작성자: {item.buyerUsername} |{' '}
                    {inquiryTypeMap[item.inquiryType]}
                  </MetaInfo>
                </CardBody>

                <CardFooter>
                  <StatusBadge $status={item.status}>
                    {item.status === 'ANSWERED' ? '답변 완료' : '대기'}
                  </StatusBadge>
                </CardFooter>

                {/* 모바일 펼쳐짐 영역 */}
                {expandedId === item.id && expandedDetail[item.id] && (
                  <MobileDetailBox onClick={(e) => e.stopPropagation()}>
                    <DetailRow>
                      <DetailLabel>문의 내용</DetailLabel>
                      <DetailContent>
                        {expandedDetail[item.id].questionDetail}
                      </DetailContent>
                    </DetailRow>

                    <DetailRow>
                      <DetailLabel>답변 내용</DetailLabel>
                      <DetailContent $isAnswer>
                        {expandedDetail[item.id].answer || '미등록'}
                      </DetailContent>
                    </DetailRow>

                    <MobileAnswerForm
                      onSubmit={(e) => {
                        e.preventDefault();
                        const answer = e.target.answer.value;
                        if (!answer.trim())
                          return alert('답변을 입력해주세요.');
                        handleAnswerSubmit(item.id, answer);
                        e.target.answer.value = '';
                      }}
                    >
                      <AnswerInput
                        name="answer"
                        placeholder="답변을 입력하세요"
                        defaultValue={expandedDetail[item.id].answer || ''}
                      />
                      <AnswerButton type="submit">등록</AnswerButton>
                    </MobileAnswerForm>
                  </MobileDetailBox>
                )}
              </MobileCard>
            </React.Fragment>
          ))
        ) : (
          <NoDataCard>문의 내역이 없습니다.</NoDataCard>
        )}
      </MobileListWrapper>

      {pageInfo.totalPages > 1 && (
        <PaginationWrapper>
          <Pagination
            currentPage={pageInfo.page + 1}
            totalPages={pageInfo.totalPages}
            onPageChange={handlePageChange}
            isFirst={pageInfo.isFirst}
            isLast={pageInfo.isLast}
          />
        </PaginationWrapper>
      )}
    </Container>
  );
};

export default InquiryList;

// --- 전면 개편된 스타일 영역 ---

const Container = styled.div`
  max-width: 1600px;
  margin: 60px auto;
  padding: 0 20px;
  font-family:
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    sans-serif;

  @media (max-width: 768px) {
    margin: 20px auto;
    padding: 0 10px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #555a82;
  margin: 0;
`;

const SelectorWrapper = styled.div`
  @media (max-width: 768px) {
    width: 100%;

    /* 내부 select 태그 넓이 100% 꽉 채우기 */
    select {
      width: 100%;
    }
  }
`;

/* PC용 테이블 래퍼 */
const DesktopTableWrapper = styled.div`
  width: 100%;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  th,
  td {
    padding: 14px 15px;
    text-align: center;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
  }

  th {
    background: #e6e8f4;
    color: #333;
    font-weight: 600;
    white-space: nowrap;
  }

  tr:hover {
    background: #f5f7fa;
  }
`;

const DetailWrapper = styled.div`
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #eee;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
`;

const DetailBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
  max-width: 1200px;
  margin: 0 auto;
`;

const DetailRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const DetailLabel = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #555a82;
`;

const DetailContent = styled.p`
  margin: 0;
  font-size: 14px;
  color: #334155;
  line-height: 1.5;
  background: ${(props) => (props.$isAnswer ? '#ffffff' : 'transparent')};
  padding: ${(props) => (props.$isAnswer ? '12px' : '0')};
  border-radius: ${(props) => (props.$isAnswer ? '8px' : '0')};
  border: ${(props) => (props.$isAnswer ? '1px solid #e2e8f0' : 'none')};
  white-space: pre-wrap;
`;

const AnswerForm = styled.form`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const AnswerInput = styled.input`
  flex: 1;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1.5px solid #cbd5e1;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #555a82;
    box-shadow: 0 0 0 3px rgba(85, 90, 130, 0.1);
  }
`;

const AnswerButton = styled.button`
  padding: 0 24px;
  border: none;
  background: #555a82;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #3e4263;
  }
`;

const NoDataCell = styled.td`
  padding: 50px 0 !important;
  text-align: center;
  color: #999;
  font-size: 15px;
`;

/* 상태를 나타내는 뱃지 (통일된 디자인) */
const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${(props) =>
    props.$status === 'ANSWERED' ? '#e6e8f4' : '#fff0f0'};
  color: ${(props) => (props.$status === 'ANSWERED' ? '#555a82' : '#e74c3c')};
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;

/* 모바일용 리스트 래퍼 */
const MobileListWrapper = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
`;

/* 모바일 카드 디자인 */
const MobileCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:active {
    background: #fcfcfc;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
`;

const ItemName = styled.span`
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
`;

const DateText = styled.span`
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  margin-left: 10px;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const QuestionTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
`;

const MetaInfo = styled.div`
  font-size: 13px;
  color: #64748b;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
`;

/* 모바일 카드 내부의 아코디언(확장) 영역 */
const MobileDetailBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f8fafc;
  border-radius: 10px;
  padding: 16px;
  margin-top: 8px;
  border: 1px solid #e2e8f0;
  cursor: default;
`;

const MobileAnswerForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;

  input {
    width: 100%;
    box-sizing: border-box;
  }

  button {
    width: 100%;
    padding: 12px;
  }
`;

const NoDataCard = styled.div`
  padding: 40px 0;
  text-align: center;
  color: #999;
  font-size: 14px;
  background: white;
  border-radius: 10px;
  border: 1px solid #eee;
`;
