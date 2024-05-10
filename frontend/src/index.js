import { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// ** Redux Imports
import { store } from './redux/store';
import { Provider } from 'react-redux';

// ** Toast
import { Toaster } from 'react-hot-toast';

import SpinnerComponent from './components/SpinnerComponent';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './assets/scss/app-loader.scss';

import reportWebVitals from './reportWebVitals';

// ** Lazy load app
const LazyApp = lazy(() => import('./App'));

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <Provider store={store}>
      <Suspense fallback={<SpinnerComponent />}>
        <LazyApp />
        <Toaster position="top-right" toastOptions={{ className: 'react-hot-toast' }} />
      </Suspense>
    </Provider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
