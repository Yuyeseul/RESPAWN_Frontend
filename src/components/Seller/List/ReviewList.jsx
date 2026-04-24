import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from '../../../api/axios';
import { useNavigate, useLocation } from 'react-router-dom';
import ItemSelector from './ItemSelector';
import Pagination from '../../Pagination';

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState(
    location.state?.itemId || ''
  );
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
    isFirst: true,
    isLast: true,
  });

  const handlePageChange = (page) => {
    if (page < 1 || (pageInfo.totalPages > 0 && page > pageInfo.totalPages))
      return;
    setPageInfo((p) => ({ ...p, page: page - 1 }));
  };

  useEffect(() => {
    if (location.state?.itemId && location.state.itemId !== selectedItem) {
      setSelectedItem(location.state.itemId);
      setPageInfo((prev) => ({ ...prev, page: 0 }));
    }
  }, [location.state?.itemId]);

  // 1. 상품 목록 불러오기 (마운트 시 1번만 실행)
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get('/items/my-items/summary');
        setItems(res.data);
      } catch (err) {
        console.error('상품 목록 불러오기 실패:', err);
      }
    };
    fetchItems();
  }, []);

  // 2. 리뷰 목록 불러오기 (선택된 상품이나 페이지 변경 시 실행)
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get('/reviews/seller/my-reviews', {
          params: {
            page: pageInfo.page,
            size: pageInfo.size,
            itemId: selectedItem || '',
          },
        });
        const data = res.data;
        setReviews(data.content);
        setPageInfo((prev) => ({
          ...prev,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          isFirst: data.first,
          isLast: data.last,
        }));
      } catch (err) {
        console.error('리뷰 불러오기 실패:', err);
      }
    };
    fetchReviews();
  }, [selectedItem, pageInfo.page, pageInfo.size]);

  const handleItemSelectorChange = (newItemId) => {
    setSelectedItem(newItemId);
    setPageInfo((prev) => ({ ...prev, page: 0 }));
  };

  // 별점 렌더링 (디자인 적용)
  const renderStars = (rating) => {
    const filled = '★'.repeat(rating);
    const empty = '☆'.repeat(5 - rating);
    return (
      <Stars>
        <span className="filled">{filled}</span>
        <span className="empty">{empty}</span>
      </Stars>
    );
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
        <SelectorWrapper>
          <ItemSelector
            value={selectedItem}
            onChange={handleItemSelectorChange}
            productList={items}
          />
        </SelectorWrapper>
      </Header>

      {/* PC 환경: 테이블 뷰 */}
      <DesktopTableWrapper>
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
            {reviews.length > 0 ? (
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
                  <td>{truncateContent(review.content, 25)}</td>
                  <td>{new Date(review.createdDate).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <NoDataCell colSpan="6">{'리뷰 내역이 없습니다.'}</NoDataCell>
              </tr>
            )}
          </tbody>
        </Table>
      </DesktopTableWrapper>

      {/* 모바일 환경: 카드형 리스트 뷰 */}
      <MobileListWrapper>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <MobileCard
              key={review.reviewId}
              onClick={() => handleRowClick(review)}
            >
              <CardHeader>
                <BuyerId>{review.buyerId}</BuyerId>
                <ReviewDate>
                  {new Date(review.createdDate).toLocaleDateString()}
                </ReviewDate>
              </CardHeader>
              <CardBody>
                <ItemName>{review.itemName}</ItemName>
                <RatingRow>{renderStars(review.rating)}</RatingRow>
                <ReviewContent>
                  {truncateContent(review.content, 40)}
                </ReviewContent>
              </CardBody>
            </MobileCard>
          ))
        ) : (
          <NoDataCard>리뷰 내역이 없습니다.</NoDataCard>
        )}
      </MobileListWrapper>

      {pageInfo.totalPages > 1 && (
        <PaginationWrapper>
          <Pagination
            currentPage={pageInfo.page + 1}
            totalPages={pageInfo.totalPages}
            onPageChange={handlePageChange}
            isFirst={pageInfo.isFirst}
            isLast={pageInfo.isLast}
          />
        </PaginationWrapper>
      )}
    </Container>
  );
};

export default ReviewList;

// --- 스타일 컴포넌트 영역 ---

const Container = styled.div`
  max-width: 1600px;
  margin: 60px auto;
  padding: 0 20px;
  font-family:
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    sans-serif;

  @media (max-width: 768px) {
    margin: 20px auto;
    padding: 0 10px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme: { colors } }) => colors.primary};
  margin: 0;
`;

const SelectorWrapper = styled.div`
  @media (max-width: 768px) {
    width: 100%;
    select {
      width: 100%;
    }
  }
`;

const Stars = styled.span`
  display: inline-flex;
  gap: 2px;
  font-size: 15px;

  .filled {
    color: ${({ theme: { colors } }) => colors.star};
  }
  .empty {
    color: ${({ theme: { colors } }) => colors.gray[200]};
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  th,
  td {
    padding: 14px 15px;
    text-align: center;
    border-bottom: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
    vertical-align: middle;
  }

  th {
    background: ${({ theme: { colors } }) => colors.primary_hover};
    color: ${({ theme: { colors } }) => colors.gray[800]};
    font-weight: 600;
    white-space: nowrap;
  }

  tr:hover {
    background: ${({ theme: { colors } }) => colors.gray[50]};
  }
`;

const NoDataCell = styled.td`
  padding: 50px 0 !important;
  text-align: center;
  color: ${({ theme: { colors } }) => colors.gray[550]};
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
  background: ${({ theme: { colors } }) => colors.white};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease;

  &:active {
    transform: scale(0.98);
    background: ${({ theme: { colors } }) => colors.gray[50]};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme: { colors } }) => colors.gray[200]};
  padding-bottom: 8px;
`;

const BuyerId = styled.span`
  font-size: 13px;
  color: ${({ theme: { colors } }) => colors.gray[600]};
  font-weight: 600;
`;

const ReviewDate = styled.span`
  font-size: 12px;
  color: ${({ theme: { colors } }) => colors.gray[550]};
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ItemName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme: { colors } }) => colors.gray[900]};
  line-height: 1.4;
  word-break: keep-all;
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
`;

const ReviewContent = styled.div`
  font-size: 14px;
  color: ${({ theme: { colors } }) => colors.gray[650]};
  line-height: 1.5;
  background: ${({ theme: { colors } }) => colors.gray[100]};
  padding: 10px;
  border-radius: 6px;
  border: 1px solid ${({ theme: { colors } }) => colors.gray[100]};
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

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;
