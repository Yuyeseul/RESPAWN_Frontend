import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Chatbot from './Chatbot';

function ChatbotContainer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: '안녕하세요! Respawn 입니다. 무엇을 도와드릴까요?',
    },
  ]);

  const initialMessage = [
    { role: 'bot', text: '안녕하세요! Respawn 입니다. 무엇을 도와드릴까요?' },
  ];

  const handleCloseAndReset = () => {
    setIsOpen(false);
    setMessages(initialMessage);
    setIsLoading(false);
  };

  const handleJustClose = () => {
    setIsOpen(false);
  };

  if (location.pathname !== '/') {
    return null;
  }

  return (
    <FloatingWrapper>
      {isOpen && (
        <ChatbotWindow>
          <Chatbot
            messages={messages}
            setMessages={setMessages}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            onClose={handleCloseAndReset}
            onMinimize={handleJustClose}
          />
        </ChatbotWindow>
      )}
      <ToggleButton onClick={() => setIsOpen(!isOpen)} isOpen={isOpen}>
        {isOpen ? '✕' : '💬 Respawn 상담'}
      </ToggleButton>
    </FloatingWrapper>
  );
}

export default ChatbotContainer;

const FloatingWrapper = styled.div`
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const ChatbotWindow = styled.div`
  margin-bottom: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  overflow: hidden;

  @media ${({ theme }) => theme.mobile} {
    margin-bottom: 0;
    border-radius: 0;
    width: 100vw;
    height: 100vh;
    max-width: none; /* 부모에서도 max-width가 있다면 해제 */
  }
`;

const ToggleButton = styled.button`
  width: ${(props) => (props.isOpen ? '50px' : '150px')};
  height: 50px;
  border-radius: 25px;
  background: ${({ theme }) => theme.colors.gray[900]};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;
