import {Link, useNavigate} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import {logout, reset} from '../../store/auth-slice';
import { useEffect , useState} from 'react';
import {toast} from 'react-toastify';

import '../../sass/layout/_header.scss';

const Header = () =>{
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showMenu, setShowMenu] = useState(false);

    const {user, message, error, success} = useSelector((state) => state.auth) //null when not exists
    let houseworker;

    if(user)
        // client = userAuth.user.type === 'Client' ? true : false;
        houseworker = user.type === 'Houseworker' ? true : false;

    const logoutHandler = () =>{
        //emit disconnected socket
        dispatch(logout());
        setShowMenu(false);
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


    const removeShowMenuHandler = () =>{
        setShowMenu(false);
    }


  return (
    <nav className = {`navbar ${showMenu ? 'navbar-mobile' : ''}`}>
        <div className = "logo" >
            {/* <a href="/" className="logo-a"> */}
            <Link to="/" className='logo-a' onClick={removeShowMenuHandler}>
                <span className='logo-span'>Home</span> 
                <span className="logo-span">Assistant</span>
            {/* </a> */}
            </Link>
        </div>
        

        <div className={`burger ${showMenu ? 'burger-active' : ''}`} onClick={()=> setShowMenu(!showMenu)}>
            <span className='bar'></span>
            <span className='bar'></span>
            <span className='bar'></span>
        </div>

        <div className={`nav-list ${showMenu ? 'activeList' : ''}`}>
            {/* unAuthenticated users */}
            {!user ? (
              
                //don't set onClick event when the menu isn't clicked
                !showMenu ? 
                    <>
                        <Link to='/login' className='nav-link' >Login</Link>
                        <Link to='/register' className='nav-link' >Register</Link>
                    </>
                :
                    <>
                        <Link to='/login' className='nav-link' onClick={removeShowMenuHandler}>Login</Link>
                        <Link to='/register' className='nav-link' onClick={removeShowMenuHandler}>Register</Link>
                    </>
                
            ):
                !showMenu ?
                <>
                    <Link to='/profile' className='nav-link' >Profile</Link>
                    <Link to='/messages' className='nav-link' >Messages</Link>
                

                    {/* if is houseworker then show Comment LInk*/}
                    {houseworker &&
                        <Link to='/comments' className='nav-link' >Comments</Link>
                    }

                    <button onClick={logoutHandler} className='nav-link-button '>Logout</button>
                </>
                :

                <>
                    <Link to='/profile' className='nav-link' onClick={removeShowMenuHandler}>Profile</Link>
                    <Link to='/messages' className='nav-link' onClick={removeShowMenuHandler}>Messages</Link>
                

                    {/* if is houseworker then show Comment LInk*/}
                    {houseworker &&
                        <Link to='/comments' className='nav-link' onClick={removeShowMenuHandler}>Comments</Link>
                    }

                    <button onClick={logoutHandler} className='nav-link-button '>Logout</button>
                </>
                
            }

        </div>
        
    </nav>
    )
}
export default Header;