import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background: #fafafa;
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
  color: rgb(105, 111, 148);
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(105, 111, 148, 0.15);
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
    height: 70px;
    object-fit: contain;
  }
`;

export const Box = styled.form`
  background: white;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;

  /* 모바일 버전에서 박스 외형 지우기 + 양쪽 여백 살리기 */
  @media (max-width: 768px) {
    background: transparent;
    box-shadow: none;
    border: none;
    padding: 20px 30px;
  }
`;

export const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 28px;
  text-align: center;
`;

export const TabWrapper = styled.div`
  display: flex;
  border-bottom: 2px solid #ddd;
  margin-bottom: 24px;
`;

export const Tab = styled.button.attrs({ type: 'button' })`
  flex: 1;
  background: none;
  border: none;
  padding: 14px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => (props.isActive ? 'rgb(105, 111, 148)' : '#888')};
  border-bottom: ${(props) =>
    props.isActive ? '2px solid rgb(105, 111, 148)' : '2px solid transparent'};
  cursor: pointer;
  transition:
    color 0.25s ease,
    border-bottom 0.25s ease;

  &:hover {
    color: rgb(105, 111, 148);
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
  color: #444;
  display: flex;
  align-items: center;
  gap: 6px;

  input {
    accent-color: rgb(105, 111, 148);
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
  color: #555;
`;

export const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 12px 14px;
  font-size: 16px;
  border: none;
  border-bottom: 1px solid #ccc;
  background: transparent;

  &:focus {
    outline: none;
    border-bottom: 2px solid rgb(105, 111, 148);
  }

  &::placeholder {
    color: #a3a9c1;
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  height: 48px;
  background: rgb(105, 111, 148);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.25s ease;
  margin-top: 4px;

  &:hover {
    background: rgb(85, 90, 130);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const Message = styled.p`
  color: #d93025;
  font-size: 14px;
  margin-top: 8px;
  text-align: center;
  font-weight: 600;
`;
