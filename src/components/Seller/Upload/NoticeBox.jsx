import React from 'react';
import styled from 'styled-components';

const NoticeBox = () => {
  return (
    <Wrapper>
      <Title>상품 등록 주의사항</Title>
      <List>
        <li>너무 귀여운 사진은 심장이 아플 수 있습니다.</li>
        <li>유사상품과 차별화되는 포인트를 강조하세요.</li>
        <li>가격, 배송 방법, 재고 수량은 정확히 입력하세요.</li>
        <li>허위 정보를 기재할 경우 등록이 취소될 수 있습니다.</li>
      </List>
    </Wrapper>
  );
};

export default NoticeBox;

const Wrapper = styled.div`
  width: 240px;
  background-color: ${({ theme }) => theme.colors.lightNavy};
  padding: 20px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const Title = styled.h4`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.red};
  margin-bottom: 15px;
`;

const List = styled.ul`
  padding-left: 20px;
  list-style: disc;

  li {
    margin-bottom: 8px;
  }
`;
