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
}) => {
  const [localMin, setLocalMin] = useState(minPrice ?? '');
  const [localMax, setLocalMax] = useState(maxPrice ?? '');

  useEffect(() => {
    setLocalMin(minPrice ?? '');
    setLocalMax(maxPrice ?? '');
  }, [minPrice, maxPrice]);

  const handleApplyPrice = () => {
    onPriceChange?.({ min: localMin, max: localMax });
  };

  return (
    <FilterBar>
      <BarHeader>
        <BarTitle>상세 검색</BarTitle>
        <BarActions>
          <TextButton type="button" onClick={onReset}>
            초기화
          </TextButton>
        </BarActions>
      </BarHeader>

      <BarBody>
        {/* 카테고리 */}
        <Group>
          <Label>카테고리</Label>
          <CheckGrid>
            {categories.map((c) => (
              <CheckItem key={c.id}>
                <input
                  id={`cat-${c.id}`}
                  type="checkbox"
                  checked={selectedCategories.includes(c.id)}
                  onChange={() => onCategoryChange?.(c.id)}
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
                  checked={selectedCompanies.includes(co.id)}
                  onChange={() => onCompanyChange?.(co.id)}
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
                  checked={selectedDeliveryType === m.id}
                  onChange={() => onDeliveryTypeChange?.(m.id)}
                />
                <label htmlFor={`ship-${m.id}`}>{m.name}</label>
              </RadioItem>
            ))}
          </RadioRow>
        </Group>

        <InlineRow>
          <Group small grow>
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
              <ApplyButton type="button" onClick={handleApplyPrice}>
                적용
              </ApplyButton>
            </PriceRow>
          </Group>
        </InlineRow>
      </BarBody>
    </FilterBar>
  );
};

export default SearchFilter;

const FilterBar = styled.section`
  position: sticky;
  z-index: 5;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  padding: 16px 18px;
`;

const BarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f1f1;
`;

const BarTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.2px;
`;

const BarActions = styled.div`
  display: flex;
  gap: 8px;
`;

const TextButton = styled.button`
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: #6b7280;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: #f5f6f8;
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
  border-bottom: 1px solid #f0f2f5;

  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
  }

  ${(p) => p.small && `gap: 8px;`}
  ${(p) => p.grow && `flex: 1 1 auto;`}
`;

const Label = styled.div`
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.2px;
`;

const CheckGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, minmax(140px, 1fr));
  gap: 8px 14px;
`;

const CheckItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  input[type='checkbox'] {
    accent-color: rgb(85, 90, 130);
    width: 16px;
    height: 16px;
  }
  label {
    cursor: pointer;
    color: #111827;
    font-size: 14px;
  }
`;

const RadioRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
`;

const RadioItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  input[type='radio'] {
    accent-color: rgb(85, 90, 130);
    width: 16px;
    height: 16px;
  }
  label {
    cursor: pointer;
    font-size: 14px;
    color: #111827;
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
`;

const Dash = styled.span`
  color: #9ca3af;
`;

const Input = styled.input`
  width: 220px;
  max-width: 100%;
  height: 38px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
  background: #fff;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    background 0.15s;

  &:hover {
    border-color: #d1d5db;
  }
  &:focus {
    border-color: rgb(105, 111, 148);
    box-shadow: 0 0 0 3px rgba(105, 111, 148, 0.12);
  }
  &::placeholder {
    color: #9ca3af;
  }
`;

const ApplyButton = styled.button`
  padding: 8px 16px;
  background: rgb(105, 111, 148);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    background: rgb(85, 90, 130);
  }
`;
