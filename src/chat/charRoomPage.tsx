// ChatRoomPage.tsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, TextField, Button } from "@mui/material";
import { get } from "../common/common";

interface ChatMessage {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
}

const ChatRoomPage = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 1. 과거 메시지 불러오기
    const fetchMessages = async () => {
      const res = await get(`/api/chat/history/${roomId}`);
      setMessages(res);
    };
    fetchMessages();
  }, [roomId]);

  useEffect(() => {
    // 2. 새 메시지 올 때마다 맨 아래로 스크롤
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    // 3. 추후 WebSocket 전송 로직 연결 예정
    if (!newMessage.trim()) return;
    console.log("보낼 메시지:", newMessage);
    setNewMessage("");
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">채팅방 #{roomId}</Typography>
      <Box
        sx={{
          height: "500px",
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: "8px",
          p: 2,
          my: 2,
        }}
      >
        {messages.map((msg) => (
          <Box key={msg.id} sx={{ mb: 1 }}>
            <Typography variant="subtitle2">
              {msg.sender} ({new Date(msg.timestamp).toLocaleTimeString()})
            </Typography>
            <Typography>{msg.content}</Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button variant="contained" onClick={handleSend}>
          전송
        </Button>
      </Box>
    </Box>
  );
};

export default ChatRoomPage;
