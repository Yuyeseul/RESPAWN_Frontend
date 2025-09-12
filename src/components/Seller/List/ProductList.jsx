import React, { useEffect, useState } from 'react';
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

  const currentPage = pageInfo.page + 1;
  const totalPages = pageInfo.totalPages;

  const handlePageChange = (page1) => {
    if (page1 < 1 || (totalPages > 0 && page1 > totalPages)) return;
    setPageInfo((p) => ({ ...p, page: page1 - 1 }));
  };

  // 상품 목록 가져오기
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/items/my-items', {
          params: { page: pageInfo.page, size: pageInfo.size },
        });
        console.log(res.data);
        setItems(res.data.content); // 서버에서 List<Item> 반환한다고 가정
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
  }, [pageInfo.page, pageInfo.size]);

  return (
    <Container>
      <TopBar>
        <Title>상품 목록</Title>
        <AddButton onClick={() => navigate('/sellerCenter/uploadProduct')}>
          상품 등록
        </AddButton>
      </TopBar>

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
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: 'center', padding: '20px' }}
                  >
                    등록된 상품이 없습니다.
                  </td>
                </tr>
              ) : (
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

const Message = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 15px;
`;
