import {createAsyncThunk, createSlice, isFulfilled} from '@reduxjs/toolkit';
import {resetUnreadMessagesCount, getAllUnreadMessages} from '../services/chat.js';
import Cookie from 'js-cookie';


//get unreadMessagesCookie(if avilable) on page reload(because the redux state is restarted on page reload)
const unreadMessagesCookie = Cookie.get("unreadMessages");

if(unreadMessagesCookie){
    console.log("\n JSON.parse(unreadMessagesCookie).unread", JSON.parse(unreadMessagesCookie).unread);
    console.log("JSON.parse(unreadMessagesCookie).unreadCount", JSON.parse(unreadMessagesCookie).unreadCount);
}

const initialState ={
    unreadMessages: unreadMessagesCookie ? JSON.parse(unreadMessagesCookie).unread : [],
    unreadCount: unreadMessagesCookie ? JSON.parse(unreadMessagesCookie).totalUnread : 0,
    error: false,
    loading: null
}
// const initialState ={
//     unreadMessages:[],
//     unreadCount:0,
//     error: false,
//     loading: null
// }

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

// export const resetUserUnreadMessagesCount = createAsyncThunk(
//     'unreadMessages/resetUserUnreadMessagesCount',
//     async({roomID, userID}, thunkAPI) =>{ //user passed from register ( dispatch(register(userData) ))
//         try{
//             await resetUnreadMessagesCount(roomID, userID);
//             // return response.data; //An array of unread messages
//             return roomID; //use this in extraReducer to filter unreadMessages(remove unread messages from current array)
//         }catch(err){
//             console.log("resetUnreadMEssagesCoutn : ", err);
//             // const message = (err.response && err.response.data.error) || err.message || err
//             return thunkAPI.rejectWithValue(err.message); //that will actualy reject and send the message as payload:message
//         }
//     }
// )

export const resetUserUnreadMessagesCount = createAsyncThunk(
    'unreadMessages/resetUserUnreadMessagesCount',
    async({roomID, userID}, thunkAPI) =>{ //user passed from register ( dispatch(register(userData) ))
        try{
            //HOW TO ACCESS to STATE.unreadMessage FROM HERE (after the .addCase is )
            //something thrynApi.getStates -> RESEARCH WITH CHATGPT
            const state = thunkAPI.getState();
            console.log("ThunkAPI STATE: ", state);

            //need to check does roomID is inlcuded in unreadMessages array
            const unreadExists = Object.values(state.unreadMessages).some(
                (item) => item.roomID === roomID
            )

            //return null when unreadDoesn'tExist or use rejectWithValue
            // if(!unreadExists){
            //     return; 
            // }

            if(!unreadExists){
                return thunkAPI.rejectWithValue('Room ID not found in unread messages');
            }

            await resetUnreadMessagesCount(roomID, userID);
            return roomID
            // return {roomID, removedCount}

            // if(unreadExists){
            //     await resetUnreadMessagesCount(roomID, userID);
            //     // dispatch(resetUnreadMM(roomID, user.userID));
            //     return roomID
            // }
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
    reducers:{},
    extraReducers: (builder) =>{
        builder
            .addCase(getUserUnreadMessages.pending, (state)=>{
                //what we wanna do when the state goes on the register actions  pending
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserUnreadMessages.fulfilled, (state, action)=>{
                state.loading = false;
                state.unreadMessages = action.payload.unread;
                state.unreadCount = action.payload.totalUnread;

                Cookie.set('unreadMessages', JSON.stringify(action.payload));

                // state.message = "Unread Messages successfully featched"
            })
            .addCase(getUserUnreadMessages.rejected, (state,action) =>{
                state.loading = false;
                // state.error = true;
                state.error = action.payload; //passed error from thunkAPI.rejectWithValue
                // state.error = action.payload.error; //pass error message 
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
                    (el) => el.roomID !== action.payload //action.payload => roomID
                    // (el) => el.roomID !== action.payload.roomID //action.payload => roomID
                ),
                // state.unreadCount = ;
                // state.unreadCount = state.unreadCount - action.payload.removedCount;

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

//export all actions (in other compoennt take it from )
// export const authActions = authSlice.actions;
export const unreadMessagesActions = unreadMessagesSlice.actions;
//or export only this reset func
// export const {reset} =  authSlice.actions;

//and also export 
export default unreadMessagesSlice;