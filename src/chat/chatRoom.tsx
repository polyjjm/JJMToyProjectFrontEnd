import React, { useEffect, useRef, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useParams } from "react-router-dom";
import { apiOrigin, postUpload } from "../common/common";
import { COLORS } from "../theme";

// Mirrors chatMessage.java field-for-field, including the snake_case names (see that file's
// comment for why: mybatis map-underscore-to-camel-case is off, and SELECT * relies on those
// names matching the DB columns exactly).
interface ChatMessage {
  id: number | null;
  sender: string | null;
  sender_id: string | null;
  content: string | null;
  message: string | null;
  timestamp: string | null;
  message_type: string | null; // 'TEXT' | 'IMAGE'
  attachment_url: string | null;
}

interface RoomInfo {
  is_group: boolean;
  room_name: string | null;
  opponentName: string | null;
  memberCount: number;
}

// This route (/chat/popup/:roomId) is rendered shell-less by mainComponent.tsx - no
// NavBar/topbar/ads around it - because it's meant to be opened via window.open() as its own
// small popup window (see ChatPanel.tsx), not navigated to as a normal in-shell page.
export default function ChatRoom() {
  const { roomId } = useParams();
  const numericRoomId = Number(roomId);
  const currentUser = localStorage.getItem('user_id');

  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [othersReadUpTo, setOthersReadUpTo] = useState(0);
  const [text, setText] = useState('');
  const clientRef = useRef<Client | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const roomTitle = roomInfo
    ? (roomInfo.is_group ? (roomInfo.room_name || `그룹채팅 (${roomInfo.memberCount}명)`) : (roomInfo.opponentName || '(알 수 없음)'))
    : '';

  useEffect(() => {
    if (!numericRoomId || !currentUser) return;

    (async () => {
      const res = await fetch(`${apiOrigin}/api/chat/roomInfo/${numericRoomId}/${currentUser}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) setRoomInfo(await res.json());
    })();

    (async () => {
      const res = await fetch(`${apiOrigin}/api/chat/history/${numericRoomId}/${currentUser}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setOthersReadUpTo(data.othersReadUpTo || 0);
      }
    })();

    const client = new Client({
      webSocketFactory: () => new SockJS(`${apiOrigin}/ws-chat`),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/${numericRoomId}`, (msg: IMessage) => {
          const received: ChatMessage = JSON.parse(msg.body);
          setMessages((prev) => [...prev, received]);
        });
      },
    });
    clientRef.current = client;
    client.activate();

    // Polls the other member(s)' read pointer while this window is open, so "읽음" appears
    // under my sent messages as soon as the other side reads them - there's no dedicated
    // per-member read-status WebSocket topic (see chatController.getReadStatus's comment for
    // why polling is good enough here).
    const pollId = setInterval(async () => {
      const res = await fetch(`${apiOrigin}/api/chat/readStatus/${numericRoomId}/${currentUser}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOthersReadUpTo(data.othersReadUpTo || 0);
      }
    }, 4000);

    return () => {
      client.deactivate();
      clearInterval(pollId);
    };
  }, [numericRoomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const publish = (payload: Partial<ChatMessage>) => {
    if (!clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: `/app/chat.send/${numericRoomId}`,
      body: JSON.stringify({
        sender: currentUser,
        content: null,
        message: null,
        sender_id: null,
        message_type: 'TEXT',
        attachment_url: null,
        ...payload,
      }),
    });
  };

  const sendText = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    publish({ content: trimmed, message_type: 'TEXT' });
    setText('');
  };

  const sendImage = async (file: File) => {
    const data = new FormData();
    data.append('upload', file);
    // Same commonServiceImpl.ckEditorUpload pipeline as board images - the file gets a
    // thumbnail generated too, though chat bubbles only show the original for now.
    const url = await postUpload('/api/chat/uploadImage', data);
    if (!url) return;
    publish({ message_type: 'IMAGE', attachment_url: url });
  };

  const handleImagePick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) sendImage(file);
    };
    input.click();
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return '';
    const date = new Date(iso);
    const hours = date.getHours();
    const ampm = hours < 12 ? '오전' : '오후';
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${ampm} ${h12}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const formatDateDivider = (iso: string | null) => {
    if (!iso) return '';
    const date = new Date(iso);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: COLORS.bg }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.25, p: '14px 16px',
        bgcolor: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0,
      }}>
        <Box sx={{
          width: 36, height: 36, flexShrink: 0, bgcolor: COLORS.accent, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
          borderRadius: roomInfo?.is_group ? '10px' : '50%',
        }}>
          {roomTitle.slice(0, 2)}
        </Box>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }} noWrap>
          {roomTitle}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: '18px 16px', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {messages.map((msg, i) => {
          const isMine = msg.sender === currentUser || msg.sender_id === currentUser;
          const prevDate = i > 0 ? messages[i - 1].timestamp?.slice(0, 10) : null;
          const thisDate = msg.timestamp?.slice(0, 10);
          const showDivider = thisDate && thisDate !== prevDate;
          const isRead = isMine && msg.id != null && msg.id <= othersReadUpTo;

          return (
            <React.Fragment key={msg.id ?? i}>
              {showDivider && (
                <Typography sx={{ textAlign: 'center', fontSize: 11, color: COLORS.textTertiary, my: 0.75 }}>
                  {formatDateDivider(msg.timestamp)}
                </Typography>
              )}
              <Box sx={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <Box sx={{ maxWidth: '75%' }}>
                  {msg.message_type === 'IMAGE' && msg.attachment_url ? (
                    <Box
                      component="img"
                      src={msg.attachment_url}
                      alt="이미지"
                      sx={{ maxWidth: '100%', maxHeight: 260, borderRadius: '16px', display: 'block' }}
                    />
                  ) : (
                    <Box sx={{
                      px: 1.625, py: 1.125, borderRadius: '16px', fontSize: 13, lineHeight: 1.5,
                      bgcolor: isMine ? COLORS.accent : '#F2EEE8',
                      color: isMine ? '#fff' : COLORS.textPrimary,
                      borderBottomRightRadius: isMine ? '4px' : '16px',
                      borderBottomLeftRadius: isMine ? '16px' : '4px',
                      wordBreak: 'break-word',
                    }}>
                      {msg.content || msg.message}
                    </Box>
                  )}
                  <Typography sx={{
                    fontSize: 10.5, color: COLORS.textTertiary, mt: 0.375,
                    textAlign: isMine ? 'right' : 'left',
                  }}>
                    {isMine && isRead && (
                      <Box component="span" sx={{ color: COLORS.accent, fontWeight: 700, mr: 0.5 }}>읽음</Box>
                    )}
                    {formatTime(msg.timestamp)}
                  </Typography>
                </Box>
              </Box>
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </Box>

      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1, p: '10px 12px',
        bgcolor: COLORS.surface, borderTop: `1px solid ${COLORS.border}`, flexShrink: 0,
      }}>
        <IconButton size="small" onClick={handleImagePick} sx={{ color: COLORS.textTertiary }}>
          <ImageOutlinedIcon fontSize="small" />
        </IconButton>
        <Box
          component="input"
          value={text}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') sendText(); }}
          placeholder="메시지를 입력하세요"
          sx={{
            flex: 1, border: `1px solid ${COLORS.border}`, borderRadius: '999px', px: 1.75, py: 1.125,
            fontFamily: 'inherit', fontSize: 12.5, outline: 'none',
            '&:focus': { borderColor: COLORS.accent },
          }}
        />
        <IconButton
          onClick={sendText}
          sx={{ bgcolor: COLORS.accent, color: '#fff', width: 34, height: 34, '&:hover': { bgcolor: '#211F1B' } }}
        >
          <SendIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
