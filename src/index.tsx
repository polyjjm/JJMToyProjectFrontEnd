import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './main/mainComponent';
import reportWebVitals from './reportWebVitals';
import store from './store';
import { Provider } from 'react-redux';
import { createTheme, ThemeProvider } from '@mui/material';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement); 


const theme = createTheme({
  typography: {
    fontFamily: `'Jua', 'Roboto',  sans-serif`,
  },
});
root.render(
  <Provider store={store}> {/* Redux store는 Provider로 감쌉니다 */}
    <ThemeProvider theme={theme}> {/* MUI 테마는 ThemeProvider로 감쌉니다 */}
      <App />
    </ThemeProvider>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
