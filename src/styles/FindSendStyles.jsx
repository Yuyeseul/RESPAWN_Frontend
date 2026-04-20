import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.gray[50]};
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @media ${({ theme }) => theme.mobile} {
    justify-content: flex-start;
    padding-top: 80px;
  }
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

export const Card = styled.div`
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
    padding: 20px 30px;
  }
`;

export const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  margin-bottom: 30px;
  text-align: center;
`;

export const ErrorMsg = styled.p`
  color: ${({ theme }) => theme.colors.red};
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;

  line-height: 1.5;
  word-break: keep-all;
  white-space: pre-line;

  @media ${({ theme }) => theme.mobile} {
    font-size: 14px;
    max-width: 100%;
  }
`;

export const SendOptions = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 35px;
`;

export const Option = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.gray[50]};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 8px;
  padding: 15px 20px;
  gap: 16px;

  @media ${({ theme }) => theme.mobile} {
    padding: 12px 16px;
    flex-wrap: wrap;
  }
`;

export const OptionLabel = styled.span`
  flex: 0 0 140px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[700]};
  font-size: 16px;

  @media ${({ theme }) => theme.mobile} {
    flex: 1 1 100%;
    font-size: 14px;
  }
`;

export const OptionValue = styled.span`
  flex: 1;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[800]};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media ${({ theme }) => theme.mobile} {
    font-size: 14px;
  }
`;

export const SendButton = styled.button`
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.25s ease;
  min-width: 100px;

  &:hover:enabled {
    background: ${({ theme }) => theme.colors.primary};
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 8px 14px;
    font-size: 13px;
  }
`;

export const ButtonRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;

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

  @media ${({ theme }) => theme.mobile} {
    width: 100%;
    max-width: 320px;
    padding: 14px 0;
  }
`;
