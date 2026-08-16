import './mainComponent.css';
import { NavBar } from '../navBar/appShell';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import NicknameInputPage from '../chat/NicknameInputPage';
import Dashboard from '../dashboard/Dashboard';
import DevToolsHub from '../devtools/DevToolsHub';
import CustomTableList from '../devtools/customTable/CustomTableList';
import CustomTableGrid from '../devtools/customTable/CustomTableGrid';
import FormatConverter from '../devtools/formatConverter/FormatConverter';
import DbNoteProjects from '../devtools/dbNotes/DbNoteProjects';
import DbNoteTableEditor from '../devtools/dbNotes/DbNoteTableEditor';
import TextTools from '../devtools/textTools/TextTools';
import Footer from './footer';
import AdFitBanner from '../common/AdFitBanner';
import TopProgressBar from '../common/TopProgressBar';

// Must match navBar/appShell.tsx's own drawerWidth constant - the sidebar and this content
// offset are two separate components that both need to agree on the same pixel width.
const drawerWidth = 240;

// Split out from mainComponent so useLocation() (which needs to be inside BrowserRouter) can
// decide whether to render the full app shell (sidebar/topbar/ads) or just a chat popup's bare
// content - a window.open'd chat room should look like a focused mini-window, not the whole
// site chrome around it. See appShell.tsx's chat bell for how the room list panel opens these.
const AppRoot: React.FC = () => {
  const scrollRef0 = useRef<HTMLDivElement>(null);
  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);
  const scrollRef3 = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const isChatPopup = location.pathname.startsWith('/chat/popup/');

  if (isChatPopup) {
    return (
      <Routes>
        <Route path="/chat/popup/:roomId" element={<ChatRoom />} />
      </Routes>
    );
  }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden' }}>
            <Box sx={{ display: 'flex', flex: '1 0 auto' }}>
                <NavBar scrollRef0={scrollRef0} scrollRef1={scrollRef1} scrollRef2={scrollRef2} scrollRef3={scrollRef3} />
                <Box
                    sx={{
                        position: 'fixed',
                        left: drawerWidth + 20,
                        top: 100,
                        width: 160,
                        height: 600,
                        display: { xs: 'none', lg: 'block' },
                        zIndex: 1000
                    }}
                >
                    <AdFitBanner adUnit="DAN-Ho9lSpfd2Z7FlSC5" width={160} height={600}  />
                </Box>
                {/* Main Content */}
                <Box sx={{
                    flexGrow: 1,
                    width: '100%',
                    ml: { xs: 0, md: `${drawerWidth}px` },
                    pr: { lg: '180px' },
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <Toolbar />
                    <Box sx={{ flex: '1 0 auto' }}>
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
                            <Route path="/chat/NicknameInputPage" element={<NicknameInputPage />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/tools" element={<DevToolsHub />} />
                            <Route path="/tools/table" element={<CustomTableList />} />
                            <Route path="/tools/table/:tableId" element={<CustomTableGrid />} />
                            <Route path="/tools/format-converter" element={<FormatConverter />} />
                            <Route path="/tools/db-notes" element={<DbNoteProjects />} />
                            <Route path="/tools/db-notes/:tableId" element={<DbNoteTableEditor />} />
                            <Route path="/tools/text-converter" element={<TextTools />} />
                        </Routes>
                    </Box>
                </Box>

                {/* Right Ad - Absolute Positioned */}
                <Box
                    sx={{
                        position: 'fixed',
                        right: 0,
                        top: 100,
                        width: 160,
                        height: 600,
                        display: { xs: 'none', lg: 'block' },
                        zIndex: 1000
                    }}
                >
                    <AdFitBanner adUnit="DAN-oMqbEDhEc68mzHvi" width={160} height={600} />
                </Box>
            </Box>

            {/* Footer - 전체 폭 사용 */}
            <Footer />
        </Box>
    );
};

const mainComponent: React.FC = () => {
  return (
    <BrowserRouter>
      <TopProgressBar />
      <AppRoot />
    </BrowserRouter>
  );
};

export default mainComponent;
