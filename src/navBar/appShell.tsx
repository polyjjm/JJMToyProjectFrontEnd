import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Avatar,
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
import { useLocation, useNavigate } from 'react-router-dom';
import { post } from '../common/common';
import { PERSONAL_INFO } from '../common/personalInfo';
import { COLORS } from '../theme';

const drawerWidth = 240;

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

// Shared style for the small uppercase group headers above a nav list
// (design-mockup.html's .sidebar-section-label, e.g. "Workspace").
const sectionLabelSx = {
  fontSize: 11,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  color: '#6b6558',
  px: 1.5,
  pt: 2,
  pb: 0.75,
  fontWeight: 600,
};

export const NavBar: React.FC<navBarProps> = ({ scrollRef0, scrollRef1, scrollRef2, scrollRef3 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menu, setMenu] = useState<Array<menu>>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const refMap = { scrollRef0, scrollRef1, scrollRef2, scrollRef3 };

  const handleClick = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setMobileOpen(false);
  };

  // Below the 900px breakpoint (MUI's default "md") the mockup shows the sidebar collapsed
  // entirely, with a hamburger button in the topbar taking its place. The static mockup has
  // no JS, so the actual open/close behavior lives here: `mobileOpen` toggles a MUI Drawer
  // in "temporary" mode (an overlay that closes on outside-click/route change) below md, while
  // a second "permanent" Drawer renders the same content pinned in place at md and above.
  // Both drawers share `drawerContent` so the nav never drifts out of sync between the two.
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
        backgroundColor: COLORS.sidebarBg,
        color: COLORS.sidebarText,
        boxSizing: 'border-box',
        overflowX: 'hidden',
        py: 3,
        px: 1.75,
      }}
    >
      {/* Profile mark: circular avatar (the logged-in user's photo today, but this is the
          slot a real profile-picture upload would plug into later) + name + a short tagline.
          Per spec this is nav + profile only - no email, no logout here (both already live
          in the topbar below, so showing them twice would just be noise). */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 1.5,
          pb: 3,
          mb: 1,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Avatar
          src={PERSONAL_INFO.profileImage}
          alt="profile"
          sx={{ width: 96, height: 96, border: '1px solid rgba(255,255,255,0.35)' }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: COLORS.sidebarTextActive, fontSize: 13.5, fontWeight: 700 }} noWrap>
            {PERSONAL_INFO.name}
          </Typography>
          <Typography sx={{ color: COLORS.sidebarText, fontSize: 11.5, mt: '1px' }}>
            {PERSONAL_INFO.tagline}
          </Typography>
        </Box>
      </Box>

      {/* Home page section jump links - only meaningful when parked on "/", but harmless
          elsewhere since they just no-op if the ref isn't mounted. */}
      <Typography sx={sectionLabelSx}>홈 바로가기</Typography>
      <List sx={{ py: 0 }}>
        {sectionLinks.map((link) => (
          <ListItem key={link.label} disablePadding>
            <ListItemButton
              onClick={() => handleClick(refMap[link.refKey])}
              sx={{
                borderRadius: '8px',
                color: COLORS.sidebarText,
                fontSize: 13.5,
                py: 1,
                px: 1.5,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)', color: COLORS.sidebarTextActive },
              }}
            >
              <ListItemText primary={link.label} primaryTypographyProps={{ fontSize: 13.5, fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.08)' }} />

      <List sx={{ py: 0 }}>
        {menu.map((value, index) => {
          // NOTE: icon-by-index is inherited fragile behavior, not introduced by this pass -
          // it silently breaks if the backend-driven menu's order/count changes. Left as-is
          // since fixing it (e.g. keying icons off menu_url or an icon field from the API)
          // is out of scope for a styling/category pass.
          const isActive = location.pathname === value.menu_url;
          return (
            <ListItem key={value.menu_name} disablePadding>
              <ListItemButton
                component="a"
                href={value.menu_url}
                sx={{
                  borderRadius: '8px',
                  mb: 0.5,
                  py: 1,
                  px: 1.5,
                  color: isActive ? COLORS.sidebarTextActive : COLORS.sidebarText,
                  backgroundColor: isActive ? COLORS.accent : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive ? COLORS.accent : 'rgba(255,255,255,0.06)',
                    color: COLORS.sidebarTextActive,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit', opacity: isActive ? 1 : 0.85 }}>
                  {index === 0 ? (
                    <HomeIcon fontSize="small" />
                  ) : index === 1 ? (
                    <ContentPasteIcon fontSize="small" />
                  ) : index <= 4 ? (
                    <InterpreterModeIcon fontSize="small" />
                  ) : index <= 5 ? (
                    <WbSunnyIcon fontSize="small" />
                  ) : (
                    <PlaylistAddCheckIcon fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={value.menu_name}
                  primaryTypographyProps={{ fontSize: 13.5, fontWeight: isActive ? 700 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar - carries the hamburger (mobile only) + title, plus the login/logout + email
          block, which intentionally stays here rather than in the sidebar (see drawerContent). */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: COLORS.surface,
          color: COLORS.textPrimary,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { xs: 'flex', md: 'none' }, color: COLORS.textPrimary }}
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
                color: COLORS.textPrimary,
                fontWeight: 'bold',
              }}
            >
              JJM Portfolio
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
            {sectionLinks.map((link) => (
              <Button key={link.label} onClick={() => handleClick(refMap[link.refKey])} sx={{ color: COLORS.textPrimary }}>
                {link.label}
              </Button>
            ))}

            {localStorage.getItem('user_email') ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                  id: {localStorage.getItem('user_email')}
                </Typography>
                <Button onClick={logOut} sx={{ color: COLORS.accent, fontWeight: 700 }}>
                  로그아웃
                </Button>
              </Box>
            ) : (
              <Button href="/signin" variant="contained" sx={{ backgroundColor: COLORS.accent, color: '#fff' }}>
                로그인
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {/* xs/sm (<900px): hamburger-triggered overlay drawer - matches the mockup's
            collapsed/hidden sidebar state, since the mockup itself has no JS to open one. */}
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

        {/* md+ (>=900px): pinned sidebar, always visible */}
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
