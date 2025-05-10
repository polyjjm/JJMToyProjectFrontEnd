import React, { useEffect, useRef, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface ChatMessage {
  sender: string | null;
  content: string;
  message: string | null;
  sender_id: string | null;
}

const ChatRoom = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const clientRef = useRef<Client | null>(null);
  const roomId = 123; // 예시 방 번호

  // 1. 이전 메시지 불러오기
  const fetchMessages = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:8020/api/chat/history/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data: ChatMessage[] = await res.json();
        setMessages(data.map((msg) => `${msg.sender_id}: ${msg.message}`));
      } else {
        console.error("Failed to fetch previous messages.");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8020/ws-chat"),
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected to STOMP");

        client.subscribe(`/topic/${roomId}`, (msg: IMessage) => {
          const received: ChatMessage = JSON.parse(msg.body);
          setMessages((prev) => [...prev, `${received.sender}: ${received.content}`]);
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [roomId]);

  // 2. 메시지 전송
  const sendMessage = () => {
    if (clientRef.current?.connected && message.trim()) {
      const payload: ChatMessage = {
        sender: localStorage.getItem('user_email'), // 실제 사용자 ID로 교체
        content: message,
        message: null,
        sender_id: null,
      };

      clientRef.current.publish({
        destination: `/app/chat.send/${roomId}`,
        body: JSON.stringify(payload),
      });

      // 👉 즉시 UI에 반영
      setMessages((prev) => [...prev, `${payload.sender}: ${payload.content}`]);
      setMessage("");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat Room: {roomId}</h2>
      <div
        style={{
          border: "1px solid #ccc",
          height: 300,
          overflowY: "auto",
          padding: 10,
          marginBottom: 10,
        }}
      >
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="메시지를 입력하세요"
        style={{ width: "80%", marginRight: 10 }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatRoom;
