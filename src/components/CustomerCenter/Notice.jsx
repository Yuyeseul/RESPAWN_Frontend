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
      const { data } = await axios.get(`/notices/view?noticeId=${noticeId}`);
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

  if (loading)
    return (
      <PageContainer>
        <LoadingBox>공지사항을 불러오는 중입니다...</LoadingBox>
      </PageContainer>
    );

  if (error)
    return (
      <PageContainer>
        <ErrorBox>{error}</ErrorBox>
      </PageContainer>
    );

  if (!notice)
    return (
      <PageContainer>
        <LoadingBox>공지사항 정보가 없습니다.</LoadingBox>
      </PageContainer>
    );

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
  max-width: ${({ theme }) => theme.maxWidth};
  min-height: 70vh;
  margin: 0 auto;
  padding: 28px 20px 40px;

  @media ${({ theme }) => theme.mobile} {
    padding: 20px 15px 30px;
  }
`;

const NoticeWrapper = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;

  @media ${({ theme }) => theme.mobile} {
    padding: 24px 16px;
    border-radius: 12px;
  }
`;

const NoticeHeader = styled.header`
  margin-bottom: 24px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  h1 {
    font-size: 26px;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.gray[900]};
    margin: 0;
    line-height: 1.3;
    word-break: keep-all;
  }

  @media ${({ theme }) => theme.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    h1 {
      font-size: 20px;
    }
  }
`;

const TypeBadge = styled.span`
  flex-shrink: 0;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.primary_light};
  color: ${({ theme }) => theme.colors.primary};
`;

const Metadata = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[600]};

  @media ${({ theme }) => theme.mobile} {
    font-size: 13px;
  }
`;

const Separator = styled.span`
  margin: 0 8px;
  color: ${({ theme }) => theme.colors.gray[300]};
`;

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[300]};
  margin: 0;
`;

const NoticeBody = styled.div`
  padding: 32px 4px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray[800]};
  white-space: pre-wrap;
  line-height: 1.8;
  min-height: 300px;
  word-break: break-all;

  @media ${({ theme }) => theme.mobile} {
    padding: 24px 0;
    font-size: 15px;
    min-height: 200px;
  }
`;

const PageFooter = styled.footer`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ListButton = styled.button`
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray[700]};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[50]};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }

  @media ${({ theme }) => theme.mobile} {
    width: 100%;
    padding: 14px;
  }
`;

const ErrorBox = styled.div`
  color: ${({ theme }) => theme.colors.gray[600]};
  background: ${({ theme }) => theme.colors.gray[50]};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  padding: 20px;
  border-radius: 12px;
  font-size: 15px;
  text-align: center;
`;

const LoadingBox = styled.div`
  padding: 100px 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: 16px;
`;
