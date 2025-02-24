//redux 생성
let user = createSlice({
    name: 'menu',
    initialState: {
    menuList: {}
    },
    reducers:{
        changMenu(state , action){
            /* 
                원본데이터 : state 
                가져온 데이터 action.payload
                ex) 원본에 가져온값 넣기 
                state.변수명 - action.payload.변수명
                
            */
        }
    }
});
export let {changMenu} = menu.changMenu;
// redux 등록 
export default configureStore({
    reducer: {
        menu : menu.reducer
    },
});