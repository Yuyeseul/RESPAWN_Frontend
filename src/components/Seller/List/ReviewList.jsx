import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from '../../../api/axios';
import { useNavigate } from 'react-router-dom';
import ItemSelector from './ItemSelector';

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    fetchReviews(selectedItem);
  }, [selectedItem]);

  // 상품 목록 불러오기
  const fetchItems = async () => {
    try {
      const res = await axios.get('/api/items/my-items');
      setItems(res.data.content);
    } catch (err) {
      console.error('상품 목록 불러오기 실패:', err);
    }
  };

  const fetchReviews = async (itemId) => {
    try {
      let url = '/api/reviews/seller/my-reviews';
      if (itemId) {
        url += `?itemId=${itemId}`;
      }
      const res = await axios.get(url);
      setReviews(res.data);
    } catch (err) {
      console.error('리뷰 불러오기 실패:', err);
    }
  };

  const renderStars = (rating) => {
    const filled = '★'.repeat(rating);
    const empty = '☆'.repeat(5 - rating);
    return filled + empty;
  };

  const handleRowClick = (review) => {
    navigate(`/sellerCenter/reviewList/${review.reviewId}`, {
      state: { review },
    });
  };

  const truncateContent = (content, length = 20) => {
    if (!content) return '';
    return content.length > length ? content.slice(0, length) + '...' : content;
  };

  return (
    <Container>
      <Header>
        <Title>상품 리뷰 목록</Title>
        <ItemSelector
          value={selectedItem}
          onChange={setSelectedItem}
          productList={items}
        />
      </Header>
      <Table>
        <thead>
          <tr>
            <th>번호</th>
            <th>작성자</th>
            <th>상품명</th>
            <th>평점</th>
            <th>리뷰 내용</th>
            <th>작성일</th>
          </tr>
        </thead>
        <tbody>
          {reviews.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>
                작성된 리뷰가 없습니다.
              </td>
            </tr>
          ) : (
            reviews.map((review, index) => (
              <tr
                key={review.reviewId}
                onClick={() => handleRowClick(review)}
                style={{ cursor: 'pointer' }}
              >
                <td>{reviews.length - index}</td>
                <td>{review.buyerId}</td>
                <td>{review.itemName}</td>
                <td>{renderStars(review.rating)}</td>
                <td>{truncateContent(review.content)}</td>
                <td>{new Date(review.createdDate).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default ReviewList;

const Container = styled.div`
  max-width: 1600px;
  margin: 60px auto;
  padding: 0 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #555a82;
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
