import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axios';

const NOTICE_TYPES = {
  SHIPPING: '배송',
  ORDER: '주문',
  ACCOUNT: '계정',
  OPERATIONS: '운영',
};

const Notice = () => {
  const { noticeId } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotice = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(
        `/api/notices/view?noticeId=${noticeId}`
      );
      setNotice(data);
    } catch (e) {
      setError('공지사항을 불러오는 중 오류가 발생했습니다.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [noticeId]);

  useEffect(() => {
    fetchNotice();
  }, [fetchNotice]);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!notice) return <p>공지사항 정보가 없습니다.</p>;

  return (
    <PageContainer>
      <NoticeWrapper>
        <NoticeHeader>
          <TitleRow>
            <TypeBadge>
              {NOTICE_TYPES[notice.noticeType] || notice.noticeType}
            </TypeBadge>
            <h1>{notice.title}</h1>
          </TitleRow>
          <Metadata>
            <span>작성자: {notice.adminName}</span>
            <Separator>·</Separator>
            <span>작성일: {notice.createdAt?.substring(0, 10)}</span>
            <Separator>·</Separator>
            <span>조회수: {notice.viewCount}</span>
          </Metadata>
        </NoticeHeader>

        <Divider />

        <NoticeBody>{notice.description}</NoticeBody>
      </NoticeWrapper>

      <PageFooter>
        <ListButton onClick={() => navigate('/customerCenter/noticelist')}>
          목록으로
        </ListButton>
      </PageFooter>
    </PageContainer>
  );
};

export default Notice;

const PageContainer = styled.div`
  max-width: 1120px;
  min-height: 70vh;
  margin: 0 auto;
  padding: 28px 20px 40px;
`;

const NoticeWrapper = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
`;

const NoticeHeader = styled.header`
  margin-bottom: 24px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }
`;

const TypeBadge = styled.span`
  flex-shrink: 0;
  padding: 4px 10px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 999px;
  background-color: #eef2ff;
  color: #4338ca;
`;

const Metadata = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #6b7280;
`;

const Separator = styled.span`
  margin: 0 8px;
`;

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid #e5e7eb;
  margin: 0;
`;

const NoticeBody = styled.div`
  padding: 32px 4px;
  font-size: 16px;
  color: #374151;
  white-space: pre-wrap; /* 줄바꿈 유지 */
  line-height: 1.7;
  min-height: 250px;
`;

const PageFooter = styled.footer`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ListButton = styled.button`
  background-color: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f9fafb;
  }
`;

// 에러 및 로딩 박스 스타일
const ErrorBox = styled.div`
  color: #ef4444;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  padding: 16px;
  border-radius: 8px;
  font-size: 15px;
  text-align: center;
`;

const LoadingBox = styled.div`
  padding: 40px;
  text-align: center;
  color: #6b7280;
  font-size: 16px;
`;
