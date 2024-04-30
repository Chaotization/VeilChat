import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './output.css';
import {BrowserRouter} from 'react-router-dom';

import fbconfig from './firebase/FirebaseConfig';

import 'tailwindcss/tailwind.css';
//const app = initializeApp(fbconfig);

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
