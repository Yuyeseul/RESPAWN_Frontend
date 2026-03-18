import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import axios from '../../api/axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';

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

  // 1) 탭→리스트 매핑 상수(파일 내 단 한 번)
  const tabToListMap = {
    all: history,
    saves,
    uses,
    expiring: expires,
  };

  // 2) 현재 탭 리스트 선택
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
          axios.get(`/api/points/total/active`, { params: { year, month: m } }),
          axios.get(`/api/points/expire/this-month/total`, {
            params: { year, month: m },
          }),
          axios.get(`/api/points/history`, { params: { year, month: m } }),
          axios.get(`/api/points/saves`, { params: { year, month: m } }),
          axios.get(`/api/points/uses`, { params: { year, month: m } }),
          axios.get(`/api/points/expire/list`, { params: { year, month: m } }),
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

  // 월별 날짜 계산
  const pad2 = (n) => String(n).padStart(2, '0');
  const formatYmd = (d) =>
    `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
  const getMonthPeriod = (baseDate) => {
    // baseDate: 기준 월(Date)
    const y = baseDate.getFullYear();
    const m = baseDate.getMonth();

    // 1일
    const first = new Date(y, m, 1);

    // 말일: 다음 달의 0일 → 현재 달의 마지막 날
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
    <Container>
      <HeaderRow>
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
      </HeaderRow>
      <PeriodText>{periodText}</PeriodText>

      <SummaryCard>
        <div className="left">
          <div className="label">총 적립 혜택</div>
          <div className="hint">
            이번 달 소멸 예정 {expiringPoints.toLocaleString()}원
          </div>
        </div>
        <div className="value">{totalPoints.toLocaleString()}원</div>
      </SummaryCard>

      <ChipTabs role="tablist" aria-label="포인트 내역 탭">
        <Chip
          role="tab"
          aria-selected={activeTab === 'all'}
          active={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
        >
          전체
        </Chip>
        <Chip
          role="tab"
          aria-selected={activeTab === 'saves'}
          active={activeTab === 'saves'}
          onClick={() => setActiveTab('saves')}
        >
          적립
        </Chip>
        <Chip
          role="tab"
          aria-selected={activeTab === 'uses'}
          active={activeTab === 'uses'}
          onClick={() => setActiveTab('uses')}
        >
          사용
        </Chip>
        <Chip
          role="tab"
          aria-selected={activeTab === 'expiring'}
          active={activeTab === 'expiring'}
          onClick={() => setActiveTab('expiring')}
        >
          만료예정
        </Chip>
      </ChipTabs>

      {loading
        ? renderEmpty('불러오는 중...')
        : error
          ? renderEmpty(error)
          : activeTab === 'expiring'
            ? renderExpiringSection(currentList)
            : renderHistoryLikeSection(currentList)}
    </Container>
  );
}

export default PointsPage;

const Container = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 16px 40px;
  font-family: 'Noto Sans KR', sans-serif;
  background: #fafbfc;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
  position: relative;
`;

const IconBtn = styled.button`
  border: none;
  background: transparent;
  font-size: 24px;
  color: #333;
  cursor: pointer;
  align-items: center;
  padding: 0 10px;
`;

const StyledDatePicker = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  .react-datepicker__triangle {
    display: none;
  }

  .react-datepicker {
    font-family: 'Noto Sans KR', sans-serif;
    border: none;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    overflow: hidden;
  }

  .react-datepicker__header {
    background-color: #333;
    border-bottom: none;
    padding-top: 10px;
    color: #ddd;
  }

  .react-datepicker__navigation-icon::before {
    border-color: #ddd;
    border-width: 2px 2px 0 0;
    top: 10px;
  }

  .react-datepicker__current-month {
    color: #ddd;
  }

  .react-datepicker__month-text--keyboard-selected,
  .react-datepicker__month-text--selected {
    background-color: #333 !important;
    color: #ddd !important;
  }
`;

const MonthBtn = styled.button`
  border: none;
  background: transparent;
  font-size: 20px;
  font-weight: 700;
  color: #222;
  cursor: pointer;
`;

const PeriodText = styled.div`
  margin: 2px 0 12px;
  color: #8b95a1;
  font-size: 12px;
  text-align: center;
`;

const SummaryCard = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e9eef1;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  .left {
    flex: 1;
    .label {
      font-size: 14px;
      color: #222;
      font-weight: 600;
    }
    .hint {
      margin-top: 2px;
      font-size: 12px;
      color: #9aa4ad;
    }
  }
  .value {
    font-weight: 800;
    color: #111;
    font-size: 18px;
  }
  .chev {
    position: absolute;
    right: 12px;
    top: 12px;
    color: #7b858e;
    font-size: 14px;
  }
`;

const ChipTabs = styled.div`
  display: flex;
  gap: 8px;
  margin: 14px 2px 12px;
`;

const Chip = styled.button`
  padding: 8px 14px;
  border-radius: 18px;
  border: 1px solid ${({ active }) => (active ? '#222' : '#e3e5e8')};
  background: ${({ active }) => (active ? '#222' : '#fff')};
  color: ${({ active }) => (active ? '#fff' : '#5f6e76')};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
`;

const Empty = styled.div`
  padding: 32px 0;
  text-align: center;
  color: #666;
  font-size: 16px;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* 스크롤 활성화 조건: prop으로 제어 */
  max-height: ${({ scrollable }) => (scrollable ? '420px' : 'unset')};
  overflow-y: ${({ scrollable }) => (scrollable ? 'auto' : 'visible')};
  padding-right: ${({ scrollable }) =>
    scrollable ? '6px' : '0'}; /* 스크롤바 여백 */
`;

const Card = styled.div`
  display: grid;
  grid-template-columns: 58px 1fr auto;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #e9eef1;
  border-radius: 14px;
  padding: 12px 14px;
`;

const Left = styled.div`
  .date {
    font-weight: 800;
    color: #222;
    font-size: 13px;
  }
  .time {
    color: #9aa0a6;
    font-size: 12px;
    margin-top: 2px;
  }
`;

const Center = styled.div`
  overflow: hidden;
  .title {
    font-size: 14px;
    color: #222;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sub {
    margin-top: 3px;
    font-size: 12px;
    color: #8a96a0;
  }
`;

const Right = styled.div`
  font-weight: 800;
  font-size: 14px;
  &.plus {
    color: #0a8f3c;
  }
  &.minus {
    color: #4f5965;
  }
`;
