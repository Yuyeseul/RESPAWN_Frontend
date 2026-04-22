import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { openKakaoChat } from '../../utils/kakaoChat';

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

const GUIDE_DATA = {
  return: {
    icon: '📦',
    title: '반품/교환 가이드',
    content:
      '• 접수 기간: 상품 수령 후 7일 이내 신청 가능합니다.\n• 접수 방법: [마이페이지 > 주문내역]에서 반품 신청 버튼을 눌러주세요.\n• 주의 사항: 단순 변심의 경우 왕복 배송비가 차감될 수 있습니다.',
  },
  tax: {
    icon: '📄',
    title: '세금계산서 발급 안내',
    content:
      "• 신청 방법: 결제 단계에서 '사업자 증빙'을 선택해주세요.\n• 사후 발급: 결제 완료 후 1:1 문의를 통해 사업자등록증 사본을 보내주시면 담당 부서에서 발급해 드립니다.\n• 확인 위치: 국세청 홈택스 또는 입력하신 이메일로 발송됩니다.",
  },
  as: {
    icon: '🛠️',
    title: 'A/S 접수 절차',
    content:
      '• 1단계: 고장 부위 사진 또는 영상을 촬영합니다.\n• 2단계: 1:1 문의에 첨부하여 접수합니다.\n• 3단계: 담당자 확인 후 수거 또는 방문 일정을 안내드립니다.\n• 비용: 보증기간 이내 과실 없는 고장은 무상으로 진행됩니다.',
  },
};

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

const ContactCard = ({ onCall }) => {
  return (
    <Contact>
      <div className="title">대표 상담센터</div>
      <div className="num">1588-8377</div>
      <div className="time">평일 09:00~18:00 · 점심 12:00~13:00</div>
      <CallBtn onClick={onCall}>즉시 전화</CallBtn>
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

      <VerticalStack>
        {displayedFaqs.map((f) => (
          <FAQCard
            key={f.id}
            item={f}
            onQuick={onQuick}
            isOpen={openId === f.id}
            onToggle={() => handleToggle(f.id)}
          />
        ))}
      </VerticalStack>
    </section>
  );
};

// 공지
const NoticeSection = ({ items }) => {
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
const GuideSection = ({ onGuideClick }) => {
  const guides = Object.values(GUIDE_DATA);
  return (
    <section>
      <SectionTitle>이용 가이드</SectionTitle>
      <Stack>
        {guides.map((guide) => (
          <StackBtn key={guide.title} onClick={() => onGuideClick(guide)}>
            <div className="icon">{guide.icon}</div>
            <div className="label">{guide.title}</div>
          </StackBtn>
        ))}
      </Stack>
    </section>
  );
};

// 문의/연락
const ContactSection = ({ onContactClick }) => {
  return (
    <section>
      <SectionTitle>상담 및 문의</SectionTitle>
      <TwoColumn>
        <div>
          <ActionStack
            items={QUICK_LINKS}
            onClick={(key) => {
              const link = QUICK_LINKS.find((l) => l.key === key);
              onContactClick(key, link.label);
            }}
          />
        </div>
        <aside>
          <ContactCard
            onCall={() => onContactClick('call', '전화 상담 서비스')}
          />
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

  const [modal, setModal] = useState({ open: false, title: '', content: '' });

  const handleSearch = (term) => {
    const finalTerm = (typeof term === 'string' ? term : inputValue).trim();
    if (!finalTerm) {
      alert('검색어를 입력해주세요.');
      return;
    }
    navigate(`/customerCenter/faq?q=${encodeURIComponent(finalTerm)}`);
  };

  const openModal = (data) => setModal({ open: true, ...data });
  const openPendingModal = (label) =>
    setModal({
      open: true,
      title: label,
      content: '현재 서비스 준비 중입니다. 빠른 시일 내에 제공해 드리겠습니다.',
    });

  const handleContactClick = (key, label) => {
    if (key === 'chat') {
      openKakaoChat(); // 카카오톡 실행
    } else {
      openPendingModal(label); // 나머지는 기존처럼 '준비중' 모달
    }
  };

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await axios.get('/notices/summaries', {
          params: { page: 0, size: 5 },
        });
        setNotices(res.data.content || []);
      } catch (e) {
        console.error(e);
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
          <p>검색을 통해 필요한 정보를 찾아보세요.</p>
        </Header>

        <SearchContainer>
          <CommandBar
            value={inputValue}
            onChange={setInputValue}
            onSearch={handleSearch}
            suggestions={[
              '배송조회',
              '세금계산서',
              '반품비',
              'A/S 신청',
              '비밀번호',
              '주문취소',
              '환불문의',
              '영수증',
            ]}
          />
        </SearchContainer>
        <SectionSpacer />

        {noticesLoading ? (
          <LoadingWrapper>공지사항을 불러오는 중입니다...</LoadingWrapper>
        ) : (
          <NoticeSection items={notices} />
        )}

        <SectionSpacer />

        <FAQSection
          items={FAQS}
          onQuick={(action) => {
            if (action === 'inquiry') {
              openKakaoChat();
            } else {
              const labelMap = {
                'return-guide': '교환/반품 가이드',
                call: '전화 상담',
              };
              openPendingModal(labelMap[action] || '알림');
            }
          }}
        />

        <SectionSpacer />

        <GuideSection onGuideClick={openModal} />

        <SectionSpacer />

        <ContactSection onContactClick={handleContactClick} />

        <FooterNote>
          더 도움이 필요하면 1:1 문의를 남겨주세요.{' '}
          <br className="mobile-only" />
          평일 기준 24시간 내 응답합니다.
        </FooterNote>
      </Main>

      {modal.open && (
        <ModalOverlay onClick={() => setModal({ ...modal, open: false })}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>{modal.title}</h3>
            <div className="body">{modal.content}</div>
            <button onClick={() => setModal({ ...modal, open: false })}>
              확인
            </button>
          </ModalContent>
        </ModalOverlay>
      )}
    </Page>
  );
};

export default CustomerCenter;

const Page = styled.div`
  min-height: 100vh;
  color: ${({ theme }) => theme.colors.gray[900]};
  background-color: ${({ theme }) => theme.colors.gray[50]};
`;

const Main = styled.main`
  max-width: ${({ theme }) => theme.maxWidth};
  padding: 28px 20px 40px;
  margin: 0 auto;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 16px;
  h1 {
    font-size: 24px;
    margin: 0 0 6px;
    color: ${({ theme }) => theme.colors.black};
    word-break: keep-all;
  }
  p {
    color: ${({ theme }) => theme.colors.gray[600]};
    margin: 0 auto;
    max-width: 400px;
    line-height: 1.5;
    word-break: keep-all;
  }
`;

const SectionSpacer = styled.div`
  margin-top: 32px;
`;

const LoadingWrapper = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 14px;
  padding: 40px;
  text-align: center;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: 14px;
`;

const SearchContainer = styled.div`
  max-width: 720px;
  margin: 0 auto;
`;

const CmdWrap = styled.section`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 14px;
  padding: 14px;
  margin: 16px 0 18px;
  .row {
    display: flex;
    gap: 8px;
    flex-wrap: nowrap;
  }
  input {
    flex: 1 1 200px;
    padding: 12px;
    border: 1px solid ${({ theme }) => theme.colors.gray[300]};
    border-radius: 10px;
    font-size: 14px;
    &:focus {
      border-color: ${({ theme }) => theme.colors.primary};
      outline: none;
    }
  }
  .chips {
    margin-top: 10px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  @media ${({ theme }) => theme.mobile} {
    input {
      padding: 10px;
      font-size: 13px;
    }
  }
`;

const SearchBtn = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: 0;
  border-radius: 10px;
  padding: 0 16px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
`;

const Chip = styled.button`
  background: ${({ theme }) => theme.colors.gray[100]};
  border: 1px dashed ${({ theme }) => theme.colors.gray[300]};
  color: ${({ theme }) => theme.colors.gray[600]};
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
  gap: 20px;
  align-items: stretch;
`;

const NoticeListSection = styled.section`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 14px;
  padding: 16px 20px;

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};

    h2 {
      font-size: 16px;
      margin: 0;
    }

    a {
      font-size: 13px;
      color: ${({ theme }) => theme.colors.gray[600]};
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
    align-items: center;
    padding: 8px 4px;
    text-decoration: none;
    color: ${({ theme }) => theme.colors.gray[900]};
    border-radius: 6px;

    .title {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .date {
      @media ${({ theme }) => theme.mobile} {
        display: none;
      }
    }

    &:hover {
      background-color: ${({ theme }) => theme.colors.primary_light};
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
  color: ${({ theme }) => theme.colors.gray[600]};
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
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
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
    background: ${({ theme }) => theme.colors.white};
    border: 0;
    cursor: pointer;
  }
  .qmark {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.lightNavy};
    color: ${({ theme }) => theme.colors.primary};
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 700;
  }
  .qt {
    font-size: 14px;
  }
  .arrow {
    color: ${({ theme }) => theme.colors.gray[600]};
  }
  .a {
    padding: 12px 14px 16px;
    background: ${({ theme }) => theme.colors.white};
    display: grid;
    gap: 10px;
    grid-template-columns: 24px 1fr;
    border-top: 1px solid ${({ theme }) => theme.colors.gray[300]};
  }
  .amark {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 700;
    margin-top: 2px;
  }
  .at {
    color: ${({ theme }) => theme.colors.gray[700]};
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
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray[900]};
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 12px;
  cursor: pointer;
  ${(p) =>
    p.$alt &&
    css`
      background: ${({ theme }) => theme.colors.primary_hover};
      border-color: ${({ theme }) => theme.colors.primary};
    `}
  &:hover {
    border-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const VerticalStack = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
`;

const Stack = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const StackBtn = styled.button`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.colors.gray[100]};
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(78, 70, 229, 0.08);

    .icon {
      background: ${({ theme }) => theme.colors.lightNavy};
      color: ${({ theme }) => theme.colors.white};
    }
  }

  .icon {
    font-size: 24px;
    width: 48px;
    height: 48px;
    background: ${({ theme }) => theme.colors.gray[100]};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .label {
    font-weight: 600;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.gray[900]};
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 15px 10px;
    .icon {
      width: 40px;
      height: 40px;
      font-size: 20px;
    }
    .label {
      font-size: 13px;
    }
  }
`;

const Contact = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.white};
  );
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 20px;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

  .title {
    color: ${({ theme }) => theme.colors.gray[700]};
    font-size: 14px;
    font-weight: 500;
  }
  .num {
    font-size: 28px;
    font-weight: 850;
    margin: 12px 0;
    letter-spacing: -0.5px;
  }
  .time {
    color: ${({ theme }) => theme.colors.gray[700]};
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 20px;
  }
`;

const CallBtn = styled.button`
  width: 100%;
  max-width: 200px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: 0;
  border-radius: 12px;
  padding: 14px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary_dark};
    transform: scale(1.02);
  }
`;

const FooterNote = styled.footer`
  max-width: 1120px;
  margin: 40px auto 0;
  color: ${({ theme }) => theme.colors.gray[600]};
  padding: 0 20px;
  text-align: center;
  font-size: 14px;
  line-height: 1.6;
  word-break: keep-all;

  .mobile-only {
    display: none;
  }

  @media ${({ theme }) => theme.mobile} {
    font-size: 13px;

    .mobile-only {
      display: block;
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 32px;
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  h3 {
    margin: 0 0 16px;
    font-size: 20px;
    font-weight: 800;
    text-align: center;
    color: ${({ theme }) => theme.colors.gray[900]};
  }

  .body {
    color: ${({ theme }) => theme.colors.gray[700]};
    font-size: 15px;
    line-height: 1.7;
    white-space: pre-wrap;
    margin-bottom: 28px;
    background: ${({ theme }) => theme.colors.gray[100]};
    padding: 20px;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  }

  button {
    width: 100%;
    padding: 14px;
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    border: 0;
    border-radius: 12px;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    transition: opacity 0.2s;
    &:hover {
      opacity: 0.9;
    }
  }
`;
