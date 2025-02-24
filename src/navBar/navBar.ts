import { post } from "../common/common";

export function menuList(){
    // 추후 관리자만 status 값 넘겨서 관리자 페이지 추가 예정 
    const object = {};
    const menuList = post('/menu/list' , object);
    // 가져왔다치고 
    
    return 
}