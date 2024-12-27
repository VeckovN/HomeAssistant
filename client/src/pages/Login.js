//Adding session timeout in a page in Reactjs
//https://stackoverflow.com/questions/50036145/adding-session-timeout-in-a-page-in-reactjs
import {useDispatch} from 'react-redux';
import { useEffect } from 'react';
import {login, reset as resetRedux} from '../store/auth-slice.js';
import {getUserUnreadMessages} from '../store/unreadMessagesSlice.js'
import {getHouseworkerUnreadComments} from '../store/unreadCommentSlice.js';
import {getHouseworkerNotifications} from '../store/notificationsSlice.js';
import { useForm } from 'react-hook-form';
import {zodResolver} from "@hookform/resolvers/zod";
import { string, z } from "zod";

import '../sass/pages/_login.scss';

const schema = z.object({
    username: string().min(4, {message:"Username must contain at least 4 characters"}),
    password: string().min(1, {message:"Password is required"})
})

const Login = () =>{
    const initialState ={
        username:'',
        password:'',
    }
    const {register, handleSubmit, reset, setError, setValue ,formState, formState:{isSubmitSuccessful}} = useForm({defaultValues:initialState, resolver: zodResolver(schema)});
    const {errors} = formState; 
    const dispatch = useDispatch();   

    const onSubmitHandler = (formValues) =>{
        //error is taken from trunk in redux -> return thunkAPI.rejectWithValue(message);
        dispatch(login(formValues))
            .unwrap()
            .then((res)=>{ //res -> response of login dispatch 
                //If login is successful, get all unread messages,comments
                dispatch(getUserUnreadMessages(formValues.username));          
                if(res.type === "Houseworker"){
                    dispatch(getHouseworkerUnreadComments(formValues.username));
                    dispatch(getHouseworkerNotifications(formValues.username));
                }
            })
            .catch((rejectedValue) => {
                const errorType = rejectedValue.errorType;
                if (errorType) {
                    if(errorType === 'input'){
                        setError('username', { type: 'manual', message: 'Invalid username or password'});
                        setError('password', { type: 'manual', message: 'Invalid username or password'});
                        setValue('username', '', { shouldValidate: false })
                        setValue('password', '', { shouldValidate: false })
                    }
                }
            });
        dispatch(resetRedux());
    }

    return (
        <>
            <div className ='login_container'>
                <div className="login_context">

                    <picture className="login-image">
                        <source srcSet="../assets/images/loginBackground.webp" type="../assets/images/webp"/>
                        <img
                            src={require('../assets/images/loginBackground.jpg')}
                            alt="Login Image"
                            className="login-image"
                        />
                    </picture>

                    <div className='context-item'>

                        <div className='login_welcome'>
                            <h3>Welcome</h3>
                            <div className='logo-h'>Home Assistant</div>
                        </div>

                        <div className='demo_accounts'>
                            <div className='demo_accounts-title'>Demo Accounts</div>
                            <div className='accounts'>
                                <div className='account-item'>
                                    <div className='account-item-type'>Client</div>
                                    <div>Username: <span>Veckov</span></div>
                                    <div>Password: <span>veckov</span></div>
                                </div>
                                <div>
                                    <div className='account-item-type'>Houseworker</div>
                                    <div>Username: <span>Sara22</span></div>
                                    <div>Password: <span>sara22</span></div>
                                </div>
                            </div>
                        </div>


                        <form onSubmit={handleSubmit(onSubmitHandler)} className='login_form'>
                            <div className='input_container'>
                                <input
                                    type='text'
                                    placeholder='Enter a username'
                                    //register has (name="username", onChange, onBlur and ref props) 
                                    {...register('username')}
                                    className={`login_input ${errors.username ? 'error' : ''}`}
                                />
                                <div className="input_error">{errors.username?.message}</div>
                            </div>
                            
                            <div className='input_container'>
                                <input
                                    type='password'
                                    placeholder='Enter password'
                                    autoComplete="off"
                                    {...register('password')}
                                    className={`login_input ${errors.password ? 'error' : ''}`}
                                />
                                <div className="input_error">{errors.password?.message}</div>
                            </div>

                            <div className ='button_container'>
                                <button type='submit' className='btn'>Log in</button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login 