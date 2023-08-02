import { Analytics } from '@vercel/analytics/react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './views/App';

import 'antd/dist/reset.css';
import './styles/index.scss';
import 'react-loading-skeleton/dist/skeleton.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  //   <BrowserRouter>
  //     <App />
  //   </BrowserRouter>
  // </React.StrictMode>
  <BrowserRouter>
    <App />
    <Analytics />
  </BrowserRouter>
);
