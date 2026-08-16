import axios from "axios";
import { beginRequest, endRequest } from "./globalLoading";

// Drives the top progress bar (see globalLoading.ts / TopProgressBar.tsx) for every request
// made through the shared `axios` instance - post/get/postBoardSearch/postUpload here, plus any
// other file that does `import axios from "axios"` and calls it directly (interceptors are
// global to the module, not per-call-site), e.g. the weather fetches below.
axios.interceptors.request.use((config) => {
    beginRequest();
    return config;
}, (error) => {
    endRequest();
    return Promise.reject(error);
});
axios.interceptors.response.use((response) => {
    endRequest();
    return response;
}, (error) => {
    endRequest();
    return Promise.reject(error);
});

// Backend is always served on :8020, regardless of what port the frontend is on.
export const apiOrigin = window.location.hostname === 'localhost'
    ? 'http://localhost:8081'
    : 'https://api.jjmlab.com';
const url = apiOrigin;

function getAuthHeader(): { Authorization: string } | undefined {
    const token = localStorage.getItem('token');
    return token ? { Authorization: 'Bearer ' + token } : undefined;
}

// Backend error bodies aren't consistently shaped (some are JSON objects, some are
// double-JSON-encoded strings, some are plain text) - this never throws.
function extractErrorCode(error: any): string | undefined {
    const data = error?.response?.data;
    if (data == null) return undefined;
    if (typeof data === 'object') return data.code;
    if (typeof data === 'string') {
        try {
            return JSON.parse(data)?.code;
        } catch {
            return undefined;
        }
    }
    return undefined;
}

export async function post (_url:String  , data:Object ={}){

    const jsonData:any = JSON.parse(JSON.stringify(data))
    const response  = await axios.post(
        url+_url ,
        jsonData,
        {headers : getAuthHeader()}
    ).then(function (response){
        return response.data;
    }).catch(function(error){
        const code = extractErrorCode(error);
        if(code === '402'){
            return reissue()
        }
        console.error('post 요청 실패:', _url, error);
        return undefined;
    });
    if(response){
        return response.data;
    }

}
export async function get(url: string, params: any = {})  {
  try {
    const response = await axios.get(url, {
        params,
        headers: getAuthHeader(),
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
    const jsonData:any = JSON.parse(JSON.stringify(data))
    const response  = await axios.post(
        url+_url ,
        jsonData,
        {headers : getAuthHeader()}
    ).then(function (response){
        return response.data;
    }).catch(function(error){
        const code = extractErrorCode(error);
        if(code === '402'){
            return reissue()
        }
        console.error('postBoardSearch 요청 실패:', _url, error);
        return undefined;
    });
    return response;
}

export async function postUpload (_url:String  , data:Object){

    const response  = await axios({
        url : url+_url,
        method:'post',
        data,
        headers :{
            'Content-Type': 'multipart/form-data;',
            ...getAuthHeader()
        },
        withCredentials:false
    }).then(function (response){
        return response.data;
    }).catch(function(error){
        const code = extractErrorCode(error);
        if (code === '402') {
            return reissue()
        }
        console.error('postUpload 요청 실패:', _url, error);
        return undefined;
    });
    return response?.data;
}


export async function reissue (){
    const userId = localStorage.getItem("user_id");
    try {
        const response = await axios.post(url + '/auth/reissue', { user_id: userId });
        localStorage.setItem("token", response.data.token);
        // user_id (Kakao id) and user_email (real email) are separate keys - see kakaoAuth.tsx.
        localStorage.setItem("user_id", response.data.id);
        localStorage.setItem("user_email", response.data.email);
        window.location.reload();
    } catch (error) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_email");
        window.location.href = window.location.origin + "/";
    }
}

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const fetchWeatherByCity = async (city: string) => {
  const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
    params: {
      q: city,
      appid: process.env.REACT_APP_WEATHER_API_KEY,
      units: 'metric',
      lang: 'kr',
    },
  });
  return response.data;
};

export const fetchForecastByCity = async (city: string) => {
  const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
    params: {
      q: city,
      appid: process.env.REACT_APP_WEATHER_API_KEY,
      units: 'metric',
      lang: 'kr',
    },
  });
  return response.data;
};
