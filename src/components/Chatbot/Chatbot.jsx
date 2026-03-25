import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from '../../api/axios';

function Chatbot({ messages, setMessages, isLoading, setIsLoading, onClose }) {
  const [input, setInput] = useState('');
  const scrollRef = useRef();

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
      <ChatHeader>
        <span>Respawn AI 상담원</span>
        <CloseButton onClick={onClose}>종료</CloseButton>
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
  font-family: 'Noto Sans KR', sans-serif;
  display: flex;
  flex-direction: column;
`;

const ChatHeader = styled.div`
  background: #222;
  color: #fff;
  padding: 15px;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  padding: 0 5px;
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
  background: #f4f4f4;
  display: flex;
  flex-direction: column;
  gap: 15px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
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
    color: #555;
  }

  .bubble {
    max-width: 80%;
    padding: 10px 14px;
    font-size: 14px;
    line-height: 1.5;
    border-radius: ${(props) =>
      props.isUser ? '15px 0 15px 15px' : '0 15px 15px 15px'};
    background: ${(props) => (props.isUser ? '#222' : '#fff')};
    color: ${(props) => (props.isUser ? '#fff' : '#222')};
    border: ${(props) => (props.isUser ? 'none' : '1px solid #ddd')};
    white-space: pre-wrap;
  }
`;

const InputArea = styled.div`
  display: flex;
  padding: 15px;
  border-top: 1px solid #ccc;
  background: #fff;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 15px;
  outline: none;
  font-size: 14px;

  &:focus {
    border-color: #222;
  }

  &:disabled {
    background: #f9f9f9;
  }
`;

const SendButton = styled.button`
  padding: 10px 20px;
  margin-left: 10px;
  background: #222;
  color: #fff;
  border: none;
  border-radius: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    background: #ccc;
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
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 0 15px 15px 15px;
  width: fit-content;
  margin-top: 5px;

  span {
    width: 6px;
    height: 6px;
    background-color: #aaa;
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
