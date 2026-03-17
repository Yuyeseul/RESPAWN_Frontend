import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

const FAQS = [
  {
    id: 1,
    cat: 'order',
    q: '결제내역 증빙은 어디서 발급하나요?',
    a: '마이페이지 > 주문내역에서 영수증/현금영수증/세금계산서 신청이 가능합니다.',
  },
  {
    id: 2,
    cat: 'shipping',
    q: '평균 배송 소요기간은?',
    a: '일반 1~3일, 도서산간 2~5일 소요됩니다. 기상/물류 사정에 따라 변동될 수 있습니다.',
  },
  {
    id: 3,
    cat: 'return',
    q: '퀵/프리미엄 배송 상품도 반품되나요?',
    a: '가능합니다. 단, 회수비가 추가될 수 있으며 지역에 따라 금액이 상이합니다.',
  },
  {
    id: 4,
    cat: 'as',
    q: 'A/S 접수는 어떻게 하나요?',
    a: '고객센터 1:1 문의 또는 A/S 전용 폼으로 접수해 주세요. 접수 후 알림톡이 발송됩니다.',
  },
];

const QUICK_LINKS = [
  { key: 'call', label: '전화상담', icon: '📞' },
  { key: 'chat', label: '채팅상담', icon: '💬' },
  { key: 'remote', label: '원격지원', icon: '🖥️' },
  { key: 'callback', label: '콜백예약', icon: '⏱️' },
];

// 상단 검색
const CommandBar = ({ value, onChange, onSearch, suggestions }) => {
  return (
    <CmdWrap role="search" aria-label="고객센터 검색">
      <div className="row">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="예) 반품비, 세금계산서, A/S 신청"
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          aria-label="검색어"
        />
        <SearchBtn onClick={onSearch} aria-label="검색 실행">
          검색
        </SearchBtn>
      </div>
      <div className="chips">
        {suggestions.map((s) => (
          <Chip
            key={s}
            onClick={() => {
              onChange(s);
              onSearch(s);
            }}
          >
            #{s}
          </Chip>
        ))}
      </div>
    </CmdWrap>
  );
};

const FAQCard = ({ item, onQuick, isOpen, onToggle }) => {
  return (
    <Card $open={isOpen}>
      <button className="q" onClick={onToggle} aria-expanded={isOpen}>
        <span className="qmark">Q</span>
        <span className="qt">{item.q}</span>
        <span className="arrow">{isOpen ? '▾' : '▸'}</span>
      </button>
      {isOpen && (
        <div className="a">
          <div className="amark">A</div>
          <div className="at">{item.a}</div>
          <div className="quick">
            <Quick onClick={() => onQuick('inquiry', item)}>문의하기</Quick>
            <Quick onClick={() => onQuick('return-guide', item)} $alt>
              교환/반품 가이드
            </Quick>
            <Quick onClick={() => onQuick('call', item)}>전화상담</Quick>
          </div>
        </div>
      )}
    </Card>
  );
};

const ActionStack = ({ items, onClick }) => {
  return (
    <Stack>
      {items.map((i) => (
        <StackBtn key={i.key} onClick={() => onClick(i.key)}>
          <div className="icon">{i.icon}</div>
          <div className="label">{i.label}</div>
        </StackBtn>
      ))}
    </Stack>
  );
};

const ContactCard = () => {
  return (
    <Contact>
      <div className="title">대표 상담센터</div>
      <div className="num">1588-8377</div>
      <div className="time">평일 09:00~18:00 · 점심 12:00~13:00</div>
      <CallBtn>즉시 전화</CallBtn>
    </Contact>
  );
};

// FAQ
const FAQSection = ({ items, onQuick }) => {
  const [openId, setOpenId] = useState(null);

  const handleToggle = (id) => {
    setOpenId((prevOpenId) => (prevOpenId === id ? null : id));
  };

  const displayedFaqs = items.slice(0, 4);
  return (
    <section>
      <SectionHeader>
        <SectionTitle>자주 묻는 질문 (FAQ)</SectionTitle>
        <ViewAllLink to="/customerCenter/faq">전체보기 &gt;</ViewAllLink>
      </SectionHeader>

      <Stack>
        {displayedFaqs.map((f) => (
          <FAQCard
            key={f.id}
            item={f}
            onQuick={onQuick}
            isOpen={openId === f.id}
            onToggle={() => handleToggle(f.id)}
          />
        ))}
      </Stack>
    </section>
  );
};

// 공지
const NoticeSection = ({ items, onShowAll }) => {
  return (
    <NoticeListSection>
      <header>
        <h2>공지사항</h2>
        <Link to="/customerCenter/noticelist">전체보기 &gt;</Link>
      </header>
      <ul>
        {items.map((n) => (
          <li key={n.id}>
            <Link to={`/customerCenter/notices/${n.id}`}>
              <span className="title">{n.title}</span>
              <span className="date">{n.createdAt?.substring(0, 10)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </NoticeListSection>
  );
};

// 가이드
const GuideSection = () => {
  return (
    <section>
      <SectionTitle>이용 가이드</SectionTitle>
      <Stack>
        <StackBtn>
          <div className="label">반품/교환 가이드</div>
        </StackBtn>
        <StackBtn>
          <div className="label">세금계산서 발급 안내</div>
        </StackBtn>
        <StackBtn>
          <div className="label">A/S 접수 절차</div>
        </StackBtn>
      </Stack>
    </section>
  );
};

// 문의/연락
const ContactSection = () => {
  return (
    <section>
      <TwoColumn>
        <div>
          <SectionTitle>문의 채널</SectionTitle>
          <ActionStack
            items={QUICK_LINKS}
            onClick={(k) => console.log('Contact action:', k)}
          />
        </div>
        <aside>
          <ContactCard />
        </aside>
      </TwoColumn>
    </section>
  );
};

const CustomerCenter = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [notices, setNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(true);

  const handleSearch = (term) => {
    const finalTerm = (typeof term === 'string' ? term : inputValue).trim();
    if (!finalTerm) {
      alert('검색어를 입력해주세요.');
      return;
    }
    navigate(`/customerCenter/search?q=${finalTerm}`);
  };

  useEffect(() => {
    const fetchNotices = async () => {
      setNoticesLoading(true);
      try {
        const response = await axios.get('/api/notices/summaries', {
          params: { page: 0, size: 5 },
        });
        setNotices(response.data.content || []);
      } catch (error) {
        console.error('Failed to fetch notices:', error);
      } finally {
        setNoticesLoading(false);
      }
    };
    fetchNotices();
  }, []);

  return (
    <Page>
      <Main>
        <Header>
          <h1>도움이 필요하신가요?</h1>
          <p>검색으로 바로 해결하거나, 필요한 정보를 찾아보세요.</p>
        </Header>

        <SearchContainer>
          <CommandBar
            value={inputValue}
            onChange={setInputValue}
            onSearch={handleSearch}
            suggestions={['배송조회', '세금계산서', '반품비', 'A/S 신청']}
          />
        </SearchContainer>
        <SectionSpacer />

        <FAQSection
          items={FAQS}
          onQuick={(action, item) => console.log('FAQ Action:', action, item)}
        />

        <SectionSpacer />

        <NoticeSection items={notices} />

        <SectionSpacer />

        <GuideSection />

        <SectionSpacer />

        <ContactSection />
      </Main>

      <FooterNote>
        더 도움이 필요하면 1:1 문의를 남겨주세요. 평일 기준 24시간 내
        응답합니다.
      </FooterNote>
    </Page>
  );
};

export default CustomerCenter;

const Page = styled.div`
  --indigo: #4e46e5ad;
  --green: #22c55e;
  --amber: #f59e0b;
  --ink: #0f172a;
  --muted: #64748b;
  --line: #e2e8f0;
  min-height: 100vh;
  color: var(--ink);
`;

const Main = styled.main`
  max-width: 1120px;
  padding: 28px 20px 40px;
  margin: 0 auto;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 16px;
  h1 {
    font-size: 24px;
    margin: 0 0 6px;
  }
  p {
    color: var(--muted);
    margin: 0;
  }
`;

const SectionSpacer = styled.div`
  margin-top: 32px;
`;

const SearchContainer = styled.div`
  max-width: 720px; /* Adjust this value to your preferred width */
  margin: 0 auto;
`;

const CmdWrap = styled.section`
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 12px;
  margin: 16px 0 18px;
  .row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  input {
    flex: 1 1 200px;
    padding: 12px;
    border: 1px solid var(--line);
    border-radius: 10px;
    font-size: 14px;
  }
  .chips {
    margin-top: 10px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

const SearchBtn = styled.button`
  background: var(--indigo);
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 0 16px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
`;

const Chip = styled.button`
  border: 1px dashed var(--line);
  background: #f1f5f9;
  color: var(--muted);
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  &:hover {
    border-style: solid;
  }
`;

const TwoColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  @media (min-width: 980px) {
    grid-template-columns: 1fr 320px;
  }
`;

const NoticeListSection = styled.section`
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 16px 20px;

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--line);

    h2 {
      font-size: 16px;
      margin: 0;
    }

    a {
      font-size: 13px;
      color: var(--muted);
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li a {
    display: flex;
    justify-content: space-between;
    padding: 8px 4px;
    text-decoration: none;
    color: var(--ink);
    border-radius: 6px;

    &:hover {
      background-color: #f8fafc;
    }
  }
`;

const SectionHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ViewAllLink = styled(Link)`
  font-size: 13px;
  color: var(--muted);
  text-decoration: none;
  margin-right: 20px;
  &:hover {
    text-decoration: underline;
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 12px;
  font-weight: 700;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
  .q {
    width: 100%;
    text-align: left;
    display: grid;
    grid-template-columns: 24px 1fr 20px;
    gap: 8px;
    align-items: center;
    padding: 12px 14px;
    background: #fff;
    border: 0;
    cursor: pointer;
  }
  .qmark {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #eef2ff;
    color: var(--indigo);
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 700;
  }
  .qt {
    font-size: 14px;
  }
  .arrow {
    color: var(--muted);
  }
  .a {
    padding: 12px 14px 16px;
    background: #f8fafc;
    display: grid;
    gap: 10px;
    grid-template-columns: 24px 1fr;
    border-top: 1px solid var(--line);
  }
  .amark {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--indigo);
    color: #fff;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 700;
    margin-top: 2px;
  }
  .at {
    color: #334155;
    line-height: 1.6;
    grid-column: 2 / -1;
  }
  .quick {
    grid-column: 1 / -1;
    padding-top: 8px;
    margin-left: 32px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

const Quick = styled.button`
  border: 1px solid var(--line);
  background: #fff;
  color: #111827;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 12px;
  cursor: pointer;
  ${(p) =>
    p.$alt &&
    css`
      background: #ecfccb;
      border-color: #d9f99d;
    `}
  &:hover {
    border-color: #cbd5e1;
  }
`;

const Stack = styled.div`
  display: grid;
  gap: 10px;
`;

const StackBtn = styled.button`
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px;
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 10px;
  align-items: center;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s;
  &:hover {
    border-color: #cbd5e1;
  }
  .icon {
    font-size: 18px;
  }
  .label {
    font-weight: 600;
  }
`;

const Contact = styled.div`
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 14px;
  text-align: center;
  .title {
    color: var(--muted);
  }
  .num {
    font-size: 22px;
    font-weight: 800;
    margin: 6px 0;
  }
  .time {
    color: var(--muted);
    font-size: 12px;
  }
`;

const CallBtn = styled.button`
  margin-top: 10px;
  width: 100%;
  background: var(--green);
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.9;
  }
`;

const EmptyBox = styled.div`
  grid-column: 1 / -1;
  background: #fff;
  border: 1px dashed var(--line);
  border-radius: 12px;
  padding: 24px 18px;
  text-align: center;
  color: var(--muted);
`;

const FooterNote = styled.footer`
  max-width: 1120px;
  margin: 8px auto 28px;
  color: var(--muted);
  padding: 0 20px;
  text-align: center;
  font-size: 14px;
`;
