import axios from "axios";

const url = 'http://localhost:8020';
export async function post (_url:String  , data:Object){
    
    const jsonData:any = JSON.parse(JSON.stringify(data))
    const config :Object = {"Content-Type": 'application/json'};
    const response  = await axios.post(
        url+_url ,
        jsonData,
        config
    ).then(function (response){
        console.log(response.data);
        return response.data;
    }).catch(function(error){
        console.log("error", error);
    });
    return response.data;
}


export async function postUpload (_url:String  , data:Object){

    const config :Object = {"Content-Type": 'multipart/form-data;'};
    const response  = await axios({
        url : url+_url,
        method:'post',
        data,
        headers :{
            'Content-Type': 'multipart/form-data;'
        },
        withCredentials:false
    }).then(function (response){
        console.log(response.data);
        return response.data;
    }).catch(function(error){
        console.log("error", error);
    });
    return response.data;
}

/*
export async function get (_url : String ){
    url + _url ;
}
*/
