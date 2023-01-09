import {Link, useNavigate} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import {logout, reset} from '../../../store/auth-slice';

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
        dispatch(logout())
        dispatch(reset())
        navigate('/');
    }
    

  return (
    <header className='header'>
        <div className='logo'>
        </div>
        <ul>
            {/* unAuthenticated users */}
            {!user ? (
                <>
                    <li>
                        <Link to='/login'>Login</Link>
                    </li>
                    <li>
                        <Link to='/register'>Register</Link>
                    </li>
                </>
            ):
                <>
                    <li>
                        <button onClick={logoutHandler}>Logout</button>
                    </li>
                    <li>
                        <Link to='/profile'>Profile</Link>
                    </li>
                    {/* if is houseworker then show Comment LInk*/}
                    {houseworker &&
                        <>
                            <li>
                                <Link to='/comments'>Comments</Link>
                            </li>
                            <li>
                                <Link to='/messages'>Messages</Link>
                            </li>
                        </>
                    }
                        
                </>
                
        
            }
            
            
        </ul>

    </header>
  )
}

export default Header