import { configureStore } from '@reduxjs/toolkit';

import authSlice from './auth-slice';
import unreadMessagesSlice from './unreadMessagesSlice';
// import unreadNotificationsSlice from './'; 

const store = configureStore({
    reducer:
    {   
        auth:authSlice.reducer,
        unreadMessages:unreadMessagesSlice.reducer,
        // unreadNotifications:unreadNotificationsSlice.reducer
    }
})


export default store;