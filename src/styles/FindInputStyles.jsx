import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background: ${({ theme }) => theme.colors.gray[50]};
`;

export const TopBar = styled.div`
  width: 100%;
  max-width: 480px;
  padding: 10px 0 5px 10px;
  display: flex;
  align-items: center;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.gray[200]};
  }
`;

export const LogoWrapper = styled.div`
  width: 100%;
  max-width: 460px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  margin-top: 20px;
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
    margin-top: 27px;
    margin-bottom: 30px;
  }
`;

export const Box = styled.form`
  background: white;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  display: flex;
  flex-direction: column;

  /* 모바일 버전에서 박스 외형 지우기 + 양쪽 여백 살리기 */
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
  margin-bottom: 28px;
  text-align: center;
`;

export const TabWrapper = styled.div`
  display: flex;
  border-bottom: 2px solid ${({ theme }) => theme.colors.gray[300]};
  margin-bottom: 24px;
`;

export const Tab = styled.button.attrs({ type: 'button' })`
  flex: 1;
  background: none;
  border: none;
  padding: 14px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${(props) =>
    props.isActive
      ? props.theme.colors.secondary
      : props.theme.colors.gray[550]};
  border-bottom: ${(props) =>
    props.isActive
      ? `2px solid ${props.theme.colors.secondary}`
      : '2px solid transparent'};
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

export const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;

export const RadioLabel = styled.label`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[700]};
  display: flex;
  align-items: center;
  gap: 6px;

  input {
    accent-color: ${({ theme }) => theme.colors.secondary};
  }
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

export const Label = styled.label`
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.gray[600]};
`;

export const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 12px 14px;
  font-size: 16px;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[300]};
  background: transparent;

  &:focus {
    outline: none;
    border-bottom: 2px solid ${({ theme }) => theme.colors.secondary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[600]};
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  height: 48px;
  background: ${({ theme }) => theme.colors.secondary};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.25s ease;
  margin-top: 4px;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const Message = styled.p`
  color: ${({ theme }) => theme.colors.red};
  font-size: 14px;
  margin-top: 8px;
  text-align: center;
  font-weight: 600;
`;
