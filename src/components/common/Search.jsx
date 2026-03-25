import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import searchIcon from '../../assets/search_icon.png';

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const isSearchPage = location.pathname === '/search';
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isSearchPage) {
      const urlParams = new URLSearchParams(location.search);
      const urlQuery = urlParams.get('query') || '';
      setQuery(urlQuery);
    } else {
      setQuery('');
    }
  }, [location.pathname, location.search, isSearchPage]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    setIsExpanded(false);
  }, [location.pathname]);

  const handleSearch = () => {
    const next = query.trim();
    if (!next) return;
    navigate(`/search?query=${encodeURIComponent(next)}`);
    setIsExpanded(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <SearchContainer $isExpanded={isExpanded}>
      {isExpanded && (
        <MobileCloseBtn onClick={() => setIsExpanded(false)}>✕</MobileCloseBtn>
      )}
      <SearchInput
        $isExpanded={isExpanded}
        placeholder="검색어를 입력하세요"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <SearchIcon
        src={searchIcon}
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
          else handleSearch();
        }}
      />
    </SearchContainer>
  );
};

export default Search;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;

  @media ${({ theme }) => theme.mobile} {
    justify-content: flex-end;
    ${({ $isExpanded, theme }) =>
      $isExpanded &&
      `
      position: fixed;
      left: 0; top: 0; width: 100%; height: 60px;
      z-index: 9999; background: white; 
      padding: 0 15px;
      display: flex;
      gap: 10px;
      border-bottom: 1px solid ${theme.colors.gray[300]};
    `}
  }
`;

const MobileCloseBtn = styled.button`
  display: none;
  @media ${({ theme }) => theme.mobile} {
    display: block;
    background: none;
    border: none;
    font-size: 22px;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.gray[700]};
    padding: 5px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  height: 45px;
  padding: 0 50px 0 20px;
  border-radius: 25px;
  border: 2px solid ${({ theme }) => theme.colors.gray[300]};
  font-size: 15px;
  outline: none;

  @media ${({ theme }) => theme.mobile} {
    display: ${({ $isExpanded }) => ($isExpanded ? 'block' : 'none')};
    height: 40px;
    flex: 1;
    border-radius: 4px;
    border-width: 1px;
    padding: 0 40px 0 10px;
  }
`;

const SearchIcon = styled.img`
  position: absolute;
  right: 15px;
  width: 24px;
  height: 24px;
  cursor: pointer;

  @media ${({ theme }) => theme.mobile} {
    position: ${({ $isExpanded }) => ($isExpanded ? 'absolute' : 'static')};
    right: ${({ $isExpanded }) => ($isExpanded ? '25px' : 'auto')};
    width: 22px;
    height: 22px;
  }
`;
