import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from '../../api/axios';

function Chatbot({
  messages,
  setMessages,
  isLoading,
  setIsLoading,
  onClose,
  onMinimize,
}) {
  const [input, setInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (isMobile || showModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    };
  }, [showModal]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('/chat/ask', { message: input });
      const botMessage = {
        role: 'bot',
        text: response.data.message || response.data,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: '죄송합니다. 서비스 연결이 원활하지 않습니다.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <p>상담을 종료하시겠습니까?</p>
            <span>종료 시 대화 내용이 모두 초기화됩니다.</span>
            <ModalButtons>
              <CancelButton onClick={() => setShowModal(false)}>
                취소
              </CancelButton>
              <ConfirmButton onClick={onClose}>종료하기</ConfirmButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}

      <ChatHeader>
        <span>Respawn AI 상담원</span>
        <HeaderButtons>
          <CloseButton onClick={() => setShowModal(true)}>종료</CloseButton>
          <XButton onClick={onMinimize}>&times;</XButton>
        </HeaderButtons>
      </ChatHeader>

      <ChatBox ref={scrollRef}>
        {messages.map((msg, index) => (
          <MessageWrapper key={index} isUser={msg.role === 'user'}>
            <div className="sender">
              {msg.role === 'user' ? '나' : 'Respawn'}
            </div>
            <div className="bubble">{msg.text}</div>
          </MessageWrapper>
        ))}
        {isLoading && (
          <MessageWrapper isUser={false}>
            <div className="sender">Respawn</div>
            <TypingIndicator>
              <span></span>
              <span></span>
              <span></span>
            </TypingIndicator>
          </MessageWrapper>
        )}
      </ChatBox>

      <InputArea>
        <ChatInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            isLoading ? '답변을 기다리는 중...' : '문의하실 내용을 입력하세요'
          }
          disabled={isLoading}
        />
        <SendButton onClick={handleSend} disabled={isLoading}>
          전송
        </SendButton>
      </InputArea>
    </Container>
  );
}

export default Chatbot;

const Container = styled.div`
  max-width: 360px;
  width: 100%;
  font-family: 'Noto Sans KR', sans-serif;
  display: flex;
  flex-direction: column;

  @media ${({ theme }) => theme.mobile} {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    max-width: none;
    z-index: 9999;
  }
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 20px;
  border-radius: 12px;
  width: 100%;
  max-width: 280px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  p {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 8px;
    color: ${({ theme }) => theme.colors.gray[900]};
  }

  span {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.gray[600]};
    display: block;
    margin-bottom: 20px;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const ModalBtnBase = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
`;

const CancelButton = styled(ModalBtnBase)`
  background: ${({ theme }) => theme.colors.gray[200]};
  color: ${({ theme }) => theme.colors.gray[700]};
  &:hover {
    background: ${({ theme }) => theme.colors.gray[300]};
  }
`;

const ConfirmButton = styled(ModalBtnBase)`
  background: ${({ theme }) => theme.colors.gray[900]};
  color: ${({ theme }) => theme.colors.white};
  &:hover {
    opacity: 0.9;
  }
`;

const ChatHeader = styled.div`
  background: ${({ theme }) => theme.colors.gray[900]};
  color: ${({ theme }) => theme.colors.white};
  padding: 15px;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.white};
  font-size: 16px;
  cursor: pointer;
  padding: 0 5px;
  line-height: 1;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
`;

const XButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.white};
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
`;

const ChatBox = styled.div`
  height: 400px;
  overflow-y: auto;
  padding: 20px;
  background: ${({ theme }) => theme.colors.gray[100]};
  display: flex;
  flex-direction: column;
  gap: 15px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.gray[600]};
    border-radius: 3px;
  }

  @media ${({ theme }) => theme.mobile} {
    flex: 1;
    height: auto;
  }
`;

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};

  .sender {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 4px;
    color: ${({ theme }) => theme.colors.gray[600]};
  }

  .bubble {
    max-width: 80%;
    padding: 10px 14px;
    font-size: 14px;
    line-height: 1.5;
    border-radius: ${({ isUser }) =>
      isUser ? '15px 0 15px 15px' : '0 15px 15px 15px'};
    background: ${({ isUser, theme }) =>
      isUser ? theme.colors.gray[900] : theme.colors.white};
    color: ${({ isUser, theme }) =>
      isUser ? theme.colors.white : theme.colors.gray[900]};
    border: ${({ isUser, theme }) =>
      isUser ? 'none' : `1px solid ${theme.colors.gray[300]}`};
    white-space: pre-wrap;
  }
`;

const InputArea = styled.div`
  display: flex;
  padding: 15px;
  padding-bottom: calc(15px + env(safe-area-inset-bottom));
  border-top: 1px solid ${({ theme }) => theme.colors.gray[300]};
  background: ${({ theme }) => theme.colors.white};
  flex-shrink: 0;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 15px;
  outline: none;
  font-size: 14px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.gray[900]};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.gray[100]};
  }
`;

const SendButton = styled.button`
  padding: 10px 20px;
  margin-left: 10px;
  background: ${({ theme }) => theme.colors.gray[900]};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.gray[400]};
    cursor: default;
  }
`;

const bounce = keyframes`
  0%, 80%, 100% { 
    transform: scale(0);
    opacity: 0.3;
  } 
  40% { 
    transform: scale(1.0);
    opacity: 1;
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 0 15px 15px 15px;
  width: fit-content;
  margin-top: 5px;

  span {
    width: 6px;
    height: 6px;
    background-color: ${({ theme }) => theme.colors.gray[600]};
    border-radius: 50%;
    display: inline-block;

    animation: ${bounce} 1.4s infinite ease-in-out both;
  }

  span:nth-child(1) {
    animation-delay: -0.32s;
  }

  span:nth-child(2) {
    animation-delay: -0.16s;
  }
`;
