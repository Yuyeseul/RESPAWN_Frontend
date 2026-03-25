import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import styled from 'styled-components';
import Pagination from '../Pagination';

const inquiryTypeMap = {
  DELIVERY: '배송 문의',
  PRODUCT: '상품 문의',
  ETC: '기타',
};

const MyInquiryList = () => {
  const [inquiries, setInquiries] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
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

  // 자신이 작성한 문의 리스트 조회
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await axios.get('/inquiries/my', {
          params: { page: pageInfo.page, size: pageInfo.size },
        });
        console.log(res.data);
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
      } finally {
        setLoadingList(false);
      }
    };

    fetchInquiries();
  }, [pageInfo.page]);

  // 문의 상세 조회
  const handleToggleExpand = async (id) => {
    setExpandedId((prevId) => (prevId === id ? null : id));
  };

  return (
    <Container>
      <Title>문의 내역</Title>
      <Table>
        <thead>
          <tr>
            <th>상품명</th>
            <th>제목</th>
            <th>작성일</th>
            <th>문의유형</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {loadingList ? (
            <tr>
              <td colSpan={5}>불러오는 중...</td>
            </tr>
          ) : inquiries.length === 0 ? (
            <tr>
              <Message colSpan={5}>문의 내역이 없습니다.</Message>
            </tr>
          ) : (
            inquiries.map((item, index) => (
              <React.Fragment key={item.id}>
                <tr onClick={() => handleToggleExpand(item.id)}>
                  <td>{item.itemName}</td>
                  <td>{item.question}</td>
                  <td>{new Date(item.questionDate).toLocaleDateString()}</td>
                  <td>{inquiryTypeMap[item.inquiryType]}</td>
                  <td>{item.status === 'ANSWERED' ? '답변 완료' : '대기'}</td>
                </tr>

                {expandedId === item.id && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ background: '#f9f9f9', textAlign: 'left' }}
                    >
                      <DetailBox>
                        <Row>
                          <Label>문의 내용</Label>
                          <ValueBox>
                            {item.questionDetail || '상세 내용 없음'}
                          </ValueBox>
                        </Row>
                        <Row>
                          <Label>판매자 답변</Label>
                          <ValueBox>
                            {item.answer ? (
                              item.answer
                            ) : (
                              <NoAnswer>미등록</NoAnswer>
                            )}
                          </ValueBox>
                        </Row>
                      </DetailBox>
                    </td>
                  </tr>
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

export default MyInquiryList;

const Container = styled.div`
  max-width: 1000px;
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 30px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;

  th,
  td {
    padding: 12px 15px;
    text-align: center;
    border-bottom: 1px solid #eee;
  }

  th {
    background: #e6e8f4;
    color: #333;
  }

  tr:hover {
    background: #f5f7fa;
  }
`;

const Message = styled.td`
  font-size: 16px;
  color: #666;
  text-align: center;
  padding: 32px 0;
`;

const DetailBox = styled.div`
  font-size: 14px;
  color: #333;
  margin-top: 10px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Label = styled.div`
  width: 110px;
  font-weight: bold;
  color: #444;
  flex-shrink: 0;
  text-align: center;
`;

const ValueBox = styled.div`
  flex: 1;
  padding: 12px 14px;
  border-radius: 6px;
  line-height: 1.6;
  white-space: pre-line;
  border: 1px solid #eee;
  text-align: left;
`;

const NoAnswer = styled.span`
  color: #999;
  font-style: italic;
`;
