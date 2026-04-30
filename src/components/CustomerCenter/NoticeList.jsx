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
            <Tr isHeader>
              <Th style={{ width: '100px', textAlign: 'center' }}>유형</Th>
              <Th>제목</Th>
              <Th style={{ width: '140px', textAlign: 'center' }}>작성일</Th>
            </Tr>
          </thead>
          <tbody>
            {loading ? (
              <Tr isNoData>
                <Td colSpan={3}>목록을 불러오는 중입니다...</Td>
              </Tr>
            ) : notices.length > 0 ? (
              notices.map((notice) => (
                <Tr
                  key={notice.id}
                  onClick={() =>
                    navigate(`/customerCenter/notices/${notice.id}`)
                  }
                >
                  <Td className="col-type">
                    <TypeBadge>
                      {NOTICE_TYPE_MAP[notice.noticeType]?.label ||
                        notice.noticeType}
                    </TypeBadge>
                  </Td>
                  <Td className="col-title">
                    <Ellipsis>{notice.title}</Ellipsis>
                  </Td>
                  <Td className="col-date">
                    <Mono>{formatDate(notice.createdAt)}</Mono>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr isNoData>
                <Td colSpan={3}>등록된 공지사항이 없습니다.</Td>
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
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: 28px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media ${({ theme }) => theme.mobile} {
    padding: 20px 15px 30px;
    gap: 16px;
  }
`;

const BreadcrumbLink = styled(Link)`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[600]};
  text-decoration: none;
  margin-bottom: -12px;

  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const PageHeader = styled.header`
  h1 {
    font-size: 28px;
    font-weight: 800;
    margin: 8px 0 8px;
    color: ${({ theme }) => theme.colors.gray[900]};
    word-break: keep-all;
  }
  p {
    font-size: 15px;
    color: ${({ theme }) => theme.colors.gray[600]};
    margin: 0;
    word-break: keep-all;
  }

  @media ${({ theme }) => theme.mobile} {
    h1 {
      font-size: 22px;
    }
    p {
      font-size: 14px;
    }
  }
`;

const TableWrap = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.white};
  overflow: hidden;

  @media ${({ theme }) => theme.mobile} {
    border: none;
    background: transparent;
    border-radius: 0;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  @media ${({ theme }) => theme.mobile} {
    thead {
      display: none;
    }
    tbody {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }
`;

const Tr = styled.tr`
  cursor: ${({ isHeader, isNoData }) =>
    isHeader || isNoData ? 'default' : 'pointer'};
  transition: background-color 0.2s;

  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ isHeader, isNoData, theme }) =>
      !isHeader && !isNoData ? theme.colors.gray[50] : 'transparent'};
  }

  @media ${({ theme }) => theme.mobile} {
    display: ${({ isHeader }) => (isHeader ? 'none' : 'flex')};
    flex-direction: column;
    padding: 16px;
    background: ${({ theme }) => theme.colors.white};
    border: 1px solid ${({ theme }) => theme.colors.gray[300]};
    border-radius: 12px;
    gap: 12px;

    &:last-child {
      border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
      margin-bottom: 0;
    }
  }
`;

const Th = styled.th`
  text-align: left;
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[600]};
  background: ${({ theme }) => theme.colors.gray[50]};
`;

const Td = styled.td`
  padding: 16px;
  color: ${({ theme }) => theme.colors.gray[900]};
  font-size: 14px;

  &.col-type {
    text-align: center;
    @media ${({ theme }) => theme.mobile} {
      text-align: left;
      padding: 0;
    }
  }

  &.col-title {
    font-weight: 500;
    @media ${({ theme }) => theme.mobile} {
      padding: 4px 0;
      font-size: 15px;
    }
  }

  &.col-date {
    text-align: center;
    color: ${({ theme }) => theme.colors.gray[550]};
    @media ${({ theme }) => theme.mobile} {
      text-align: left;
      padding: 0;
      font-size: 12px;
    }
  }

  ${({ colSpan }) => colSpan && `text-align: center !important;`}
`;

const Mono = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
`;

const Ellipsis = styled.div`
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-all;

  @media ${({ theme }) => theme.mobile} {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;

const TypeBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.primary_light};
  color: ${({ theme }) => theme.colors.primary};
`;

const PaginationBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 12px;
`;
