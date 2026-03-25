import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { useSearchParams, Link } from 'react-router-dom';
import FaqTab from './Faq';
import NoticesTab from './NoticesTab';
import GuidesTab from './GuidesTab';
import ContactTab from './ContactTab';

const CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'order', label: '주문/결제' },
  { key: 'shipping', label: '배송' },
  { key: 'return', label: '반품/교환/환불' },
  { key: 'as', label: 'A/S' },
  { key: 'account', label: '회원' },
  { key: 'product', label: '상품' },
  { key: 'etc', label: '기타' },
];

function CommandBar({
  value,
  onChange,
  onSearch,
  category,
  onCategory,
  sort,
  onSort,
  suggestions,
}) {
  return (
    <CmdWrap role="search" aria-label="고객센터 검색">
      <label css={srOnly}>검색</label>
      <div className="row">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="예) 반품비, 세금계산서, A/S 신청"
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          aria-label="검색어"
        />
        <Select
          value={category}
          onChange={(e) => onCategory(e.target.value)}
          aria-label="카테고리"
        >
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </Select>
        <Select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          aria-label="정렬"
        >
          <option value="relevance">관련도순</option>
          <option value="recent">최신순</option>
        </Select>
        <SearchBtn onClick={onSearch} aria-label="검색 실행">
          검색
        </SearchBtn>
      </div>
      <div className="chips">
        {suggestions.map((s) => (
          <Chip key={s} onClick={() => onChange(s)}>
            #{s}
          </Chip>
        ))}
      </div>
    </CmdWrap>
  );
}

const SupportCenter = () => {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'faq';
  const [keyword, setKeyword] = useState(params.get('q') || '');
  const [cat, setCat] = useState(params.get('cat') || 'all');
  const [sort, setSort] = useState(params.get('sort') || 'relevance');

  const onSearch = () => setParams({ tab, q: keyword, cat, sort });
  const switchTab = (next) => setParams({ tab: next, q: keyword, cat, sort });

  return (
    <Page>
      <Main>
        <Header>
          <h1>도움이 필요하신가요?</h1>
          <p>검색으로 바로 해결하거나, 탭에서 필요한 정보를 찾아보세요.</p>
        </Header>

        <CommandBar
          value={keyword}
          onChange={setKeyword}
          onSearch={onSearch}
          category={cat}
          onCategory={(v) => setParams({ tab, q: keyword, cat: v, sort })}
          sort={sort}
          onSort={(v) => setParams({ tab, q: keyword, cat, sort: v })}
          suggestions={['배송조회', '세금계산서', '반품비', 'A/S 신청']}
        />

        <Tabs role="tablist" aria-label="고객센터 탭">
          <TabButton
            aria-selected={tab === 'faq'}
            onClick={() => switchTab('faq')}
          >
            FAQ
          </TabButton>
          <TabButton
            aria-selected={tab === 'notices'}
            onClick={() => switchTab('notices')}
          >
            공지
          </TabButton>
          <TabButton
            aria-selected={tab === 'guides'}
            onClick={() => switchTab('guides')}
          >
            가이드/정책
          </TabButton>
          <TabButton
            aria-selected={tab === 'contact'}
            onClick={() => switchTab('contact')}
          >
            문의/연락
          </TabButton>
        </Tabs>

        {tab === 'faq' && <FaqTab keyword={keyword} cat={cat} sort={sort} />}
        {tab === 'notices' && <NoticesTab />}
        {tab === 'guides' && <GuidesTab />}
        {tab === 'contact' && <ContactTab />}
      </Main>
      <FooterNote>
        더 도움이 필요하면 1:1 문의를 남겨주세요. 평일 기준 24시간 내
        응답합니다.
      </FooterNote>
    </Page>
  );
};

export default SupportCenter;

const Page = styled.div`
  --indigo: #4f46e5;
  --green: #22c55e;
  --amber: #f59e0b;
  --ink: #0f172a;
  --muted: #64748b;
  --line: #e2e8f0;
  background: #f8fafc;
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

const CmdWrap = styled.section`
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 12px;
  margin: 16px 0 18px;
  .row {
    display: flex;
    gap: 8px;
  }
  input {
    flex: 1;
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

const Select = styled.select`
  padding: 12px 10px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #fff;
`;

const SearchBtn = styled.button`
  background: var(--indigo);
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 0 16px;
  font-weight: 600;
  cursor: pointer;
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

const Tabs = styled.div`
  display: inline-flex;
  gap: 6px;
  margin: 8px 0 14px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 6px;
`;

const TabButton = styled.button`
  all: unset;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--muted);
  &[aria-selected='true'] {
    background: #eef2ff;
    color: var(--indigo);
    font-weight: 700;
  }
`;

const FooterNote = styled.footer`
  max-width: 1120px;
  margin: 8px auto 28px;
  color: var(--muted);
  padding: 0 20px;
`;

const srOnly = css`
  position: absolute !important;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;
