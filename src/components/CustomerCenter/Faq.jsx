import React, { useMemo, useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { Link, useSearchParams } from 'react-router-dom';
import Fuse from 'fuse.js';
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
  {
    id: 5,
    cat: 'account',
    q: '비밀번호를 잊었어요.',
    a: '로그인 > 비밀번호 찾기에서 재설정 링크를 이메일로 받아 변경할 수 있습니다.',
  },
  {
    id: 6,
    cat: 'product',
    q: '업체직배송 상품이란?',
    a: '제조사에서 직접 발송하는 상품으로 송장 갱신이 늦을 수 있습니다.',
  },
  {
    id: 7,
    cat: 'return',
    q: '교환 시 왕복배송비는 얼마인가요?',
    a: '기본 6,000원이며 상품/지역에 따라 달라질 수 있습니다.',
  },
  {
    id: 8,
    cat: 'etc',
    q: '세금계산서 발급 경로는?',
    a: '사업자회원은 마이페이지 > 증빙서류 메뉴에서 신청 가능합니다.',
  },
];

const CATEGORIES = ['all', ...new Set(FAQS.map((f) => f.cat))];
const CATEGORY_MAP = {
  all: '전체',
  order: '주문/결제',
  shipping: '배송',
  return: '교환/반품',
  as: 'A/S',
  account: '계정',
  product: '상품',
  etc: '기타',
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

const FAQSection = ({ items, onQuick }) => {
  const [openId, setOpenId] = useState(null);

  const handleToggle = (id) => {
    setOpenId((prevOpenId) => (prevOpenId === id ? null : id));
  };

  return (
    <section>
      <Stack>
        {items.map((f) => (
          <FAQCard
            key={f.id}
            item={f}
            onQuick={onQuick}
            isOpen={openId === f.id}
            onToggle={() => handleToggle(f.id)}
          />
        ))}
      </Stack>
      {items.length === 0 && <EmptyBox>검색 결과가 없습니다.</EmptyBox>}
    </section>
  );
};

const Faq = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [inputValue, setInputValue] = useState(initialQuery);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [modal, setModal] = useState({ open: false, title: '', content: '' });

  const handleQuickAction = (action) => {
    if (action === 'inquiry') {
      openKakaoChat();
      return;
    }

    const labels = {
      'return-guide': '교환/반품 가이드',
      call: '전화 상담',
    };

    setModal({
      open: true,
      title: labels[action] || '알림',
      content:
        '현재 서비스 준비 중입니다.\n빠른 시일 내에 제공해 드리겠습니다.',
    });
  };

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setInputValue(query);
    setSearchTerm(query);
  }, [searchParams]);

  const filteredFaqs = useMemo(() => {
    const categoryFiltered = FAQS.filter(
      (f) => selectedCategory === 'all' || f.cat === selectedCategory
    );

    if (!searchTerm.trim()) return categoryFiltered;

    const fuse = new Fuse(categoryFiltered, {
      keys: ['q', 'a'],
      threshold: 0.4,
      distance: 200,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });

    const results = fuse.search(searchTerm).map((result) => result.item);
    return results;
  }, [searchTerm, selectedCategory]);

  const handleSearch = () => {
    setSearchTerm(inputValue);
    setSearchParams({ q: inputValue });
  };

  return (
    <PageContainer>
      <BreadcrumbLink to="/customerCenter">&larr; 고객센터 홈</BreadcrumbLink>
      <PageHeader>
        <h1>자주 묻는 질문</h1>
        <p>궁금한 점을 검색하거나 카테고리별로 찾아보세요.</p>
      </PageHeader>
      <Toolbar>
        <SearchWrapper>
          <SearchInput
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="궁금한 점을 검색해보세요."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <SearchButton onClick={handleSearch}>검색</SearchButton>
        </SearchWrapper>
        <FilterGroup>
          {CATEGORIES.map((cat) => (
            <CategoryButton
              key={cat}
              $active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            >
              {CATEGORY_MAP[cat] || cat}
            </CategoryButton>
          ))}
        </FilterGroup>
      </Toolbar>

      <FAQSection items={filteredFaqs} onQuick={handleQuickAction} />
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
    </PageContainer>
  );
};

export default Faq;

const PageContainer = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 28px 20px 40px;
  min-height: 60vh;
`;

const BreadcrumbLink = styled(Link)`
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  text-decoration: none;
  margin-bottom: 8px;
  display: inline-block;
  &:hover {
    text-decoration: underline;
  }
`;

const PageHeader = styled.header`
  h1 {
    font-size: 28px;
    font-weight: 800;
    margin: 0 0 8px;
    color: #111827;
  }
  p {
    font-size: 15px;
    color: #6b7280;
    margin: 0;
  }
`;

const Toolbar = styled.div`
  margin: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SearchWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const SearchInput = styled.input`
  width: 100%;
  flex-grow: 1; /* Wrapper 안에서 남는 공간을 모두 차지 */
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  &:focus {
    outline: 2px solid #4f46e5;
    border-color: transparent;
  }
`;

const SearchButton = styled.button`
  flex-shrink: 0; /* 너비가 줄어들지 않도록 설정 */
  padding: 0 24px;
  border: 1px solid #d1d5db;
  background-color: #fff;
  color: #374151;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f9fafb;
    border-color: #4f46e5;
    color: #4f46e5;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const CategoryButton = styled.button`
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${({ $active }) => ($active ? '#4f46e5' : '#d1d5db')};
  background-color: ${({ $active }) => ($active ? '#eef2ff' : '#fff')};
  color: ${({ $active }) => ($active ? '#4338ca' : '#374151')};
  &:hover {
    border-color: #4f46e5;
  }
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
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
    color: #4338ca;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 700;
  }
  .qt {
    font-size: 14px;
  }
  .arrow {
    color: #64748b;
  }
  .a {
    padding: 12px 14px 16px;
    background: #f8fafc;
    display: grid;
    gap: 10px;
    grid-template-columns: 24px 1fr;
    border-top: 1px solid #e2e8f0;
  }
  .amark {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #4f46e5;
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
  /* 빠른 실행 버튼 영역 스타일 복원 */
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
  border: 1px solid #e2e8f0;
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

const EmptyBox = styled.div`
  background: #fff;
  border: 1px dashed #e2e8f0;
  border-radius: 12px;
  padding: 24px 18px;
  text-align: center;
  color: #64748b;
`;

const Stack = styled.div`
  display: grid;
  gap: 10px;
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
  background: #fff;
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
    color: #0f172a;
  }

  .body {
    color: #475569;
    font-size: 15px;
    line-height: 1.7;
    white-space: pre-wrap;
    margin-bottom: 28px;
    background: #f8fafc;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }

  button {
    width: 100%;
    padding: 14px;
    background: #4e46e5ad;
    color: #fff;
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
