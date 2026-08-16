import React, { useCallback, useEffect, useState } from 'react';
import {
  AppBar,
  Avatar,
  Badge,
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
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { apiOrigin, get, post } from '../common/common';
import { PERSONAL_INFO } from '../common/personalInfo';
import { COLORS } from '../theme';
import { readMenuCache, writeMenuCache } from '../common/menuCache';
import ChatPanel from '../chat/ChatPanel';

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

// Sidebar icon, keyed by menu_url instead of array position - the old version picked an icon by
// raw index (0=home, 1=board, 2-4=chat, 5=weather, 6+=todo), which silently breaks any time a
// menu item is added/removed/reordered (exactly what removing 채팅/날씨/할일 and adding
// 대시보드 does). A URL-keyed lookup can't drift out of sync with the menu's actual shape the
// same way - a route either has an icon here or falls back to the default, nothing shifts.
const MENU_ICONS: Record<string, React.ReactNode> = {
  '/': <HomeIcon fontSize="small" />,
  '/board': <ContentPasteIcon fontSize="small" />,
  '/dashboard': <DashboardOutlinedIcon fontSize="small" />,
  '/tools': <BuildOutlinedIcon fontSize="small" />,
};
const DEFAULT_MENU_ICON = <ContentPasteIcon fontSize="small" />;

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
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const refMap = { scrollRef0, scrollRef1, scrollRef2, scrollRef3 };
  const currentUserId = localStorage.getItem('user_id');
  // A guest chat participant (NicknameInputPage.tsx) also sets user_id (their chosen nickname)
  // but never gets a JWT - checking token, not user_id, is what actually distinguishes "really
  // logged in via Kakao" from "just has a chat nickname". Without this, a guest visiting any
  // other page would incorrectly see the chat bell/panel and the topbar's "id: / 로그아웃"
  // state instead of "로그인" (this was already slightly wrong before the chat bell existed -
  // the old topbar branch keyed off the same misleading check).
  const isLoggedIn = !!localStorage.getItem('token');

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
    // One-time migration: sessions created before board_userName/comment ownership started
    // being compared by real email stored a Kakao id under the 'user_email' key and never had
    // a 'user_id' key at all (see kakaoAuth.tsx). Running with that stale shape silently breaks
    // board edit/delete visibility, so force a clean re-login instead of limping along with it.
    if (localStorage.getItem('token') && !localStorage.getItem('user_id')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user_email');
    }
  }, []);

  useEffect(() => {
    async function fetchMenu() {
      // Menu structure rarely changes, and NavBar mounts once for the whole app (not per
      // route - React Router only swaps the <Routes> subtree), so this only needs to hit the
      // network at all once per hour per browser. See menuCache.ts for the storage + TTL.
      const cached = readMenuCache<menu[]>();
      if (cached) {
        setMenu(cached);
        return;
      }
      const menuList = await post('/menu/list', { currentPage: 1 });
      if (menuList) {
        setMenu(menuList);
        writeMenuCache(menuList);
      }
    }
    fetchMenu();
  }, []);

  const refreshUnreadTotal = useCallback(async () => {
    if (!isLoggedIn || !currentUserId) return;
    try {
      // GET (not post()) - unreadCount is a @GetMapping, and get() returns the response body
      // as-is (one "data" unwrap needed here), unlike post()'s helper which unwraps twice.
      const result = await get(apiOrigin + `/api/chat/unreadCount/${currentUserId}`);
      if (result && typeof result.data === 'number') setUnreadTotal(result.data);
    } catch {
      // Non-fatal - the badge just stays at its last known value.
    }
  }, [currentUserId]);

  // No dedicated "unread count changed" WebSocket event exists (see ChatRoomController's
  // comments) - a short poll is simple and cheap enough at personal-site scale, and the panel
  // itself does a fresher fetch whenever it's opened/a room is read (see ChatPanel.tsx).
  useEffect(() => {
    if (!isLoggedIn) return;
    refreshUnreadTotal();
    const id = setInterval(refreshUnreadTotal, 20000);
    return () => clearInterval(id);
  }, [isLoggedIn, refreshUnreadTotal]);

  const logOut = () => {
    // Kakao's /user/unlink API requires an admin key, which can't be safely held in
    // client-side code. Logout here only clears the local session; the JWT simply expires.
    localStorage.removeItem('user_id');
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
          elsewhere since they just no-op if the ref isn't mounted. Distinct from the header's
          former About me/Skills/Archiving/Career buttons (now removed in favor of the chat
          bell) - this sidebar list stays since it's a quick-jump aid, not a duplicate top-nav. */}
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
        {menu.map((value) => {
          const isActive = location.pathname === value.menu_url;
          // Menu entries are all internal SPA routes today, but this stays defensive in case a
          // future entry ever points off-site - only internal ones should go through the
          // client-side router.
          const isExternal = /^https?:\/\//.test(value.menu_url);
          const itemSx = {
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
          };
          const itemContent = (
            <>
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit', opacity: isActive ? 1 : 0.85 }}>
                {MENU_ICONS[value.menu_url] ?? DEFAULT_MENU_ICON}
              </ListItemIcon>
              <ListItemText
                primary={value.menu_name}
                primaryTypographyProps={{ fontSize: 13.5, fontWeight: isActive ? 700 : 500 }}
              />
            </>
          );
          return (
            <ListItem key={value.menu_name} disablePadding>
              {/* Real <a> triggers a full page reload (which was the actual cause of "menu
                  re-fetched on every navigation" - NavBar remounting from scratch each time,
                  not the useEffect re-firing) - Link keeps navigation client-side so NavBar
                  (and its cached menu) survives the transition. */}
              {isExternal ? (
                <ListItemButton component="a" href={value.menu_url} sx={itemSx}>
                  {itemContent}
                </ListItemButton>
              ) : (
                <ListItemButton component={RouterLink} to={value.menu_url} onClick={() => setMobileOpen(false)} sx={itemSx}>
                  {itemContent}
                </ListItemButton>
              )}
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar - carries the hamburger (mobile only) + title, the chat bell (replaces the old
          About me/Skills/Archiving/Career links - see MENU_ICONS comment and chat-mockup.html),
          and the login/logout + id block. */}
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
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: COLORS.textPrimary,
                fontWeight: 'bold',
              }}
            >
              JJM Portfolio
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 } }}>
            {/* Chat only makes sense for a logged-in identity (guests use the separate
                NicknameInputPage entry point, not this bell) - see chat-mockup.html. */}
            {isLoggedIn && (
              <IconButton
                onClick={() => setChatPanelOpen(true)}
                sx={{
                  bgcolor: chatPanelOpen ? COLORS.accent : COLORS.accentSoft,
                  color: chatPanelOpen ? '#fff' : COLORS.textSecondary,
                  borderRadius: '10px',
                  width: 36, height: 36,
                  '&:hover': { bgcolor: chatPanelOpen ? '#211F1B' : COLORS.accentSoft },
                }}
              >
                <Badge
                  badgeContent={unreadTotal}
                  max={99}
                  sx={{ '& .MuiBadge-badge': { bgcolor: '#B3403B', color: '#fff', fontWeight: 700, fontSize: 10 } }}
                >
                  <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
                </Badge>
              </IconButton>
            )}

            {isLoggedIn ? (
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                  id: {currentUserId}
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

      {isLoggedIn && (
        <ChatPanel
          open={chatPanelOpen}
          onClose={() => setChatPanelOpen(false)}
          onRoomsChanged={refreshUnreadTotal}
        />
      )}

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
