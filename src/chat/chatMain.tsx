import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Checkbox, Modal, Typography } from "@mui/material";
import { post, apiOrigin } from "../common/common";
import { useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "92vw", sm: 600, md: 900 },
  maxHeight: "85vh",
  overflowY: "auto" as const,
  bgcolor: "background.paper",
  textAlign: "center",
  borderRadius: "12px",
  boxShadow: 24,
  p: { xs: 2, sm: 4 },
};

interface userState {
  user_name: string;
  user_id: string;
  user_email: string;
}

interface ChatRoom {
  room_id: number;
  is_group: boolean;
  opponent_name?: string;
  room_name?: string;
  lastMessage: string;
  lastMessageTime: string;
  hasNewMessage?: boolean;
}

const chatMain = () => {
  const [modalStatus, setModalStatus] = useState(false);
  const [userList, setUserList] = useState<userState[]>([]);
  const [checkedList, setCheckedList] = useState<boolean[]>([]);
  const [roomList, setRoomList] = useState<ChatRoom[]>([]);
  const navigate = useNavigate();
  const clientRef = useRef<Client | null>(null);
  const currentUser = localStorage.getItem("user_email");
  const wsUrl = apiOrigin;
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("user_email");

    if (!token || !userEmail) {
      alert("로그인이 필요합니다.");
      navigate("/signin");
    }
  }, []);
  useEffect(() => {
    async function fetchRooms() {
      try {
        const rooms = await post("/api/chat/rooms", {
          userId: currentUser,
        });
        setRoomList(rooms || []);
      } catch (error) {
        console.error("채팅방 목록 불러오기 실패", error);
        setRoomList([]);
      }
    }
    fetchRooms();
  }, [currentUser]);

 useEffect(() => {
  if (!roomList.length) return;

  const client = new Client({
    webSocketFactory: () => new SockJS(`${wsUrl}/ws-chat`),
    reconnectDelay: 5000,
    onConnect: () => {
      roomList.forEach((room) => {
        client.subscribe(`/topic/${room.room_id}`, (msg: IMessage) => {
          const received = JSON.parse(msg.body);
          if (received.sender !== currentUser) {
            setRoomList((prev) =>
              prev.map((r) =>
                r.room_id === room.room_id
                  ? {
                      ...r,
                      hasNewMessage: true,
                      lastMessage: received.content,
                      lastMessageTime: new Date().toISOString(),
                    }
                  : r
              )
            );
          }
        });
      });
    },
  });

  clientRef.current = client;
  client.activate();

  return () => {
    client.deactivate();
  }; // ✅ 동기 cleanup 함수 리턴
}, [roomList]);

  const modalClose = () => setModalStatus(false);

  const modalOpen = async () => {
    setModalStatus(true);
    const userMap = await post("/member/userList", {});
    if (!userMap) {
      alert("유저 목록을 불러오지 못했습니다.");
      setModalStatus(false);
      return;
    }
    setUserList(userMap);
    setCheckedList(userMap.map(() => false));
  };

  const checkClick = (index: number) => {
    setCheckedList((prev) => {
      const newList = [...prev];
      newList[index] = !newList[index];
      return newList;
    });
  };

  const chatOpend = async () => {
    const selectedUsers = userList
      .filter((_, i) => checkedList[i])
      .map((user) => user.user_id);

    if (selectedUsers.length === 0) {
      alert("유저를 선택해주세요.");
      return;
    }

    const isGroup = selectedUsers.length > 1;
    const payload = { memberIds: selectedUsers, isGroup };

    try {
      await post("/api/chat/createRoom", payload);
      alert("채팅방이 생성되었습니다.");
      setModalStatus(false);
    } catch (err) {
      console.error("채팅방 생성 실패", err);
      alert("채팅방 생성에 실패했습니다.");
    }
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", minHeight: "100vh", px: { xs: 2, sm: 4 }, py: 3 }}>
      <Box sx={{ textAlign: "center", width: "100%" }}>
        <h2>채팅 메인</h2>
        <Box sx={{ textAlign: "right", mb: 2 }}>
          <Button variant="contained" onClick={modalOpen}>
            채팅방 개설
          </Button>
        </Box>

        <Modal open={modalStatus} onClose={modalClose}>
          <Box sx={modalStyle}>
            <Box sx={{ width: "100%", maxHeight: 400 }}>
              <Typography variant="h6" sx={{ overflowY: "auto", height: 300 }}>
                여기에 가입한 사람 목록
                {userList.map((e, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      minHeight: "50px",
                      alignItems: "center",
                      borderBottom: "1px solid #ccc",
                      textAlign: "left",
                    }}
                  >
                    <Box sx={{ width: { xs: "100%", sm: "30%" } }}>
                      <Checkbox onClick={() => checkClick(index)} /> ID: {e.user_id}
                    </Box>
                    <Box sx={{ width: { xs: "50%", sm: "20%" } }}>NAME: {e.user_name}</Box>
                    <Box sx={{ width: { xs: "50%", sm: "50%" } }}>EMAIL: {e.user_email}</Box>
                  </Box>
                ))}
              </Typography>
            </Box>

            <Box sx={{ width: "100%", mt: { xs: 4, sm: 8 }, height: "50px" }}>
              <Button variant="contained" onClick={chatOpend}>
                채팅 개설
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>

      <Box sx={{ width: "100%", py: 2 }}>
        <Typography variant="h6">내 채팅방 목록</Typography>
        {!roomList.length ? (
          <Typography>채팅방이 없습니다.</Typography>
        ) : (
          roomList.map((room, index) => (
            <Box
              key={index}
              sx={{
                border: "1px solid #ccc",
                borderRadius: "12px",
                padding: "10px",
                marginBottom: "10px",
                cursor: "pointer",
                textAlign: "left",
              }}
              onClick={() => {
                setRoomList((prev) =>
                  prev.map((r) =>
                    r.room_id === room.room_id ? { ...r, hasNewMessage: false } : r
                  )
                );
                navigate(`/chat/room/${room.room_id}`);
              }}
            >
              <Typography variant="subtitle1">
                {room.is_group
                  ? `👥 ${room.room_name || "그룹채팅"}`
                  : `👤 ${room.opponent_name || "1:1 채팅"}`}{" "}
                {room.hasNewMessage && (
                  <span style={{ color: "red", marginLeft: 6 }}>●</span>
                )}
              </Typography>
              <Typography variant="body2">💬 {room.lastMessage}</Typography>
              <Typography variant="caption" color="textSecondary">
                🕒 {new Date(room.lastMessageTime).toLocaleString()}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default chatMain;
