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
  const [setToast] = useState('');
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

        <Field style={{ marginBottom: 0 }}>
          <Label htmlFor="description">설명</Label>
          <StyledTextarea
            id="description"
            name="description"
            value={form.description}
            onChange={onChange}
            minRows={10}
            placeholder="공지 내용을 입력하세요"
          />
        </Field>
      </Card>

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

  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.gray[900]};
    font-size: 22px;

    @media ${({ theme }) => theme.mobile} {
      font-size: 18px;
    }
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 12px;
  padding: 24px;

  @media ${({ theme }) => theme.mobile} {
    padding: 16px;
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

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
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

// 기존 인라인 스타일을 styled-component로 분리하여 테마 및 반응형 적용
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

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 10px 12px;
    font-size: 14px;
  }
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

const Dim = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlay};
  display: grid;
  place-items: center;
  z-index: 50;
  padding: 16px;
  box-sizing: border-box;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;

  h3 {
    margin: 0;
    color: ${({ theme }) => theme.colors.gray[900]};
    font-size: 18px;
  }

  p {
    margin: 12px 0 0 0;
    color: ${({ theme }) => theme.colors.gray[650]};
    font-size: 15px;
    line-height: 1.5;
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 20px;

    h3 {
      font-size: 16px;
    }
    p {
      font-size: 14px;
    }
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 24px;
`;
