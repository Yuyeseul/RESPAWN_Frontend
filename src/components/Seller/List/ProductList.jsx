import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import axios from '../../../api/axios';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../Pagination';

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
  const [sortBy, setSortBy] = useState('latest');

  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    sort: 'latest',
  });

  const isInitialMount = useRef(true);

  const currentPage = pageInfo.page + 1;
  const totalPages = pageInfo.totalPages;

  const handlePageChange = (page1) => {
    if (page1 < 1 || (totalPages > 0 && page1 > totalPages)) return;
    setPageInfo((p) => ({ ...p, page: page1 - 1 }));
  };

  const handleSearchApply = () => {
    setPageInfo((p) => ({ ...p, page: 0 }));
    setAppliedFilters({ search: searchTerm, sort: sortBy });
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

  // 상품 목록 가져오기
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);

        let sortField = '_id';
        let sortDir = 'desc';

        if (appliedFilters.sort !== 'latest') {
          const [field, dir] = appliedFilters.sort.split('_');
          sortField = field;
          sortDir = dir;
        }

        const params = {
          page: pageInfo.page,
          size: pageInfo.size,
          search: appliedFilters.search,
          sort: sortField,
          dir: sortDir,
        };

        if (!params.search) delete params.search;

        const res = await axios.get('/items/my-items', { params });

        console.log(res.data);
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
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="latest">최신순</option>
          <option value="price_asc">가격 낮은순</option>
          <option value="price_desc">가격 높은순</option>
          <option value="stockQuantity_asc">재고 적은순</option>
          <option value="stockQuantity_desc">재고 많은순</option>
        </Select>
      </FilterBar>

      {loading && <Message>로딩중...</Message>}
      {error && <Message>{error}</Message>}

      {!loading && !error && (
        <>
          <Table>
            <thead>
              <tr>
                <th>이미지</th>
                <th>상품명</th>
                <th>가격</th>
                <th>재고</th>
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
                          <img src={item.imageUrl} alt={item.name} />
                        ) : (
                          <span>이미지 없음</span>
                        )}
                      </Thumb>
                    </td>
                    <td>{item.name}</td>
                    <td>{item.price.toLocaleString()} 원</td>
                    <td>{item.stockQuantity} 개</td>
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

const Container = styled.div`
  max-width: 1600px;
  margin: 60px auto;
  padding: 0 20px;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #555a82;
`;

const AddButton = styled.button`
  padding: 8px 16px;
  background: #555a82;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;

  &:hover {
    background: #4a4e70;
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  gap: 10px;
`;

const SearchContainer = styled.div`
  display: flex;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px 0 0 6px;
  outline: none;
  font-size: 14px;
  width: 250px;

  &:focus {
    border-color: #555a82;
  }
`;

const SearchButton = styled.button`
  padding: 8px 16px;
  border: none;
  background: #555a82;
  color: white;
  cursor: pointer;
  border-radius: 0 6px 6px 0;

  &:hover {
    background: #4a4e70;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;

  &:focus {
    border-color: #555a82;
    outline: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;

  th,
  td {
    padding: 12px 15px;
    text-align: center;
    border-bottom: 1px solid #eee;
  }

  th {
    background: #e6e8f4;
    color: #333;
  }

  tr:hover {
    background: #f5f7fa;
  }
`;

const Thumb = styled.div`
  width: 60px;
  height: 60px;
  background: #f2f2f2;
  display: flex;
  justify-content: center;
  align-items: center;

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
  color: white;
  background: ${(props) => (props.$danger ? '#ff4d4f' : '#555a82')};
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${(props) => (props.$danger ? '#d9363e' : '#3e4263')};
  }
`;

const NoDataCell = styled.td`
  padding: 50px 0 !important;
  text-align: center;
  color: #999;
  font-size: 16px;
`;

const Message = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 15px;
`;
