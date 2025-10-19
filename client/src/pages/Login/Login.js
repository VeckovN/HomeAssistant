import {useDispatch, useSelector} from 'react-redux';
import {login, reset as resetRedux} from '../../store/auth-slice.js';
import {getUserUnreadMessages} from '../../store/unreadMessagesSlice.js'
import {getHouseworkerUnreadComments} from '../../store/unreadCommentSlice.js';
import {getHouseworkerNotifications} from '../../store/notificationsSlice.js';
import { useForm } from 'react-hook-form';
import {zodResolver} from "@hookform/resolvers/zod";
import { string, z } from "zod";
import LoginForm from './LoginForm.js';

import '../../sass/pages/_login.scss'

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
    const loading = useSelector(state => state.auth.loading);

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
                dispatch(resetRedux());
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
                dispatch(resetRedux());
            });
    }

    return (
        <LoginForm 
            register={register}
            errors={errors}
            isLoading={loading}
            handleSubmit={handleSubmit}
            onSubmitHandler={onSubmitHandler}
        />
    )
}

export default Login 