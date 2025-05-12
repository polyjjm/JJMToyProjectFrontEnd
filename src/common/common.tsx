import axios from "axios";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { UNSAFE_NavigationContext as NavigationContext, useLocation } from 'react-router-dom';
import type { History, Blocker, Transition } from 'history';

let Authorization:any;

if(localStorage.getItem('token')){
    Authorization = {'Authorization': 'Bearer ' + localStorage.getItem('token')}
}    

const url = `${window.location.origin.replace(/:\d+$/, '')}:8020`;
export async function post (_url:String  , data:Object ={}){
    
    const jsonData:any = JSON.parse(JSON.stringify(data))
    const response  = await axios.post(
        url+_url ,
        jsonData,
        {headers : Authorization}
    ).then(function (response){
        console.log(response.data);
        return response.data;
    }).catch(function(error){
        const returnData = JSON.parse(error.response.data)
        if(returnData && returnData.code == '402'){
            return reissue()
        }
    });
    if(response){
        return response.data;
    }
    
}
export async function get(url: string, params: any = {})  {
  try {
    const response = await axios.get(url, { 
        params,
        withCredentials: false 
        }
    );
    return response.data;
  } catch (err) {
    console.error("GET 요청 실패:", err);
    throw err;
  }
};

export async function postBoardSearch (_url:String  , data:Object){
    console.log(localStorage.getItem('token') ,'token 확인');
    const jsonData:any = JSON.parse(JSON.stringify(data))
    const response  = await axios.post(
        url+_url ,
        jsonData,
        {headers : Authorization}
    ).then(function (response){
        //console.log(response.data);
        return response.data;
    }).catch(function(error){
        const returnData = JSON.parse(error.response.data)
        if(returnData && returnData.code == '402'){
            return reissue()
        }
    });
    return response;
}

export async function postUpload (_url:String  , data:Object){
    
    const config :Object = {"Content-Type": 'multipart/form-data;'};
    const response  = await axios({
        url : url+_url,
        method:'post',
        data,
        headers :{
            'Content-Type': 'multipart/form-data;',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        withCredentials:false
    }).then(function (response){
        console.log(response.data);
        return response.data;
    }).catch(function(error){
        const returnData = JSON.parse(error.response.data)
        if(returnData && returnData.code == '402'){
            return reissue()
        }
    });
    return response.data;
}




export async function reissue (){
    console.log(localStorage.getItem('token') ,'token 확인');
    console.log(localStorage.getItem('user_email') ,'email 확인');
    //const tt=  "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ3bndoZDc4OUBuYXZlci5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc0NDM5NDE2MywiZXhwIjoxNzQ0Mzk0NzYzfQ.MfokC9g4NPIUaJUTG4HgPG8BEeyTd8Aquu4r47FZToDvdWfHNrtKU5smdSpDGcn32r7ezn74GAARbFJkBSaVoA"
    const jsonData:any = JSON.parse(JSON.stringify({"user_id" : localStorage.getItem("user_email")}))
    console.log(jsonData , 'rrrrr');
    const response  = await axios.post(
        url+ '/auth/reissue' ,
        jsonData,
    ).then(function (response){

        if(response.data.code === '101'){
            alert("세션이 만료되었습니다 로그아웃합니다");
            localStorage.removeItem("token")
            localStorage.removeItem("user_email")
            location.href = "http://localhost:3000/";
        }else {

            console.log("주종민 확인중");
            localStorage.setItem("token" , response.data.token)
            localStorage.setItem("user_email" , response.data.id)
            window.location.reload();
        }
    }).catch(function(error){
        console.log("error", error);
        //여기서 로그아웃 remove 아이템 하고 로그인 페이지로
    });
 
}








// export const UserApi = axios.create({
//     baseURL: 'http://localhost:8080',
//     headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `${TOKEN_TYPE} ${ACCESS_TOKEN}`,
//         'REFRESH_TOKEN': REFRESH_TOKEN,
//     },
// });
// // 토큰 갱신
// const refreshAccessToken = async () => {
//     const response = await UserApi.get(`/api/v1/auth/refresh`);
//     ACCESS_TOKEN = response.data;
//     localStorage.setItem('accessToken', ACCESS_TOKEN);
//     UserApi.defaults.headers.common['Authorization'] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;
// }

// // 토큰 유효성 검사
// UserApi.interceptors.response.use((response) => {
//     return response;
// }, async (error) => {
//     const originalRequest = error.config;
//     if (error.response.status === 403 && !originalRequest._retry) {
//         await refreshAccessToken();
//         return UserApi(originalRequest);
//     }
//     return Promise.reject(error);
// });





