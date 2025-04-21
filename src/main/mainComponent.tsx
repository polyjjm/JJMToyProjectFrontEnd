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

const mainComponent: React.FC = () => {
  const scrollRef0 = useRef<HTMLDivElement>(null);
  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);
  const scrollRef3 = useRef<HTMLDivElement>(null);

//  const scrollRef = useRef <null | HTMLDivElement >; 

  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex' , backgroundColor: '#F8F9FA' }}>
        <NavBar scrollRef0={scrollRef0} scrollRef1={scrollRef1} scrollRef2={scrollRef2} scrollRef3={scrollRef3}/>
        <Box style={{width:'100%'}}>
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
              <Route path='/board/boardDetail' element={<BoardDetail/>} />
            </Routes>
            
        </Box>
        <Footer/>    
        </Box>    
    </Box>
   </BrowserRouter>
  );
}

export default mainComponent;
