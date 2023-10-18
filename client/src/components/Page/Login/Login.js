//Adding session timeout in a page in Reactjs
//https://stackoverflow.com/questions/50036145/adding-session-timeout-in-a-page-in-reactjs
import {useDispatch} from 'react-redux';
import { useEffect } from 'react';
import {login, reset as resetRedux} from '../../../store/auth-slice';
import { useForm } from 'react-hook-form';
import {zodResolver} from "@hookform/resolvers/zod";
import { string, z } from "zod";


import './Login.css';

const schema = z.object({
    username: string().min(4, {message:"Username must contain at least 4 characters"}),
    password: string().min(1, {message:"Password is required"})
})


const Login = () =>{
    const initialState ={
        username:'',
        password:'',
    }
    const {register, handleSubmit, reset, formState, formState:{isSubmitSuccessful}} = useForm({defaultValues:initialState, resolver: zodResolver(schema)});
    const {errors} = formState; 

    const dispatch = useDispatch();   
    //UseEffect for restarting value of state
    useEffect(()=>{
        if(formState.isSubmitSuccessful){
            const timer = setTimeout(() => reset({username:'', password:''}),500)
            return () =>clearTimeout(timer);
        }
    },[formState, isSubmitSuccessful])

    const onSubmitHandler = (formValues) =>{
        dispatch(login(formValues));
        dispatch(resetRedux());
    }

    return (
        <>
            <div className ='login_container'>
                <div className="login_context">
                    <div className='login_welcome'>
                        <h3>Welcome</h3>
                        <div className='logo-h'>Home Assistant</div>
                    </div>
                    <form onSubmit={handleSubmit(onSubmitHandler)} className='login_form'>
                        <div className='input_container'>
                            <input
                                className='input_field'
                                type='text'
                                placeholder='Enter a username'
                                //register has (name="username", onChange, onBlur and ref props) 
                                {...register('username')}
                            />
                            <div className="input_error">{errors.username?.message}</div>
                        </div>
                        
                        <div className='input_container'>
                            <input
                                className='input_field'
                                type='password'
                                placeholder='Enter password'
                                autoComplete="off"
                                {...register('password')}
                            />
                             <div className="input_error">{errors.password?.message}</div>
                        </div>

                        <div className ='button_container'>
                            <button type='submit' className='btn'>Log in</button>
                        </div>

                    </form>
                </div>
            </div>

        </>
    )
}

export default Login 