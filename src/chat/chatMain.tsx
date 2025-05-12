import React, { useEffect, useState } from "react";
import { Box, Button, Checkbox, Modal, Typography } from "@mui/material";
import { post } from "../common/common";

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 900,
  height: 600,
  bgcolor: "background.paper",
  textAlign: "center",
  borderRadius: "12px",
  boxShadow: 24,
  p: 4,
};

interface userState {
  user_name: string;
  user_id: string;
  user_email: string;
}

interface ChatRoom {
  room_id: number;
  is_group: boolean;
  lastMessage: string;
  lastMessageTime: string;
}

const charMain = () => {
  const [modalStatus, setModalStatus] = useState(false);
  const [userList, setUserList] = useState<userState[]>([]);
  const [checkedList, setCheckedList] = useState<boolean[]>([]);
  const [roomList, setRoomList] = useState<ChatRoom[]>([]); // ✅ 안전한 초기화

  useEffect(() => {
    async function fetchRooms() {
      try {
        const rooms = await post("/api/chat/rooms", {
          userId: localStorage.getItem("user_email"),
        });
        console.log("📥 채팅방 목록:", rooms);
        setRoomList(rooms || []); // ✅ fallback 방어
      } catch (error) {
        console.error("채팅방 목록 불러오기 실패", error);
        setRoomList([]); // 실패 시도라도 빈 배열로
      }
    }
    fetchRooms();
  }, []);

  const modalClose = () => setModalStatus(false);

  const modalOpen = async () => {
    setModalStatus(true);
    const userMap = await post("/member/userList", {});
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

    const payload = {
      memberIds: selectedUsers,
      isGroup: isGroup,
    };

    try {
      await post("/api/chat/createRoom", payload);
      alert("채팅방이 생성되었습니다.");
      setModalStatus(false);
      // TODO: 목록 갱신
    } catch (err) {
      console.error("채팅방 생성 실패", err);
      alert("채팅방 생성에 실패했습니다.");
    }
  };

  return (
    <Box style={{ display: "flex", flexWrap: "wrap", minHeight: "1200px", border: "1px solid blue" }}>
      <Box style={{ textAlign: "center", border: "1px solid red", width: "1200px" }}>
        <Box style={{ width: "100%" }}>
          <h2>채팅 메인</h2>
          채팅방 개설은 관리자만 가능합니다
        </Box>

        <Box style={{ width: "20%", float: "right" }}>
          <Button variant="contained" color="success" onClick={modalOpen}>
            채팅방 개설
          </Button>

          <Modal
            open={modalStatus}
            onClose={modalClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <Box sx={modalStyle}>
              <Box style={{ width: "800px", maxHeight: "400px" }}>
                <Typography
                  id="modal-title"
                  variant="h6"
                  component="h2"
                  sx={{ overflowY: "auto", overflowX: "hidden", height: 300, border: "1px solid green" }}
                >
                  여기에 가입한 사람 목록
                  {userList.map((e, index) => (
                    <Box
                      key={index}
                      style={{
                        width: "800px",
                        border: "1px solid red",
                        marginTop: "10px",
                        float: "left",
                        height: "50px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Box style={{ width: "30%", border: "1px solid red" }}>
                        <Checkbox onClick={() => checkClick(index)} color="secondary" /> ID: {e.user_id}
                      </Box>
                      <Box style={{ width: "20%", border: "1px solid red" }}>NAME: {e.user_name}</Box>
                      <Box style={{ width: "50%", border: "1px solid red" }}>EMAIL: {e.user_email}</Box>
                    </Box>
                  ))}
                </Typography>
              </Box>

              <Box style={{ width: "800px", marginTop: "150px", border: "1px solid blue", height: "50px" }}>
                <Button variant="contained" color="success" onClick={chatOpend}>
                  채팅 개설
                </Button>
              </Box>
            </Box>
          </Modal>
        </Box>
      </Box>

      {/* ✅ 채팅방 목록 렌더링 */}
      <Box style={{ width: "100%", padding: "20px" }}>
        <Typography variant="h6">내 채팅방 목록</Typography>
        {!Array.isArray(roomList) || roomList.length === 0 ? (
          <Typography>채팅방이 없습니다.</Typography>
        ) : (
          roomList.map((room, index) => (
            <Box
              key={index}
              style={{
                border: "1px solid #ccc",
                borderRadius: "12px",
                padding: "10px",
                marginBottom: "10px",
                cursor: "pointer",
              }}
              onClick={() => (window.location.href = `/chat/room/${room.room_id}`)}
            >
              <Typography variant="subtitle1">
                {room.is_group ? "👥 그룹 채팅방" : "👤 1:1 채팅방"} #{room.room_id}
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

export default charMain;
