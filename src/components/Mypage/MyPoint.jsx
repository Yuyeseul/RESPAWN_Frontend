import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from '../../api/axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import MypageLayout from './MypageLayout';

const SCROLL_THRESHOLD = 8;

const TYPE_LABELS = {
  SAVE: '적립',
  USE: '사용',
  EXPIRE: '만료',
  CANCEL_SAVE: '적립취소',
  CANCEL_USE: '사용취소',
};

function PointsPage() {
  const [totalPoints, setTotalPoints] = useState(0);
  const [expiringPoints, setExpiringPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [saves, setSaves] = useState([]);
  const [uses, setUses] = useState([]);
  const [expires, setExpires] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // all | saves | uses | expires
  const [month, setMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tabToListMap = {
    all: history,
    saves,
    uses,
    expiring: expires,
  };

  const currentList = tabToListMap[activeTab] || history;

  useEffect(() => {
    const fetchPoints = async () => {
      setLoading(true);
      setError(null);
      try {
        const year = month.getFullYear();
        const m = month.getMonth() + 1;

        const [
          totalRes,
          expiringPointsRes,
          historyRes,
          savesRes,
          usesRes,
          expireRes,
        ] = await Promise.all([
          axios.get(`/points/total/active`, { params: { year, month: m } }),
          axios.get(`/points/expire/this-month/total`, {
            params: { year, month: m },
          }),
          axios.get(`/points/history`, { params: { year, month: m } }),
          axios.get(`/points/saves`, { params: { year, month: m } }),
          axios.get(`/points/uses`, { params: { year, month: m } }),
          axios.get(`/points/expire/list`, { params: { year, month: m } }),
        ]);

        setTotalPoints(totalRes.data ?? 0);
        setExpiringPoints(expiringPointsRes.data?.totalExpiringThisMonth ?? 0);
        setHistory(historyRes.data?.content ?? []);
        setSaves(savesRes.data?.content ?? []);
        setUses(usesRes.data?.content ?? []);
        setExpires(expireRes.data ?? []);
      } catch (e) {
        setError('데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [month]);

  const isMinusType = (type) =>
    type === 'USE' || type === 'EXPIRE' || type === 'CANCEL_SAVE';

  const getAmountValue = (item) => {
    if (typeof item.absAmount === 'number') {
      return isMinusType(item.type) ? -item.absAmount : item.absAmount;
    }
    return item.amount || 0;
  };

  const formatAmount = (n) =>
    n > 0 ? `+${n.toLocaleString()}원` : `-${Math.abs(n).toLocaleString()}원`;

  const pad2 = (n) => String(n).padStart(2, '0');
  const formatYmd = (d) =>
    `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
  const getMonthPeriod = (baseDate) => {
    const y = baseDate.getFullYear();
    const m = baseDate.getMonth();

    const first = new Date(y, m, 1);

    const last = new Date(y, m + 1, 0);

    return {
      first,
      last,
      text: `${formatYmd(first)} ~ ${formatYmd(last)}`,
    };
  };
  const { text: periodText } = getMonthPeriod(month);
  const shiftMonth = (delta) =>
    setMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    );

  const renderEmpty = (text) => <Empty>{text}</Empty>;

  const renderExpiringSection = (items) => {
    if (!items || items.length === 0)
      return renderEmpty('만료 예정 내역이 없습니다.');
    return (
      <CardList scrollable={items.length > SCROLL_THRESHOLD}>
        {items.map((item) => {
          const expiryDate = new Date(item.expiryAt);
          const dateTxt = `${expiryDate.getMonth() + 1}.${String(
            expiryDate.getDate()
          ).padStart(2, '0')}`;
          const timeTxt = `${String(expiryDate.getHours()).padStart(
            2,
            '0'
          )}:${String(expiryDate.getMinutes()).padStart(2, '0')}`;
          return (
            <Card key={item.ledgerId}>
              <Left>
                <div className="date">{dateTxt}</div>
              </Left>
              <Center>
                <div className="title">{item.reason || '만료 예정 포인트'}</div>
                <div className="sub">
                  만료 예정 · {expiryDate.toLocaleDateString()} · {timeTxt}
                </div>
              </Center>
              <Right className="minus">
                -{item.remainingAmount.toLocaleString()}원
              </Right>
            </Card>
          );
        })}
      </CardList>
    );
  };

  const renderHistoryLikeSection = (items) => {
    if (!items || items.length === 0) return renderEmpty('내역이 없습니다.');
    return (
      <CardList scrollable={items.length > SCROLL_THRESHOLD}>
        {items.map((item) => {
          const occurred = new Date(item.occurredAt);
          const dateTxt = `${String(occurred.getMonth() + 1).padStart(
            2,
            '0'
          )}.${String(occurred.getDate()).padStart(2, '0')}`;
          const timeTxt = `${String(occurred.getHours()).padStart(
            2,
            '0'
          )}:${String(occurred.getMinutes()).padStart(2, '0')}`;
          const typeLabel = TYPE_LABELS[item.type] || item.type;
          const amountVal = getAmountValue(item);
          const isMinus = amountVal < 0;
          return (
            <Card key={item.id}>
              <Left>
                <div className="date">{dateTxt}</div>
                <div className="time">{timeTxt}</div>
              </Left>
              <Center>
                <div className="title">
                  {item.title ||
                    item.memo ||
                    item.reason ||
                    `${typeLabel} 내역`}
                </div>
                <div className="sub">
                  {typeLabel}
                  {item.expiryAt
                    ? ` · 만료 ${new Date(item.expiryAt).toLocaleDateString()}`
                    : ''}
                </div>
              </Center>
              <Right className={isMinus ? 'minus' : 'plus'}>
                {formatAmount(amountVal)}
              </Right>
            </Card>
          );
        })}
      </CardList>
    );
  };

  return (
    <MypageLayout title="적립금" isNarrow={true}>
      <DateFilterSection>
        <IconBtn type="button" aria-label="prev" onClick={() => shiftMonth(-1)}>
          ‹
        </IconBtn>
        <StyledDatePicker>
          <DatePicker
            selected={month}
            onChange={(date) => setMonth(date)}
            dateFormat="yyyy년 MM월"
            showMonthYearPicker
            locale={ko}
            customInput={
              <MonthBtn>
                {month.getFullYear()}년 {month.getMonth() + 1}월 ▾
              </MonthBtn>
            }
          />
        </StyledDatePicker>
        <IconBtn type="button" aria-label="next" onClick={() => shiftMonth(1)}>
          ›
        </IconBtn>
      </DateFilterSection>

      <PeriodText>{periodText}</PeriodText>

      <SummaryCard>
        <div className="left">
          <div className="label">총 보유 적립금</div>
          <div className="hint">
            이번 달 소멸 예정 {expiringPoints.toLocaleString()}원
          </div>
        </div>
        <div className="value">{totalPoints.toLocaleString()}원</div>
      </SummaryCard>

      <ChipTabs role="tablist">
        {['all', 'saves', 'uses', 'expiring'].map((tab) => (
          <Chip
            key={tab}
            active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'all'
              ? '전체'
              : tab === 'saves'
                ? '적립'
                : tab === 'uses'
                  ? '사용'
                  : '만료예정'}
          </Chip>
        ))}
      </ChipTabs>

      <ListContainer>
        {loading ? (
          <LoadingWrapper>
            <Spinner />
            <LoadingText>데이터를 불러오는 중입니다...</LoadingText>
          </LoadingWrapper>
        ) : error ? (
          renderEmpty(error)
        ) : activeTab === 'expiring' ? (
          renderExpiringSection(currentList)
        ) : (
          renderHistoryLikeSection(currentList)
        )}
      </ListContainer>
    </MypageLayout>
  );
}

export default PointsPage;

// === 스타일 영역 ===
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 16px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${({ theme }) => theme.colors.gray[200]};
  border-top-color: ${({ theme }) => theme.colors.secondary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  color: ${({ theme }) => theme.colors.gray[550]};
  font-size: 14px;
  font-weight: 600;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const DateFilterSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 5px;
`;

const IconBtn = styled.button`
  border: none;
  background: transparent;
  font-size: 24px;
  color: ${({ theme }) => theme.colors.gray[600]};
  cursor: pointer;
  align-items: center;
  padding: 0 10px;
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const StyledDatePicker = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  .react-datepicker-wrapper {
    width: auto;
  }

  .react-datepicker__triangle {
    display: none;
  }

  .react-datepicker {
    border: 1px solid ${({ theme }) => theme.colors.gray[200]};
    border-radius: 12px;
    box-shadow: 0 10px 24px ${({ theme }) => theme.colors.shadow_line};
    font-family: inherit;
    background-color: ${({ theme }) => theme.colors.white};
    overflow: hidden;
  }

  .react-datepicker__header {
    background-color: ${({ theme }) => theme.colors.gray[50]};
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
    border-radius: 12px 12px 0 0;
    padding-top: 12px;
  }

  .react-datepicker__current-month {
    color: ${({ theme }) => theme.colors.gray[800]};
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .react-datepicker__navigation-icon::before {
    border-color: ${({ theme }) => theme.colors.gray[500]};
    border-width: 2px 2px 0 0;
  }
  .react-datepicker__navigation:hover *::before {
    border-color: ${({ theme }) => theme.colors.secondary};
  }

  .react-datepicker__month-wrapper {
    display: flex;
    justify-content: space-around;
  }

  .react-datepicker__month-text {
    color: ${({ theme }) => theme.colors.gray[800]};
    border-radius: 6px;
    padding: 6px 0;
    margin: 4px;
    transition:
      background-color 0.15s ease,
      color 0.15s ease;

    &:hover {
      background-color: ${({ theme }) => theme.colors.primary_light};
      color: ${({ theme }) => theme.colors.secondary};
    }
  }

  .react-datepicker__month-text--keyboard-selected,
  .react-datepicker__month-text--selected {
    background-color: ${({ theme }) => theme.colors.secondary} !important;
    color: ${({ theme }) => theme.colors.white} !important;
    font-weight: 700;

    &:hover {
      background-color: ${({ theme }) => theme.colors.primary} !important;
    }
  }
`;

const MonthBtn = styled.button`
  border: none;
  background: transparent;
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const PeriodText = styled.div`
  margin: 2px 0 12px;
  color: ${({ theme }) => theme.colors.gray[550]};
  font-size: 13px;
  text-align: center;
  font-weight: 500;
`;

const SummaryCard = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.gray[50]};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.overlay_line};

  .left {
    flex: 1;
    .label {
      font-size: 14px;
      color: ${({ theme }) => theme.colors.gray[700]};
      font-weight: 600;
    }
    .hint {
      margin-top: 4px;
      font-size: 13px;
      color: ${({ theme }) => theme.colors.danger};
      font-weight: 500;
    }
  }
  .value {
    font-weight: 800;
    color: ${({ theme }) => theme.colors.secondary};
    font-size: 22px;
  }
`;

const ChipTabs = styled.div`
  display: flex;
  gap: 8px;
  margin: 20px 2px 16px;
`;

const Chip = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid
    ${({ active, theme }) =>
      active ? theme.colors.secondary : theme.colors.gray[300]};
  background: ${({ active, theme }) =>
    active ? theme.colors.secondary : theme.colors.white};
  color: ${({ active, theme }) =>
    active ? theme.colors.white : theme.colors.gray[600]};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.secondary};
    color: ${({ active, theme }) =>
      active ? theme.colors.white : theme.colors.secondary};
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 6px 12px;
    font-size: 13px;
  }
`;

const Empty = styled.div`
  padding: 40px 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.gray[500]};
  font-size: 15px;
  background: ${({ theme }) => theme.colors.gray[10]};
  border-radius: 12px;
  border: 1px dashed ${({ theme }) => theme.colors.gray[300]};
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: ${({ scrollable }) => (scrollable ? '480px' : 'unset')};
  overflow-y: ${({ scrollable }) => (scrollable ? 'auto' : 'visible')};
  padding-right: ${({ scrollable }) => (scrollable ? '6px' : '0')};

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.gray[300]};
    border-radius: 4px;
  }
`;

const Card = styled.div`
  display: grid;
  grid-template-columns: 64px 1fr auto;
  align-items: center;
  gap: 12px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 2px 6px ${({ theme }) => theme.colors.shadow_line};
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px ${({ theme }) => theme.colors.shadow_line};
  }
`;

const Left = styled.div`
  .date {
    font-weight: 800;
    color: ${({ theme }) => theme.colors.gray[800]};
    font-size: 14px;
  }
  .time {
    color: ${({ theme }) => theme.colors.gray[550]};
    font-size: 12px;
    margin-top: 4px;
  }
`;

const Center = styled.div`
  overflow: hidden;
  .title {
    font-size: 15px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.gray[800]};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sub {
    margin-top: 4px;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.gray[550]};
  }
`;

const Right = styled.div`
  font-weight: 800;
  font-size: 15px;
  &.plus {
    color: ${({ theme }) => theme.colors.primary};
  }
  &.minus {
    color: ${({ theme }) => theme.colors.gray[600]};
  }
`;

const ListContainer = styled.div`
  margin-top: 10px;
  padding-bottom: 20px;
`;
