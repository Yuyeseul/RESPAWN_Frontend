import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  background: #fafafa;
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  /* 다른 화면과 동일하게 모바일에서 내용을 상단으로 끌어올림 */
  @media (max-width: 768px) {
    justify-content: flex-start;
    padding-top: 80px;
  }
`;

export const LogoWrapper = styled.div`
  margin-bottom: 40px;

  & > div img {
    height: 70px;
    object-fit: contain;
  }
`;

export const ResultContainer = styled.div`
  background: #fff;
  width: 100%;
  max-width: 560px;
  border-radius: 12px;
  padding: 40px 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;

  /* 모바일 화면일 때 박스 형태 제거 및 넉넉한 양쪽 여백(40px) 추가 */
  @media (max-width: 768px) {
    background: transparent;
    box-shadow: none;
    border: none;
    padding: 20px 40px;
  }
`;

export const SuccessText = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: rgb(105, 111, 148);
  text-align: center;
  line-height: 1.4;
  margin-bottom: 20px;
`;

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
`;

export const BackButton = styled.button`
  background: rgba(105, 111, 148, 0.1);
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  color: rgb(105, 111, 148);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(105, 111, 148, 0.2);
  }
  &:focus {
    outline: none;
  }
`;
