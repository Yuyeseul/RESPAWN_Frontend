import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import TextareaAutosize from 'react-textarea-autosize';

const NOTICE_TYPES = {
  SHIPPING: '배송',
  ORDER: '주문',
  ACCOUNT: '계정',
  OPERATIONS: '운영',
};

const NoticeDetail = () => {
  const { noticeId } = useParams();
  const navigate = useNavigate();

  const [notice, setNotice] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    noticeType: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [confirmInfo, setConfirmInfo] = useState({
    isOpen: false,
    title: '',
    description: '',
    confirmText: '확인',
    onConfirm: () => {}, // 확인 버튼 클릭 시 실행될 함수
    isDanger: false, // 삭제 버튼 등 위험한 작업일 경우 true
  });

  const closeConfirmModal = () => {
    setConfirmInfo((prev) => ({ ...prev, isOpen: false }));
  };

  const fetchNotice = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`/notices/view?noticeId=${noticeId}`);
      setNotice(data);
      setForm({
        title: data.title,
        description: data.description,
        noticeType: data.noticeType,
      });
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

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      alert('제목과 설명을 모두 입력해주세요.');
      return;
    }

    setConfirmInfo({
      isOpen: true,
      title: '공지사항 저장',
      description: '수정한 내용을 저장하시겠습니까?',
      confirmText: '저장',
      isDanger: false,
      onConfirm: async () => {
        closeConfirmModal(); // 모달 먼저 닫기
        setLoading(true);
        try {
          const payload = { ...form };
          await axios.post(`/notices/${noticeId}/update`, payload); // API 엔드포인트 예시
          alert('성공적으로 수정되었습니다.');
          await fetchNotice();
          setIsEditing(false);
        } catch (e) {
          alert('수정 중 오류가 발생했습니다.');
          console.error(e);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleCancel = () => {
    setConfirmInfo({
      isOpen: true,
      title: '수정 취소',
      description: '변경사항이 저장되지 않습니다. 정말로 취소하시겠습니까?',
      confirmText: '확인',
      isDanger: false,
      onConfirm: () => {
        setIsEditing(false);
        setForm({
          title: notice.title,
          description: notice.description,
          noticeType: notice.noticeType,
        });
        closeConfirmModal();
      },
    });
  };

  const openDeleteModal = () => {
    setConfirmInfo({
      isOpen: true,
      title: '공지사항 삭제',
      description:
        '정말로 이 공지사항을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.',
      confirmText: '삭제',
      isDanger: true,
      onConfirm: async () => {
        closeConfirmModal();
        setLoading(true);
        try {
          await axios.delete(`/notices/${noticeId}`);
          alert('삭제되었습니다.');
          navigate('/admin/notices');
        } catch (e) {
          alert('삭제 중 오류가 발생했습니다.');
          console.error(e);
          setLoading(false);
        }
      },
    });
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!notice) return <p>공지사항 정보가 없습니다.</p>;

  return (
    <Page>
      <Header>
        <h2>공지사항 {isEditing ? '수정' : '상세'}</h2>
        <HeaderActions>
          {isEditing ? (
            <>
              <GhostBtn onClick={handleCancel}>취소</GhostBtn>
              <PrimaryBtn onClick={handleSave} style={{ marginLeft: '8px' }}>
                저장
              </PrimaryBtn>
            </>
          ) : (
            <>
              <GhostBtn onClick={() => navigate('/admin/notices')}>
                목록
              </GhostBtn>
              <PrimaryBtn onClick={handleEdit} style={{ marginLeft: '8px' }}>
                수정
              </PrimaryBtn>
              <DeleteBtn
                onClick={openDeleteModal}
                style={{ marginLeft: '8px' }}
              >
                삭제
              </DeleteBtn>
            </>
          )}
        </HeaderActions>
      </Header>

      <Card>
        <MetaInfo>
          <span>작성자: {notice.adminName}</span>
          <span>작성일: {notice.createdAt?.substring(0, 10)}</span>
          <span>조회수: {notice.viewCount}</span>
        </MetaInfo>

        <Field>
          <Label>제목</Label>
          {isEditing ? (
            <Input name="title" value={form.title} onChange={onChange} />
          ) : (
            <ContentView>{notice.title}</ContentView>
          )}
        </Field>
        <Field>
          <Label>공지 타입</Label>
          {isEditing ? (
            <Select
              name="noticeType"
              value={form.noticeType}
              onChange={onChange}
            >
              {Object.entries(NOTICE_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </Select>
          ) : (
            <ContentView>
              {NOTICE_TYPES[notice.noticeType] || notice.noticeType}
            </ContentView>
          )}
        </Field>
        <Field>
          <Label>설명</Label>
          {isEditing ? (
            <StyledTextarea
              name="description"
              value={form.description}
              onChange={onChange}
              minRows={10}
            />
          ) : (
            <DescriptionView>{notice.description}</DescriptionView>
          )}
        </Field>
      </Card>

      {confirmInfo.isOpen && (
        <ModalOverlay onClick={closeConfirmModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>{confirmInfo.title}</h3>
            <p style={{ margin: '6px 0 18px 0', whiteSpace: 'pre-wrap' }}>
              {confirmInfo.description}
            </p>
            <ModalActions>
              <GhostBtn onClick={closeConfirmModal}>취소</GhostBtn>
              {confirmInfo.isDanger ? (
                <DeleteBtn onClick={confirmInfo.onConfirm}>
                  {confirmInfo.confirmText}
                </DeleteBtn>
              ) : (
                <PrimaryBtn onClick={confirmInfo.onConfirm}>
                  {confirmInfo.confirmText}
                </PrimaryBtn>
              )}
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </Page>
  );
};

export default NoticeDetail;

const Page = styled.div`
  display: grid;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;

  @media ${({ theme }) => theme.mobile} {
    gap: 12px;
  }
`;

const Header = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.gray[900]};
    font-size: 22px;

    @media ${({ theme }) => theme.mobile} {
      font-size: 18px;
    }
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 12px;
  padding: 24px;
  box-sizing: border-box;

  @media ${({ theme }) => theme.mobile} {
    padding: 16px;
  }
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: 20px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 8px;
  flex-wrap: wrap;

  @media ${({ theme }) => theme.mobile} {
    gap: 10px;
    font-size: 12px;
    padding: 10px;
    margin-bottom: 16px;
  }
`;

const Field = styled.div`
  display: grid;
  gap: 8px;
  margin-bottom: 20px;

  @media ${({ theme }) => theme.mobile} {
    margin-bottom: 16px;
  }
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.gray[600]};
  font-weight: 600;
  font-size: 14px;

  @media ${({ theme }) => theme.mobile} {
    font-size: 13px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 8px;
  outline: none;
  font-size: 15px;
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.gray[900]};
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 10px 12px;
    font-size: 14px;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 8px;
  outline: none;
  background: ${({ theme }) => theme.colors.white};
  font-size: 15px;
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.gray[900]};
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 10px 12px;
    font-size: 14px;
  }
`;

const StyledTextarea = styled(TextareaAutosize)`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 8px;
  resize: none;
  font-size: 15px;
  box-sizing: border-box;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.gray[900]};
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 10px 12px;
    font-size: 14px;
  }
`;

const ContentView = styled.div`
  padding: 12px 14px;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.gray[900]};
  background-color: ${({ theme }) => theme.colors.gray[50]};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 8px;
  box-sizing: border-box;

  @media ${({ theme }) => theme.mobile} {
    padding: 10px 12px;
    font-size: 14px;
  }
`;

const DescriptionView = styled(ContentView)`
  white-space: pre-wrap;
  line-height: 1.6;
  min-height: 200px;
`;

const ErrorBox = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.danger_bg};
  border: 1px solid ${({ theme }) => theme.colors.danger_border};
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;

  @media ${({ theme }) => theme.mobile} {
    font-size: 13px;
    padding: 10px 14px;
  }
`;

const GhostBtn = styled.button`
  all: unset;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.gray[100]};
  color: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  font-size: 14px;
  font-weight: 600;
  transition:
    background 0.12s ease,
    transform 0.06s ease;
  box-sizing: border-box;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.gray[200]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 10px 16px;
    font-size: 13px;
  }
`;

const PrimaryBtn = styled.button`
  all: unset;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.primary_alpha};
  transition:
    transform 0.06s ease,
    box-shadow 0.12s ease,
    background 0.12s ease;
  box-sizing: border-box;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    background: ${({ theme }) => theme.colors.primary_dark};
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 10px 16px;
    font-size: 13px;
  }
`;

const DeleteBtn = styled(PrimaryBtn)`
  background: ${({ theme }) => theme.colors.danger};
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.danger_light || '#c82333'};
    box-shadow: 0 6px 16px rgba(220, 53, 69, 0.3);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlay};
  display: grid;
  place-items: center;
  z-index: 1000;
  padding: 16px;
  box-sizing: border-box;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  box-sizing: border-box;

  h3 {
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 18px;
    color: ${({ theme }) => theme.colors.gray[900]};
  }

  p {
    margin-bottom: 24px;
    color: ${({ theme }) => theme.colors.gray[650]};
    line-height: 1.6;
    font-size: 15px;
    white-space: pre-wrap;
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 20px;

    h3 {
      font-size: 16px;
    }
    p {
      font-size: 14px;
      margin-bottom: 20px;
    }
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;
