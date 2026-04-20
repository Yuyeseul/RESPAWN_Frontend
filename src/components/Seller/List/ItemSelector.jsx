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
  background-color: ${({ theme: { colors } }) => colors.white};
  border: 1.5px solid
    ${({ $isOpen, theme: { colors } }) =>
      $isOpen ? colors.primary : colors.gray[200]};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ $isOpen, theme: { colors } }) =>
    $isOpen ? `0 0 0 3px ${colors.primary_alpha}` : 'none'};

  &:hover {
    border-color: ${({ $isOpen, theme: { colors } }) =>
      $isOpen ? colors.primary : colors.gray[300]};
  }
`;

const SelectedText = styled.span`
  color: ${({ theme: { colors } }) => colors.gray[900]};
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 12px;
`;

const ArrowIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme: { colors } }) => colors.gray[600]};
  transition: transform 0.3s ease;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0)')};
`;

const DropdownList = styled.ul`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 8px;
  list-style: none;
  background-color: ${({ theme: { colors } }) => colors.white};
  border: 1px solid ${({ theme: { colors } }) => colors.gray[100]};
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  max-height: 260px;
  overflow-y: auto;
  z-index: 100;
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

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
    margin: 8px 0;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme: { colors } }) => colors.gray[300]};
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme: { colors } }) => colors.gray[500]};
  }
`;

const DropdownItem = styled.li`
  padding: 12px 14px;
  font-size: 14px;
  font-weight: ${({ $isSelected }) => ($isSelected ? '600' : '500')};
  color: ${({ $isSelected, theme: { colors } }) =>
    $isSelected ? colors.primary : colors.gray[700]};
  background-color: ${({ $isSelected, theme: { colors } }) =>
    $isSelected ? colors.primary_light : 'transparent'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:not(:last-child) {
    margin-bottom: 2px;
  }
  &:hover {
    background-color: ${({ $isSelected, theme: { colors } }) =>
      $isSelected ? colors.primary_hover : colors.gray[50]};
  }
`;
