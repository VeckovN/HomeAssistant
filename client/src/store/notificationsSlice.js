import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {getNotifications, getMoreNotifications, markAllNotificationsAsRead} from '../services/houseworker';


const initialState ={
    notifications:[], //all user notifications
    unreadNotificationsCount:0,
    error: false,
    loading: null
}

export const getHouseworkerNotifications = createAsyncThunk(
    'notifications/getHouseworkerNotifications',
    async(username, thunkAPI) =>{ 
        try{
            const response = await getNotifications(username);

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

export const getMoreHouseworkerNotifications = createAsyncThunk(
    //check how to pass multiple variables 
    'notifications/getMoreHouseworkerNotifications',
    async({username, batchNumber} , thunkAPI) =>{
        try{
            console.log("UserID : ", username);
            console.log("BatchNUmber: ", batchNumber);
            const response = await getMoreNotifications(username, batchNumber);

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

export const markNotificationsAsRead = createAsyncThunk(
    'notifications/markNotificationsAsRead',
    async(username, thunkAPI) =>{
        try{
            await markAllNotificationsAsRead(username);
        }catch(err){
            const message = (err.response && err.response.data.error) || err.message || err
            return thunkAPI.rejectWithValue(message);        
        }
    }
)

const notificationsSlice = createSlice({
    name:'notifications',
    initialState,
    reducers:{
        //this is Sync action to restart/update states without calling Async
        resetNotifications:(state)=>{
            state.notifications = []
            state.unreadNotificationsCount = 0
            state.error = false
            state.loading = null
        },

        addNotification:(state, action) =>{
            console.log("addNotification: action payload: ", action.payload);
            state.notifications.push(action.payload)
            state.unreadNotificationsCount +=1
            state.error = false
            state.loading = null
        }
    },
    extraReducers: (builder) =>{
        builder
            .addCase(getHouseworkerNotifications.pending, (state)=>{
                state.loading = true;
                state.error = null;
            })
            .addCase(getHouseworkerNotifications.fulfilled, (state, action)=>{
                state.loading = false;
                console.log("getHouseworkerNotifcations: ", action.payload);
                state.notifications = [...action.payload.notifications];
                state.unreadNotificationsCount = action.payload.unreadCount;
            })
            .addCase(getHouseworkerNotifications.rejected, (state,action) =>{
                state.loading = false;
                state.error = action.payload; //passed error from thunkAPI.rejectWithValue
            })    
            
            .addCase(getMoreHouseworkerNotifications.pending, (state)=>{
                state.loading = true;
                state.error = null;
            })
            .addCase(getMoreHouseworkerNotifications.fulfilled, (state, action)=>{
                state.loading = false;
                console.log("getMOREEEEHouseworkerNotifcations: ", action.payload);
            })
            .addCase(getMoreHouseworkerNotifications.rejected, (state,action) =>{
                state.loading = false;
                state.error = action.payload; //passed error from thunkAPI.rejectWithValue
            })    

            .addCase(markNotificationsAsRead.pending, (state)=>{
                state.loading = true;
                state.error = null;
            })
            .addCase(markNotificationsAsRead.fulfilled, (state, action)=>{
                state.error = false
                state.loading = false;
                console.log("markNotificationsAsRead: ", action.payload);
            })
            .addCase(markNotificationsAsRead.rejected, (state,action) =>{
                state.loading = false;
                state.error = action.payload;
            })    
    }
})

// export const {updateUnreadComments, resetUnreadComments} = unreadCommentsSlice.actions;
export const {resetNotifications, addNotification} = notificationsSlice.actions;
export default notificationsSlice;
