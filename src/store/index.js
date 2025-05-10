import { configureStore, createSlice } from '@reduxjs/toolkit';

const menu = createSlice({
  name: 'menu',
  initialState: {
    menuList: {}
  },
  reducers: {
    changMenu(state, action) {
      state.menuList = action.payload;
    }
  }
});

export const { changMenu } = menu.actions;

const store = configureStore({
  reducer: {
    menu: menu.reducer  // ✅ 여기에 등록해야 함!
  }
});

export default store;