import React, { useEffect, useRef, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useParams } from "react-router-dom";

interface ChatMessage {
  sender: string | null;
  content: string;
  message: string | null;
  sender_id: string | null;
}

const ChatRoom = () => {
  const { roomId } = useParams(); // ✅ URL에서 roomId 동적으로 추출
  const numericRoomId = Number(roomId); // 서버는 숫자 ID 필요

  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const clientRef = useRef<Client | null>(null);
  const url = `${window.location.origin.replace(/:\d+$/, "")}:8020`;

  // 1. 이전 메시지 불러오기
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
        setMessages(data.map((msg) => `${msg.sender_id}: ${msg.message}`));
      } else {
        console.error("이전 메시지 불러오기 실패");
      }
    } catch (error) {
      console.error("fetchMessages 오류:", error);
    }
  };

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
          setMessages((prev) => [...prev, `${received.sender}: ${received.content}`]);
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

  // 2. 메시지 전송
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

      // UI 즉시 반영
      //setMessages((prev) => [...prev, `${payload.sender}: ${payload.content}`]);
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
