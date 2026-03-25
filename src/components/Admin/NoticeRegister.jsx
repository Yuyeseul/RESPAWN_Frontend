import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import axios from '../../api/axios';
import TextareaAutosize from 'react-textarea-autosize';

const NOTICE_TYPES = {
  SHIPPING: '배송',
  ORDER: '주문',
  ACCOUNT: '계정',
  OPERATIONS: '운영',
};

const NoticeRegister = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    noticeType: 'SHIPPING',
  });

  // 파생 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [confirm, setConfirm] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null,
  });

  // 간단 검증 (noticeType 검증 추가)
  const canSubmit = useMemo(() => {
    return (
      form.title.trim().length > 0 &&
      form.description.trim().length > 0 &&
      !!form.noticeType
    );
  }, [form.title, form.description, form.noticeType]);

  // 입력 핸들러 (select 포함)
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // 2. 서버 전송 로직 수정 (JSON 전송)
  const postNotice = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        noticeType: form.noticeType,
      };

      // FormData 대신 JSON 객체를 body로 전송
      await axios.post('/notices/register', payload);

      setToast('공지사항이 게시되었습니다.');
      // 게시 완료 후 폼 초기화
      setForm({
        title: '',
        description: '',
        noticeType: 'SHIPPING',
      });
    } catch (e) {
      console.error(
        'notice create error',
        e?.response?.status,
        e?.response?.data || e.message
      );
      setError(e?.response?.data?.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 게시 버튼 핸들러
  const onPublish = () => {
    if (!canSubmit) {
      setError('제목, 설명, 공지 타입을 모두 입력/선택하세요.');
      return;
    }
    setConfirm({
      open: true,
      title: '공지사항 게시',
      description: '작성한 내용으로 공지사항을 게시하시겠습니까?',
      onConfirm: async () => {
        await postNotice();
        setConfirm((p) => ({ ...p, open: false }));
      },
    });
  };

  return (
    <Page>
      <Header>
        <h2>공지사항 작성</h2>
        <PrimaryBtn type="button" disabled={loading} onClick={onPublish}>
          게시
        </PrimaryBtn>
      </Header>

      {error && <ErrorBox>{error}</ErrorBox>}

      <Card>
        <Field>
          <Label htmlFor="title">제목</Label>
          <Input
            id="title"
            name="title"
            value={form.title}
            onChange={onChange}
            placeholder="제목을 입력하세요"
            maxLength={120}
          />
        </Field>

        <Field>
          <Label htmlFor="noticeType">공지 타입</Label>
          <Select
            id="noticeType"
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
        </Field>

        <Field>
          <Label htmlFor="description">설명</Label>
          <TextareaAutosize
            id="description"
            name="description"
            value={form.description}
            onChange={onChange}
            minRows={10}
            placeholder="공지 내용을 입력하세요"
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid rgba(15,23,42,0.12)',
              borderRadius: 8,
              resize: 'none',
              fontSize: '15px',
            }}
          />
        </Field>

        {/* 6. 옵션 및 파일 첨부 UI 제거 */}
      </Card>

      {/* 확인 모달 (기존 코드 재사용) */}
      {confirm.open && (
        <Dim role="dialog" aria-modal="true">
          <Modal>
            <h3>{confirm.title}</h3>
            {confirm.description && <p>{confirm.description}</p>}
            <ModalActions>
              <GhostBtn
                onClick={() => setConfirm((p) => ({ ...p, open: false }))}
              >
                취소
              </GhostBtn>
              <PrimaryBtn
                onClick={async () => {
                  await confirm.onConfirm?.();
                }}
              >
                확인
              </PrimaryBtn>
            </ModalActions>
          </Modal>
        </Dim>
      )}
    </Page>
  );
};

export default NoticeRegister;

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

const Dim = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.28);
  display: grid;
  place-items: center;
  z-index: 50;
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 12px;
  width: min(480px, 92vw);
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  h3 {
    margin: 0;
  }
  p {
    margin: 8px 0 0 0;
    color: #4b5563;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 24px;
`;
