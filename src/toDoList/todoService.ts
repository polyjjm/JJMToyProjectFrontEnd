import { post } from '../common/common'; // 사용자 정의 axios 래퍼 사용

// 📄 할 일 목록 조회 (날짜별)
export const fetchTodos = async (date: string) => {
  return await post('/todo/list', { 'date' : date  , 'user_id' : localStorage.getItem('user_email')});
};
export const fetchAllTodos = async () => {
  return await post('/todo/list/all' , {'user_id' : localStorage.getItem('user_email')}); // 백엔드에서 전체 할 일 리턴
};
// ➕ 할 일 추가
export const addTodo = async (todo: any) => {
  return await post('/todo',  todo);
};

// 📝 할 일 수정
export const updateTodo = async (id: number, updatedFields: any) => {
  return await post(`/todo/${id}`, updatedFields); // PUT 대신 POST 방식 사용 가정
};

// ❌ 할 일 삭제
export const deleteTodo = async (id: number) => {
  return await post(`/todo/delete/${id}`, {}); // DELETE 대신 POST 방식 사용 가정
};
