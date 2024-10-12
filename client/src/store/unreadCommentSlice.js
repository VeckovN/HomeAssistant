import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import { getUnreadComments, markUnreadComments} from '../services/houseworker';

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

            if(response.data && response.data.error) {
                console.error("FetchUnreadMessages error:", response.data.error);
                return thunkAPI.rejectWithValue(response.data.error);
            }
            return response;

        }catch(err){
            const message = (err.response && err.response.data.error) || err.message || err

            return thunkAPI.rejectWithValue(message); //that will actualy reject and send the message as payload:message
        }
    }
)

export const markCommentsAsRead = createAsyncThunk(
    'unreadComments/markCommentAsRead ',
    async(username, thunkAPI) =>{
        try{
            await markUnreadComments(username);
        }catch(err){
            const message = (err.response && err.response.data.error) || err.message || err
            return thunkAPI.rejectWithValue(message);        
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
            state.unreadComments.push(action.payload.newUpdateComment);
            state.unreadCommentsCount += 1;
        },
        
        resetUnreadComments:(state)=>{
            state.unreadComments =[]
            state.unreadCommentsCount = 0
            state.error = false
            state.loading = null
        }
    },
    extraReducers: (builder) =>{
        builder
            .addCase(getHouseworkerUnreadComments.pending, (state)=>{
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

            .addCase(markCommentsAsRead.pending, (state)=>{
                state.loading = true;
                state.error = null;
            })
            .addCase(markCommentsAsRead.fulfilled, (state, action)=>{
                state.unreadComments =[]
                state.unreadCommentsCount = 0
                state.error = false
                state.loading = false;
            })
            .addCase(markCommentsAsRead.rejected, (state,action) =>{
                state.loading = false;
                state.error = action.payload;
            })    
    }
})

export const {updateUnreadComments, resetUnreadComments} = unreadCommentsSlice.actions;
export default unreadCommentsSlice;
