import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const ItemSelector = ({ value, onChange, productList }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 현재 선택된 항목의 이름을 찾습니다.
  // value의 타입(문자열/숫자)이 다를 수 있어 느슨한 비교(==)를 사용하거나 String()으로 맞춥니다.
  const selectedLabel = value
    ? productList.find((p) => String(p.id) === String(value))?.name ||
      '전체 상품'
    : '전체 상품';

  // 드롭다운 바깥 영역을 클릭하면 메뉴가 닫히도록 처리
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <DropdownContainer ref={dropdownRef}>
      {/* 선택된 값을 보여주는 헤더 부분 */}
      <DropdownHeader onClick={() => setIsOpen(!isOpen)} $isOpen={isOpen}>
        <SelectedText>{selectedLabel}</SelectedText>
        <ArrowIcon $isOpen={isOpen}>
          <svg
            width="12"
            height="8"
            viewBox="0 0 14 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L7 7L13 1"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ArrowIcon>
      </DropdownHeader>

      {/* 클릭 시 펼쳐지는 커스텀 목록 부분 */}
      {isOpen && (
        <DropdownList>
          <DropdownItem $isSelected={!value} onClick={() => handleSelect('')}>
            전체 상품
          </DropdownItem>
          {productList.map((p) => (
            <DropdownItem
              key={p.id}
              $isSelected={String(value) === String(p.id)}
              onClick={() => handleSelect(p.id)}
            >
              {p.name}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </DropdownContainer>
  );
};

export default ItemSelector;

// --- 세련된 커스텀 드롭다운 스타일 영역 ---

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
  min-width: 350px;
  font-family:
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    sans-serif;
`;

const DropdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #ffffff;
  border: 1.5px solid ${({ $isOpen }) => ($isOpen ? '#555a82' : '#e2e8f0')};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ $isOpen }) =>
    $isOpen ? '0 0 0 3px rgba(85, 90, 130, 0.1)' : 'none'};

  &:hover {
    border-color: ${({ $isOpen }) => ($isOpen ? '#555a82' : '#cbd5e1')};
  }
`;

const SelectedText = styled.span`
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 12px; /* 화살표와 텍스트 사이 간격 */
`;

const ArrowIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0)')};
`;

const DropdownList = styled.ul`
  position: absolute;
  top: calc(100% + 8px); /* 헤더 바로 8px 아래에 위치 */
  left: 0;
  right: 0;
  margin: 0;
  padding: 8px;
  list-style: none;
  background-color: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  max-height: 260px; /* 항목이 많으면 스크롤 생성 */
  overflow-y: auto;
  z-index: 100; /* 다른 요소들 위로 올라오도록 설정 */

  /* 드롭다운 등장 애니메이션 */
  animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: top center;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px) scaleY(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scaleY(1);
    }
  }

  /* 예쁜 커스텀 스크롤바 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
    margin: 8px 0;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const DropdownItem = styled.li`
  padding: 12px 14px;
  font-size: 14px;
  font-weight: ${({ $isSelected }) => ($isSelected ? '600' : '500')};
  color: ${({ $isSelected }) => ($isSelected ? '#555a82' : '#334155')};
  background-color: ${({ $isSelected }) =>
    $isSelected ? '#f0f2f8' : 'transparent'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:not(:last-child) {
    margin-bottom: 2px;
  }

  /* 마우스 오버 시 부드러운 회색 배경 */
  &:hover {
    background-color: ${({ $isSelected }) =>
      $isSelected ? '#e6e8f4' : '#f8fafc'};
  }
`;
