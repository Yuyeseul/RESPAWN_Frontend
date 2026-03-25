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
        const response = await axios.get(`/inquiries/${id}/detail`);
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
      const { data } = await axios.get(`/inquiries/${itemId}/titles`, {
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
                    <Td colSpan={5}>
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
  @media ${({ theme }) => theme.mobile} {
    padding: 0 4px;
    box-sizing: border-box;
  }
`;

const TitleBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  @media ${({ theme }) => theme.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.gray[700]};
  font-size: 20px;
  font-weight: bold;
`;

const Count = styled.span`
  color: ${({ theme }) => theme.colors.red};
  font-size: 20px;
  margin-left: 4px;
`;

const Right = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  @media ${({ theme }) => theme.mobile} {
    width: 100%;
    justify-content: space-between;
    font-size: 14px;
  }
`;

const Button = styled.button`
  padding: 8px 18px;
  background: ${({ theme }) => theme.colors.gray[800]};
  color: ${({ theme }) => theme.colors.gray[200]};
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
    background: ${({ theme }) => theme.colors.secondary};
    color: white;
  }

  @media ${({ theme }) => theme.mobile} {
    flex: 1;
    text-align: center;
    padding: 10px 5px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.white};
  margin-bottom: 18px;

  @media ${({ theme }) => theme.mobile} {
    display: block;
    thead {
      display: none;
    }
    tbody {
      display: block;
    }
  }
`;

const Tr = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};

  @media ${({ theme }) => theme.mobile} {
    display: flex;
    flex-wrap: wrap;
    padding: 16px 10px;
    align-items: center;

    &:has(td[colspan='5']) {
      padding: 0;
      background: ${({ theme }) => theme.colors.gray[100]};
    }
  }
`;

const Th = styled.th`
  background: ${({ theme }) => theme.colors.gray[200]};
  font-size: 15px;
  font-weight: 500;
  padding: 12px 4px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.gray[300]};
  text-align: center;
`;

const TdTitle = styled.td`
  padding: 10px 4px;
  font-size: 15px;
  vertical-align: middle;
  color: ${({ theme }) => theme.colors.gray[700]};
  cursor: pointer;
  max-width: 300px; 
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;

  @media ${({ theme }) => theme.mobile} {
    display: block;
    width: 100%;
    max-width: 100%;
    order: 3; 
    padding: 8px 0;
    font-size: 15px;
    font-weight: 500;
    white-space: normal; 
  }
  }
`;

const Td = styled.td`
  padding: 10px 4px;
  font-size: 15px;
  vertical-align: middle;
  color: ${({ theme }) => theme.colors.gray[700]};
  text-align: center;
  ${(props) => props.finish && `color: ${props.theme.colors.success};`}

  &[colspan='5'] {
    background: ${({ theme }) => theme.colors.gray[100]};
  }

  @media ${({ theme }) => theme.mobile} {
    display: block;
    padding: 0;
    text-align: left;
    line-height: 1.4;

    /* 확장 영역(상세 내용) 및 데이터 없음 영역 */
    &[colspan='5'] {
      width: 100%;
      margin: 0;
      padding: 16px 14px;
      background: transparent;
    }

    /* 1번째 Td: 문의유형 */
    &:not([colspan='5']):nth-child(1) {
      order: 2;
      font-size: 13px;
      color: ${({ theme }) => theme.colors.gray[600]};
    }

    /* 2번째 Td: 답변상태 */
    &:not([colspan='5']):nth-child(2) {
      order: 1;
      font-size: 12px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      background: ${({ theme }) => theme.colors.gray[100]};
      margin-right: 8px;
    }

    /* 4번째 Td: 작성자 */
    &:not([colspan='5']):nth-child(4) {
      order: 4;
      font-size: 13px;
      color: ${({ theme }) => theme.colors.gray[600]};
      margin-top: 4px;
    }

    /* 5번째 Td: 작성일 */
    &:not([colspan='5']):nth-child(5) {
      order: 5;
      font-size: 13px;
      color: ${({ theme }) => theme.colors.gray[600]};
      margin-top: 4px;
      margin-left: 8px;
    }

    /* 작성자와 작성일 사이에 파이프(|) 구분선 추가 */
    &:not([colspan='5']):nth-child(5)::before {
      content: '|';
      margin-right: 8px;
      color: ${({ theme }) => theme.colors.gray[300]};
    }
  }
`;

const Lock = styled.span`
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SecretText = styled.span`
  font-size: 15px;
`;

const ContentBox = styled.div`
  padding: 16px 14px;
  background: ${({ theme }) => theme.colors.white};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  text-align: left;
  line-height: 1.5;
  word-break: break-all;

  p {
    margin: 14px 0;

    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }

  strong {
    flex-shrink: 0;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
  }

  span {
    color: ${({ theme }) => theme.colors.gray[600]};
    font-size: 12px;
    white-space: nowrap;
  }

  @media ${({ theme }) => theme.mobile} {
    background: ${({ theme }) => theme.colors.white};
  }
`;
