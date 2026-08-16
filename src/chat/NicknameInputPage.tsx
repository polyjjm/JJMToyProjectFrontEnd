import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../common/common';

const NicknameInputPage = () => {
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  const handleEnter = async () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    // Guest chat identity shares the same slot chat reads for logged-in users (see
    // chatMain.tsx/chatRoom.tsx) - that's the Kakao id for real logins, a chosen nickname here.
    localStorage.setItem('user_id', nickname);

    try {
      // 백엔드에 게스트 채팅방 입장 요청
      const result = await post('/api/chat/joinGuestRoom', {
        guestId: nickname,
      });
        console.log(result ,'리턴값확인')
      if (result) {
        // /chat/popup renders shell-less (no NavBar/topbar/ads - see mainComponent.tsx), which
        // suits a guest with no logged-in identity just as well as it suits the popup-window
        // flow the header chat bell uses (ChatPanel.tsx) - same route, two different callers.
        navigate(`/chat/popup/${result}`);
      } else {
        alert('채팅방 입장 실패');
      }
    } catch (error) {
      console.error('게스트 채팅방 입장 실패', error);
      alert('오류가 발생했습니다.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>👋 닉네임을 입력해 게스트 채팅방에 입장하세요</h2>
      <input
        type="text"
        placeholder="닉네임 입력"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        style={styles.input}
      />
      <button onClick={handleEnter} style={styles.button}>
        입장하기
      </button>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '20px',
    backgroundColor: '#f0f2f5',
  },
  input: {
    width: '300px',
    padding: '12px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '12px 20px',
    fontSize: '16px',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default NicknameInputPage;