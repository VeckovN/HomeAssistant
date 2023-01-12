//Adding session timeout in a page in Reactjs
//https://stackoverflow.com/questions/50036145/adding-session-timeout-in-a-page-in-reactjs
import {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {login, reset} from '../../../store/auth-slice';
import {toast} from 'react-toastify';
const Login = () =>{

    const [formData, setFormData] = useState(
        {
            username:'',
            password:''
        }
    )

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {user, loading, success, error, message} = useSelector( (state) => state.auth)
    
    console.log("REDUXXXXXXXX: " + user); 
    
    const {username, password} = formData

    console.log("USERS: " + JSON.stringify({username, password}))
    useEffect(()=>{
        if(error)
            toast.error(message)

        if(success || user){
            navigate('/')
            toast.success("You are logged")
        }
        dispatch(reset())
            
    },[user, loading, success, error, message, dispatch, navigate])

    const onChange =(e)=>{

        const name = e.target.name;
        const value = e.target.value; 

        setFormData(prev => (
            {
                ...prev,
                [name]:value
            }
        ))

        console.log(formData);
    }

    const onSubmit = (e)=>{
        e.preventDefault(); //without page refreshing
        //dispatchFunction
        
        const data = {username, password}
        dispatch(login(data))
        dispatch(reset());
        
    }


    return (
        <>
            <div>
                <h1>Login</h1>
            </div>

            <div className ='login_container'>
                <form>
                    <div className='input_container'>
                        <input
                            className='input_field'
                            type='text'
                            name='username'
                            value={username}
                            placeholder='Enter username'
                            onChange={onChange}
                        />
                    </div>

                    <div className='input_container'>
                        <input
                            className='input_field'
                            type='password'
                            name='password'
                            value={password}
                            placeholder='Enter password'
                            onChange={onChange}
                        />
                    </div>

                    <div className ='button_container'>
                        <button type='submit' onClick={onSubmit} className='btn'>Submit</button>
                    </div>

                </form>

            </div>

        </>
    )
}

export default Login 