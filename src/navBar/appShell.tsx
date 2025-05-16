import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  ButtonGroup,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import InterpreterModeIcon from '@mui/icons-material/InterpreterMode';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import { useNavigate } from 'react-router-dom';
import { post } from '../common/common';

const drawerWidth = 200;

interface menu {
  depth: number;
  menu_name: string;
  menu_url: string;
  parent_id: string;
  sideYn: string;
  sort_no: string;
}

type navBarProps = {
  scrollRef0: React.RefObject<HTMLDivElement>;
  scrollRef1: React.RefObject<HTMLDivElement>;
  scrollRef2: React.RefObject<HTMLDivElement>;
  scrollRef3: React.RefObject<HTMLDivElement>;
};

export const NavBar: React.FC<navBarProps> = ({ scrollRef0, scrollRef1, scrollRef2, scrollRef3 }) => {
  const navigate = useNavigate();
  const [menu, setMenu] = useState<Array<menu>>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleClick = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    async function fetchMenu() {
      const menuList = await post('/menu/list', { currentPage: 1 });
      if (menuList) {
        setMenu(menuList);
      }
    }
    fetchMenu();
  }, []);

  const logOut = () => {
    localStorage.removeItem('user_email');
    localStorage.removeItem('token');
    fetch('https://kapi.kakao.com/v1/user/unlink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer J0NBMZ4i0YUGCOsaxbQcrSRwnZdmA-teOHXID_c-xySh4YJ7gibYDQAAAAQKDQgeAAABlsTwQooe0jm_MNo9Pw`
      }
    })
      .then((res) => res.json())
      .then((data) => console.log('카카오 로그아웃 성공', data))
      .catch((err) => console.error('카카오 로그아웃 실패', err));
    navigate('/');
  };

  const drawerContent = (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#202020',
        color: '#9B9B9B',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}
    >
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <img
          src={process.env.PUBLIC_URL + '/KakaoTalk_20250303_001054029.jpg'}
          alt="profile"
          style={{ width: '80px', borderRadius: '50%', marginTop: '15px' }}
        />
        <Typography variant="body2" sx={{ mt: 1 }}>
          wnwhd788@gmail.com
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <List>
        {menu.map((value, index) => (
          <ListItem key={value.menu_name} disablePadding>
            <ListItemButton component="a" href={value.menu_url}>
              <ListItemIcon sx={{ color: '#9B9B9B' }}>
                {index === 0 ? (
                  <HomeIcon />
                ) : index === 1 ? (
                  <ContentPasteIcon />
                ) : index <= 4 ? (
                  <InterpreterModeIcon />
                ) : index <=5 ?  (
                  <WbSunnyIcon />
                ) : <PlaylistAddCheckIcon />}
              </ListItemIcon>
              <ListItemText primary={value.menu_name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: '#FFFFFF'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { sm: 'none' }, color: 'black' }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                textDecoration: 'none',
                color: 'black',
                fontWeight: 'bold',
                mr: 2,
                ml: '200px'
              }}
            >
              JJM Portfolio
            </Typography>

            <Box
              sx={{
                ml: 'auto',
                mr: '50px',
                display: { xs: 'none', md: 'flex' }
              }}
            >
              <ButtonGroup variant="text" sx={{ gap: 1 }}>
                <Button onClick={() => handleClick(scrollRef0)} sx={{ color: 'black' }}>
                  About me
                </Button>
                <Button onClick={() => handleClick(scrollRef1)} sx={{ color: 'black' }}>
                  Skills
                </Button>
                <Button onClick={() => handleClick(scrollRef2)} sx={{ color: 'black' }}>
                  Archiving
                </Button>
                <Button onClick={() => handleClick(scrollRef3)} sx={{ color: 'black' }}>
                  Career
                </Button>
              </ButtonGroup>
            </Box>
          </Box>

          <Box
            sx={{
              ml: 'auto',
              mr: '200px',
              display: { xs: 'none', md: 'flex' }
            }}
          >
            {localStorage.getItem('user_email') ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'black' }}>
                  id: {localStorage.getItem('user_email')}
                </Typography>
                <Button onClick={logOut} sx={{ color: 'black' }}>
                  로그아웃
                </Button>
              </Box>
            ) : (
              <Button href="/signin" sx={{ color: 'black' }}>
                로그인
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        {/* 모바일 */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              height: '100vh',
              overflowX: 'hidden'
            }
          }}
        >
          {drawerContent}
        </Drawer>

        {/* 데스크탑 */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              height: '100vh',
              overflowX: 'hidden'
            }
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
    </Box>
  );
};
