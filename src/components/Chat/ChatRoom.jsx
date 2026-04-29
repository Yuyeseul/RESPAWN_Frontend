import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from '../../api/axios';
import styled from 'styled-components';
import { useAuth } from '../../AuthContext';

const ChatRoom = ({ roomId, onRead, onBack }) => {
  const { user } = useAuth();
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const chatWindowRef = useRef(null);
  const socketUrl = `${process.env.REACT_APP_API_URL}/ws/chat`;

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  const markMessagesAsRead = useCallback(async () => {
    try {
      await axios.patch(`/chat/room/${roomId}/read`);
      if (onRead) onRead();

      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: `/app/chat/send/${roomId}`,
          body: JSON.stringify({
            type: 'READ',
            senderId: user?.username,
          }),
        });
      }
    } catch (error) {
      console.error('메시지 읽음 처리 실패:', error);
    }
  }, [roomId, onRead, stompClient, user?.username]);

  useEffect(() => {
    if (!roomId) return;
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`/chat/room/${roomId}/messages`);
        setMessages(response.data);
        markMessagesAsRead();
      } catch (error) {
        console.error('이전 대화 내역 로딩 실패', error);
      }
    };
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    const socket = new SockJS(socketUrl, null, {
      transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
    });
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        client.subscribe(`/topic/chat/${roomId}`, (message) => {
          const receivedMessage = JSON.parse(message.body);

          if (receivedMessage.type === 'READ') {
            if (receivedMessage.senderId !== user?.username) {
              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.senderId === user?.username
                    ? { ...msg, isRead: true, read: true }
                    : msg
                )
              );
            }
          } else {
            setMessages((prevMessages) => [...prevMessages, receivedMessage]);
            if (receivedMessage.senderId !== user?.username) {
              markMessagesAsRead();
            }
          }
        });

        client.publish({
          destination: `/app/chat/send/${roomId}`,
          body: JSON.stringify({
            content: '님이 입장하셨습니다.',
            type: 'JOIN',
          }),
        });
        client.publish({
          destination: `/app/chat/send/${roomId}`,
          body: JSON.stringify({
            type: 'READ',
            senderId: user?.username,
          }),
        });
      },
      onStompError: (frame) => {
        console.error('Broker error:', frame.headers['message']);
      },
      onWebSocketClose: (event) => {
        if (event.code !== 1000) alert('로그인이 필요한 서비스입니다.');
      },
    });
    client.activate();
    setStompClient(client);

    return () => {
      if (client) client.deactivate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketUrl, roomId, user?.username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (stompClient && stompClient.connected && inputMessage.trim()) {
      const chatMessage = {
        sender: '',
        content: inputMessage,
        type: 'CHAT',
      };
      stompClient.publish({
        destination: `/app/chat/send/${roomId}`,
        body: JSON.stringify(chatMessage),
      });
      setInputMessage('');
    } else if (!stompClient?.connected) {
      alert('채팅 서버와 연결되어 있지 않습니다. 다시 로그인 해주세요.');
    }
  };

  return (
    <Container>
      <Header>
        <MobileBackButton onClick={onBack} type="button">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </MobileBackButton>
        <h2>Respawn 톡톡</h2>
      </Header>

      <ChatWindow ref={chatWindowRef}>
        {messages.map((msg, index) => {
          if (msg.type === 'READ' || msg.type === 'JOIN') return null;
          const text = msg.message || msg.content;
          if (
            !text ||
            text.trim() === '' ||
            text.includes('님이 입장하셨습니다.')
          ) {
            return null;
          }
          const isMine = msg.senderId === user?.username;
          const isUnread = msg.isRead === false || msg.read === false;

          return (
            <MessageRow key={index} $isMine={isMine}>
              {!isMine && (
                <SenderPhoto>
                  {msg.senderId ? msg.senderId.charAt(0).toUpperCase() : '?'}
                </SenderPhoto>
              )}
              <MessageContent $isMine={isMine}>
                {!isMine && <SenderName>{msg.senderId}</SenderName>}
                <MessageWrapper>
                  {isMine && isUnread && <UnreadCount>1</UnreadCount>}
                  <Bubble $isMine={isMine}>{text}</Bubble>
                </MessageWrapper>
              </MessageContent>
            </MessageRow>
          );
        })}
      </ChatWindow>

      <InputForm onSubmit={sendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
        />
        <button type="submit">전송</button>
      </InputForm>
    </Container>
  );
};

export default ChatRoom;

// --- Styled Components ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.primary_light};
  overflow: hidden;
  box-shadow: none;
  margin: 0;
  max-width: none;
  border-radius: 0;
`;

const Header = styled.div`
  height: 64px;
  min-height: 64px;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 0 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  h2 {
    font-size: 16px;
    font-weight: bold;
    margin: 0;
    color: ${({ theme }) => theme.colors.gray[800]};
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 0 16px;
  }
`;

const MobileBackButton = styled.button`
  display: none;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[800]};
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
  }

  @media ${({ theme }) => theme.mobile} {
    display: flex;
  }
`;

const ChatWindow = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.gray[400]};
    border-radius: 3px;
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 16px 14px;
    gap: 12px;
  }
`;

const MessageRow = styled.div`
  display: flex;
  justify-content: ${({ $isMine }) => ($isMine ? 'flex-end' : 'flex-start')};
  align-items: flex-start;
  gap: 8px;
`;

const SenderPhoto = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.gray[600]};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;

  @media ${({ theme }) => theme.mobile} {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isMine }) => ($isMine ? 'flex-end' : 'flex-start')};
`;

const SenderName = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: 4px;
`;

const MessageWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 5px;
  max-width: 100%;

  @media ${({ theme }) => theme.mobile} {
    max-width: 100%;
  }
`;

const UnreadCount = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 11px;
  font-weight: bold;
`;

const Bubble = styled.div`
  max-width: 100%;
  padding: 10px 16px;
  border-radius: 16px;
  font-size: 15px;
  line-height: 1.5;
  word-break: break-all;
  overflow-wrap: break-word;
  white-space: pre-wrap;

  background-color: ${({ $isMine, theme }) =>
    $isMine ? theme.colors.primary : theme.colors.white};
  color: ${({ $isMine, theme }) =>
    $isMine ? theme.colors.white : theme.colors.gray[800]};
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);

  border-top-right-radius: ${({ $isMine }) => ($isMine ? '2px' : '16px')};
  border-top-left-radius: ${({ $isMine }) => ($isMine ? '16px' : '2px')};

  @media ${({ theme }) => theme.mobile} {
    font-size: 14px;
    padding: 8px 14px;
  }
`;

const InputForm = styled.form`
  background-color: ${({ theme }) => theme.colors.white};
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  gap: 10px;

  input {
    flex: 1;
    padding: 12px;
    border: 1px solid ${({ theme }) => theme.colors.gray[300]};
    border-radius: 8px;
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s;
    &:focus {
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }

  button {
    padding: 0 20px;
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
    &:hover {
      background-color: ${({ theme }) => theme.colors.primary_dark};
    }
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 10px 12px;
    input {
      padding: 10px;
      font-size: 16px;
    }
    button {
      padding: 0 16px;
      font-size: 14px;
    }
  }
`;
