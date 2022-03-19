import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles'
import reportWebVitals from './reportWebVitals';
import PageRouter from './pageRouter';
import {appTheme} from './Resources/theme'

ReactDOM.render(
  <ThemeProvider theme={appTheme}>
    <React.StrictMode>
      <Router >
        <PageRouter />
      </Router>
    </React.StrictMode>
  </ThemeProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
