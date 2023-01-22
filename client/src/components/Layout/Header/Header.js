import {Link, useNavigate} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import {logout, reset} from '../../../store/auth-slice';

import './Header.css';

const Header = () =>{

    // const user = false;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const userAuth = useSelector((state) => state.auth) //null when not exists
    const {user} = useSelector((state) => state.auth) //null when not exists
    let houseworker;
    // if(userAuth.user)
    if(user)
        // client = userAuth.user.type === 'Client' ? true : false;
        houseworker = user.type === 'Houseworker' ? true : false;

    const logoutHandler = () =>{

        //emit disconnected socket
        
        dispatch(logout())
        dispatch(reset())
        navigate('/');
    }
    

  return (
    <nav class = "navbar">
        <div class = "logo" >
            <a href="/" class="logo-a">
                Home <span class="logo-span">Assistant</span>
            </a>
        </div>
        <div class="nav-list">
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