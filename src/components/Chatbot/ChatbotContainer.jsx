import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Chatbot from './Chatbot';

function ChatbotContainer() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  if (location.pathname !== '/') {
    return null;
  }

  return (
    <FloatingWrapper>
      {isOpen && (
        <ChatbotWindow>
          <Chatbot />
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
`;

const ToggleButton = styled.button`
  width: ${(props) => (props.isOpen ? '50px' : '150px')};
  height: 50px;
  border-radius: 25px;
  background: #222;
  color: #fff;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    background: #444;
  }
`;
