import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
// /https://stackoverflow.com/questions/43002444/make-axios-send-cookies-in-its-requests-automatically
// TO SEND COOKIE force credentials to every Axios requests
axios.defaults.withCredentials = true

const initialState ={
    user:null,
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
            alert("REDUX");
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

            if(response.data && response.data.error) {
                console.error("Registration error:", response.data.error);
                return thunkAPI.rejectWithValue(response.data.error);
            }
            return response.data;

        }catch(err){
            const message = (err.response && err.response.data.error) || err.message || err
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
            if(response.data){
                if(!response.data.error){
                    return response.data;
                }
                else
                    //put taken erron from server to action.payload (this will be persist in redux state)
                    return thunkAPI.rejectWithValue(response.data.error)//this is action.payload for message in useCase.login rejected
            }
        }
        catch(err){
            // const message = (err.response && err.response.data.error) || err.message || err
            const errorObj = (err.response && err.response.data) || err.message || err
            //return response.data -> contains {error:'message' errorType:'input'}
            //to get "error" prop - return res.status(401).json({error: "Incorrect username or password", errorType:true -> for set error input});
            return thunkAPI.rejectWithValue(errorObj);
        }
    }
)

export const logout = createAsyncThunk(
    'auth/logout',
    async (trunkAPI) =>{
        try{
            const response = await axios.get('http://localhost:5000/api/logout');
            // // //httpOnly:true , cookie cannot be manipulated through JS
         }
         catch(error){
            const message =  error.message || error || (error.response.data.error && error.response.data && error.response)
            trunkAPI.rejectWithValue(message)
         }
    }
)

export const sessionExpired = createAsyncThunk(
    'auth/sessionExpired',
    async(trunkAPI) =>{
        try{
            await axios.get('http://localhost:5000/api/logout');
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
        //for other ASYNC function we will use TRUNK func
        reset:(state)=>{
            state.message=' '
            state.success=false
            state.error=false
            state.loading=false 
        }
    },
    extraReducers: (builder) =>{
        builder
            .addCase(register.pending, (state)=>{
                //what we wanna do when the state goes on the register actions  pending
                state.loading = true;
            })
            .addCase(register.fulfilled, (state, action)=>{
                state.loading = false;
                state.success = true;
                state.message = "Client Sucessfully created"
            })
            .addCase(register.rejected, (state,action) =>{
                state.loading = false;
                state.success = false;
                state.error = true;
                //we set payload to message state because in catch block in register functon
                //we return thunkAPI.rejectWithValue(message); that return error in message const as payload
                state.user = true;
                state.message = action.payload
            })
            .addCase(login.pending, (state)=>{
                state.loading = true;
            })
            .addCase(login.fulfilled, (state,action)=>{
                state.loading = false;
                state.error = false;
                state.success = true;
                state.message ="You have successfully logged in"
                state.user = action.payload 
            })
            //rejectWithValue(errorObj); ->{error:'message', errorType:"user||password"}
            .addCase(login.rejected, (state, action)=>{
                state.loading =false;
                state.message = action.payload.error
                state.error = true;
                state.user = null;
            })
            .addCase(logout.fulfilled, (state)=>{
                state.user = null;
                state.success = true;
                state.message = "You are logged out"
            })
            .addCase(sessionExpired.fulfilled, (state)=>{
                state.user = null;
                state.success = true;
                state.message = "Your session expired"
            })
            
    }
})

export const {reset} = authSlice.actions;
export default authSlice;
