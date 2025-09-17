import React, { useEffect, useState } from 'react';
import axios from '../../../api/axios';
import styled from 'styled-components';
import Pagination from '../../Pagination';

const inquiryTypeMap = {
  DELIVERY: '배송 문의',
  PRODUCT: '상품 문의',
  ETC: '기타',
};

const InquiryList = () => {
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

  // 문의 리스트 가져오기
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await axios.get('/api/inquiries/seller', {
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
      }
    };

    fetchInquiries();
  }, [pageInfo.page]);

  // 상세 조회
  const handleToggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    if (!expandedDetail[id]) {
      try {
        const res = await axios.get(`/api/inquiries/${id}/detail`);
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
      const res = await axios.post(`/api/inquiries/${id}/answer`, { answer });
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
      <Title>판매자 문의 관리</Title>
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
          {inquiries.map((item) => (
            <React.Fragment key={item.id}>
              <tr onClick={() => handleToggleExpand(item.id)}>
                <td>{item.itemName}</td>
                <td>{item.question}</td>
                <td>{item.buyerUsername}</td>
                <td>{new Date(item.questionDate).toLocaleDateString()}</td>
                <td>{inquiryTypeMap[item.inquiryType]}</td>
                <td>{item.status === 'ANSWERED' ? '답변 완료' : '대기'}</td>
              </tr>

              {expandedId === item.id && expandedDetail[item.id] && (
                <tr>
                  <td colSpan={6} style={{ background: '#f9f9f9' }}>
                    <DetailBox>
                      <p>
                        <strong>문의 내용:</strong>{' '}
                        {expandedDetail[item.id].questionDetail}
                      </p>

                      <p>
                        <strong>답변:</strong>{' '}
                        {expandedDetail[item.id].answer || '미등록'}
                      </p>

                      <AnswerForm
                        onSubmit={(e) => {
                          e.preventDefault();
                          const answer = e.target.answer.value;
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
                      </AnswerForm>
                    </DetailBox>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
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
  max-width: 1600px;
  margin: 60px auto;
  padding: 0 20px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #555a82;
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

const DetailBox = styled.div`
  text-align: left;
  p {
    margin: 6px 0;
  }
`;

const AnswerForm = styled.form`
  display: flex;
  gap: 8px;
  margin-top: 10px;
`;

const AnswerInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
`;

const AnswerButton = styled.button`
  padding: 8px 12px;
  border: none;
  background: #222;
  color: white;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: #444;
  }
`;
