import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {resetUnreadMessagesCount, getAllUnreadMessages} from '../services/chat.js';


//USING COOKIE OR LOCALSTORAGE INSTAED OF REDUX  PERSIST:
//1.Upon sucessful user login, unread messages are fetched and memoized in Cookie("unreadMEssages");
//which prevents loos of state when reloading page or closing the browser
//That causes more potential problems:
//Problem -> if the state changes and the page is reloaded, the state value won't be the last modified, but will be the same as when the user logged in(read from the cookie)
//How to solve it? -> I have to write to the Cookie after every state change
//example: If i decrenent the unreadCount for some user who changes unreadCount state and this value MUST BE written to the COOKIE to have last modified value

//BETTER SOLUTON -> use Redux Persist that automatcally saves your Redux store's states to a storage engine (like 'LocalStorage - cookie')

const initialState ={
    unreadMessages:[],
    unreadCount:0,
    error: false,
    loading: null
}

export const getUserUnreadMessages = createAsyncThunk(
    'unreadMessages/getUserUnreadMessages',
    async(username, thunkAPI) =>{ //user passed from register ( dispatch(register(userData) ))
        try{
            const response = await getAllUnreadMessages(username);

            if(response.data && response.data.error) {
                console.error("FetchUnreadMessages error:", response.data.error);
                return thunkAPI.rejectWithValue(response.data.error);
            }
            return response;

        }catch(err){
            const message = (err.response && err.response.data.error) || err.message || err
            //using thinkApi (passed in this function)
            return thunkAPI.rejectWithValue(message); //that will actualy reject and send the message as payload:message
        }
    }
)

export const resetUserUnreadMessagesCount = createAsyncThunk(
    'unreadMessages/resetUserUnreadMessagesCount',
    async({roomID, userID}, thunkAPI) =>{ //user passed from register ( dispatch(register(userData) ))
        try{
            const state = thunkAPI.getState().unreadMessages;
            console.log("ThunkAPI STATE: ", state);

            console.log("roomID: ", roomID);

            //need to check does roomID is inlcuded in unreadMessages array
            const unreadExists = Object.values(state.unreadMessages).some(
                (item) => item.roomID === roomID
            )

            if(!unreadExists){
                return thunkAPI.rejectWithValue('Room ID not found in unread messages');
            }

            const response = await resetUnreadMessagesCount(roomID, userID);
            console.log("response", response);
            return {roomID:roomID, removedCount:response.removedCount}
        }catch(err){
            console.log("resetUnreadMEssagesCoutn : ", err);
            // const message = (err.response && err.response.data.error) || err.message || err
            return thunkAPI.rejectWithValue(err.message); //that will actualy reject and send the message as payload:message
        }
    }
)

const unreadMessagesSlice = createSlice({
    name:'unreadMessages',
    initialState,
    reducers:{
        //this is Sync action to update totalUnread and unread.count prop without calling Async
        updateUnreadMessages: (state, action) =>{
            const {unreadUpdateStatus, roomID} = action.payload;
            //unreadUpdateStatus will be true if the user have already
            if(unreadUpdateStatus){
                const index = state.unreadMessages.findIndex(el => el.roomID == roomID);
                
                if(index !== -1){ //double check (safety check for found index)
                    const currentCount = state.unreadMessages[index].count
                    state.unreadMessages[index].count = currentCount + 1;
                }
                else{
                    state.unreadMessages.push({ roomID: roomID, count: 1 });
                }
            }
            else{
                state.unreadMessages.push({roomID:roomID, count:1})
            }
            state.unreadCount += 1;
        },

        resetUnreadMessages:(state)=>{
            state.unreadMessages =[]
            state.unreadCount = 0
            state.error = false
            state.loading = null
        }
    },
    extraReducers: (builder) =>{
        builder
            .addCase(getUserUnreadMessages.pending, (state)=>{
                //what we wanna do when the state goes on the register actions  pending
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserUnreadMessages.fulfilled, (state, action)=>{
                console.log("getUserUnreadMessages");
                state.loading = false;
                state.unreadMessages = action.payload.unread;
                state.unreadCount = action.payload.totalUnread;

            })
            .addCase(getUserUnreadMessages.rejected, (state,action) =>{
                state.loading = false;
                state.error = action.payload; //passed error from thunkAPI.rejectWithValue
            })    

            //We will see, but .fulfiled is enought 
            .addCase(resetUserUnreadMessagesCount.fulfilled, (state, action)=>{
                console.log("resetUnreadMessagesCount.fulfilled PAYLOAD", action.payload);
                //Filter here unread messages based on retunred removeUnreadMessages = createAsyncThunk roomID
                
                //When is this used in resetUserUnreadMEssagesCount
                // if(!unreadExists){
                //     return; 
                // }
                //use this here 
                // if(!action.payload){
                //     return;
                // }
                
                state.unreadMessages = state.unreadMessages.filter(
                    // (el) => el.roomID !== action.payload //action.payload => roomID
                    (el) => el.roomID !== action.payload.roomID //action.payload => roomID
                ),
                // state.unreadCount = ;
                state.unreadCount = state.unreadCount - action.payload.removedCount;

                state.loading = false;
            })
            .addCase(resetUserUnreadMessagesCount.rejected, (state,action) =>{
                console.log("resetUnreadMessagesCount.rejected, action:", action);
                //when the unread doesn't exist
                state.loading = false;
                state.error = action.payload;  
            })    
    }
})


export const {updateUnreadMessages, resetUnreadMessages} = unreadMessagesSlice.actions;
export default unreadMessagesSlice;

// export const unreadMessagesActions = unreadMessagesSlice.actions;
// //also export sync function
// export const {updateUnreadMessages} =  unreadMessagesSlice.actions;
// //and also export 
// export default unreadMessagesSlice;