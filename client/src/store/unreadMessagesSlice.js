import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {resetUnreadMessagesCount, getAllUnreadMessages, resetUsersUnreadMessagesCount, forwardUnreadMessagesFromOldToNewRoom} from '../services/chat.js';

const initialState ={
    unreadMessages:[],
    unreadCount:0,
    error: false,
    loading: null
}

export const getUserUnreadMessages = createAsyncThunk(
    'unreadMessages/getUserUnreadMessages',
    async(username, thunkAPI) =>{
        try{
            const response = await getAllUnreadMessages(username);

            if(response.data && response.data.error) {
                console.error("FetchUnreadMessages error:", response.data.error);
                return thunkAPI.rejectWithValue(response.data.error);
            }
            return response;

        }catch(err){
            const message = (err.response && err.response.data.error) || err.message || err
            return thunkAPI.rejectWithValue(message); 
        }
    }
)

export const resetUserUnreadMessagesCount = createAsyncThunk(
    'unreadMessages/resetUserUnreadMessagesCount',
    async({roomID, userID}, thunkAPI) =>{
        try{
            const state = thunkAPI.getState().unreadMessages;
            const unreadExists = Object.values(state.unreadMessages).some(
                (item) => item.roomID === roomID
            )

            if(!unreadExists){
                return thunkAPI.rejectWithValue('Room ID not found in unread messages');
            }

            const response = await resetUnreadMessagesCount(roomID, userID);
            return {roomID:roomID, removedCount:response.removedCount}
        }catch(err){
            console.error("resetUnreadMEssagesCoutn : ", err);
            return thunkAPI.rejectWithValue(err.message);
        }
    }
)

export const resetUsersUnreadMessagesbyRoomID = createAsyncThunk(
    'unreadMessages/resetUsersUnreadMessagesbyRoomID ',
    async({roomID, clientID}, thunkAPI) =>{
        try{
            const response = await resetUsersUnreadMessagesCount(roomID, clientID);
            return {roomID:roomID, removedCount:response.removedClientUnreadCount}
        }catch(err){
            console.error("resetUnreadMEssagesCoutn : ", err);
            return thunkAPI.rejectWithValue(err.message);
        }
    }
)

export const forwardUnreadMessagesToNewRoom = createAsyncThunk(
    'unreadMessages/forwardUnreadMessagesToNewRoom ',
    async({oldRoomID, newRoomID, kickedUserID}, thunkAPI) =>{
        try{
            await forwardUnreadMessagesFromOldToNewRoom({oldRoomID, newRoomID, kickedUserID});
            return {oldRoomID, newRoomID}
        }catch(err){
            console.error("forward unread messages : ", err);
            return thunkAPI.rejectWithValue(err.message);
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

        removeUnreadMessages: (state, action) =>{
            const messageIndex = state.unreadMessages.findIndex(
                (el) => el.roomID === action.payload.roomID
            )

            if(messageIndex !== -1){
                const removedCount = parseInt(state.unreadMessages[messageIndex].count);
                state.unreadCount -= removedCount;

                state.unreadMessages = state.unreadMessages.filter(
                    (el) => el.roomID !== action.payload.roomID //action.payload => roomID
                );
            }

            state.loading = false;
        },

        forwardUnreadMessages: (state, action) =>{
            const {oldRoomID, newRoomID} = action.payload;  
                      
            const oldRoom = state.unreadMessages.find(el => el.roomID === oldRoomID);
            const unreadRoomCount = oldRoom ? oldRoom.count : null;

            state.unreadMessages = state.unreadMessages.map((message) =>
                message.roomID === oldRoomID
                    ? {roomID: newRoomID, count:unreadRoomCount} // Update the room ID immutably
                    : message
            );
            state.loading = false;
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
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserUnreadMessages.fulfilled, (state, action)=>{
                state.loading = false;
                state.unreadMessages = action.payload.unread;
                state.unreadCount = action.payload.totalUnread;
            })
            .addCase(getUserUnreadMessages.rejected, (state,action) =>{
                state.loading = false;
                state.error = action.payload; //passed error from thunkAPI.rejectWithValue
            })    

            .addCase(resetUserUnreadMessagesCount.fulfilled, (state, action)=>{
                state.unreadMessages = state.unreadMessages.filter(
                    (el) => el.roomID !== action.payload.roomID //action.payload => roomID
                ),
                state.unreadCount = state.unreadCount - action.payload.removedCount;
                state.loading = false;
            })
            .addCase(resetUserUnreadMessagesCount.rejected, (state,action) =>{
                state.loading = false;
                state.error = action.payload;  
            })    

            .addCase(resetUsersUnreadMessagesbyRoomID.fulfilled, (state, action)=>{
                state.unreadMessages = state.unreadMessages.filter(
                    (el) => el.roomID !== action.payload.roomID //action.payload => roomID
                ),
                state.unreadCount = state.unreadCount - action.payload.removedCount;
                state.loading = false;
            })
            .addCase(resetUsersUnreadMessagesbyRoomID.rejected, (state,action) =>{
                state.loading = false;
                state.error = action.payload;  
            }) 

            .addCase(forwardUnreadMessagesToNewRoom.fulfilled, (state, action)=>{
                const {oldRoomID, newRoomID} = action.payload;
   
                const oldRoom = state.unreadMessages.find(el => el.roomID === oldRoomID);
                const unreadRoomCount = oldRoom ? oldRoom.count : null;
    
                state.unreadMessages = state.unreadMessages.map((message) =>
                    message.roomID === oldRoomID
                        ? {roomID: newRoomID, count:unreadRoomCount} // Update the room ID immutably
                        : message
                );
                state.loading = false;
            })
            .addCase(forwardUnreadMessagesToNewRoom.rejected, (state,action) =>{
                state.loading = false;
                state.error = action.payload;  
            })    
    }
})

export const {updateUnreadMessages, resetUnreadMessages, removeUnreadMessages, forwardUnreadMessages} = unreadMessagesSlice.actions;
export default unreadMessagesSlice;