import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Pagination from '../Pagination';

const NOTICE_TYPE_MAP = {
  ACCOUNT: { label: '계정', color: '#5c90cfff' },
  SHIPPING: { label: '배송', color: '#15a835ff' },
  ORDER: { label: '주문', color: '#f5b62eff' },
  OPERATIONS: { label: '운영', color: '#b3b3b3ff' },
};

function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 5,
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
  const { page, size } = pageInfo;

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/notices/summaries', {
          params: { page, size },
        });
        console.log(data);
        setNotices(data.content);
        setPageInfo((prevInfo) => ({
          ...prevInfo,
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
  }, [page, size]);

  const formatDate = (dateString) => {
    return dateString.substring(0, 10);
  };

  return (
    <Wrap>
      <Header>
        <PrimaryBtn onClick={() => navigate('/admin/noticeRegister')}>
          새 공지 작성
        </PrimaryBtn>
      </Header>
      <List>
        {loading ? (
          <p>목록을 불러오는 중입니다...</p>
        ) : notices.length > 0 ? (
          notices.map((notice) => (
            <Item
              key={notice.id}
              onClick={() => navigate(`/admin/notices/${notice.id}`)}
            >
              <Content>
                <Tag type={notice.noticeType}>
                  {NOTICE_TYPE_MAP[notice.noticeType]?.label ||
                    notice.noticeType}
                </Tag>
                <strong>{notice.title}</strong>
              </Content>
              <DateText>{formatDate(notice.createdAt)}</DateText>
            </Item>
          ))
        ) : (
          <EmptyMessage>등록된 공지사항이 없습니다.</EmptyMessage>
        )}
      </List>
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
    </Wrap>
  );
}

export default Notices;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;

  @media ${({ theme }) => theme.mobile} {
    gap: 12px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 22px;
    color: ${({ theme }) => theme.colors.gray[900]};

    @media ${({ theme }) => theme.mobile} {
      font-size: 18px;
    }
  }
`;

const PrimaryBtn = styled.button`
  all: unset;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:hover {
    background: ${({ theme }) => theme.colors.primary_dark};
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 8px 12px;
    font-size: 13px;
  }
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const Item = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background: ${({ theme }) => theme.colors.gray[50]};
    border-color: ${({ theme }) => theme.colors.gray[300]};
  }

  @media ${({ theme }) => theme.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 16px 14px;
  }
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;

  strong {
    font-weight: 500;
    color: ${({ theme }) => theme.colors.gray[800]};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media ${({ theme }) => theme.mobile} {
    gap: 8px;
    max-width: 100%;

    strong {
      font-size: 14px;
    }
  }
`;

const Tag = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.white};
  background-color: ${(props) =>
    NOTICE_TYPE_MAP[props.type]?.color || props.theme.colors.gray[500]};
  flex-shrink: 0;

  @media ${({ theme }) => theme.mobile} {
    font-size: 11px;
    padding: 3px 6px;
  }
`;

const DateText = styled.small`
  color: ${({ theme }) => theme.colors.gray[550]};
  font-size: 14px;
  flex-shrink: 0;
  margin-left: 16px;

  @media ${({ theme }) => theme.mobile} {
    margin-left: 0;
    margin-top: 4px;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.gray[500]};
  }
`;

const EmptyMessage = styled.p`
  text-align: center;
  padding: 40px 0;
  color: ${({ theme }) => theme.colors.gray[550]};
  font-size: 14px;
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 10px;
  border: 1px dashed ${({ theme }) => theme.colors.gray[300]};
  margin: 0;
`;

const PaginationBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: auto;

  @media ${({ theme }) => theme.mobile} {
    margin-top: 16px;
    padding-bottom: 8px;
  }
`;
