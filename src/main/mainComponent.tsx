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
const mainComponent: React.FC = () => {
  const scrollRef0 = useRef<HTMLDivElement>(null);
  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);
  const scrollRef3 = useRef<HTMLDivElement>(null);

//  const scrollRef = useRef <null | HTMLDivElement >; 

  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex' }}>
        <NavBar scrollRef0={scrollRef0} scrollRef1={scrollRef1} scrollRef2={scrollRef2} scrollRef3={scrollRef3}/>
        <Box sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - 240px)` }}}>
          <Toolbar />
            <Routes>
              <Route path='/' element={<Home scrollRef0={scrollRef0} scrollRef1={scrollRef1} scrollRef2={scrollRef2} scrollRef3={scrollRef3}/>} />
              <Route path='/board' element={<Board/>} />
              <Route path='/board/boardInsert' element={<BoardInsert/>} />
              <Route path='/board/boardPreview' element={<BoardInsert/>} />
              <Route path='/board/boardDetail' element={<BoardDetail/>} />
            </Routes>
            <Footer/>
        </Box>
        
    </Box>
   </BrowserRouter>
  );
}

export default mainComponent;
