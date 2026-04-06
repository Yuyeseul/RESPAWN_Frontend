import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from '../../api/axios';
import styled, { css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import StarRating from '../../components/common/StarRating';
import { BASE_URL } from '../../api/axios';
import MypageLayout from './MypageLayout';

const PAGE_SIZE = 10;

const WrittenReviewItem = ({ review }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef(null);
  const [shouldShowButton, setShouldShowButton] = useState(false);

  // 텍스트가 3줄을 초과하는지 체크
  useEffect(() => {
    if (contentRef.current) {
      // line-height와 height를 비교하여 3줄 초과 여부 확인
      const hasOverflow =
        contentRef.current.scrollHeight > contentRef.current.clientHeight;
      setShouldShowButton(hasOverflow);
    }
  }, [review.content]);

  return (
    <WrittenItem>
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
          <ReviewDate>
            {new Date(review.createdDate).toLocaleDateString()}
          </ReviewDate>
        </ItemInfo>
      </ItemHeader>

      <ReviewContent ref={contentRef} $isExpanded={isExpanded}>
        {(review.content || '').split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </ReviewContent>

      {shouldShowButton && (
        <MoreButton onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? '접기' : '...더보기'}
        </MoreButton>
      )}
    </WrittenItem>
  );
};

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
        setHasMore(
          totalPages > 0
            ? number + 1 < totalPages
            : newItems.length === PAGE_SIZE
        );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <WrittenReviewItem key={review.reviewId} review={review} />
      ));
    }
    return null;
  };

  return (
    <MypageLayout title={'리뷰'}>
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
    </MypageLayout>
  );
};

export default MyReviewList;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
`;

const TabButton = styled.button`
  flex: 1;
  padding: 16px 0;
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[600]};
  background-color: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  ${({ active, theme }) =>
    active &&
    css`
      color: ${theme.colors.gray[700]};
      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: ${theme.colors.gray[700]};
      }
    `}

  @media ${({ theme }) => theme.mobile} {
    padding: 12px 0;
    font-size: 14px;
  }
`;

const Count = styled.span`
  margin-left: 6px;
  color: ${({ theme }) => theme.colors.gray[600]};
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
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
  &:last-child {
    border-bottom: none;
  }
  @media ${({ theme }) => theme.mobile} {
    padding: 16px 0;
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
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};

  @media ${({ theme }) => theme.mobile} {
    width: 70px;
    height: 70px;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ItemName = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: ${({ theme }) => theme.colors.gray[700]};
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media ${({ theme }) => theme.mobile} {
    font-size: 14px;
  }
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
  color: ${({ theme }) => theme.colors.secondary};
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightNavy};
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 8px 12px;
    font-size: 14px;
  }
`;

const WrittenItem = styled(ListItemBase)`
  display: flex;
  flex-direction: column;
`;

const ItemHeader = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  align-items: center;

  @media ${({ theme }) => theme.mobile} {
    gap: 12px;
  }
`;

const ReviewImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};

  @media ${({ theme }) => theme.mobile} {
    width: 65px;
    height: 65px;
  }
`;

const ReviewContent = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[700]};
  line-height: 1.6;
  padding-left: 96px;

  p {
    margin: 0;
  }

  ${({ $isExpanded }) =>
    !$isExpanded &&
    css`
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    `}

  @media ${({ theme }) => theme.mobile} {
    font-size: 13px;
    padding-left: 0;
    margin-top: 12px;
    p {
      padding: 0 4px;
    }
  }
`;

const MoreButton = styled.button`
  align-self: flex-start;
  margin-top: 8px;
  margin-left: 96px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  &:hover {
    color: ${({ theme }) => theme.colors.gray[700]};
  }
  @media ${({ theme }) => theme.mobile} {
    margin-left: 4px;
  }
`;

const ReviewDate = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin: 4px 0 !important;
`;

const Message = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: 16px;
  padding: 32px 0;
`;

const Sentinel = styled.div`
  height: 1px;
`;
