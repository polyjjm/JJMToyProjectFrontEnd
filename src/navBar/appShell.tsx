import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
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
import { PERSONAL_INFO } from '../common/personalInfo';
import { COLORS } from '../theme';

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

const sectionLinks = [
  { label: 'About me', refKey: 'scrollRef0' as const },
  { label: 'Skills', refKey: 'scrollRef1' as const },
  { label: 'Archiving', refKey: 'scrollRef2' as const },
  { label: 'Career', refKey: 'scrollRef3' as const },
];

export const NavBar: React.FC<navBarProps> = ({ scrollRef0, scrollRef1, scrollRef2, scrollRef3 }) => {
  const navigate = useNavigate();
  const [menu, setMenu] = useState<Array<menu>>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const refMap = { scrollRef0, scrollRef1, scrollRef2, scrollRef3 };

  const handleClick = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setMobileOpen(false);
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
    // Kakao's /user/unlink API requires an admin key, which can't be safely held in
    // client-side code. Logout here only clears the local session; the JWT simply expires.
    localStorage.removeItem('user_email');
    localStorage.removeItem('token');
    navigate('/');
  };

  const drawerContent = (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: COLORS.ink,
        color: '#C9C9E0',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}
    >
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <img
          src={PERSONAL_INFO.profileImage}
          alt="profile"
          style={{ width: '80px', borderRadius: '50%', marginTop: '15px', border: `2px solid ${COLORS.coral}` }}
        />
        <Typography variant="body2" sx={{ mt: 1 }}>
          {PERSONAL_INFO.email}
        </Typography>
      </Box>

      <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.12)' }} />

      {/* Home page section jump links - only meaningful when parked on "/", but harmless elsewhere */}
      <List>
        {sectionLinks.map((link) => (
          <ListItem key={link.label} disablePadding>
            <ListItemButton onClick={() => handleClick(refMap[link.refKey])}>
              <ListItemText primary={link.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.12)' }} />

      <List>
        {menu.map((value, index) => (
          <ListItem key={value.menu_name} disablePadding>
            <ListItemButton component="a" href={value.menu_url}>
              <ListItemIcon sx={{ color: COLORS.teal }}>
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

      <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.12)' }} />

      <Box sx={{ px: 2, py: 2 }}>
        {localStorage.getItem('user_email') ? (
          <Box>
            <Typography variant="body2" sx={{ mb: 1, wordBreak: 'break-all' }}>
              id: {localStorage.getItem('user_email')}
            </Typography>
            <Button fullWidth variant="outlined" onClick={logOut} sx={{ color: COLORS.amber, borderColor: COLORS.amber }}>
              로그아웃
            </Button>
          </Box>
        ) : (
          <Button fullWidth variant="contained" href="/signin" sx={{ backgroundColor: COLORS.coral, color: COLORS.ink }}>
            로그인
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar - only carries the hamburger + title below md; the drawer is the single
          source of navigation across breakpoints so there's no dead zone in between. */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: COLORS.surface,
          color: COLORS.ink,
          borderBottom: `3px solid ${COLORS.coral}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { xs: 'flex', md: 'none' }, color: COLORS.ink }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                textDecoration: 'none',
                color: COLORS.ink,
                fontWeight: 'bold',
              }}
            >
              JJM Portfolio
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
            {sectionLinks.map((link) => (
              <Button key={link.label} onClick={() => handleClick(refMap[link.refKey])} sx={{ color: COLORS.ink }}>
                {link.label}
              </Button>
            ))}

            {localStorage.getItem('user_email') ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: COLORS.inkSoft }}>
                  id: {localStorage.getItem('user_email')}
                </Typography>
                <Button onClick={logOut} sx={{ color: COLORS.coral, fontWeight: 700 }}>
                  로그아웃
                </Button>
              </Box>
            ) : (
              <Button href="/signin" variant="contained" sx={{ backgroundColor: COLORS.coral, color: COLORS.ink }}>
                로그인
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {/* xs/sm: hamburger-triggered, covers the full nav+auth surface */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              height: '100vh',
              overflowX: 'hidden'
            }
          }}
        >
          {drawerContent}
        </Drawer>

        {/* md+: pinned sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
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
