import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import Pagination from '../Pagination';

const NOTICE_TYPE_MAP = {
  ACCOUNT: { label: '계정' },
  SHIPPING: { label: '배송' },
  ORDER: { label: '주문' },
  OPERATIONS: { label: '운영' },
};

const NoticeList = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
    isFirst: true,
    isLast: true,
  });

  const currentPage = pageInfo.page + 1;
  const totalPages = pageInfo.totalPages;

  const handlePageChange = (page1) => {
    if (page1 < 1 || (totalPages > 0 && page1 > totalPages)) return;
    setPageInfo((p) => ({ ...p, page: page1 - 1 }));
  };

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      try {
        const { page, size } = pageInfo;
        const { data } = await axios.get('/notices/summaries', {
          params: { page, size },
        });
        const content = data.content;
        setNotices(content);
        setPageInfo((prev) => ({
          ...prev,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          isFirst: data.first,
          isLast: data.last,
        }));
      } catch (error) {
        console.error('Failed to fetch notices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, [pageInfo.page, pageInfo.size]);

  const formatDate = (dateString) => String(dateString).substring(0, 10);

  return (
    <PageContainer>
      <BreadcrumbLink to="/customerCenter">&larr; 고객센터 홈</BreadcrumbLink>
      <PageHeader>
        <h1>공지사항</h1>
        <p>서비스 이용에 필요한 최신 소식과 중요한 안내를 확인하세요.</p>
      </PageHeader>
      <TableWrap>
        <StyledTable role="table" aria-label="공지사항 목록">
          <thead>
            <Tr as="tr">
              <Th as="th" style={{ width: 100, textAlign: 'center' }}>
                유형
              </Th>
              <Th as="th">제목</Th>
              <Th as="th" style={{ width: 140, textAlign: 'center' }}>
                작성일
              </Th>
            </Tr>
          </thead>
          <tbody>
            {loading ? (
              <Tr as="tr">
                <Td as="td" colSpan={4} style={{ textAlign: 'center' }}>
                  목록을 불러오는 중입니다...
                </Td>
              </Tr>
            ) : notices.length > 0 ? (
              notices.map((notice) => {
                return (
                  <Tr
                    as="tr"
                    key={notice.id}
                    tabIndex={0}
                    role="row"
                    onClick={() =>
                      navigate(`/customerCenter/notices/${notice.id}`)
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/customerCenter/notices/${notice.id}`);
                      }
                    }}
                  >
                    <Td as="td" style={{ textAlign: 'center' }}>
                      <TypeBadge title={notice.noticeType}>
                        {NOTICE_TYPE_MAP[notice.noticeType]?.label ||
                          notice.noticeType}
                      </TypeBadge>
                    </Td>
                    <Td as="td">
                      <Ellipsis title={notice.title}>{notice.title}</Ellipsis>
                    </Td>
                    <Td as="td" style={{ textAlign: 'center' }}>
                      <Mono>{formatDate(notice.createdAt)}</Mono>
                    </Td>
                  </Tr>
                );
              })
            ) : (
              <Tr as="tr">
                <Td as="td" colSpan={4} style={{ textAlign: 'center' }}>
                  등록된 공지사항이 없습니다.
                </Td>
              </Tr>
            )}
          </tbody>
        </StyledTable>
      </TableWrap>

      {!loading && notices.length > 0 && pageInfo.totalPages > 1 && (
        <PaginationBar>
          <Pagination
            currentPage={currentPage}
            totalPages={pageInfo.totalPages}
            onPageChange={handlePageChange}
            isFirst={pageInfo.isFirst}
            isLast={pageInfo.isLast}
          />
        </PaginationBar>
      )}
    </PageContainer>
  );
};

export default NoticeList;

const PageContainer = styled.div`
  min-height: 70vh;
  max-width: 1120px;
  margin: 0 auto;
  padding: 28px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const BreadcrumbLink = styled(Link)`
  font-size: 14px;
  font-weight: 500;
  color: #64748b; /* var(--muted) */
  text-decoration: none;
  margin-bottom: -12px; /* 헤더와의 간격 조정 */

  &:hover {
    text-decoration: underline;
  }
`;

const PageHeader = styled.header`
  h1 {
    font-size: 28px;
    font-weight: 800;
    margin: 0 0 8px;
    color: #111827;
  }
  p {
    font-size: 15px;
    color: #6b7280;
    margin: 0;
  }
`;

const TableWrap = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  overflow: hidden;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
`;

const Tr = styled.tr`
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #f8fafc;
  }
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
`;

const Td = styled.td`
  padding: 14px 16px;
  color: #0f172a;
  font-size: 14px;
`;

const Mono = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
`;

const Ellipsis = styled.span`
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TypeBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 999px;
  background: #f1f5f9;
  color: #64748b;
`;

const PaginationBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 8px;
`;
