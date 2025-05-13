import React, { useEffect, useRef, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useParams } from "react-router-dom";

interface ChatMessage {
  sender: string | null;
  content: string;
  message: string | null;
  sender_id: string | null;
  is_read?: boolean;
}

const ChatRoom = () => {
  const { roomId } = useParams();
  const numericRoomId = Number(roomId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>("");
  const clientRef = useRef<Client | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const url = `${window.location.origin.replace(/:\d+$/, "")}:8020`;

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const fetchMessages = async () => {
    const token = localStorage.getItem("token");
    if (!token || !numericRoomId) return;

    try {
      const res = await fetch(`${url}/api/chat/history/${numericRoomId}/${localStorage.getItem('user_email')}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data: ChatMessage[] = await res.json();
        const normalized = data.map((msg) => ({
          ...msg,
          content: msg.content || msg.message || "",
          sender: msg.sender || msg.sender_id || null,
        }));
        setMessages(normalized);
      } else {
        console.error("이전 메시지 불러오기 실패");
      }
    } catch (error) {
      console.error("fetchMessages 오류:", error);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!numericRoomId) return;

    fetchMessages();

    const client = new Client({
      webSocketFactory: () => new SockJS(`${url}/ws-chat`),
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("📡 WebSocket 연결됨");

        client.subscribe(`/topic/${numericRoomId}`, (msg: IMessage) => {
          const received: ChatMessage = JSON.parse(msg.body);
          received.content = received.content || received.message || "";
          received.sender = received.sender || received.sender_id || null;

          const currentUser = localStorage.getItem('user_email');
          const isMe = received.sender === currentUser;

          if (!isMe && document.hidden && Notification.permission === "granted") {
            new Notification("새 메시지 도착", {
              body: received.content,
            });
          }

          setMessages((prev) => [...prev, received]);
        });
      },
      onStompError: (frame) => {
        console.error("STOMP 에러:", frame);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [numericRoomId]);

  const sendMessage = () => {
    if (clientRef.current?.connected && message.trim()) {
      const payload: ChatMessage = {
        sender: localStorage.getItem("user_email"),
        content: message,
        message: null,
        sender_id: null,
      };

      clientRef.current.publish({
        destination: `/app/chat.send/${numericRoomId}`,
        body: JSON.stringify(payload),
      });

      setMessage("");
    }
  };

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div style={{ padding: 20, backgroundColor: '#f0f2f5', minHeight: '130vh' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>💬 Chat Room #{roomId == '13' ? '게스트룸' : roomId}</h2>

      <div
        ref={scrollContainerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          height: '60vh',
          overflowY: 'auto',
          padding: 16,
          marginBottom: 20,
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {messages.map((msg, i) => {
          const currentUser = localStorage.getItem('user_email');
          const isMe = String(msg.sender) === currentUser;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: isMe ? 'flex-end' : 'flex-start',
                width: '100%',
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  backgroundColor: isMe ? '#dcf8c6' : '#f1f0f0',
                  color: '#333',
                  borderRadius: '18px',
                  padding: '10px 16px',
                  wordBreak: 'break-word',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                {!isMe && (
                  <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: 4, color: '#555' }}>
                    {msg.sender =='3971393861' && roomId =='13' ? '관리자' : msg.sender}
                  </div>
                )}
                <div style={{ fontSize: '14px' }}>{msg.content}</div>
                <div
                  style={{
                    fontSize: '10px',
                    color: '#888',
                    textAlign: 'right',
                    marginTop: 6,
                  }}
                >
                  {formatTime(new Date())} {isMe && (msg.is_read ? '✔' : '')}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지를 입력하세요"
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 24,
            border: '1px solid #ccc',
            fontSize: 16,
            outline: 'none',
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: '10px 20px',
            borderRadius: 24,
            backgroundColor: '#4caf50',
            color: '#fff',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          보내기
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
