import React, { useState } from 'react';
import styled from 'styled-components';
import Logo from '../../components/common/Logo';

const FindIdResultStep = ({ idList, onNext, onPrev }) => {
  const [selectedId, setSelectedId] = useState(null);

  const handleConfirm = () => {
    if (!selectedId) {
      alert('아이디를 선택해주세요.');
      return;
    }
    const user = idList.find((u) => u.id === selectedId);
    if (user) onNext({ id: user });
  };

  return (
    <ResultContainer>
      <LogoWrapper>
        <Logo />
      </LogoWrapper>
      <ResultBox>
        <Title>아이디 찾기</Title>
        <Content>입력하신 정보와 일치하는 아이디입니다.</Content>
        <SubContent>
          아이디 찾기를 진행하시려면 확인 버튼을 클릭해 주세요.
        </SubContent>
        <ListWrapper>
          {idList.map((user) => (
            <IdRow key={user.id}>
              <Radio
                type="radio"
                name="userId"
                checked={selectedId === user.id}
                onChange={() => setSelectedId(user.id)}
              />
              <IdText title={user.username}>{user.username}</IdText>
            </IdRow>
          ))}
        </ListWrapper>
        <ButtonWrapper>
          <BackButton onClick={onPrev}>이전</BackButton>
          <ConfirmButton onClick={handleConfirm}>확인</ConfirmButton>
        </ButtonWrapper>
      </ResultBox>
    </ResultContainer>
  );
};

export default FindIdResultStep;

const ResultContainer = styled.div`
  min-height: 100vh;
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => theme.colors.gray[50]};

  @media ${({ theme }) => theme.mobile} {
    justify-content: flex-start;
    padding-top: 80px;
  }
`;

const LogoWrapper = styled.div`
  width: 100%;
  max-width: 460px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;

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

const ResultBox = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 40px 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
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

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  margin-bottom: 18px;
  text-align: center;
`;

const Content = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[700]};
  text-align: center;

  @media ${({ theme }) => theme.mobile} {
    font-size: 16px;
  }
`;

const SubContent = styled.h3`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: 28px;
  text-align: center;

  @media ${({ theme }) => theme.mobile} {
    font-size: 12px;
  }
`;

const ListWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
`;

const IdRow = styled.label`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.gray[50]};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 8px;
`;

const Radio = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  flex-shrink: 0;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

const IdText = styled.span`
  display: inline-block;
  width: 220px;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[800]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media ${({ theme }) => theme.mobile} {
    width: 100%;
    flex: 1;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(105, 111, 148, 0.15);
  }
`;

const ConfirmButton = styled.button`
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  padding: 8px 26px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;
