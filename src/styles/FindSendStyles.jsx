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

export const Card = styled.div`
  background: #fff;
  width: 100%;
  max-width: 560px;
  border-radius: 12px;
  padding: 40px 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;

  /* 모바일 화면일 때 박스 형태 제거 및 양쪽 여백 추가 */
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
  margin-bottom: 30px;
  text-align: center;
`;

export const ErrorMsg = styled.p`
  color: #e53e3e;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
`;

export const SendOptions = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 35px;
`;

export const Option = styled.div`
  display: flex;
  align-items: center;
  background: #fafafa;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px 20px;
  gap: 20px;
`;

export const OptionLabel = styled.span`
  flex: 0 0 140px;
  font-weight: 600;
  color: #555;

  /* 모바일에서 라벨이 차지하는 영역을 살짝 줄여서 값(Value) 공간 확보 */
  @media (max-width: 768px) {
    flex: 0 0 100px;
  }
`;

export const OptionValue = styled.span`
  flex: 1;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SendButton = styled.button`
  background: rgb(105, 111, 148);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.25s ease;
  min-width: 100px;

  &:hover:enabled {
    background: rgb(85, 90, 130);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

export const ButtonRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

export const BackButton = styled.button`
  background: rgba(105, 111, 148, 0.1);
  border: none;
  padding: 12px 26px;
  border-radius: 8px;
  font-size: 15px;
  color: rgb(105, 111, 148);
  font-weight: 700;
  cursor: pointer;

  &:hover:enabled {
    background: rgba(105, 111, 148, 0.2);
  }

  &:disabled {
    background: #eee;
    cursor: not-allowed;
  }
`;

// 선택: FindIdSendStep에서만 쓰는 경우
export const UserInfo = styled.div`
  width: 100%;
  display: flex;
  margin-bottom: 30px;
`;

export const Label = styled.span`
  flex: 0 0 70px;
  font-weight: 600;
  color: #666;
`;

export const Value = styled.span`
  flex: 1;
  font-weight: 600;
  color: #333;
`;
