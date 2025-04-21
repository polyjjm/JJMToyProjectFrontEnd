import React, { ForwardedRef, forwardRef, RefObject, useEffect, useRef, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { styled, useTheme, Theme, CSSObject} from '@mui/material/styles';
import {post} from '../common/common'
import { UseSelector, useSelector } from 'react-redux';
import { Button, ButtonGroup, Menu, MenuItem } from '@mui/material';

const drawerWidth = 200;

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window?: () => Window;
}

interface menu {
  
    depth :number ,
    menu_name : string ,
    menu_url : string,
    parent_id : string,
    sideYn : string,
    sort_no : string,
}

interface category {
  
  aboutMe : Number
}
type navBarProps = {
  scrollRef0: React.RefObject<HTMLDivElement>,
  scrollRef1: React.RefObject<HTMLDivElement>,
  scrollRef2: React.RefObject<HTMLDivElement>,
  scrollRef3: React.RefObject<HTMLDivElement>
};

export const NavBar : React.FC<navBarProps> = ({scrollRef0 ,scrollRef1, scrollRef2, scrollRef3} ,props:Props ) => {
  const [menu , setMenu] =useState<Array<menu>>([]);
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const object : Object = {}



  const handleClick = (ref: React.RefObject<HTMLDivElement>) => {
    if(ref.current){
      ref.current?.scrollIntoView({ behavior: "smooth", block: 'center' ,inline: "nearest" });
    }
  };


  
  let menuList:any;

  const element = useRef<HTMLDivElement>(null);
  const onMoveToElement = (props:any,ref:any) => {
    element.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(()=>{
    async function fetch() {
        
      menuList = await post('/menu/list' , {'currentPage' : 1});
      if(menuList){
        setMenu(menuList);
      }
      
    };
    fetch();
  

  }, [])



  
  
  let menuName = [{name : '홈',domain : '/'} ,{ name : '게시판' , domain : 'board'} ,{name : 'md게시판' , domain:'/common/mdEditor'}];
  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };
  
  const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  }));
/**
   추후 DB 에서 메뉴 가져와서 뿌려주는걸로 변경 
*/

  // Remove this const when copying and pasting into your project.
  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' ,width:`${drawerWidth}px`}}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
        style={{backgroundColor:'#FFFFFF'}}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" width="100%" >
            <div style={{ width:'100%' ,display:"flex"}}>
              <Box width="60%" display="flex">
              <h3  style={{color:'black'}}>JJM Portfolio</h3> 
              </Box>
              <Box marginTop="20px">
                <ButtonGroup variant="text" aria-label="Basic button group" >
                  <Button  onClick={() => handleClick(scrollRef0)} style={{color : 'black', fontWeight:'bolder'}}>About me</Button>
                  <Button  onClick={() => handleClick(scrollRef1)} style={{color : 'black', fontWeight:'bolder'}}>Skills</Button>
                  <Button  onClick={() => handleClick(scrollRef2)} style={{color : 'black', fontWeight:'bolder'}}>Archiving</Button>
                  <Button  onClick={() => handleClick(scrollRef3)} style={{color : 'black', fontWeight:'bolder'}}>Career</Button>
                </ButtonGroup>
              </Box>
            </div>
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{display:'flex'}}>        
        <Drawer variant="permanent">
          <DrawerHeader style={{ backgroundColor: "#202020"}}>
            <Box sx={{width:{sm : drawerWidth} , marginTop:'5px',textAlign:'center'}}>
              <img src={process.env.PUBLIC_URL + '/KakaoTalk_20250303_001054029.jpg'} style={{width:'80px',borderRadius: '50px',marginTop:'15px'}}/>
              <p style={{fontSize:'15px' ,color:'#9B9B9B'}}>wnwhd788@gmail.com</p>
            </Box>
          </DrawerHeader>
          <Divider />
          <List   style={{backgroundColor: "#202020" ,height:'100vh'}}>
            {menu.map((value , index) => (
              <ListItem key={value.menu_name} disablePadding sx={{ display: 'block' }}>
                <ListItemButton 
                  sx={{
                    minHeight: 48,
                    justifyContent:'initial',
                    px: 2.5,
                    color:'#9B9B9B'
                  }}
                  href={value.menu_url}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 3,
                      justifyContent: 'center',
                    }}
                  >
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={value.menu_name} sx={{ opacity: 1 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
      </Box>
    </Box>
  );
};
