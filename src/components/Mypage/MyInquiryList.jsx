import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import styled, { css } from 'styled-components';
import Pagination from '../Pagination';
import MypageLayout from './MypageLayout';

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
      setLoadingList(true);
      try {
        const res = await axios.get('/inquiries/my', {
          params: { page: pageInfo.page, size: pageInfo.size },
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
    <MypageLayout title="문의 내역">
      <TableContainer>
        <ResponsiveTable>
          <thead>
            <tr>
              <th style={{ width: '25%' }}>상품명</th>
              <th style={{ width: '30%' }}>제목</th>
              <th style={{ width: '15%' }}>작성일</th>
              <th style={{ width: '15%' }}>문의유형</th>
              <th style={{ width: '15%' }}>상태</th>
            </tr>
          </thead>
          <tbody>
            {loadingList ? (
              <tr>
                <td colSpan={5} className="msg-cell">
                  불러오는 중...
                </td>
              </tr>
            ) : inquiries.length === 0 ? (
              <tr>
                <td colSpan={5} className="msg-cell">
                  문의 내역이 없습니다.
                </td>
              </tr>
            ) : (
              inquiries.map((item, index) => (
                <React.Fragment key={item.id}>
                  <PcRow
                    onClick={() => handleToggleExpand(item.id)}
                    $active={expandedId === item.id}
                    $expanded={expandedId === item.id}
                  >
                    <td className="item-name" title={item.itemName}>
                      {item.itemName}
                    </td>
                    <td className="question-title">{item.question}</td>
                    <td>{new Date(item.questionDate).toLocaleDateString()}</td>
                    <td>{inquiryTypeMap[item.inquiryType]}</td>
                    <td>
                      <StatusBadge $isAnswered={item.status === 'ANSWERED'}>
                        {item.status === 'ANSWERED' ? '답변완료' : '답변대기'}
                      </StatusBadge>
                    </td>
                  </PcRow>

                  <MobileCard
                    onClick={() => handleToggleExpand(item.id)}
                    $expanded={expandedId === item.id}
                  >
                    <div className="card-header">
                      <div className="left-grp">
                        <StatusBadge $isAnswered={item.status === 'ANSWERED'}>
                          {item.status === 'ANSWERED' ? '답변완료' : '답변대기'}
                        </StatusBadge>
                        <span className="date">
                          {new Date(item.questionDate).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="type">
                        {inquiryTypeMap[item.inquiryType]}
                      </span>
                    </div>

                    <div className="card-body">
                      <div className="item-name" title={item.itemName}>
                        {item.itemName}
                      </div>
                      <div className="title">{item.question}</div>
                    </div>
                  </MobileCard>

                  {expandedId === item.id && (
                    <DetailRow>
                      <td colSpan={5}>
                        <DetailBox>
                          <DetailSection>
                            <Label>문의 제목</Label>
                            <ValueBox>{item.question}</ValueBox>
                          </DetailSection>

                          <Divider />

                          <DetailSection>
                            <Label>문의 내용</Label>
                            <ValueBox>
                              {item.questionDetail || '상세 내용 없음'}
                            </ValueBox>
                          </DetailSection>

                          <Divider />

                          <DetailSection>
                            <Label>판매자 답변</Label>
                            <ValueBox $isAnswer={!!item.answer}>
                              {item.answer ? (
                                item.answer
                              ) : (
                                <NoAnswerText>
                                  답변을 준비 중입니다. 잠시만 기다려 주세요.
                                </NoAnswerText>
                              )}
                            </ValueBox>
                          </DetailSection>
                        </DetailBox>
                      </td>
                    </DetailRow>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </ResponsiveTable>
      </TableContainer>

      {pageInfo.totalPages > 1 && (
        <Pagination
          currentPage={pageInfo.page + 1}
          totalPages={pageInfo.totalPages}
          onPageChange={handlePageChange}
          isFirst={pageInfo.isFirst}
          isLast={pageInfo.isLast}
        />
      )}
    </MypageLayout>
  );
};

export default MyInquiryList;

const TableContainer = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  overflow: hidden;

  @media ${({ theme }) => theme.mobile} {
    border: none;
    background: transparent;
  }
`;

const ResponsiveTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  th,
  td {
    padding: 16px 12px;
    font-size: 14px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
    color: ${({ theme }) => theme.colors.gray[700]};
    text-align: center;
  }

  th {
    background: ${({ theme }) => theme.colors.gray[700]};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.white};
  }

  .msg-cell {
    padding: 80px 0;
    color: ${({ theme }) => theme.colors.gray[600]};
  }

  @media ${({ theme }) => theme.mobile} {
    display: block;
    thead {
      display: none;
    }
    tbody {
      display: block;
      width: 100%;
    }
  }
`;

const PcRow = styled.tr`
  cursor: pointer;
  transition: background 0.2s;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.gray[10] : 'transparent'};

  &:hover {
    background: ${({ theme }) => theme.colors.gray[10]};
  }

  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
  }

  ${({ $expanded, theme }) =>
    $expanded &&
    css`
      background: ${theme.colors.white};
      &:hover {
        background: ${theme.colors.white};
      }
    `}

  .item-name {
    text-align: left;
    color: ${({ theme }) => theme.colors.gray[600]};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .question-title {
    text-align: left;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.gray[700]};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media ${({ theme }) => theme.mobile} {
    display: none !important;
  }
`;

const MobileCard = styled.div`
  display: none;

  @media ${({ theme }) => theme.mobile} {
    display: flex;
    flex-direction: column;
    padding: 20px;
    background: ${({ theme }) => theme.colors.white};
    border: 1px solid ${({ theme }) => theme.colors.gray[300]};
    border-radius: 12px;
    margin-bottom: 12px;
    cursor: pointer;

    ${({ $expanded }) =>
      $expanded &&
      css`
        margin-bottom: 0;
        border-radius: 12px 12px 0 0;
        border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
      `}

    .card-header {
    display: flex;
    justify-content: space-between; 
    align-items: center;
    margin-bottom: 14px;

    .left-grp {
      display: flex;
      align-items: center;
      gap: 8px; 

      .date {
        font-size: 12px;
        color: ${({ theme }) => theme.colors.gray[600]};
      }
    }

    .type {
      font-size: 12px;
      font-weight: 500;
      color: ${({ theme }) => theme.colors.gray[600]};
      background: ${({ theme }) => theme.colors.gray[100]}; 
      padding: 2px 6px;
      border-radius: 4px;
    }
  }

  .card-body {
    .item-name {
      font-size: 13px;
      color: ${({ theme }) => theme.colors.gray[600]};
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .title {
      font-size: 16px;
      font-weight: 800; 
      color: ${({ theme }) => theme.colors.gray[700]};
      line-height: 1.4;

      display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};

  ${({ $isAnswered, theme }) =>
    $isAnswered
      ? css`
          background: ${theme.colors.gray[800]};
          color: ${theme.colors.white};
          border-color: ${theme.colors.gray[800]};
        `
      : css`
          background: ${theme.colors.white};
          color: ${theme.colors.gray[600]};
        `}
`;

const DetailRow = styled.tr`
  background: ${({ theme }) => theme.colors.white};

  @media ${({ theme }) => theme.mobile} {
    display: block;
    width: 100%;
    margin-bottom: 12px;
  }

  td {
    padding: 0 !important;
    @media ${({ theme }) => theme.mobile} {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
  }
`;

const DetailBox = styled.div`
  padding: 24px 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  box-sizing: border-box;

  @media ${({ theme }) => theme.mobile} {
    width: 100% !important;
    padding: 20px 16px;
    border: 1px solid ${({ theme }) => theme.colors.gray[300]};
    border-top: none;
    border-radius: 0 0 12px 12px;
    box-sizing: border-box;
  }
`;

const DetailSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 20px;

  @media ${({ theme }) => theme.mobile} {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }
`;

const Label = styled.div`
  flex-shrink: 0;
  width: 100px;
  font-size: 14px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.gray[700]};
  text-align: left;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    width: 3px;
    height: 14px;
    background: ${({ theme }) => theme.colors.gray[400]};
    margin-right: 8px;
    border-radius: 2px;
  }

  @media ${({ theme }) => theme.mobile} {
    width: 100% !important;
    font-size: 13px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
  }
`;

const ValueBox = styled.div`
  flex: 1;
  width: 100%;
  font-size: 15px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.gray[700]};
  white-space: pre-wrap;
  word-break: break-all;
  text-align: left;

  @media ${({ theme }) => theme.mobile} {
    display: block !important;
    width: 100% !important;
    padding: 12px 14px;
    background: ${({ $isAnswer, theme }) =>
      $isAnswer ? theme.colors.gray[50] : theme.colors.white};
    border: 1px solid ${({ theme }) => theme.colors.gray[300]};
    border-radius: 8px;
    font-size: 14px;
    box-sizing: border-box !important;
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.gray[300]};
  width: 100%;
  @media ${({ theme }) => theme.mobile} {
    display: none;
  }
`;

const NoAnswerText = styled.span`
  color: ${({ theme }) => theme.colors.gray[600]};
  font-style: italic;
`;
