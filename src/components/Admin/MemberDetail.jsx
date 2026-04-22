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

  // ⭐️ 커스텀 드롭다운 열림/닫힘 상태
  const [isGradeOpen, setIsGradeOpen] = useState(false);

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
    accountNonExpired: true,
    accountNonLocked: true,
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
    enabled: Boolean(data.enabled),
    accountNonExpired: Boolean(data.accountNonExpired),
    accountNonLocked: Boolean(data.accountNonLocked),
    accountExpiryDate: data.accountExpiryDate || null,
    failedLoginAttempts: data.failedLoginAttempts ?? 0,
    lastPasswordChangedAt: data.lastPasswordChangedAt || '',
    role: data.role || '',
    createdAt: data.createdAt || '',
    grade: data.grade || 'BASIC',
  });

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError('');
      try {
        const [{ data: summary }, { data: memoRes }] = await Promise.all([
          axios.get(`/admin/${userType}/${userId}/summary`),
          axios.get(`/admin/memo`, { params: { userType, userId } }),
        ]);
        const mapped = mapToForm(summary);
        mapped.memo = memoRes?.content ?? ''; // 메모 병합
        setForm(mapped);
        setOriginal(mapped);
      } catch (e) {
        console.error(e);
        setError('회원/메모 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userType, userId]);

  // 저장대상 비교
  const pickSavable = (f) => ({ memo: f.memo, grade: f.grade });
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

  // 임시 비밀번호 발급
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
          setToast('임시 비밀번호가 전송되었습니다.');
        } catch (e) {
          console.error(e);
          setError('임시 비밀번호 발급 중 오류가 발생했습니다.');
        }
      },
    });
  };

  // 저장
  const onSave = () => {
    if (!dirty) return;
    setConfirm({
      open: true,
      title: '변경사항 저장',
      description: '입력하신 변경사항을 저장합니다. 계속하시겠습니까?',
      confirmText: '저장',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          setLoading(true);
          setError('');

          const tasks = [];

          if (form.memo !== original.memo) {
            tasks.push(
              axios.post(`/admin/memo/upsert`, {
                userType,
                userId: Number(userId),
                content: form.memo ?? '',
              })
            );
          }

          if (isBuyer && form.grade !== original.grade) {
            tasks.push(
              axios.put(`/api/grade/${userId}`, {
                newGrade: form.grade,
              })
            );
          }

          await Promise.all(tasks);

          setOriginal((o) => ({
            ...(o || {}),
            memo: form.memo,
            grade: form.grade,
          }));
          setToast('변경사항이 저장되었습니다.');
        } catch (e) {
          console.error(e);
          setError('저장 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 되돌리기
  const onRevert = () => {
    if (!dirty || !original) return;
    setConfirm({
      open: true,
      title: '변경사항 되돌리기',
      description:
        '저장되지 않은 변경사항을 원래대로 되돌립니다. 계속하시겠습니까?',
      confirmText: '되돌리기',
      cancelText: '취소',
      onConfirm: () => {
        setForm((p) => ({
          ...p,
          memo: original.memo || '',
          grade: original.grade || 'BASIC',
        }));
        setToast('변경사항을 되돌렸습니다.');
      },
    });
  };

  if (loading && !original) return <Center>로딩 중...</Center>;
  if (error && !original) return <Center error>{error}</Center>;
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
                {/* ⭐️ 기본 브라우저 select 태그 대신 직접 만든 커스텀 드롭다운 사용 */}
                <CustomSelectWrapper
                  onClick={() => setIsGradeOpen(!isGradeOpen)}
                  onMouseLeave={() => setIsGradeOpen(false)}
                >
                  <SelectBox $isOpen={isGradeOpen}>
                    {form.grade}
                    <span className="arrow">▼</span>
                  </SelectBox>

                  {isGradeOpen && (
                    <OptionList>
                      {['BASIC', 'VIP', 'VVIP', 'VVIP_PLUS'].map(
                        (gradeOption) => (
                          <OptionItem
                            key={gradeOption}
                            $active={form.grade === gradeOption}
                            onClick={(e) => {
                              e.stopPropagation(); // 부모로 클릭 이벤트 전파 방지
                              onChange({
                                target: { name: 'grade', value: gradeOption },
                              });
                              setIsGradeOpen(false);
                            }}
                          >
                            {gradeOption}
                          </OptionItem>
                        )
                      )}
                    </OptionList>
                  )}
                </CustomSelectWrapper>
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
              <StatValue mono data-ok={form.failedLoginAttempts === 0}>
                {form.failedLoginAttempts ?? 0}
              </StatValue>
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
          <StyledTextarea
            name="memo"
            value={form.memo}
            onChange={onChange}
            placeholder="내부 참고용 메모를 입력하세요."
            minRows={5}
          />
        </Card>
      </Grid>

      <FooterBar>
        {error && <ErrorText>{error}</ErrorText>}
        {toast && <Toast onAnimationEnd={() => setToast('')}>{toast}</Toast>}
        <div className="spacer" />
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
              <ModalDesc>{confirm.description}</ModalDesc>
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

// === ⭐️ 스타일 영역 (테마 연동 & 커스텀 드롭다운) ===

const Page = styled.div`
  display: grid;
  gap: 16px;
`;

const Center = styled.div`
  display: grid;
  place-items: center;
  height: 300px;
  color: ${(p) => (p.error ? p.theme.colors.danger : p.theme.colors.gray[700])};
`;

const Header = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;

  h2 {
    margin: 0;
    color: ${({ theme: { colors } }) => colors.gray[900]};
  }

  @media ${({ theme }) => theme.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const HeaderActions = styled.div`
  display: inline-flex;
  gap: 8px;
  align-items: center;

  @media ${({ theme }) => theme.mobile} {
    width: 100%;
    flex-wrap: wrap;

    button {
      flex: 1;
      text-align: center;
      justify-content: center;
      min-width: 120px;
    }
  }
`;

const GhostBtn = styled.button`
  all: unset;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  background: ${({ theme: { colors } }) => colors.gray[100]};
  color: ${({ theme: { colors } }) => colors.gray[800]};
  border: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
  transition:
    background 0.12s ease,
    transform 0.06s ease;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: ${({ theme: { colors } }) => colors.gray[200]};
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 12px 10px;
    font-size: 13px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 16px;

  @media ${({ theme }) => theme.mobile} {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${({ theme: { colors } }) => colors.white};
  border: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
  border-radius: 12px;
  padding: 20px;
`;

const CardTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  color: ${({ theme: { colors } }) => colors.gray[900]};
`;

const CompactRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 10px;
  align-items: center;
  padding: 8px 0;

  @media ${({ theme }) => theme.mobile} {
    grid-template-columns: 1fr;
    gap: 4px;
    padding: 10px 0;
  }
`;

const Value = styled.div`
  padding: 10px 12px;
  border: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
  border-radius: 8px;
  background: ${({ theme: { colors } }) => colors.gray[50]};
  color: ${({ theme: { colors } }) => colors.gray[900]};
  font-size: 14px;
  font-family: ${(p) =>
    p.mono ? 'ui-monospace,SFMono-Regular,Menlo,monospace' : 'inherit'};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// ==========================================
// ⭐️ 커스텀 드롭다운 메뉴 스타일 완벽 분리
// ==========================================
const CustomSelectWrapper = styled.div`
  position: relative;
  width: 100%;
  cursor: pointer;
  user-select: none;
`;

const SelectBox = styled.div`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid
    ${({ theme: { colors }, $isOpen }) =>
      $isOpen ? colors.secondary : colors.gray[300]};
  border-radius: 8px;
  background: ${({ theme: { colors } }) => colors.white};
  color: ${({ theme: { colors } }) => colors.gray[900]};
  font-size: 14px;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  box-shadow: ${({ theme: { colors }, $isOpen }) =>
    $isOpen ? `0 0 0 3px ${colors.primary_alpha}` : 'none'};

  &:hover {
    border-color: ${({ theme: { colors }, $isOpen }) =>
      $isOpen ? colors.secondary : colors.gray[400]};
  }

  /* 화살표 빙글 도는 애니메이션 */
  .arrow {
    font-size: 10px;
    color: ${({ theme: { colors } }) => colors.gray[550]};
    transition: transform 0.2s ease;
    transform: ${({ $isOpen }) =>
      $isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const OptionList = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  margin: 0;
  padding: 6px;
  list-style: none;
  background: ${({ theme: { colors } }) => colors.white};
  border: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  z-index: 10;

  /* 부드럽게 스르륵 나타나는 효과 */
  animation: dropdownFade 0.15s ease-out;
  @keyframes dropdownFade {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const OptionItem = styled.li`
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.1s ease;

  /* 선택된 녀석은 진한 색상, 안 된 녀석은 기본 색상 */
  font-weight: ${({ $active }) => ($active ? '700' : '500')};
  color: ${({ theme: { colors }, $active }) =>
    $active ? colors.secondary : colors.gray[800]};
  background: ${({ theme: { colors }, $active }) =>
    $active ? colors.primary_light : 'transparent'};

  &:hover {
    background: ${({ theme: { colors }, $active }) =>
      $active ? colors.primary_light : colors.gray[50]};
  }
`;
// ==========================================

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
  margin: 12px 0;
`;

const KeyStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  margin: 6px 0 12px 0;

  @media ${({ theme }) => theme.mobile} {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Stat = styled.div`
  background: ${({ theme: { colors } }) => colors.gray[50]};
  border: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
  border-radius: 10px;
  padding: 12px 10px;
  text-align: center;
`;

const ClickableStat = styled(Stat)`
  position: relative;
  cursor: ${(p) => (p['data-clickable'] ? 'pointer' : 'default')};
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease;

  ${(p) =>
    p['data-clickable'] &&
    `
    &:hover { 
      background: ${p.theme.colors.primary_light}; 
      box-shadow: inset 0 0 0 1px ${p.theme.colors.gray[300]}; 
    }
  `}

  &:focus-visible {
    outline: 2px solid ${({ theme: { colors } }) => colors.primary_alpha};
    outline-offset: 2px;
  }
  ${(p) => !p['data-clickable'] && `opacity: 0.6;`}
`;

const StatValue = styled.div`
  position: relative;
  font-weight: 700;
  color: ${(p) =>
    p['data-ok'] ? p.theme.colors.gray[900] : p.theme.colors.danger};
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
    color: ${({ theme: { colors } }) => colors.white};
    background: ${({ theme: { colors } }) => colors.secondary};
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }
`;

const StatLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme: { colors } }) => colors.gray[600]};
  margin-bottom: 6px;
`;

const Label = styled.label`
  color: ${({ theme: { colors } }) => colors.gray[650]};
  font-size: 13px;
  font-weight: 600;
`;

const StyledTextarea = styled(TextareaAutosize)`
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme: { colors } }) => colors.gray[300]};
  border-radius: 8px;
  resize: none;
  font-size: 15px;
  font-family: inherit;
  color: ${({ theme: { colors } }) => colors.gray[900]};
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: ${({ theme: { colors } }) => colors.secondary};
    box-shadow: 0 0 0 3px ${({ theme: { colors } }) => colors.primary_alpha};
  }

  &::placeholder {
    color: ${({ theme: { colors } }) => colors.gray[400]};
  }
`;

const FooterBar = styled.div`
  position: sticky;
  bottom: 0;
  background: ${({ theme: { colors } }) => colors.gray[50]};
  border: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.02);

  .spacer {
    flex: 1;
  }

  @media ${({ theme }) => theme.mobile} {
    flex-wrap: wrap;
    padding: 12px;
    border-radius: 8px;

    .spacer {
      display: none;
    }
  }
`;

const ErrorText = styled.span`
  color: ${({ theme: { colors } }) => colors.danger};
  font-size: 14px;
  font-weight: 600;

  @media ${({ theme }) => theme.mobile} {
    width: 100%;
    text-align: center;
    margin-bottom: 8px;
  }
`;

const Toast = styled.div`
  color: ${({ theme: { colors } }) => colors.gray[900]};
  font-size: 14px;
  font-weight: 600;
  animation: fade 2.4s ease forwards;

  @media ${({ theme }) => theme.mobile} {
    width: 100%;
    text-align: center;
    margin-bottom: 8px;
  }

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
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  background: ${({ theme: { colors } }) => colors.secondary};
  color: ${({ theme: { colors } }) => colors.white};
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 4px 12px ${({ theme: { colors } }) => colors.primary_alpha};
  transition:
    transform 0.06s ease,
    box-shadow 0.12s ease,
    background 0.12s ease;

  &:hover {
    transform: translateY(-1px);
    background: ${({ theme: { colors } }) => colors.primary};
    box-shadow: 0 6px 16px ${({ theme: { colors } }) => colors.primary_alpha};
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px ${({ theme: { colors } }) => colors.primary_alpha};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media ${({ theme }) => theme.mobile} {
    flex: 1;
    padding: 12px 0;
  }
`;

const Dim = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme: { colors } }) => colors.overlay};
  display: grid;
  place-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: ${({ theme: { colors } }) => colors.white};
  border-radius: 12px;
  width: min(480px, 92vw);
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

  h3 {
    margin: 0;
    color: ${({ theme: { colors } }) => colors.gray[900]};
  }
`;

const ModalDesc = styled.p`
  margin: 12px 0 24px 0;
  color: ${({ theme: { colors } }) => colors.gray[600]};
  line-height: 1.5;
  font-size: 15px;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;
