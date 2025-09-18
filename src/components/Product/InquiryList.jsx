import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import Pagination from '../Pagination';
import axios from '../../api/axios';
import InquiryModal from './InquiryModal';
import { useAuth } from '../../AuthContext';

const inquiryTypeMap = {
  DELIVERY: '배송 문의',
  PRODUCT: '상품 문의',
  ETC: '기타',
};

const InquiryList = ({ itemId }) => {
  const { user } = useAuth();
  const isSeller = user?.role === 'ROLE_SELLER';
  const [inquiries, setInquiries] = useState([]);
  const [showSecret, setShowSecret] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 5,
    totalPages: 0,
    totalElements: 0,
    isFirst: true,
    isLast: true,
  });

  // 클릭한 항목 ID 저장
  const [expandedId, setExpandedId] = useState(null);
  const [expandedDetail, setExpandedDetail] = useState({});

  const handlePageChange = (page) => {
    setPageInfo((p) => ({ ...p, page: page - 1 }));
  };

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    // 작성 완료 후 다시 목록을 갱신
    fetchInquiries();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPageInfo((p) => ({ ...p, page: 0 })); // 탭 변경 시 페이지 초기화
    setExpandedId(null); // 탭 변경 시 확장 해제
  };

  const handleSecretChange = () => {
    setShowSecret((prev) => !prev);
    setPageInfo((p) => ({ ...p, page: 0 }));
  };

  const handleToggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    // 상세 데이터가 없으면 API 호출
    if (!expandedDetail[id]) {
      try {
        const response = await axios.get(`/api/inquiries/${id}/detail`);
        console.log(response.data);
        setExpandedDetail((prev) => ({ ...prev, [id]: response.data }));
      } catch (error) {
        console.error('상세조회 실패:', error);
        return;
      }
    }

    setExpandedId(id);
  };

  const fetchInquiries = useCallback(async () => {
    const params = {
      page: pageInfo.page,
      size: pageInfo.size,
      openToPublic: showSecret ? true : null,
    };
    if (activeTab === 'waiting') {
      params.status = 'WAITING';
    } else if (activeTab === 'answered') {
      params.status = 'ANSWERED';
    }
    try {
      const { data } = await axios.get(`/api/inquiries/${itemId}/titles`, {
        params,
      });
      console.log(data);
      setInquiries(data.content);
      setPageInfo((prev) => ({
        ...prev,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        isFirst: data.first,
        isLast: data.last,
      }));
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
      setInquiries([]);
    }
  }, [itemId, pageInfo.page, pageInfo.size, activeTab, showSecret]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  return (
    <Container>
      <TitleBox>
        <Title>
          Q&amp;A <Count>({pageInfo.totalElements})</Count>
        </Title>
        <Right>
          <label>
            <input
              type="checkbox"
              checked={showSecret}
              onChange={handleSecretChange}
            />{' '}
            비밀글 제외
          </label>
          {!isSeller && (
            <Button onClick={handleOpenModal}>상품 Q&amp;A 작성하기</Button>
          )}
          {showModal && (
            <InquiryModal itemId={itemId} onClose={handleCloseModal} />
          )}
        </Right>
      </TitleBox>

      {/* 탭 메뉴 추가 */}
      <TabMenu>
        <TabButton
          active={activeTab === 'all'}
          onClick={() => handleTabChange('all')}
        >
          전체
        </TabButton>
        <TabButton
          active={activeTab === 'waiting'}
          onClick={() => handleTabChange('waiting')}
        >
          답변대기
        </TabButton>
        <TabButton
          active={activeTab === 'answered'}
          onClick={() => handleTabChange('answered')}
        >
          답변완료
        </TabButton>
      </TabMenu>

      <Table>
        <thead>
          <Tr>
            <Th>문의유형</Th>
            <Th>답변상태</Th>
            <Th>제목</Th>
            <Th>작성자</Th>
            <Th>작성일</Th>
          </Tr>
        </thead>
        <tbody>
          {inquiries.length === 0 ? (
            <Tr>
              <Td colSpan={5} style={{ textAlign: 'center', color: '#bbb' }}>
                문의 내역이 없습니다.
              </Td>
            </Tr>
          ) : (
            inquiries.map((item) => (
              <React.Fragment key={item.id}>
                <Tr onClick={() => handleToggleExpand(item.id)}>
                  <Td>{inquiryTypeMap[item.inquiryType]}</Td>
                  <Td finish={item.status === 'ANSWERED'}>
                    {item.status === 'ANSWERED' ? '답변완료' : '답변대기'}
                  </Td>
                  <TdTitle>
                    {!item.openToPublic ? (
                      <Lock>
                        🔒 <SecretText>비밀글 입니다.</SecretText>
                      </Lock>
                    ) : (
                      item.question
                    )}
                  </TdTitle>
                  <Td>{item.buyerUsername}</Td>
                  <Td>{new Date(item.questionDate).toLocaleDateString()}</Td>
                </Tr>
                {/* 클릭 시 확장 영역 */}
                {expandedId === item.id && expandedDetail[item.id] && (
                  <Tr>
                    <Td colSpan={5} style={{ background: '#f9f9f9' }}>
                      <ContentBox>
                        <p>
                          <strong>문의내용:</strong>{' '}
                          {expandedDetail[item.id].questionDetail}
                        </p>
                        {item.status === 'ANSWERED' && (
                          <p>
                            <strong>답변:</strong>{' '}
                            {expandedDetail[item.id].answer}{' '}
                            <span>
                              (
                              {new Date(
                                expandedDetail[item.id].answerDate
                              ).toLocaleDateString()}
                              )
                            </span>
                          </p>
                        )}
                      </ContentBox>
                    </Td>
                  </Tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </Table>
      {pageInfo.totalPages > 1 && (
        <Pagination
          currentPage={pageInfo.page + 1}
          totalPages={pageInfo.totalPages}
          onPageChange={handlePageChange}
          isFirst={pageInfo.isFirst}
          isLast={pageInfo.isLast}
        />
      )}
    </Container>
  );
};

export default InquiryList;

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
`;

const TitleBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
`;

const Count = styled.span`
  color: #d32f2f;
  font-size: 24px;
  margin-left: 4px;
`;

const Right = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Button = styled.button`
  padding: 8px 18px;
  background: #222;
  color: #fff;
  border-radius: 3px;
  border: none;
  font-weight: 500;
  cursor: pointer;
`;

const TabMenu = styled.div`
  display: flex;
  margin-bottom: 12px;
`;

const TabButton = styled.button`
  background: ${({ active }) => (active ? '#555a82' : '#e6e8f4')};
  color: ${({ active }) => (active ? 'white' : '#555a82')};
  border: none;
  padding: 8px 16px;
  font-weight: 700;
  cursor: pointer;
  margin-right: 8px;
  border-radius: 5px;
  transition: background 0.3s;

  &:hover {
    background: #4a4e70;
    color: white;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  margin-bottom: 18px;
`;

const Tr = styled.tr`
  border-bottom: 1px solid #eee;
`;

const Th = styled.th`
  background: #fafbfc;
  font-size: 15px;
  font-weight: 500;
  padding: 12px 4px;
  border-bottom: 2px solid #eee;
  text-align: center;
`;

const TdTitle = styled.td`
  padding: 10px 4px;
  font-size: 15px;
  vertical-align: middle;
  color: #444;
  cursor: pointer;
  max-width: 300px; 
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  }
`;

const Td = styled.td`
  padding: 10px 4px;
  font-size: 15px;
  vertical-align: middle;
  color: #444;
  text-align: center;
  ${(props) => props.finish && `color: #2e7d32;`}
`;

const Lock = styled.span`
  color: #888;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SecretText = styled.span`
  font-size: 15px;
`;

const ContentBox = styled.div`
  padding: 10px 15px;
  border-left: 4px solid #555a82;
  background: #f4f5f8;
  font-size: 14px;
  color: #333;
  text-align: left;

  p {
    margin: 6px 0;
  }

  strong {
    color: #555a82;
    margin-right: 6px;
  }

  span {
    color: #888;
    font-size: 12px;
  }
`;
