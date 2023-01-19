import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
// /https://stackoverflow.com/questions/43002444/make-axios-send-cookies-in-its-requests-automatically
// TO SEND COOKIE force credentials to every Axios requests
axios.defaults.withCredentials = true

import Cookie from 'js-cookie';


//with login we set user in localStorage
// const user = JSON.parse(localStorage.getItem('user'));
const cookie = Cookie.get('user');
const expressCookie = Cookie.get("sessionLog"); //track sessoin expire
let user;
if(expressCookie!=undefined)
    user = JSON.parse(Cookie.get('user'));
else {
    user = false;
    Cookie.remove('user'); //also remove user
}
   

//console.log()
//WITH LOGIN GET USER FROM COOKIE NOT FROM LOCALSTORAGE 
//when is logged Express send cookie to client (cookieID -> 'sessionLog")

const initialState ={
    user: user ? user : null,
    message:'',
    success:false,
    error: false,
    loading: false,
}


//every Trunk has 3 states(pending, fulfilled, and rejected)
export const register = createAsyncThunk(
    'auth/register', //is action ,
    async(userFormData, thunkAPI) =>{ //user passed from register ( dispatch(register(userData) ))
        try{
            console.log("USER TYPE:" + typeof(userFormData));
            console.log("USER ST:" + JSON.stringify(userFormData));

            //THIS FETCH FUNCTION COULD BE IN SERVICE FOLDER (as Api Calls)
            // const response = await axios.post('http://localhost:5000/api/register', user);
            //with context-type multipart/form-data
            const response = await axios({
                method: 'post',
                url: 'http://localhost:5000/api/register',
                data: userFormData,
                headers: {
                    'Content-Type': `multipart/form-data`,
                },
            });
            console.log("REPOSNE FORM DATA: " + response);
            if(response.data){
                 //GET USER FROM COOKIE -EXPRESS SESSION (WE DON't NEED PUT THIS USER IN LOCAL STORATE)
                //if post request is success we put response (user) to localStorage
                localStorage.setItem('user', JSON.stringify(response.data));
                Cookie.set('user', JSON.stringify(response.data))
            }
               
            
            return response.data; 

        }catch(error){
            const message = error.message || error || (error.response && error.response.data)
            //using thinkApi (passed in this function)
            return thunkAPI.rejectWithValue(message); //that will actualy reject and send the message as payload:message
        }
    }
)

export const login = createAsyncThunk(
    'auth/login',
    async(user, thunkAPI) =>{
        try{
            const response = await axios.post('http://localhost:5000/api/login', user);
            console.log("RESESEPEPE: " + JSON.stringify(response))            
            // if(response.data)
            //     localStorage.setItem('user', JSON.stringify(response.data))
            
            // return response.data;
            if(response.data){
                if(!response.data.error){
                    localStorage.setItem('user', JSON.stringify(response.data))
                    Cookie.set('user', JSON.stringify(response.data))
                    return response.data;
                }
                else
                    //put taken erron from server to action.payload (this will be persist in redux state)
                    return thunkAPI.rejectWithValue(response.data.error)//this is action.payload for message in useCase.login rejected
            }
        }
        catch(error){
            const message = error.message || error || (error.response && error.response.data)
            return thunkAPI.rejectWithValue(message);
        }
    }
)

//that will be ok if we don't use Fetch in function (async call)
// export const logout = async()=>{
// }
//but we use fetch(async) and that must be AsyncTrunk
export const logout = createAsyncThunk(
    'auth/logout',
    async (trunkAPI) =>{
        try{
            const response = await axios.get('http://localhost:5000/api/logout');
        //we want to set state.message and this will be seted in extraReducer case:fulfilled
            localStorage.removeItem('user');
            Cookie.remove('user');
         }
         catch(error){
            const message =  error.message || error || (error.response.data.error && error.response.data && error.response)
            trunkAPI.rejectWithValue(message)
         }
    }
)

const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers:{
        //reduce function ( dispatch(addItemToCart)) example
        //reset sync function(after we logged or register, we want to reset this values on initial )
        //for other ASYNC function we will use TRUNK func
        reset:(state)=>{
            state.message='',
            state.success=false,
            state.error=false,
            state.loading=false
        },
    },
    extraReducers: (builder) =>{
        builder
            .addCase(register.pending, (state)=>{
                //what we wanna do when the state goes on the register actions  pending
                state.loading = true;
            })
            .addCase(register.fulfilled, (state, action)=>{
                //when is data backed (register is finnished)
                //we wanna take this data (payload) and set to user state
                state.loading = false;
                state.success = true;

                //add cookie info in action.payload
                state.user = action.payload //payload returned from reg function (return response.data); which is await axios.post(reg) 
            })
            .addCase(register.rejected, (state,action) =>{
                state.loading = false;
                state.succes = false;
                state.error = true;
                //we set payload to message state because in catch block in register functon
                //we return thunkAPI.rejectWithValue(message); that return error in message const as payload
                state.message = action.payload
                state.user = null; //ofc , user cant be seted
            })
            ///LOGIN//
            .addCase(login.pending, (state)=>{
                state.loading = true;
            })
            .addCase(login.fulfilled, (state,action)=>{
                state.loading = false;
                state.error = false;
                state.user = action.payload //our response from axios fetch
            })
            .addCase(login.rejected, (state, action)=>{
                state.loading =false;
                state.message = action.payload
                state.error = true;
                state.user = null;
            })
            ///// LOGOUT /////
            .addCase(logout.fulfilled, (state)=>{
                state.user = null;
            })
            
    }
})


//export all actions (in other compoennt take it from )
export const authActions = authSlice.actions;
//or export only this reset func
export const {reset} =  authSlice.actions;
//and also export 
export default authSlice;