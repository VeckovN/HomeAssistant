import {Link, useNavigate} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import {logout, reset} from '../../../store/auth-slice';
import { useEffect } from 'react';
import {toast} from 'react-toastify';

// import './Header.css';
import '../../../sass/layout/_header.scss';

const Header = () =>{
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {user, message, error, success} = useSelector((state) => state.auth) //null when not exists
    let houseworker;

    if(user)
        // client = userAuth.user.type === 'Client' ? true : false;
        houseworker = user.type === 'Houseworker' ? true : false;

    const logoutHandler = () =>{
        //emit disconnected socket
        dispatch(logout())
    }

    useEffect(()=>{
        if(error)
            toast.error(message,{
                className:'toast-contact-message'
            })

        if(success){
            navigate('/')
            toast.success(message,{
                className:'toast-contact-message'
            })
        }
    },[user,error,success])
    

  return (
    <nav className = "navbar">
        <div className = "logo" >
            <a href="/" className="logo-a">
                <span className='logo-span'>Home</span> 
                <span className="logo-span">Assistant</span>
            </a>
        </div>
        <div className="nav-list">
            {/* unAuthenticated users */}
            {!user ? (
                        <>
                            <Link to='/login' className='nav-link'>Login</Link>
                            <Link to='/register' className='nav-link'>Register</Link>
                        </>
                    ):
                        <>
                            <Link to='/profile' className='nav-link'>Profile</Link>
                            <Link to='/messages' className='nav-link'>Messages</Link>
                        

                            {/* if is houseworker then show Comment LInk*/}
                            {houseworker &&
                                <Link to='/comments' className='nav-link'>Comments</Link>
                            }

                            <button onClick={logoutHandler} className='nav-link-button '>Logout</button>
                                
                        </>
            }
        </div>
    </nav>
    )
}
export default Header;