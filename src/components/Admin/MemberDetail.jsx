import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import axios from '../../api/axios';
import TextareaAutosize from 'react-textarea-autosize';

const MemberDetail = () => {
  const { userType, userId } = useParams();
  const isBuyer = userType === 'buyer';
  const isSeller = userType === 'seller';

  // 로딩/에러
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 사용자 데이터(폼 상태)
  const [form, setForm] = useState({
    name: '',
    username: '',
    phoneNumber: '',
    email: '',
    company: '', // 판매자용
    companyNumber: '', // 판매자용
    memo: '',
    enabled: true,
    accountNonExpired: true, // 계정 만료 휴면계정
    accountNonLocked: true, // 계정 잠김
    accountExpiryDate: null,
    failedLoginAttempts: 0,
    lastPasswordChangedAt: '',
    role: '',
    createdAt: '',
    grade: '', // 구매자용
  });

  // 원본 비교용
  const [original, setOriginal] = useState(null);

  // 임시 알림/모달
  const [toast, setToast] = useState('');
  const [confirm, setConfirm] = useState({
    open: false,
    title: '',
    onConfirm: null,
  });

  // util 함수
  const mapToForm = (data) => ({
    name: data.name || '',
    username: data.username || '',
    phoneNumber: data.phoneNumber || '',
    email: data.email || '',
    company: data.company || '',
    companyNumber: data.companyNumber || '',
    memo: data.memo || '',
    // 추가 표시용
    enabled: Boolean(data.enabled),
    accountNonExpired: Boolean(data.accountNonExpired),
    accountNonLocked: Boolean(data.accountNonLocked),
    accountExpiryDate: data.accountExpiryDate || null,
    failedLoginAttempts: data.failedLoginAttempts ?? 0,
    lastPasswordChangedAt: data.lastPasswordChangedAt || '',
    role: data.role || '',
    createdAt: data.createdAt || '',
    grade: data.grade || '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError('');
      try {
        const [{ data: summary }, { data: memoRes }] = await Promise.all([
          axios.get(`/admin/${userType}/${userId}/summary`),
          axios.get(`/api/admin/memo`, { params: { userType, userId } }),
        ]);
        const mapped = mapToForm(summary);
        mapped.memo = memoRes?.content ?? ''; // 메모 병합
        setForm(mapped);
        setOriginal(mapped);
        console.log(mapped);
      } catch (e) {
        console.error(e);
        setError('회원/메모 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userType, userId]);

  // 저장대상만 비교(예: memo만 저장하는 경우)
  const pickSavable = (f) => ({ memo: f.memo });
  const dirty = useMemo(
    () =>
      JSON.stringify(pickSavable(form)) !==
      JSON.stringify(pickSavable(original || {})),
    [form, original]
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // 상태 토글
  const onToggleStatus = () => {
    const nextEnabled = !form.enabled;
    setConfirm({
      open: true,
      title: nextEnabled ? '계정 활성화' : '계정 비활성화',
      description: nextEnabled
        ? '해당 계정을 다시 활성화합니다. 계속하시겠습니까?'
        : '해당 계정을 비활성화합니다. 로그인 및 주문 등이 제한될 수 있습니다. 계속하시겠습니까?',
      confirmText: nextEnabled ? '활성화' : '비활성화',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          setLoading(true);
          setError('');
          const url = nextEnabled
            ? `/admin/${userType}/${userId}/enable`
            : `/admin/${userType}/${userId}/disable`;
          const { data } = await axios.post(url);
          setForm((p) => ({ ...p, enabled: Boolean(data.enabled) }));
          setOriginal((o) => ({
            ...(o || {}),
            enabled: Boolean(data.enabled),
          }));
          setToast(
            data.message ||
              (nextEnabled
                ? '계정이 활성화되었습니다.'
                : '계정이 정지되었습니다.')
          );
        } catch (e) {
          console.error(e);
          setError('상태 변경 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 비밀번호 틀림 잠김 해제
  const onUnlock = () => {
    setConfirm({
      open: true,
      title: '계정 잠금 해제',
      description: '해당 계정의 잠금을 해제합니다. 계속하시겠습니까?',
      confirmText: '해제',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          setLoading(true);
          setError('');
          const { data } = await axios.post(
            `/admin/${userType}/${userId}/unlock`
          );
          // 서버가 accountNonLocked=true로 반영되도록 처리되어 있다고 가정
          setForm((p) => ({
            ...p,
            accountNonLocked: true,
            failedLoginAttempts: 0,
          }));
          setOriginal((o) => ({
            ...(o || {}),
            accountNonLocked: true,
            failedLoginAttempts: 0,
          }));
          setToast(data.message || '계정 잠금이 해제되었습니다.');
        } catch (e) {
          console.error(e);
          setError('잠금 해제 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 만료(휴면계정) 해제
  const onUnexpire = () => {
    setConfirm({
      open: true,
      title: '계정 만료 해제',
      description: '해당 계정의 만료 상태를 해제합니다. 계속하시겠습니까?',
      confirmText: '해제',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          setLoading(true);
          setError('');
          const { data } = await axios.post(
            `/admin/${userType}/${userId}/unexpire`
          );
          // 서버가 만료 해제 후 accountNonExpired=true 상태가 되도록 처리되어 있다고 가정
          setForm((p) => ({ ...p, accountNonExpired: true }));
          setOriginal((o) => ({ ...(o || {}), accountNonExpired: true }));
          setToast(data?.message || '계정 만료를 해제했습니다.');
        } catch (e) {
          console.error(e);
          setError('계정 만료 해제 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 임시 비밀번호 발급: 모달 확인
  const onResetPassword = () => {
    setConfirm({
      open: true,
      title: '임시 비밀번호 발급',
      description: isBuyer
        ? '구매자 임시 비밀번호를 발급/전송합니다. 계속하시겠습니까?'
        : '판매자 임시 비밀번호를 발급/전송합니다. 계속하시겠습니까?',
      confirmText: '발급',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          // const { data } = await axios.post(`/admin/${userType}/${userId}/reset-password`);
          // setToast(`임시 비밀번호가 전송되었습니다. (${data.maskedDestination})`);
          setToast('임시 비밀번호가 전송되었습니다.');
        } catch (e) {
          console.error(e);
          setError('임시 비밀번호 발급 중 오류가 발생했습니다.');
        }
      },
    });
  };

  // 저장: 모달 확인 → 저장
  const onSave = () => {
    if (!dirty) return;
    setConfirm({
      open: true,
      title: '변경사항 저장',
      description: '입력하신 변경사항(메모)을 저장합니다. 계속하시겠습니까?',
      confirmText: '저장',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          setLoading(true);
          setError('');
          const payload = {
            userType,
            userId: Number(userId),
            content: form.memo ?? '',
          };
          const { data } = await axios.post(`/api/admin/memo/upsert`, payload);
          const nextMemo = data?.content ?? payload.content;
          setForm((p) => ({ ...p, memo: nextMemo }));
          setOriginal((o) => ({ ...(o || {}), memo: nextMemo }));
          setToast('메모가 저장되었습니다.');
        } catch (e) {
          console.error(
            'UPsert error',
            e?.response?.status,
            e?.response?.data || e.message
          );
          setError(
            e?.response?.data?.message || '메모 저장 중 오류가 발생했습니다.'
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 되돌리기: 모달 확인 → 원복
  const onRevert = () => {
    if (!dirty || !original) return;
    setConfirm({
      open: true,
      title: '변경사항 되돌리기',
      description:
        '저장되지 않은 메모를 원래대로 되돌립니다. 계속하시겠습니까?',
      confirmText: '되돌리기',
      cancelText: '취소',
      onConfirm: () => {
        setForm((p) => ({ ...p, memo: original.memo || '' }));
        setToast('메모 변경사항을 되돌렸습니다.');
      },
    });
  };

  if (loading && !original) return <Center>로딩 중...</Center>;
  if (error && !original)
    return <Center style={{ color: '#ef4444' }}>{error}</Center>;
  if (!original) return null;

  return (
    <Page>
      <Header>
        <h2>{isBuyer ? '구매자 관리' : '판매자 관리'}</h2>
        <HeaderActions>
          {!form.accountNonLocked && (
            <GhostBtn onClick={onUnlock} disabled={loading}>
              잠금 해제
            </GhostBtn>
          )}

          {!form.accountNonExpired && (
            <GhostBtn onClick={onUnexpire} disabled={loading}>
              휴면계정 해제
            </GhostBtn>
          )}

          <GhostBtn onClick={onResetPassword}>임시 비밀번호 발급</GhostBtn>
        </HeaderActions>
      </Header>

      <Grid>
        <Card>
          <CardTitle>기본 정보</CardTitle>

          <CompactRow>
            <Label>이름</Label>
            <Value>{form.name || '-'}</Value>
          </CompactRow>

          <CompactRow>
            <Label>아이디</Label>
            <Value mono>{form.username || '-'}</Value>
          </CompactRow>

          <Divider />

          <CompactRow>
            <Label>전화번호</Label>
            <Value mono>{form.phoneNumber || '-'}</Value>
          </CompactRow>

          <CompactRow>
            <Label>이메일</Label>
            <Value mono>{form.email || '-'}</Value>
          </CompactRow>

          {isSeller && (
            <>
              <Divider />
              <CompactRow>
                <Label>회사명</Label>
                <Value>{form.company || '-'}</Value>
              </CompactRow>
              <CompactRow>
                <Label>사업자번호</Label>
                <Value mono>{form.companyNumber || '-'}</Value>
              </CompactRow>
            </>
          )}

          {isBuyer && (
            <>
              <Divider />
              <CompactRow>
                <Label>등급</Label>
                <Value>{form.grade || '-'}</Value>
              </CompactRow>
            </>
          )}
        </Card>

        <Card>
          <CardTitle>계정 상태·보안</CardTitle>

          <KeyStats>
            <ClickableStat
              role="button"
              tabIndex={0}
              aria-pressed={!!form.enabled}
              aria-label={form.enabled ? '비활성화' : '활성화'}
              onClick={onToggleStatus}
              data-clickable={!loading}
            >
              <StatLabel>사용여부</StatLabel>
              <StatValue data-ok={form.enabled}>
                {form.enabled ? '사용' : '중지'}
              </StatValue>
            </ClickableStat>

            <Stat>
              <StatLabel>잠금여부</StatLabel>
              <StatValue data-ok={form.accountNonLocked}>
                {form.accountNonLocked ? '잠김 아님' : '잠김'}
              </StatValue>
            </Stat>

            <Stat>
              <StatLabel>만료여부</StatLabel>
              <StatValue data-ok={form.accountNonExpired}>
                {form.accountNonExpired ? '만료 아님' : '휴면계정'}
              </StatValue>
            </Stat>

            <Stat>
              <StatLabel>실패</StatLabel>
              <StatValue mono>{form.failedLoginAttempts ?? 0}</StatValue>
            </Stat>
          </KeyStats>

          <CompactRow>
            <Label>가입일</Label>
            <Value mono>
              {form.createdAt ? String(form.createdAt).slice(0, 10) : '-'}
            </Value>
          </CompactRow>

          <CompactRow>
            <Label>만료 예정일</Label>
            <Value mono>
              {form.accountExpiryDate
                ? String(form.accountExpiryDate).slice(0, 10)
                : '-'}
            </Value>
          </CompactRow>

          <CompactRow>
            <Label>마지막 비번 변경</Label>
            <Value mono>
              {form.lastPasswordChangedAt
                ? form.lastPasswordChangedAt.slice(0, 19).replace('T', ' ')
                : '-'}
            </Value>
          </CompactRow>

          <Divider style={{ marginTop: 12 }} />

          <CardTitle style={{ marginTop: 8 }}>메모</CardTitle>
          <TextareaAutosize
            name="memo"
            value={form.memo}
            onChange={onChange}
            placeholder="내부 참고용 메모를 입력하세요."
            minRows={5}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid rgba(15, 23, 42, 0.12)',
              borderRadius: 8,
              resize: 'none',
              fontSize: '16px',
            }}
          />
        </Card>
      </Grid>

      <FooterBar>
        {error && <ErrorText>{error}</ErrorText>}
        {toast && <Toast onAnimationEnd={() => setToast('')}>{toast}</Toast>}
        <div style={{ flex: 1 }} />
        <GhostBtn onClick={onRevert} disabled={!dirty}>
          되돌리기
        </GhostBtn>
        <PrimaryBtn onClick={onSave} disabled={!dirty}>
          저장
        </PrimaryBtn>
      </FooterBar>

      {confirm.open && (
        <Dim>
          <Modal>
            <h3>{confirm.title}</h3>
            {confirm.description && (
              <p style={{ margin: '6px 0 18px 0', color: '#4b5563' }}>
                {confirm.description}
              </p>
            )}
            <ModalActions>
              <GhostBtn
                onClick={() => setConfirm((p) => ({ ...p, open: false }))}
              >
                {confirm.cancelText || '취소'}
              </GhostBtn>
              <PrimaryBtn
                onClick={async () => {
                  await confirm.onConfirm?.();
                  setConfirm((p) => ({ ...p, open: false }));
                }}
              >
                {confirm.confirmText || '확인'}
              </PrimaryBtn>
            </ModalActions>
          </Modal>
        </Dim>
      )}
    </Page>
  );
};

export default MemberDetail;

const Page = styled.div`
  display: grid;
  gap: 16px;
`;

const Center = styled.div`
  display: grid;
  place-items: center;
  height: 300px;
  color: #374151;
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

const HeaderActions = styled.div`
  display: inline-flex;
  gap: 8px;
  align-items: center;
`;

const GhostBtn = styled.button`
  all: unset;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  background: #eef2f7;
  color: #1f2937;
  border: 1px solid rgba(15, 23, 42, 0.08);
  transition: background 0.12s ease, transform 0.06s ease;
  &:hover {
    background: #e5eaf1;
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 16px;
  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 12px;
  padding: 16px;
`;

const CardTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #111827;
`;

const CompactRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 10px;
  align-items: center;
  padding: 6px 0;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Value = styled.div`
  padding: 8px 10px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  background: #fafbfc;
  color: #111827;
  font-family: ${(p) =>
    p.mono ? 'ui-monospace,SFMono-Regular,Menlo,monospace' : 'inherit'};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid rgba(15, 23, 42, 0.06);
  margin: 10px 0;
`;

const KeyStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  margin: 6px 0 8px 0;
`;

const Stat = styled.div`
  background: #f8fafc;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  padding: 10px;
  text-align: center;
`;

const ClickableStat = styled(Stat)`
  position: relative;
  cursor: ${(p) => (p['data-clickable'] ? 'pointer' : 'default')};
  transition: background 0.15s ease, box-shadow 0.15s ease;

  ${(p) =>
    p['data-clickable'] &&
    `
    &:hover { background: #8794b1ff; box-shadow: inset 0 0 0 1px rgba(15,23,42,0.08); }
  `}

  &:focus-visible {
    outline: 2px solid rgba(37, 50, 77, 0.35);
    outline-offset: 2px;
  }
  ${(p) => !p['data-clickable'] && `opacity: 0.6;`}
`;

const StatValue = styled.div`
  position: relative;
  font-weight: 700;
  color: ${(p) => (p['data-ok'] ? '#111827' : '#ef4444')};
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${ClickableStat}:hover &,
  ${ClickableStat}:focus-visible & {
    color: transparent;
  }

  ${ClickableStat}:hover &::after,
  ${ClickableStat}:focus-visible &::after {
    content: ${(p) => (p['data-ok'] ? '"비활성화"' : '"활성화"')};
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    font-weight: 800;
    white-space: nowrap;
  }
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
`;

const Label = styled.label`
  color: #6b7280;
  font-size: 13px;
`;

const FooterBar = styled.div`
  position: sticky;
  bottom: 0;
  background: #f8fafc;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ErrorText = styled.span`
  color: #ef4444;
  font-size: 14px;
`;

const Toast = styled.div`
  color: #111827;
  font-size: 14px;
  animation: fade 2.4s ease forwards;
  @keyframes fade {
    0% {
      opacity: 0;
      transform: translateY(6px);
    }
    10% {
      opacity: 1;
      transform: translateY(0);
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
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
  transition: transform 0.06s ease, box-shadow 0.12s ease, background 0.12s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(37, 50, 77, 0.22);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(37, 50, 77, 0.18);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Dim = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.28);
  display: grid;
  place-items: center;
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 12px;
  width: min(480px, 92vw);
  padding: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  h3 {
    margin: 0;
  }
  p {
    margin: 8px 0 0 0;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 18px;
`;
