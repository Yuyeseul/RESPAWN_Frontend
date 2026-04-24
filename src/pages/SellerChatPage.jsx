import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from '../api/axios'; // 경로에 맞게 수정해주세요
import { useLocation, useNavigate } from 'react-router-dom';
import ChatRoom from '../components/Chat/ChatRoom'; // ChatRoom 컴포넌트 경로에 맞게 수정해주세요
import { useAuth } from '../AuthContext';

const SellerChatPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const initialRoomId = location.state?.roomId || null;
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // 판매자가 아니면 접근 차단
    if (!user || user.role !== 'ROLE_SELLER') {
      alert('판매자만 접근할 수 있는 페이지입니다.');
      navigate('/');
      return;
    }

    const fetchRooms = async () => {
      try {
        const response = await axios.get('/chat/rooms'); // 판매자 채팅방 목록 API
        if (Array.isArray(response.data)) {
          setRooms(response.data);
        }
      } catch (error) {
        console.error('채팅방 목록 로딩 실패:', error);
      }
    };
    fetchRooms();
  }, [user, navigate]);

  // ⭐️ 방 클릭 시 즉시 안 읽은 숫자 0으로 업데이트
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
      {/* 왼쪽: 구매자 문의 목록 */}
      <Sidebar>
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
                {/* ⭐️ 왼쪽 정보 영역을 RoomContent로 묶음 */}
                <RoomContent>
                  <ProfileCircle>
                    {room.buyerId ? room.buyerId.charAt(0).toUpperCase() : 'B'}
                  </ProfileCircle>
                  <RoomInfo>
                    <BuyerName>{room.buyerId} (구매자)</BuyerName>
                    <RoomDate>
                      개설일: {new Date(room.createdAt).toLocaleDateString()}
                    </RoomDate>
                  </RoomInfo>
                </RoomContent>

                {/* ⭐️ 오른쪽 읽지 않은 메시지 뱃지 */}
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

      {/* 오른쪽: 채팅 내용 */}
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
            <p>대화할 구매자를 선택해 주세요.</p>
          </WelcomeScreen>
        )}
      </ChatContainer>
    </PageContainer>
  );
};

export default SellerChatPage;

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
      font-size: 13px;
      text-align: center;
      word-break: keep-all;
    }
    padding: 15px 5px;
  }
`;

const RoomList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const RoomItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between; /* ⭐️ 뱃지를 오른쪽 끝으로 밀어내기 위해 추가 */
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

// ⭐️ 왼쪽 요소들(프로필, 이름)을 묶어주는 컨테이너 추가
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

const BuyerName = styled.span`
  font-weight: 600;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.gray[800]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RoomDate = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 4px;
`;

// ⭐️ 읽지 않은 메시지 뱃지 스타일 추가
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

  @media ${({ theme }) => theme.mobile} {
    p {
      font-size: 15px;
    }
  }
`;

const EmptyMsg = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.gray[500]};
  font-size: 14px;
`;
