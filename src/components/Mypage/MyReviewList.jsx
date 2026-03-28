import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from '../../api/axios';
import styled, { css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import StarRating from '../../components/common/StarRating';
import { BASE_URL } from '../../api/axios';

const PAGE_SIZE = 10;

const MyReviewList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('writable');
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ writable: 0, written: 0 });

  // 무한 스크롤 상태
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Intersection Observer를 위한 Ref
  const sentinelRef = useRef(null);
  const inFlightRef = useRef(false); // 중복 요청 방지

  // 리뷰 작성 버튼 클릭 시
  const handleWriteReview = (orderId, orderItemId) => {
    navigate(`/mypage/orders/${orderId}/items/${orderItemId}/registerReview`);
  };

  const fetchCounts = async () => {
    try {
      const response = await axios.get(`/reviews/count`);
      setCounts({
        writable: response.data.writableCount || 0,
        written: response.data.writtenCount || 0,
      });
    } catch (error) {
      console.error('리뷰 개수를 불러오는데 실패했습니다.', error);
    }
  };

  // 서버에서 내 리뷰 목록 불러오기
  // 특정 탭의 데이터 불러오기 (무한 스크롤용)
  const fetchMyReviews = useCallback(
    async (isInitialLoad = false) => {
      if (inFlightRef.current) return;
      if (!hasMore && !isInitialLoad) return;
      inFlightRef.current = true;
      setLoading(true);

      const currentPage = isInitialLoad ? 0 : page;

      try {
        const params = {
          page: currentPage,
          size: PAGE_SIZE,
        };
        const res = await axios.get(`/reviews/${activeTab}`, { params });
        console.log(res.data);

        const newItems = res.data.content || [];
        const pageMeta = res.data.page || {};
        const number =
          typeof pageMeta.number === 'number' ? pageMeta.number : currentPage;
        const totalPages =
          typeof pageMeta.totalPages === 'number' ? pageMeta.totalPages : 0;

        setItems((prevItems) =>
          isInitialLoad ? newItems : [...prevItems, ...newItems]
        );
        let more;
        if (totalPages > 0) {
          more = number + 1 < totalPages;
        } else {
          // totalPages 정보가 없을 때의 보루 로직
          more = newItems.length === PAGE_SIZE;
        }
        setHasMore(more);

        // 페이지는 항상 +1
        setPage(isInitialLoad ? 1 : currentPage + 1);
      } catch (error) {
        console.error(error);
        alert('리뷰 목록을 불러오는데 실패했습니다.');
        setHasMore(false);
      } finally {
        setLoading(false);
        if (isInitialLoad) setInitialLoading(false);
        inFlightRef.current = false;
      }
    },
    [activeTab, page, hasMore]
  );

  useEffect(() => {
    fetchCounts();
  }, []);

  // 탭 변경 시 상태 초기화 및 데이터 다시 불러오기
  useEffect(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    setInitialLoading(true);
    fetchMyReviews(true);
  }, [activeTab]);

  // IntersectionObserver 설정
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMyReviews();
        }
      },
      { rootMargin: '0px 0px 200px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, hasMore, fetchMyReviews]);

  const renderContent = () => {
    if (initialLoading)
      return <Message>리뷰 목록을 불러오는 중입니다...</Message>;
    if (items.length === 0) {
      return (
        <Message>
          {activeTab === 'writable'
            ? '작성할 리뷰가 없습니다.'
            : '작성한 리뷰가 없습니다.'}
        </Message>
      );
    }

    if (activeTab === 'writable') {
      return items.map((item) => (
        <WritableItem key={item.orderItemId}>
          <ItemImage
            src={`${BASE_URL}${item.imageUrl}`}
            alt={item.itemName}
            loading="lazy"
          />
          <ItemInfo>
            <ItemName>{item.itemName}</ItemName>
          </ItemInfo>
          <Actions>
            <ActionButton
              onClick={() => handleWriteReview(item.orderId, item.orderItemId)}
            >
              리뷰 작성하기
            </ActionButton>
          </Actions>
        </WritableItem>
      ));
    }

    if (activeTab === 'written') {
      return items.map((review) => (
        <WrittenItem key={review.reviewId}>
          <ItemHeader>
            {review.imageUrl && (
              <ReviewImage
                src={`${BASE_URL}${review.imageUrl}`}
                alt=""
                loading="lazy"
              />
            )}
            <ItemInfo>
              <ItemName>{review.itemName}</ItemName>
              <StarRating value={review.rating} readOnly={true} />
            </ItemInfo>
          </ItemHeader>
          <ReviewContent>
            <ReviewDate>
              {new Date(review.createdDate).toLocaleDateString()}
            </ReviewDate>
            {(review.content || '').split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </ReviewContent>
        </WrittenItem>
      ));
    }
    return null;
  };

  return (
    <Container>
      <Title>리뷰</Title>
      <TabContainer role="tablist" aria-label="리뷰 탭">
        <TabButton
          role="tab"
          aria-selected={activeTab === 'writable'}
          active={activeTab === 'writable'}
          onClick={() => setActiveTab('writable')}
        >
          리뷰 작성 <Count>{counts.writable}</Count>
        </TabButton>
        <TabButton
          role="tab"
          aria-selected={activeTab === 'written'}
          active={activeTab === 'written'}
          onClick={() => setActiveTab('written')}
        >
          작성한 리뷰 <Count>{counts.written}</Count>
        </TabButton>
      </TabContainer>

      <Content>
        <ReviewList>{renderContent()}</ReviewList>

        {loading && !initialLoading && (
          <Message>더 많은 리뷰를 불러오는 중...</Message>
        )}
        {hasMore && !loading && <Sentinel ref={sentinelRef} />}
      </Content>
    </Container>
  );
};

export default MyReviewList;

const Container = styled.div`
  max-width: 1000px;
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 30px;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #ddd;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 15px 0;
  font-size: 16px;
  font-weight: 700;
  color: #888;
  background-color: #f8f8f8;
  border: 1px solid #ddd;
  border-bottom: none;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  ${({ active }) =>
    active &&
    css`
      color: #333;
      background-color: #fff;
      border-bottom: 1px solid #fff;
      position: relative;
      top: 1px;
    `}
`;

const Count = styled.span`
  margin-left: 4px;
`;

const Content = styled.div`
  padding-top: 20px;
`;

const ReviewList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  min-height: 300px;
`;

const ListItemBase = styled.li`
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
  &:last-child {
    border-bottom: none;
  }
`;

const WritableItem = styled(ListItemBase)`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const ItemImage = styled.img`
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
`;

const ItemInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ItemName = styled.h3`
  font-size: 15px;
  font-weight: 500;
  margin: 0;
  color: #333;
  line-height: 1.4;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 700;
  color: rgb(105, 111, 148);
  background-color: #fff;
  border: 1px solid rgb(105, 111, 148);
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: rgba(105, 111, 148, 0.1);
  }
`;

const WrittenItem = styled(ListItemBase)``;

const ItemHeader = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 15px;
  align-items: center;
`;

const ReviewImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
`;

const ReviewContent = styled.div`
  font-size: 14px;
  color: #555;
  line-height: 1.6;
  padding-left: 96px; /* 이미지 너비 + 간격 만큼 들여쓰기 */

  p {
    margin: 8px 0;
  }
`;

const ReviewDate = styled.p`
  font-size: 13px;
  color: #999;
  margin: 10px 0 !important;
`;

const Message = styled.div`
  text-align: center;
  color: #666;
  font-size: 16px;
  padding: 32px 0;
`;

const Sentinel = styled.div`
  height: 1px;
`;
