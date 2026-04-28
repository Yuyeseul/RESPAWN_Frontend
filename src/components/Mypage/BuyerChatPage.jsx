import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from '../../api/axios';
import { useLocation } from 'react-router-dom';
import ChatRoom from '../Chat/ChatRoom';

const BuyerChatPage = () => {
  const location = useLocation();
  const initialRoomId = location.state?.roomId || null;
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId);
  const [rooms, setRooms] = useState([]);

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

  return (
    <PageContainer>
      <Sidebar>
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
                    {room.sellerId
                      ? room.sellerId.charAt(0).toUpperCase()
                      : 'S'}
                  </ProfileCircle>
                  <RoomInfo>
                    <SellerName>{room.sellerId}</SellerName>
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

      <ChatContainer>
        {selectedRoomId ? (
          <ChatRoom
            key={selectedRoomId}
            roomId={selectedRoomId}
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
    </PageContainer>
  );
};

export default BuyerChatPage;

// --- Styled Components ---

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
    height: 90vh;
    margin: 0;
    border-radius: 0;
  }
`;

const Sidebar = styled.div`
  width: 350px;
  border-right: 1px solid ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.gray[100]};

  @media ${({ theme }) => theme.mobile} {
    width: 80px;
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
    h3 {
      font-size: 14px;
      text-align: center;
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
  position: relative;

  &:hover {
    background-color: ${({ $active, theme }) =>
      $active ? theme.colors.primary_light : theme.colors.gray[200]};
  }

  @media ${({ theme }) => theme.mobile} {
    padding: 15px 10px;
    justify-content: center;
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
  background-color: ${({ theme }) => theme.colors.gray[500]};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
  flex-shrink: 0;

  @media ${({ theme }) => theme.mobile} {
    margin-right: 0;
  }
`;

const RoomInfo = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media ${({ theme }) => theme.mobile} {
    display: none;
  }
`;

const SellerName = styled.span`
  font-weight: 600;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.gray[800]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
    position: absolute;
    top: 10px;
    right: 12px;
    padding: 0 4px;
    min-width: 18px;
    height: 18px;
    font-size: 10px;
    border-radius: 9px;
    border: 2px solid ${({ theme }) => theme.colors.gray[100]};
  }
`;

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.white};
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
`;

const EmptyMsg = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.gray[500]};
  font-size: 14px;
`;
