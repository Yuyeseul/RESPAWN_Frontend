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
      const { data } = await axios.get(
        `/api/notices/view?noticeId=${noticeId}`
      );
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
          await axios.post(`/api/notices/${noticeId}/update`, payload); // API 엔드포인트 예시
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
          await axios.delete(`/api/notices/${noticeId}`);
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
        <div>
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
        </div>
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
            <TextareaAutosize
              name="description"
              value={form.description}
              onChange={onChange}
              minRows={10}
              style={{
                width: '100%',
                padding: 12,
                border: '1px solid rgba(15,23,42,0.12)',
                borderRadius: 8,
                resize: 'none',
                fontSize: '15px',
              }}
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
              {/* isDanger 값에 따라 삭제 버튼 또는 기본 확인 버튼을 표시 */}
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
`;

const Header = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  h2 {
    margin: 0;
  }
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 12px;
  padding: 16px;
`;

const Field = styled.div`
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
`;

const Label = styled.label`
  color: #6b7280;
  font-weight: 500;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 8px;
  outline: none;
  font-size: 15px;
  &:focus {
    border-color: #25324d;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 8px;
  outline: none;
  background: #fff;
  font-size: 15px;
  &:focus {
    border-color: #25324d;
  }
`;

const ErrorBox = styled.div`
  color: #ef4444;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
`;

const GhostBtn = styled.button`
  all: unset;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  background: #eef2f7;
  color: #1f2937;
  border: 1px solid rgba(15, 23, 42, 0.08);
  transition:
    background 0.12s ease,
    transform 0.06s ease;
  &:hover {
    background: #e5eaf1;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrimaryBtn = styled.button`
  all: unset;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  background: #25324d;
  color: #fff;
  box-shadow: 0 4px 12px rgba(37, 50, 77, 0.18);
  transition:
    transform 0.06s ease,
    box-shadow 0.12s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(37, 50, 77, 0.22);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 4px 12px rgba(37, 50, 77, 0.18);
  }
`;

const DeleteBtn = styled(PrimaryBtn)`
  background: #ef4444;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.22);

  &:hover {
    background: #dc2626;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(220, 38, 38, 0.28);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;

  h3 {
    margin-top: 0;
    font-size: 20px;
  }
  p {
    margin-bottom: 24px;
    color: #4b5563;
    line-height: 1.6;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const ContentView = styled.div`
  padding: 12px;
  font-size: 15px;
  color: #111827;
  background-color: #f9fafb; // 배경색 추가
  border: 1px solid #e5e7eb; // 테두리 추가
  border-radius: 8px; // 둥근 모서리 추가
`;

const DescriptionView = styled.div`
  padding: 12px;
  font-size: 15px;
  color: #374151;
  white-space: pre-wrap;
  line-height: 1.6;
  min-height: 200px;
  background-color: #f9fafb; // 배경색 추가
  border: 1px solid #e5e7eb; // 테두리 추가
  border-radius: 8px; // 둥근 모서리 추가
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 8px;
`;
