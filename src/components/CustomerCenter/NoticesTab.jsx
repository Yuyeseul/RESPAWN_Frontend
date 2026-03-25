import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

const NoticesTab = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/notices/summaries', {
          params: { page: 0, size: 5 },
        });
        setNotices(response.data.content || []);
      } catch (error) {
        console.error('Failed to fetch notices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  const formatDate = (dateString) => dateString?.substring(0, 10);

  return (
    <NoticeListSection>
      <header>
        <h2>공지사항</h2>
      </header>
      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <>
          <ul>
            {notices.map((n) => (
              <li
                key={n.id}
                onClick={() => navigate(`/customerCenter/notices/${n.id}`)}
              >
                <span className="title">{n.title}</span>
                <span className="date">{formatDate(n.createdAt)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </NoticeListSection>
  );
};

export default NoticesTab;

const NoticeListSection = styled.section`
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 18px;

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--line);

    h2 {
      font-size: 16px;
      margin: 0;
    }

    a {
      font-size: 13px;
      color: var(--muted);
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li a {
    display: flex;
    justify-content: space-between;
    padding: 8px 4px;
    text-decoration: none;
    color: var(--ink);
    border-radius: 6px;

    &:hover {
      background-color: #f8fafc;
    }

    .title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .date {
      color: var(--muted);
      font-size: 13px;
      flex-shrink: 0;
      margin-left: 16px;
    }
  }
`;
