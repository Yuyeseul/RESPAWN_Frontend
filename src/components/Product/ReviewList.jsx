import React, { useEffect, useState, useRef } from 'react';
import axios from '../../api/axios';
import styled, { css } from 'styled-components';
import Pagination from '../Pagination';

const ReviewItem = ({ review }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef(null);
  const [shouldShowButton, setShouldShowButton] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      const hasOverflow =
        contentRef.current.scrollHeight > contentRef.current.clientHeight;
      setShouldShowButton(hasOverflow);
    }
  }, [review.content]);

  return (
    <ReviewCard>
      <Header>
        <Reviewer>{review.maskedUsername}</Reviewer>
        <DateText>{new Date(review.createdDate).toLocaleDateString()}</DateText>
      </Header>
      <Rating>⭐ {review.rating}점</Rating>

      <Content ref={contentRef} $isExpanded={isExpanded}>
        {review.content}
      </Content>

      {shouldShowButton && (
        <MoreButton onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? '접기' : '...더보기'}
        </MoreButton>
      )}
    </ReviewCard>
  );
};

const ReviewList = ({ itemId }) => {
  const [reviews, setReviews] = useState([]);
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
    fetchReviews();
  }, [pageInfo.page]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`reviews/items/${itemId}`, {
        params: { page: pageInfo.page, size: pageInfo.size },
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

  const getRatingStats = (reviews) => {
    const stats = [0, 0, 0, 0, 0]; // index 0 → 1점, index 4 → 5점
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        stats[r.rating - 1]++;
      }
    });
    return stats;
  };

  const ratingStats = getRatingStats(reviews);
  const totalReviews = pageInfo.totalElements;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(
          1
        )
      : 0;

  return (
    <Container>
      <Title>
        상품평 <Count>({totalReviews})</Count>
      </Title>
      <StatsContainer>
        <AverageBox>
          <AverageScore>⭐ {averageRating}</AverageScore>
          <TotalReviewText>({totalReviews}개 리뷰)</TotalReviewText>
        </AverageBox>
        {ratingStats
          .slice()
          .reverse()
          .map((count, idx) => {
            const rating = 5 - idx;
            const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <StatRow key={rating}>
                <RatingLabel>{rating}점</RatingLabel>
                <ProgressBar>
                  <Progress style={{ width: `${percent}%` }} />
                </ProgressBar>
                <CountText>{count}개</CountText>
              </StatRow>
            );
          })}
      </StatsContainer>
      {reviews.length === 0 ? (
        <NoReview>리뷰가 없습니다.</NoReview>
      ) : (
        <>
          {reviews.map((review) => (
            <ReviewItem key={review.reviewId} review={review} />
          ))}
          {pageInfo.totalPages > 1 && (
            <Pagination
              currentPage={pageInfo.page + 1}
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

export default ReviewList;

const Container = styled.div`
  width: 100%;
  margin: 0 auto;

  @media ${({ theme }) => theme.mobile} {
    padding: 0 4px;
    box-sizing: border-box;
  }
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.gray[700]};
  font-size: 20px;
  font-weight: bold;
`;

const Count = styled.span`
  color: ${({ theme }) => theme.colors.red};
  font-size: 20px;
  margin-left: 4px;
`;

const StatsContainer = styled.div`
  margin: 24px 0;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.gray[100]};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 12px;

  @media ${({ theme }) => theme.mobile} {
    padding: 16px;
    margin: 16px 0;
  }
`;

const AverageBox = styled.div`
  display: flex;
  align-items: baseline;
  margin-bottom: 16px;
`;

const AverageScore = styled.span`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.orange};
  margin-right: 8px;

  @media ${({ theme }) => theme.mobile} {
    font-size: 20px;
  }
`;

const TotalReviewText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;

  @media ${({ theme }) => theme.mobile} {
    gap: 8px;
    margin-bottom: 8px;
  }
`;

const RatingLabel = styled.span`
  width: 40px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[700]};
  text-align: right;

  @media ${({ theme }) => theme.mobile} {
    width: 32px;
    font-size: 14px;
  }
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 10px;
  background-color: ${({ theme }) => theme.colors.gray[300]};
  border-radius: 20px;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  background-color: ${({ theme }) => theme.colors.yellow};
  transition: width 0.3s ease;
`;

const CountText = styled.span`
  width: 40px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[600]};
  text-align: left;

  @media ${({ theme }) => theme.mobile} {
    width: 32px;
    font-size: 12px;
  }
`;

const NoReview = styled.p`
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: 14px;
`;

const ReviewCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  background-color: ${({ theme }) => theme.colors.gray[100]};

  @media ${({ theme }) => theme.mobile} {
    padding: 12px;
    margin-bottom: 12px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;

  @media ${({ theme }) => theme.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

const Reviewer = styled.span`
  color: ${({ theme }) => theme.colors.gray[700]};
  font-weight: bold;

  @media ${({ theme }) => theme.mobile} {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
  }
`;

const DateText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};

  @media ${({ theme }) => theme.mobile} {
    margin-left: 0;
  }
`;

const Rating = styled.div`
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.orange};
  font-weight: 500;
`;

const Content = styled.p`
  line-height: 1.6;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[700]};
  margin: 0;
  white-space: pre-wrap;

  ${({ $isExpanded }) =>
    !$isExpanded &&
    css`
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    `}
`;

const MoreButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0 0 0;
  margin-top: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.gray[700]};
  }
`;
