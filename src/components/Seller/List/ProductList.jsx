import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import axios, { BASE_URL } from '../../../api/axios';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../Pagination';

// 정렬 옵션 배열 정의
const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: '최신순' },
  { value: 'soldCount_desc', label: '판매량순' },
  { value: 'reviewCount_desc', label: '후기많은순' },
  { value: 'price_asc', label: '가격 낮은순' },
  { value: 'price_desc', label: '가격 높은순' },
  { value: 'stockQuantity_asc', label: '재고 적은순' },
  { value: 'stockQuantity_desc', label: '재고 많은순' },
];

const ProductList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 6,
    totalPages: 0,
    totalElements: 0,
    isFirst: true,
    isLast: true,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 상태

  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    sort: 'createdAt_desc',
  });

  const isInitialMount = useRef(true);
  const dropdownRef = useRef(null); // 드롭다운 외부 영역 클릭 감지용

  const currentPage = pageInfo.page + 1;
  const totalPages = pageInfo.totalPages;

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePageChange = (page1) => {
    if (page1 < 1 || (totalPages > 0 && page1 > totalPages)) return;
    setPageInfo((p) => ({ ...p, page: page1 - 1 }));
  };

  const handleSearchApply = () => {
    setPageInfo((p) => ({ ...p, page: 0 }));
    setAppliedFilters({ search: searchTerm, sort: sortBy });
  };

  const handleSortSelect = (value) => {
    setSortBy(value);
    setIsDropdownOpen(false);
  };

  const handleReviewClick = (itemId) => {
    navigate('/sellerCenter/reviewList', { state: { itemId } });
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setPageInfo((p) => ({ ...p, page: 0 }));
    setAppliedFilters((prevFilters) => ({
      ...prevFilters,
      sort: sortBy,
    }));
  }, [sortBy]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);

        const [sortField, sortDir] = appliedFilters.sort.split('_');

        const params = {
          page: pageInfo.page,
          size: pageInfo.size,
          search: appliedFilters.search,
          sort: sortField,
          dir: sortDir,
        };

        if (!params.search) delete params.search;

        const res = await axios.get('/items/my-items', { params });
        console.log('API Response:', res.data);
        setItems(res.data.content);
        setPageInfo((prev) => ({
          ...prev,
          totalPages: res.data.totalPages,
          totalElements: res.data.totalElements,
          isFirst: res.data.first,
          isLast: res.data.last,
        }));
      } catch (err) {
        console.error(err);
        setError('상품 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [pageInfo.page, pageInfo.size, appliedFilters]);

  return (
    <Container>
      <TopBar>
        <Title>상품 목록</Title>
        <AddButton onClick={() => navigate('/sellerCenter/uploadProduct')}>
          상품 등록
        </AddButton>
      </TopBar>

      <FilterBar>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="상품명으로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchApply()}
          />
          <SearchButton onClick={handleSearchApply}>검색</SearchButton>
        </SearchContainer>

        {/* 커스텀 드롭다운 */}
        <DropdownContainer ref={dropdownRef}>
          <DropdownHeader onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}
            <Arrow $isOpen={isDropdownOpen}>▼</Arrow>
          </DropdownHeader>
          {isDropdownOpen && (
            <DropdownList>
              {SORT_OPTIONS.map((opt) => (
                <DropdownItem
                  key={opt.value}
                  $isSelected={sortBy === opt.value}
                  onClick={() => handleSortSelect(opt.value)}
                >
                  {opt.label}
                </DropdownItem>
              ))}
            </DropdownList>
          )}
        </DropdownContainer>
      </FilterBar>

      {loading && <Message>로딩중...</Message>}
      {error && <Message>{error}</Message>}

      {!loading && !error && (
        <>
          {/* PC 환경: 기존 테이블 뷰 */}
          <DesktopTableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>이미지</th>
                  <th>상품명</th>
                  <th>가격</th>
                  <th>재고</th>
                  <th>판매량</th>
                  <th>후기수</th>
                  <th>배송방식</th>
                  <th>판매사</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Thumb>
                          {item.imageUrl ? (
                            <img
                              src={`${BASE_URL}${item.imageUrl}`}
                              alt={item.name}
                            />
                          ) : (
                            <span>이미지 없음</span>
                          )}
                        </Thumb>
                      </td>
                      <td>{item.name}</td>
                      <td>{item.price.toLocaleString()} 원</td>
                      <td>{item.stockQuantity} 개</td>
                      <td>{item.soldCount || 0} 개</td>
                      <td>
                        <ReviewCountLink
                          onClick={() => handleReviewClick(item.id)}
                        >
                          {item.reviewCount || 0} 개
                        </ReviewCountLink>
                      </td>
                      <td>{item.deliveryType}</td>
                      <td>{item.company}</td>
                      <td>
                        <ActionBtn
                          onClick={() =>
                            navigate(`/sellerCenter/productList/${item.id}`)
                          }
                        >
                          관리
                        </ActionBtn>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <NoDataCell colSpan="7">
                      {'등록된 상품이 없습니다.'}
                    </NoDataCell>
                  </tr>
                )}
              </tbody>
            </Table>
          </DesktopTableWrapper>

          {/* 모바일 환경: 카드형 리스트 뷰 */}
          <MobileListWrapper>
            {items.length > 0 ? (
              items.map((item) => (
                <MobileCard key={item.id}>
                  <MobileThumb>
                    {item.imageUrl ? (
                      <img
                        src={`${BASE_URL}${item.imageUrl}`}
                        alt={item.name}
                      />
                    ) : (
                      <span>이미지 없음</span>
                    )}
                  </MobileThumb>
                  <MobileInfo>
                    <ItemName>{item.name}</ItemName>
                    <ItemPrice>{item.price.toLocaleString()} 원</ItemPrice>
                    <ItemMeta>
                      재고: {item.stockQuantity}개 | 판매: {item.soldCount || 0}
                      개 | 후기: {item.reviewCount || 0} 개
                    </ItemMeta>
                  </MobileInfo>
                  <MobileAction>
                    <ActionBtn
                      onClick={() =>
                        navigate(`/sellerCenter/productList/${item.id}`)
                      }
                    >
                      관리
                    </ActionBtn>
                  </MobileAction>
                </MobileCard>
              ))
            ) : (
              <NoDataCard>등록된 상품이 없습니다.</NoDataCard>
            )}
          </MobileListWrapper>

          {!loading && items.length > 0 && pageInfo.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pageInfo.totalPages}
              onPageChange={handlePageChange}
              isFirst={pageInfo.isFirst}
              isLast={pageInfo.isLast}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default ProductList;

// --- 스타일 컴포넌트 ---
const Container = styled.div`
  max-width: 1600px;
  margin: 60px auto;
  padding: 0 20px;

  @media (max-width: 768px) {
    margin: 20px auto;
    padding: 0 10px;
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme: { colors } }) => colors.primary};
  margin: 0;
`;

const AddButton = styled.button`
  padding: 8px 16px;
  background: ${({ theme: { colors } }) => colors.primary};
  border: none;
  border-radius: 6px;
  color: ${({ theme: { colors } }) => colors.white};
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: ${({ theme: { colors } }) => colors.primary_dark};
  }
  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 14px;
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: ${({ theme: { colors } }) => colors.gray[50]};
  border-radius: 8px;
  gap: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${({ theme: { colors } }) => colors.gray[300]};
  border-radius: 6px 0 0 6px;
  outline: none;
  font-size: 14px;
  width: 250px;

  &:focus {
    border-color: ${({ theme: { colors } }) => colors.primary};
  }
  @media (max-width: 768px) {
    flex: 1;
    width: auto;
  }
`;

const SearchButton = styled.button`
  padding: 8px 16px;
  border: none;
  background: ${({ theme: { colors } }) => colors.primary};
  color: ${({ theme: { colors } }) => colors.white};
  cursor: pointer;
  border-radius: 0 6px 6px 0;
  white-space: nowrap;

  &:hover {
    background: ${({ theme: { colors } }) => colors.primary_dark};
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  width: 150px;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const DropdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid ${({ theme: { colors } }) => colors.gray[300]};
  border-radius: 6px;
  font-size: 14px;
  background-color: ${({ theme: { colors } }) => colors.white};
  cursor: pointer;
  user-select: none;
  color: ${({ theme: { colors } }) => colors.gray[800]};
  transition: border-color 0.2s;

  &:hover {
    border-color: ${({ theme: { colors } }) => colors.primary};
  }
`;

const Arrow = styled.span`
  font-size: 10px;
  color: ${({ theme: { colors } }) => colors.gray[600]};
  transition: transform 0.3s ease;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0)')};
`;

const DropdownList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  padding: 0;
  list-style: none;
  background-color: ${({ theme: { colors } }) => colors.white};
  border: 1px solid ${({ theme: { colors } }) => colors.gray[300]};
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 100;
  animation: fadeIn 0.2s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const DropdownItem = styled.li`
  padding: 10px 12px;
  font-size: 14px;
  cursor: pointer;
  color: ${({ $isSelected, theme: { colors } }) =>
    $isSelected ? colors.primary : colors.gray[800]};
  background-color: ${({ $isSelected, theme: { colors } }) =>
    $isSelected ? colors.primary_light : colors.white};
  font-weight: ${({ $isSelected }) => ($isSelected ? 'bold' : 'normal')};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.gray[50]};
  }
`;

const DesktopTableWrapper = styled.div`
  width: 100%;
  @media (max-width: 768px) {
    display: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme: { colors } }) => colors.white};
  border-radius: 10px;
  overflow: hidden;

  th,
  td {
    padding: 12px 15px;
    text-align: center;
    border-bottom: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
  }

  th {
    background: ${({ theme: { colors } }) => colors.primary_hover};
    color: ${({ theme: { colors } }) => colors.gray[800]};
    white-space: nowrap;
  }

  tr:hover {
    background: ${({ theme: { colors } }) => colors.gray[50]};
  }
`;

const Thumb = styled.div`
  width: 60px;
  height: 60px;
  background: ${({ theme: { colors } }) => colors.gray[100]};
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;

  img {
    max-width: 100%;
    max-height: 100%;
  }
`;

const ActionBtn = styled.button`
  margin: 0 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  color: ${({ theme: { colors } }) => colors.white};
  background: ${(props) =>
    props.$danger
      ? props.theme.colors.danger_light
      : props.theme.colors.primary};
  cursor: pointer;
  transition: background 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${(props) =>
      props.$danger
        ? props.theme.colors.danger
        : props.theme.colors.primary_dark};
  }
`;

const NoDataCell = styled.td`
  padding: 50px 0 !important;
  text-align: center;
  color: ${({ theme: { colors } }) => colors.gray[550]};
  font-size: 16px;
`;

const Message = styled.div`
  text-align: center;
  padding: 20px;
  color: ${({ theme: { colors } }) => colors.gray[600]};
  font-size: 15px;
`;

const MobileListWrapper = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
`;

const MobileCard = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme: { colors } }) => colors.white};
  border-radius: 10px;
  padding: 15px;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
`;

const MobileThumb = styled.div`
  width: 70px;
  height: 70px;
  background: ${({ theme: { colors } }) => colors.gray[100]};
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  span {
    font-size: 11px;
    color: ${({ theme: { colors } }) => colors.gray[550]};
  }
`;

const MobileInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
`;

const ItemName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme: { colors } }) => colors.gray[800]};
  word-break: keep-all;
  line-height: 1.3;
`;

const ItemPrice = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme: { colors } }) => colors.primary};
`;

const ItemMeta = styled.div`
  font-size: 12px;
  color: ${({ theme: { colors } }) => colors.gray[550]};
`;

const MobileAction = styled.div`
  flex-shrink: 0;
`;

const NoDataCard = styled.div`
  padding: 40px 0;
  text-align: center;
  color: ${({ theme: { colors } }) => colors.gray[550]};
  font-size: 14px;
  background: ${({ theme: { colors } }) => colors.white};
  border-radius: 10px;
  border: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
`;

const ReviewCountLink = styled.span`
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;

  &:hover {
    color: ${({ theme }) => theme.colors.primary_dark};
  }
`;
