import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const CartConfirmModal = ({ isOpen, onClose, productName }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <IconCircle>✓</IconCircle>

        <ModalBody>
          <div className="title">장바구니에 담았습니다</div>
          <div className="desc">
            <strong>{productName}</strong> 상품이 담겼습니다.
            <br />
            지금 확인하시겠습니까?
          </div>
        </ModalBody>

        <ModalFooter>
          <OutlineButton onClick={onClose}>쇼핑 계속하기</OutlineButton>
          <PrimaryButton onClick={() => navigate('/cart')}>
            장바구니 이동
          </PrimaryButton>
        </ModalFooter>
      </ModalContainer>
    </ModalBackdrop>
  );
};

export default CartConfirmModal;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 20px;
  width: 100%;
  max-width: 380px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 30px;

  @media ${({ theme }) => theme.mobile} {
    max-width: none;
    border-radius: 24px 24px 0 0;
    position: fixed;
    bottom: 0;
  }
`;

const IconCircle = styled.div`
  width: 60px;
  height: 60px;
  background: ${({ theme }) => theme.colors.lightNavy};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 30px;
`;

const ModalBody = styled.div`
  padding: 0 24px 30px;
  text-align: center;

  .title {
    font-size: 20px;
    font-weight: 800;
    margin-bottom: 8px;
    color: ${({ theme }) => theme.colors.gray[800]};
  }

  .desc {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.gray[600]};
    line-height: 1.6;
    word-break: keep-all;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  width: 100%;
  padding: 16px 20px 20px;
  gap: 12px;

  @media ${({ theme }) => theme.mobile} {
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
  }
`;

const OutlineButton = styled.button`
  flex: 1;
  height: 54px;
  background: ${({ theme }) => theme.colors.gray[100]};
  color: ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.gray[200]};
  }
`;

const PrimaryButton = styled.button`
  flex: 1;
  height: 54px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;
