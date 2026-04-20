import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.gray[50]};
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const LogoWrapper = styled.div`
  margin-bottom: 40px;

  & > div img {
    height: 80px;
    object-fit: contain;
    transition: height 0.2s ease;

    @media ${({ theme }) => theme.mobile} {
      height: 56px;
    }
  }

  @media ${({ theme }) => theme.mobile} {
    margin-top: 35px;
    margin-bottom: 30px;
  }
`;

export const ResultContainer = styled.div`
  background: ${({ theme }) => theme.colors.white};
  width: 100%;
  max-width: 560px;
  border-radius: 12px;
  padding: 40px 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;

  @media ${({ theme }) => theme.mobile} {
    background: transparent;
    box-shadow: none;
    border: none;
    padding: 20px 40px;
  }
`;

export const SuccessText = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.secondary};
  text-align: center;
  line-height: 1.4;
  margin-bottom: 20px;

  line-height: 1.6;
  word-break: keep-all;
  white-space: pre-line;

  @media ${({ theme }) => theme.mobile} {
    font-size: 16px;
    margin-bottom: 30px;
  }
`;

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;

  @media ${({ theme }) => theme.mobile} {
    justify-content: center;
  }
`;

export const BackButton = styled.button`
  background: rgba(105, 111, 148, 0.1);
  border: none;
  padding: 12px 26px;
  border-radius: 8px;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.lightNavy};
  }

  @media ${({ theme }) => theme.mobile} {
    width: 100%;
    padding: 14px 0;
  }
`;
