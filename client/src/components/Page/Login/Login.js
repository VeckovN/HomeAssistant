//Adding session timeout in a page in Reactjs
//https://stackoverflow.com/questions/50036145/adding-session-timeout-in-a-page-in-reactjs
import {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import useUser from '../../../hooks/useUser';
import LoginForm from './LoginForm';
import {login, reset} from '../../../store/auth-slice';
import {toast} from 'react-toastify';

import './Login.css';

const Login = () =>{
    const initialState ={
        username:'',
        password:'',
    }

    const {data:formData, onChange} = useUser(initialState);
    const {username, password} = formData

    const {user, loading, success, error, message} = useSelector( (state) => state.auth)
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(()=>{
        if(error)
            toast.error(message,{
                className:'toast-contact-message'
            })

        if(success || user){
            navigate('/')
            toast.success("You have succeessfully logged in",{
                className:'toast-contact-message'
            })
        }
        dispatch(reset())
        //without navigate in dependecies on login submit 
        console.log("SSSSSSSSSWWWWWWWWWWWW");

    },[message,error,success, navigate])
    //without navigate in dependecies navigation(on home page) after submition wont be executed

    const onSubmit = (e)=>{
        e.preventDefault(); //without page refreshing
        dispatch(login({username, password}))
        dispatch(reset());
    }

    return (
        <LoginForm
            username={username}
            password={password}
            onChange={onChange}
            onSubmit={onSubmit}
        />
    )
}

export default Login 