import { useRef, useEffect, useCallback, useState } from "react";
import styled from "styled-components";


const Container = styled.section`
  width : 100%;
  display:'flex';
  flex-direction: column;
  align-items: center;
  float:left;
`;

const StyledFileInput = styled.div`
  padding: 4px;
  border-bottom: 2px solid #E4EDFC;
  border-radius: 8px;
  width: 100%;
`;
//width: fit-content;
const AttachmentButton = styled.label`
  padding: 3px;
  background-color: #191b27;
  border-radius: 12px;
  color: white;
  font-weight: bold;
  cursor: pointer;
`;

const Input = styled.input`
  width : 100%;
  display: none;
`;

const AttachedFile = styled.p`
  font-size: 13px;
  height:30px;
  font-weight: bold;
  color: #999;
`;

type Props = {
    onChange: (value: any) => void;
}


const  FileButton :React.FC<Props> = ({onChange}) => {
  // 1️⃣
  const inputEl :any = useRef(null);
  const [fileName, setFileName] = useState([] as any);
  const fileInputHandler = useCallback((event:any) => {
    const files = event.target && event.target.files;
    setFileName([]);
    for(let i = 0; i< event.target.files.length ; i++){
        setFileName((prev: any) => [event.target.files[i].name, ...prev]);  

    }
  }, []);
  
  useEffect(() => {
    if (inputEl.current !== null) {
      inputEl.current.addEventListener("input", fileInputHandler);
    }
    return () => {
      inputEl.current && inputEl.current.removeEventListener("input", fileInputHandler);
    };
  }, [inputEl, fileInputHandler]);


  // 3️⃣
  return (
    <Container> 
      <label  style={{float:"left" ,width:'100%'}}>
        <StyledFileInput style={{width: '100%',float:'left',textAlign:'left' , display:'flex'}}>  
          <AttachmentButton htmlFor="file" >🔗 FILE UPLOAD</AttachmentButton> 
          <div style={{wordWrap: 'break-word', display: '-webkit-box',overflow:'hidden' ,textOverflow:'ellipsis', lineHeight:'1.5',WebkitLineClamp:'1',WebkitBoxOrient:'vertical', marginLeft:'10px',maxWidth:'80%' ,height:'30px',fontSize: '14px', fontWeight: 'bold' ,color: '#999',paddingTop:'5px'}}>
            {
              fileName.map((value:string , index:number) => {
                if(fileName.length === index + 1){
                  return value
                }else {
                  if(fileName.length !== 1){
                    return value + ','
                  }else {
                    return value
                  }
                  
                }
              })
            }
         </div>
        </StyledFileInput>
      </label>
      
      <Input type="file" id="file" onChange={(event) => {
        onChange(event);
      }} multiple ref={inputEl} /> 
    </Container>
  );
}


export default FileButton;