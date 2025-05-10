import './mainComponent.css';
import {NavBar} from '../navBar/appShell';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import {Home} from '../home/Home';
import Board from '../borad/board';
import BoardInsert from '../borad/boardInsert';
import BoardDetail from '../borad/boardDetail';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Footer from './footer';
import { useRef } from 'react';
import Signin from '../user/signin';
import KakaoAuth from '../user/kakaoAuth';
import ChatGpt from '../chatGpt/chatGpt';
import BoardUpdate from '../borad/boardUpdate';
import ChatRoom from '../chat/chatRoom';

const mainComponent: React.FC = () => {
  const scrollRef0 = useRef<HTMLDivElement>(null);
  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);
  const scrollRef3 = useRef<HTMLDivElement>(null);

//  const scrollRef = useRef <null | HTMLDivElement >; 

  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex' , backgroundColor: '#F8F9FA'}}>
      <div>  
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8340992511391681" crossOrigin="anonymous"></script>
      </div>
        <NavBar  scrollRef0={scrollRef0} scrollRef1={scrollRef1} scrollRef2={scrollRef2} scrollRef3={scrollRef3}/>
        <Box style={{width:'100%'}}>
        <Box style={{display:'flex' ,justifyContent: 'center'}}>
          <Box style={{display:'flex',border:'1px solid green',height:'1200px',width:'200px',marginTop:'200px',marginLeft:'40px'}}>
          <ins className="kakao_ad_area" style={{display:'none'}}
            data-ad-unit = "DAN-Ho9lSpfd2Z7FlSC5"
            data-ad-width = "160"
            data-ad-height = "600"></ins>
            <script type="text/javascript" src="//t1.daumcdn.net/kas/static/ba.min.js" async></script>
          </Box>
          <Box style={{width:'1200px', margin:'auto',minHeight:'850px'}}>  
              <Toolbar /> 
              <Routes>
                <Route path='/login/kakao/oauth' element={<KakaoAuth />}/>
                <Route path='/' element={<Home scrollRef0={scrollRef0} scrollRef1={scrollRef1} scrollRef2={scrollRef2} scrollRef3={scrollRef3}/>} />
                <Route path='/signin' element={<Signin/>} />
                <Route path='/board' element={<Board/>} />
                <Route path='/board/boardInsert' element={<BoardInsert/>}/>
                <Route path='/board/boardPreview' element={<BoardDetail/>} />
                <Route path='/board/boardDetail' element={<BoardDetail/>} />
                <Route path='/board/boardUpdate' element={<BoardUpdate/>} />
                <Route path='/chatGptApi' element={<ChatGpt/>} />
                <Route path='/chat' element={<ChatRoom/>} />
              </Routes>
              
          </Box>
          <Box style={{display:'flex',border:'1px solid green',height:'1200px',width:'200px',marginTop:'200px'}}>
           <ins className="kakao_ad_area" style={{display:'none'}}
              data-ad-unit = "DAN-oMqbEDhEc68mzHvi"
              data-ad-width = "160"
              data-ad-height = "600"></ins>
              <script type="text/javascript" src="//t1.daumcdn.net/kas/static/ba.min.js" async></script>
          </Box>
        </Box>
        <Footer/>    
        </Box>    
    </Box>
   </BrowserRouter>
  );
}

export default mainComponent;
