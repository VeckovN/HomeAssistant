import { configureStore} from '@reduxjs/toolkit';
import { persistStore, persistReducer, createTransform} from 'redux-persist'
import storage from 'redux-persist/lib/storage';
import authSlice from './auth-slice';
import unreadMessagesSlice from './unreadMessagesSlice';

const authPersistConfig = {
    key:'auth',
    storage,
    whitelist:['user'], //only persist the 'user' part of the state
}

//unreadMessages PERSIST only WHEN the user is logged.

// Custom Transform for Conditional Persistence of Unread Messages
const conditionalTransform = createTransform(
    // Transform state on its way to being serialized and persisted.
    (inboundState, key, state) => {
      // Only persist unreadMessages if user is logged in
      if (state.auth && state.auth.user) {
        return inboundState;
      }
      // Reset unreadMessages if user is not logged in
      return { unreadMessages: [], unreadCount: 0, error: false, loading: null };
    },
    // Transform state being rehydrated
    (outboundState, key) => outboundState,
    { whitelist: ['unreadMessages', 'unreadCount']}
  );

const unreadMessagesPersistConfig = {
    key:'unreadMessages',
    storage,
    // whitelist:['unreadMessages','unreadCount'],
    transform:[conditionalTransform]
}

const persistedAuthReducer = persistReducer(authPersistConfig, authSlice.reducer)
const persistedUnreadMessagesReducer = persistReducer(unreadMessagesPersistConfig, unreadMessagesSlice.reducer);

const store = configureStore({
    reducer:{
        auth: persistedAuthReducer,
        unreadMessages:persistedUnreadMessagesReducer,
        //other slices...
    },

    middleware:(getDefaultMiddleware)=>
    getDefaultMiddleware({
        serializableCheck: false, //to avoid unnecessary warning
    }),
})

export const persistor = persistStore(store);
export default store;