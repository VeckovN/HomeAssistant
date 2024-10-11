import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import { getUnreadComments, getUnreadCommentsCount} from '../services/houseworker';

const initialState ={
    unreadComments:[],
    unreadCommentsCount:0,
    error: false,
    loading: null
}

export const getHouseworkerUnreadComments = createAsyncThunk(
    'unreadComments/getHouseworkerUnreadComments',
    async(username, thunkAPI) =>{ //user passed from register ( dispatch(register(userData) ))
        try{
            const response = await getUnreadComments(username);
            console.log("RESPONSE UNREAD COMMENTS: ", response);

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

export const markCommentAsRead = createAsyncThunk(
    'unreadComments/markCommentAsRead ',
    async(username, thunkAPI) =>{ //user passed from register ( dispatch(register(userData) ))
        try{
            //post comment As Read -> 
            const response = await getUnreadComments(username, commentID);

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

const unreadCommentsSlice = createSlice({
    name:'unreadComments',
    initialState,
    reducers:{
        //this is Sync action to update totalUnread and unread.count prop without calling Async
        updateUnreadComments: (state, action) =>{
            console.log("Action payload: ", action.payload);

            // const {unreadUpdateStatus, roomID} = action.payload;
            // if(unreadUpdateStatus){
            //     const index = state.unreadMessages.findIndex(el => el.roomID == roomID);
                
            //     if(index !== -1){ //double check (safety check for found index)
            //         const currentCount = state.unreadMessages[index].count
            //         state.unreadMessages[index].count = currentCount + 1;
            //     }
            //     else{
            //         //if unread messages with matching room aren't found
            //         state.unreadMessages.push({ roomID: roomID, count: 1 });
            //     }
            // }
            // else{
            //     state.unreadMessages.push({roomID:roomID, count:1})
            // }
            // //update totalCount in both situations
            // state.unreadCount += 1;
        }
    },
    extraReducers: (builder) =>{
        builder
            .addCase(getHouseworkerUnreadComments.pending, (state)=>{
                //what we wanna do when the state goes on the register actions  pending
                state.loading = true;
                state.error = null;
            })
            .addCase(getHouseworkerUnreadComments.fulfilled, (state, action)=>{
                state.loading = false;
                state.unreadComments = [...action.payload];
                state.unreadCommentsCount = action.payload.length;
            })
            .addCase(getHouseworkerUnreadComments.rejected, (state,action) =>{
                state.loading = false;
                state.error = action.payload; //passed error from thunkAPI.rejectWithValue
            })    

            .addCase(markCommentAsRead.pending, (state)=>{
                //what we wanna do when the state goes on the register actions  pending
                state.loading = true;
                state.error = null;
            })
            .addCase(markCommentAsRead.fulfilled, (state, action)=>{
                console.log("getHouseworkerUnreadComments");
                console.log("getHouse Builder add Case action payload: ", action.payload);
                state.loading = false;
                //remove comment from unreadComments
                // state.unreadMessages = action.payload.unread;

                //decrese unreadCount by 1
                //unreadCount is length of action.payload.unreadComments -> comments array

            })
            .addCase(markCommentAsRead.rejected, (state,action) =>{
                state.loading = false;
                state.error = action.payload; //passed error from thunkAPI.rejectWithValue
            })    

            // //We will see, but .fulfiled is enought 
            // .addCase(resetUserUnreadMessagesCount.fulfilled, (state, action)=>{
            //     console.log("resetUnreadMessagesCount.fulfilled PAYLOAD", action.payload);
            //     state.unreadMessages = state.unreadMessages.filter(
            //         // (el) => el.roomID !== action.payload //action.payload => roomID
            //         (el) => el.roomID !== action.payload.roomID //action.payload => roomID
            //     ),
            //     // state.unreadCount = ;
            //     state.unreadCount = state.unreadCount - action.payload.removedCount;

            //     state.loading = false;
            // })
            // .addCase(resetUserUnreadMessagesCount.rejected, (state,action) =>{
            //     console.log("resetUnreadMessagesCount.rejected, action:", action);
            //     //when the unread doesn't exist
            //     state.loading = false;
            //     state.error = action.payload;  
            // })    
    }
})


export const {updateUnreadComments} = unreadCommentsSlice.actions;
export default unreadCommentsSlice;
