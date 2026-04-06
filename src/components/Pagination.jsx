import React from 'react';
import styled from 'styled-components';

const generatePageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      '...',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isFirst,
  isLast,
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = generatePageNumbers(currentPage, totalPages);

  return (
    <PaginationContainer>
      <PageButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
      >
        이전
      </PageButton>
      {pages.map((page, index) =>
        typeof page === 'string' ? (
          <Ellipsis key={`ellipsis-${index}`}>...</Ellipsis>
        ) : (
          <PageNumber
            key={page}
            onClick={() => onPageChange(page)}
            className={currentPage === page ? 'active' : ''}
          >
            {page}
          </PageNumber>
        )
      )}
      <PageButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
      >
        다음
      </PageButton>
    </PaginationContainer>
  );
}

export default Pagination;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  margin: 0 4px;
  border: none;
  background-color: ${({ theme }) => theme.colors.gray[200]};
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageNumber = styled.button`
  padding: 8px 12px;
  margin: 0 4px;
  border: none;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  cursor: pointer;
  &.active {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

const Ellipsis = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  color: ${({ theme }) => theme.colors.gray[600]};
`;
