import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, {persistor} from './store/index.js'
import EntryAppLoadingScreen from './components/UI/EntryAppLoadingScreen.js';

import './sass/style.scss'

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <Provider store={store} >
        <PersistGate loading={null} persistor={persistor}>
            <EntryAppLoadingScreen>
                <App />
            </EntryAppLoadingScreen>
        </PersistGate>
    </Provider>
);

