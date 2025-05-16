import './mainComponent.css';
import { NavBar } from '../navBar/appShell';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { useRef } from 'react';

import { Home } from '../home/Home';
import Board from '../borad/board';
import BoardInsert from '../borad/boardInsert';
import BoardDetail from '../borad/boardDetail';
import BoardUpdate from '../borad/boardUpdate';
import Signin from '../user/signin';
import KakaoAuth from '../user/kakaoAuth';
import ChatGpt from '../chatGpt/chatGpt';
import ChatRoom from '../chat/chatRoom';
import ChatMain from '../chat/chatMain';
import NicknameInputPage from '../chat/NicknameInputPage';
import WeatherMain from '../weather/WeatherMain';
import MainLayout from '../toDoList/MainLayout';
import Footer from './footer';
import AdFitBanner from '../common/AdFitBanner';

const drawerWidth = 200;

const mainComponent: React.FC = () => {
  const scrollRef0 = useRef<HTMLDivElement>(null);
  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);
  const scrollRef3 = useRef<HTMLDivElement>(null);

  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex', overflowX: 'hidden' }}>
        <NavBar scrollRef0={scrollRef0} scrollRef1={scrollRef1} scrollRef2={scrollRef2} scrollRef3={scrollRef3} />
        <Box
          sx={{
            position: 'fixed',
            left:220,
            top: 100,
            width: 160,
            height: 600,
            display: { xs: 'none', md: 'block' },
            zIndex: 1000
          }}
        >
          <AdFitBanner adUnit="DAN-Ho9lSpfd2Z7FlSC5" width={160} height={600}  />
        </Box>
        {/* Main Content */}
        <Box sx={{ flexGrow: 1, ml: `${drawerWidth}px`, pr: { md: '180px' } }}>
          <Toolbar />
          <Routes>
            <Route path="/login/kakao/oauth" element={<KakaoAuth />} />
            <Route path="/" element={<Home scrollRef0={scrollRef0} scrollRef1={scrollRef1} scrollRef2={scrollRef2} scrollRef3={scrollRef3} />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/board" element={<Board />} />
            <Route path="/board/boardInsert" element={<BoardInsert />} />
            <Route path="/board/boardPreview" element={<BoardDetail />} />
            <Route path="/board/boardDetail" element={<BoardDetail />} />
            <Route path="/board/boardUpdate" element={<BoardUpdate />} />
            <Route path="/chatGptApi" element={<ChatGpt />} />
            <Route path="/chat" element={<ChatMain />} />
            <Route path="/chat/room/:roomId" element={<ChatRoom />} />
            <Route path="/chat/NicknameInputPage" element={<NicknameInputPage />} />
            <Route path="/weather" element={<WeatherMain />} />
            <Route path="/todo" element={<MainLayout />} />
          </Routes>
          <Footer />
        </Box>

        {/* Right Ad - Absolute Positioned */}
        <Box
          sx={{
            position: 'fixed',
            right: 0,
            top: 100,
            width: 160,
            height: 600,
            display: { xs: 'none', md: 'block' },
            zIndex: 1000
          }}
        >
          <AdFitBanner adUnit="DAN-oMqbEDhEc68mzHvi" width={160} height={600} />
        </Box>
      </Box>
    </BrowserRouter>
  );
};

export default mainComponent;