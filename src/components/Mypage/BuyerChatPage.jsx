import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from '../../api/axios';
import { useLocation } from 'react-router-dom';
import ChatRoom from '../Chat/ChatRoom';
import { useAuth } from '../../AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import MypageLayout from './MypageLayout';

const BuyerChatPage = () => {
  const { user } = useAuth();
  const location = useLocation();

  const initialRoomId = location.state?.roomId || null;
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId);
  const [rooms, setRooms] = useState([]);

  const selectedRoomIdRef = useRef(selectedRoomId);
  useEffect(() => {
    selectedRoomIdRef.current = selectedRoomId;
  }, [selectedRoomId]);

  const handleRoomClick = (roomId) => {
    setSelectedRoomId(roomId);
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      )
    );
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('/chat/buyer/rooms');
        if (Array.isArray(response.data)) {
          setRooms(response.data);
        }
      } catch (error) {
        console.error('채팅방 목록 로딩 실패:', error);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    if (rooms.length === 0) return;

    const socketUrl = `${process.env.REACT_APP_API_URL}/ws/chat`;
    const socket = new SockJS(socketUrl, null, {
      transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
    });

    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log('Buyer Sidebar:', str),
      onConnect: () => {
        rooms.forEach((room) => {
          client.subscribe(`/topic/chat/${room.id}`, (message) => {
            const receivedMessage = JSON.parse(message.body);

            if (
              receivedMessage.type === 'CHAT' &&
              receivedMessage.senderId !== user?.username &&
              selectedRoomIdRef.current !== room.id
            ) {
              setRooms((prevRooms) =>
                prevRooms.map((r) =>
                  r.id === room.id
                    ? { ...r, unreadCount: (r.unreadCount || 0) + 1 }
                    : r
                )
              );
            }
          });
        });
      },
    });

    client.activate();

    return () => {
      if (client) client.deactivate();
    };
  }, [rooms.length, user?.username]);

  return (
    <MypageLayout title="실시간 채팅" isNarrow={false}>
      <ChatWrapper>
        <Sidebar $isSelected={!!selectedRoomId}>
          <SidebarHeader>
            <h3>메시지</h3>
          </SidebarHeader>
          <RoomList>
            {rooms.length === 0 ? (
              <EmptyMsg>진행 중인 대화가 없습니다.</EmptyMsg>
            ) : (
              rooms.map((room) => (
                <RoomItem
                  key={room.id}
                  $active={selectedRoomId === room.id}
                  onClick={() => handleRoomClick(room.id)}
                >
                  <RoomContent>
                    <ProfileCircle>
                      {room.sellerUsername
                        ? room.sellerUsername.charAt(0).toUpperCase()
                        : 'S'}
                    </ProfileCircle>
                    <RoomInfo>
                      <SellerName>{room.sellerUsername}</SellerName>
                      <ItemName>
                        {room.itemName ? `상품: ${room.itemName}` : '일반 문의'}
                      </ItemName>
                    </RoomInfo>
                  </RoomContent>

                  {room.unreadCount > 0 && (
                    <UnreadBadge>
                      {room.unreadCount > 99 ? '99+' : room.unreadCount}
                    </UnreadBadge>
                  )}
                </RoomItem>
              ))
            )}
          </RoomList>
        </Sidebar>

        <ChatContainer $isSelected={!!selectedRoomId}>
          {selectedRoomId ? (
            <ChatRoom
              key={selectedRoomId}
              roomId={selectedRoomId}
              onBack={() => setSelectedRoomId(null)}
              onRead={() => {
                setRooms((prev) =>
                  prev.map((r) =>
                    r.id === selectedRoomId ? { ...r, unreadCount: 0 } : r
                  )
                );
              }}
            />
          ) : (
            <WelcomeScreen>
              <div className="icon">💬</div>
              <p>대화할 상대방을 선택해 주세요.</p>
            </WelcomeScreen>
          )}
        </ChatContainer>
      </ChatWrapper>
    </MypageLayout>
  );
};

export default BuyerChatPage;

const ChatWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 70vh;
  min-height: 550px;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 8px;
  box-shadow: 0 4px 15px ${({ theme }) => theme.colors.overlay_line};
  overflow: hidden;

  @media ${({ theme }) => theme.mobile} {
    height: calc(100vh - 120px);
    margin: 0 -16px;
    width: calc(100% + 32px);
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
`;

const Sidebar = styled.div`
  width: 300px;
  border-right: 1px solid ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.white};

  @media ${({ theme }) => theme.mobile} {
    width: 100%;
    display: ${({ $isSelected }) => ($isSelected ? 'none' : 'flex')};
  }
`;

const SidebarHeader = styled.div`
  height: 64px;
  padding: 0 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  align-items: center;
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.gray[800]};
  }
`;

const RoomList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const RoomItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primary_light : 'transparent'};
  border-left: 4px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};

  &:hover {
    background-color: ${({ $active, theme }) =>
      $active ? theme.colors.primary_light : theme.colors.gray[50]};
  }
`;

const RoomContent = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
`;

const ProfileCircle = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.gray[500]};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 14px;
  flex-shrink: 0;
`;

const RoomInfo = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SellerName = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[800]};
`;

const ItemName = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
`;

const UnreadBadge = styled.div`
  background-color: ${({ theme }) => theme.colors.red};
  color: ${({ theme }) => theme.colors.white};
  font-size: 11px;
  font-weight: bold;
  height: 20px;
  min-width: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
`;

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.primary_light};
  min-height: 0;

  @media ${({ theme }) => theme.mobile} {
    display: ${({ $isSelected }) => ($isSelected ? 'flex' : 'none')};
  }
`;

const WelcomeScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.gray[500]};
  p {
    font-size: 15px;
  }
  .icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

const EmptyMsg = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.gray[500]};
  font-size: 14px;
`;
