import { Analytics } from '@vercel/analytics/react';
import ReactDOM from 'react-dom/client';
import 'react-loading-skeleton/dist/skeleton.css';
import { BrowserRouter } from 'react-router-dom';

import './styles/index.scss';
import App from './views/App';

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
