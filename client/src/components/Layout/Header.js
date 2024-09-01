import {useState} from 'react';
import {Link} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import {logout} from '../../store/auth-slice';

import '../../sass/layout/_header.scss';

const Header = () =>{
    const dispatch = useDispatch();
    const [showMenu, setShowMenu] = useState(false);

    const {user} = useSelector((state) => state.auth)
    let houseworker;

    if(user)
        houseworker = user.type === 'Houseworker' ? true : false;

    const logoutHandler = () =>{
        dispatch(logout());
        setShowMenu(false);
    }

    const removeShowMenuHandler = () =>{
        setShowMenu(false);
    }

    return (
    <nav className = {`navbar ${showMenu ? 'navbar-mobile' : ''}`}>
        <div className = "logo" >
            <Link to="/" className='logo-a' onClick={removeShowMenuHandler}>
                <span className='logo-span'>Home</span> 
                <span className="logo-span">Assistant</span>
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
                    <button onClick={logoutHandler} className='nav-link-button '>Logout</button>
                </>
                :
                <>
                    <Link to='/profile' className='nav-link' onClick={removeShowMenuHandler}>Profile</Link>
                    <Link to='/messages' className='nav-link' onClick={removeShowMenuHandler}>Messages</Link>
                    <button onClick={logoutHandler} className='nav-link-button '>Logout</button>
                </>
                
            }

        </div>
        
    </nav>
    )
}
export default Header;