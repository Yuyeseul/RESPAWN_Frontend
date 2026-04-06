import React from 'react';
import styled from 'styled-components';

const StepProgress = ({ currentStep }) => {
  const steps = [
    { id: 1, label: '장바구니' },
    { id: 2, label: '주문/결제' },
    { id: 3, label: '주문완료' },
  ];

  return (
    <StepsContainer>
      {steps.map((step, index) => (
        <Step key={step.id} active={currentStep === step.id}>
          <StepNumber active={currentStep === step.id}>
            {String(step.id).padStart(2, '0')}
          </StepNumber>
          <StepLabel active={currentStep === step.id}>{step.label}</StepLabel>
          {index < steps.length - 1 && <Separator>›</Separator>}
        </Step>
      ))}
    </StepsContainer>
  );
};

export default StepProgress;

const StepsContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;

  @media ${({ theme }) => theme.mobile} {
    font-size: 12px;
  }
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.gray[600]};
  font-weight: ${({ active }) => (active ? '700' : '400')};
`;

const StepNumber = styled.span`
  margin-right: 4px;
  color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.gray[400]};
  font-weight: 700;
`;

const StepLabel = styled.span`
  margin-right: 6px;
`;

const Separator = styled.span`
  margin-right: 6px;
  color: ${({ theme }) => theme.colors.gray[300]};
`;
