import React from 'react';
import styled from 'styled-components';

const GuideList = () => {
  return (
    <Stack>
      <StackBtn>
        <div className="label">반품/교환 가이드</div>
      </StackBtn>
      <StackBtn>
        <div className="label">세금계산서 발급 안내</div>
      </StackBtn>
      <StackBtn>
        <div className="label">A/S 접수 절차</div>
      </StackBtn>
    </Stack>
  );
};

const GuidesTab = () => {
  return <GuideList />;
};

export default GuidesTab;

const StackBtn = styled.button`
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  align-items: center;
  text-align: left;
  cursor: pointer;
  width: 100%;
  .label {
    font-weight: 600;
  }
`;

const Stack = styled.div`
  display: grid;
  gap: 10px;
`;
