import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const SearchFilter = ({
  categories,
  selectedCategories,
  onCategoryChange,
  companies = [],
  selectedCompanies = [],
  onCompanyChange,
  deliveryTypeMethods = [],
  selectedDeliveryType = '',
  onDeliveryTypeChange,
  minPrice,
  maxPrice,
  onPriceChange,
  onReset,
  onApplyAll,
}) => {
  const [isDesktop, setIsDesktop] = useState(
    window.matchMedia('(min-width: 769px)').matches
  );
  const [tempCategories, setTempCategories] = useState(selectedCategories);
  const [tempCompanies, setTempCompanies] = useState(selectedCompanies);
  const [tempDelivery, setTempDelivery] = useState(selectedDeliveryType);
  const [localMin, setLocalMin] = useState(minPrice ?? '');
  const [localMax, setLocalMax] = useState(maxPrice ?? '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 769px)');

    const handleChange = (e) => {
      setIsDesktop(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    setTempCategories(selectedCategories);
    setTempCompanies(selectedCompanies);
    setTempDelivery(selectedDeliveryType);
    setLocalMin(minPrice ?? '');
    setLocalMax(maxPrice ?? '');

    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [
    isModalOpen,
    selectedCategories,
    selectedCompanies,
    selectedDeliveryType,
    minPrice,
    maxPrice,
  ]);

  const handleCategoryToggle = (id) => {
    const next = tempCategories.includes(id)
      ? tempCategories.filter((c) => c !== id)
      : [...tempCategories, id];

    setTempCategories(next);
    if (isDesktop) onCategoryChange?.(id);
  };

  const handleCompanyToggle = (id) => {
    const next = tempCompanies.includes(id)
      ? tempCompanies.filter((co) => co !== id)
      : [...tempCompanies, id];

    setTempCompanies(next);
    if (isDesktop) onCompanyChange?.(id);
  };

  const handleDeliveryChange = (id) => {
    setTempDelivery(id);
    if (isDesktop) onDeliveryTypeChange?.(id);
  };

  const handleMobileApply = () => {
    onApplyAll?.({
      categories: tempCategories,
      companies: tempCompanies,
      delivery: tempDelivery,
      price: { min: localMin, max: localMax },
    });
    setIsModalOpen(false);
  };

  const handleLocalReset = () => {
    if (isDesktop) {
      onReset?.();
    } else {
      setTempCategories([]);
      setTempCompanies([]);
      setTempDelivery('');
      setLocalMin('');
      setLocalMax('');
    }
  };

  return (
    <>
      <MobileFilterButton onClick={() => setIsModalOpen(true)}>
        상세 필터
      </MobileFilterButton>

      <FilterBar $isOpen={isModalOpen}>
        <BarHeader>
          <BarTitle>상세 검색</BarTitle>
          <BarActions>
            <TextButton type="button" onClick={handleLocalReset}>
              초기화
            </TextButton>
            <MobileCloseIcon onClick={() => setIsModalOpen(false)}>
              ✕
            </MobileCloseIcon>
          </BarActions>
        </BarHeader>

        <BarBody>
          <Group>
            <Label>카테고리</Label>
            <CheckGrid>
              {categories.map((c) => (
                <CheckItem key={c.id}>
                  <input
                    id={`cat-${c.id}`}
                    type="checkbox"
                    checked={tempCategories.includes(c.id)}
                    onChange={() => handleCategoryToggle(c.id)}
                  />
                  <label htmlFor={`cat-${c.id}`}>{c.name}</label>
                </CheckItem>
              ))}
            </CheckGrid>
          </Group>

          <Group>
            <Label>제조사</Label>
            <CheckGrid>
              {companies.map((co) => (
                <CheckItem key={co.id}>
                  <input
                    id={`co-${co.id}`}
                    type="checkbox"
                    checked={tempCompanies.includes(co.id)}
                    onChange={() => handleCompanyToggle(co.id)}
                  />
                  <label htmlFor={`co-${co.id}`}>{co.name}</label>
                </CheckItem>
              ))}
            </CheckGrid>
          </Group>

          <Group>
            <Label>배송</Label>
            <RadioRow>
              {deliveryTypeMethods.map((m) => (
                <RadioItem key={m.id}>
                  <input
                    id={`ship-${m.id}`}
                    type="radio"
                    name="delivery"
                    checked={tempDelivery === m.id}
                    onChange={() => handleDeliveryChange(m.id)}
                  />
                  <label htmlFor={`ship-${m.id}`}>{m.name}</label>
                </RadioItem>
              ))}
            </RadioRow>
          </Group>

          <InlineRow>
            <Group>
              <Label>가격</Label>
              <PriceRow>
                <Input
                  type="number"
                  placeholder="최소"
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                />
                <Dash>~</Dash>
                <Input
                  type="number"
                  placeholder="최대"
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                />
                {!isModalOpen && (
                  <ApplyButton
                    type="button"
                    onClick={() =>
                      onPriceChange?.({ min: localMin, max: localMax })
                    }
                  >
                    적용
                  </ApplyButton>
                )}
              </PriceRow>
            </Group>
          </InlineRow>
        </BarBody>

        <MobileApplyArea>
          <FullApplyButton onClick={handleMobileApply}>
            결과 보기
          </FullApplyButton>
        </MobileApplyArea>
      </FilterBar>

      {isModalOpen && <Overlay onClick={() => setIsModalOpen(false)} />}
    </>
  );
};

export default SearchFilter;

const FilterBar = styled.section`
  position: relative;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 12px;
  padding: 20px;
  z-index: 10;

  @media ${({ theme }) => theme.mobile} {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    z-index: 1000;
    border-radius: 20px 20px 0 0;
    border: none;
    padding: 24px 20px 100px;
    transform: ${({ $isOpen }) =>
      $isOpen ? 'translateY(0)' : 'translateY(100%)'};
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 85vh;
    overflow-y: auto;
  }
`;

const MobileFilterButton = styled.button`
  display: none;
  @media ${({ theme }) => theme.mobile} {
    display: block;
    width: 100%;
    padding: 12px;
    background: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.primary};
    border: 1px solid ${({ theme }) => theme.colors.primary};
    border-radius: 8px;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
  }
`;

const Overlay = styled.div`
  display: none;
  @media ${({ theme }) => theme.mobile} {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    z-index: 999;
  }
`;

const BarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const BarTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
`;

const BarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TextButton = styled.button`
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.gray[600]};
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: ${({ theme }) => theme.colors.gray[100]};
  }
`;

const MobileCloseIcon = styled.button`
  display: none;
  @media ${({ theme }) => theme.mobile} {
    display: block;
    background: none;
    border: none;
    font-size: 20px;
    color: ${({ theme }) => theme.colors.gray[600]};
  }
`;

const BarBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 12px;
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};

  &:last-of-type {
    border-bottom: none;
  }
`;

const Label = styled.div`
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.2px;
`;

const CheckGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px 14px;

  @media ${({ theme }) => theme.mobile} {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px 10px;
  }
`;

const CheckItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  input[type='checkbox'] {
    accent-color: ${({ theme }) => theme.colors.primary};
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
  label {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.gray[800]};
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const RadioRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
`;

const RadioItem = styled.div`
  input[type='radio'] {
    display: none;
  }

  label {
    display: inline-block;
    padding: 8px 16px;
    font-size: 14px;
    border: 1px solid ${({ theme }) => theme.colors.gray[300]};
    border-radius: 20px;
    background: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.gray[700]};
    cursor: pointer;
    transition: all 0.2s ease;
  }

  input[type='radio']:checked + label {
    background: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    font-weight: 600;
  }

  &:hover label {
    background: ${({ theme }) => theme.colors.gray[100]};
  }
`;

const InlineRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: flex-end;
  flex-wrap: wrap;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media ${({ theme }) => theme.mobile} {
    flex-wrap: wrap;
  }
`;

const Dash = styled.span`
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const Input = styled.input`
  flex: 1;
  min-width: 80px;
  height: 38px;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 8px;
  outline: none;
  font-size: 14px;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.secondary};
    box-shadow: 0 0 0 3px rgba(105, 111, 148, 0.1);
  }

  @media ${({ theme }) => theme.mobile} {
    max-width: calc(50% - 20px);
  }
`;

const ApplyButton = styled.button`
  padding: 8px 16px;
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const MobileApplyArea = styled.div`
  display: none;
  @media ${({ theme }) => theme.mobile} {
    display: block;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px 20px 30px;
    background: linear-gradient(
      to top,
      rgba(255, 255, 255, 1) 80%,
      rgba(255, 255, 255, 0)
    );
  }
`;

const FullApplyButton = styled.button`
  width: 100%;
  height: 50px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
`;
