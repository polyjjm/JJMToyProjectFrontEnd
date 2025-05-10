//redux 생성
let menu = createSlice({
  name: 'menu',
  initialState: {
    menuList: {}
  },
  reducers: {
    changMenu(state, action) {
      // reducer 로직 넣기
    }
  }
});

export let { changMenu } = menu.actions;
// redux 등록 
export default configureStore({
    reducer: {
        menu : menu.reducer
    },
});