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

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      try {
        const { page, size } = pageInfo;
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
  }, [pageInfo.page, pageInfo.size]);

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
              <small>{formatDate(notice.createdAt)}</small>
            </Item>
          ))
        ) : (
          <p>등록된 공지사항이 없습니다.</p>
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
  display: grid;
  gap: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  h2 {
    margin: 0;
    font-size: 22px;
  }
`;

const PrimaryBtn = styled.button`
  all: unset;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  background: #25324d;
  color: #fff;
  font-weight: 500;
  transition: background 0.2s ease;

  &:hover {
    background: #3c4a6c;
  }
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
`;

const Item = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 14px 16px;
  border-radius: 10px;

  strong {
    font-weight: 500;
    color: #1f2937;
  }

  small {
    color: #6b7280;
    font-size: 14px;
    flex-shrink: 0; /* 너비가 줄어들지 않도록 설정 */
    margin-left: 16px;
  }
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  /* 제목이 너무 길 경우 말줄임표 처리 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Tag = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  /* props로 전달된 타입에 따라 배경색을 동적으로 설정합니다. */
  background-color: ${(props) =>
    NOTICE_TYPE_MAP[props.type]?.color || '#6b7280'};
`;

const PaginationBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
`;
