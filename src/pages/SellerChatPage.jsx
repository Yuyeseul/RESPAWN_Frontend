import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from '../api/axios';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatRoom from '../components/Chat/ChatRoom';
import { useAuth } from '../AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const SellerChatPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const initialRoomId = location.state?.roomId || null;
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId);
  const [rooms, setRooms] = useState([]);

  // ⭐️ 현재 보고 있는 방을 추적하는 Ref (백그라운드 리스너용)
  const selectedRoomIdRef = useRef(selectedRoomId);
  useEffect(() => {
    selectedRoomIdRef.current = selectedRoomId;
  }, [selectedRoomId]);

  useEffect(() => {
    if (!user || user.role !== 'ROLE_SELLER') {
      navigate('/', { replace: true });
      return;
    }

    const fetchRooms = async () => {
      try {
        const response = await axios.get('/chat/rooms');
        if (Array.isArray(response.data)) {
          setRooms(response.data);
        }
      } catch (error) {
        console.error('채팅방 목록 로딩 실패:', error);
      }
    };
    fetchRooms();
  }, [user, navigate]);

  // ⭐️ 사이드바 알림 배지(숫자) 업데이트용 백그라운드 웹소켓
  useEffect(() => {
    if (rooms.length === 0) return;

    const socketUrl = `${process.env.REACT_APP_API_URL}/ws/chat`;
    const socket = new SockJS(socketUrl, null, {
      transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
    });

    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log('Seller Sidebar:', str),
      onConnect: () => {
        rooms.forEach((room) => {
          client.subscribe(`/topic/chat/${room.id}`, (message) => {
            const receivedMessage = JSON.parse(message.body);

            // 다른 방에서 새로운 CHAT 메시지가 왔을 때만 숫자 증가
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms.length, user?.username]);

  const handleRoomClick = (roomId) => {
    setSelectedRoomId(roomId);
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      )
    );
  };

  return (
    <PageContainer>
      <Sidebar $isSelected={!!selectedRoomId}>
        <SidebarHeader>
          <h3>고객 문의 관리</h3>
        </SidebarHeader>
        <RoomList>
          {rooms.length === 0 ? (
            <EmptyMsg>들어온 문의가 없습니다.</EmptyMsg>
          ) : (
            rooms.map((room) => (
              <RoomItem
                key={room.id}
                $active={selectedRoomId === room.id}
                onClick={() => handleRoomClick(room.id)}
              >
                <RoomContent>
                  <ProfileCircle>
                    {room.buyerUsername
                      ? room.buyerUsername.charAt(0).toUpperCase()
                      : 'B'}
                  </ProfileCircle>
                  <RoomInfo>
                    <BuyerName>{room.buyerUsername}</BuyerName>
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
            <p>대화할 구매자를 선택해 주세요.</p>
          </WelcomeScreen>
        )}
      </ChatContainer>
    </PageContainer>
  );
};

export default SellerChatPage;

const PageContainer = styled.div`
  display: flex;
  width: 100%;
  height: 85vh;
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 20px auto;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  box-shadow: 0 4px 20px ${({ theme }) => theme.colors.overlay_line};
  overflow: hidden;

  @media ${({ theme }) => theme.mobile} {
    height: calc(100vh - 120px);
    margin: 0;
    width: 100%;
    border-radius: 0;
    box-shadow: none;
  }
`;

const Sidebar = styled.div`
  width: 350px;
  border-right: 1px solid ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.gray[100]};

  @media ${({ theme }) => theme.mobile} {
    width: 100%;
    display: ${({ $isSelected }) => ($isSelected ? 'none' : 'flex')};
  }
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  h3 {
    margin: 0;
    font-size: 18px;
    color: ${({ theme }) => theme.colors.gray[800]};
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 16px 20px;
    h3 {
      font-size: 16px;
      text-align: left;
    }
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
  padding: 15px 20px;
  cursor: pointer;
  transition: background 0.2s;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primary_light : 'transparent'};
  border-left: 4px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};

  &:hover {
    background-color: ${({ $active, theme }) =>
      $active ? theme.colors.primary_light : theme.colors.gray[200]};
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 16px 20px;
  }
`;

const RoomContent = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
`;

const ProfileCircle = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
  flex-shrink: 0;

  @media ${({ theme }) => theme.mobile} {
    width: 42px;
    height: 42px;
    margin-right: 14px;
  }
`;

const RoomInfo = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media ${({ theme }) => theme.mobile} {
    display: flex;
  }
`;

const BuyerName = styled.span`
  font-weight: 600;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.gray[800]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media ${({ theme }) => theme.mobile} {
    font-size: 14px;
  }
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
  font-size: 12px;
  font-weight: bold;
  height: 22px;
  min-width: 22px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  margin-left: 10px;
  flex-shrink: 0;

  @media ${({ theme }) => theme.mobile} {
    font-size: 11px;
    height: 20px;
    min-width: 20px;
    border-radius: 10px;
  }
`;

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.white};
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

  .icon {
    font-size: 60px;
    margin-bottom: 20px;
  }
  p {
    font-size: 18px;
  }

  @media ${({ theme }) => theme.mobile} {
    p {
      font-size: 15px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
  }
`;

const EmptyMsg = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.gray[500]};
  font-size: 14px;
`;
