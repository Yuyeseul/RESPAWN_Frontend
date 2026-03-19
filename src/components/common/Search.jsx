import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import searchIcon from '../../assets/search_icon.png';

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const isSearchPage = location.pathname === '/search';

  useEffect(() => {
    if (isSearchPage) {
      const urlParams = new URLSearchParams(location.search);
      const urlQuery = urlParams.get('query') || '';
      setQuery(urlQuery);
    } else {
      setQuery('');
    }
  }, [location.pathname, location.search, isSearchPage]);

  const handleSearch = () => {
    const next = query.trim();
    if (!next) return;

    navigate(`/search?query=${encodeURIComponent(next)}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <SearchContainer>
      <SearchInput
        autoComplete="off"
        placeholder="상품을 검색해보세요!"
        type="text"
        name="q"
        inputMode="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <SearchIcon src={searchIcon} alt="search" onClick={handleSearch} />
    </SearchContainer>
  );
};

export default Search;

const SearchContainer = styled.header`
  width: 100%;
  max-width: 600px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 50px;
  padding: 0 60px 0 20px;
  border-radius: 30px;
  border: 2.5px solid;
  font-size: 18px;
`;

const SearchIcon = styled.img`
  position: absolute;
  width: 30px;
  height: 30px;
  right: 20px;
  object-fit: cover;
  cursor: pointer;
`;
