import { NavLink, Outlet, useNavigate } from "react-router-dom";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import CottageIcon from '@mui/icons-material/Cottage';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import TuneIcon from '@mui/icons-material/Tune';

import '../../sass/layout/_sidebar.scss';

 
const Sidebar = () => {
    const menuItem1 = [
        {
            path:"/", //link to
            name:"Home",
            icon:<HomeOutlinedIcon fontSize='inherit'/>,
        },
        {
            path:"/messages",
            name:"Messages",
            icon:<ForumOutlinedIcon fontSize='inherit'/>,
        },
        {
            path:"/comments",
            name:"Comments",
            icon:<CommentOutlinedIcon fontSize='inherit'/>,
        }
    ];

    const menuItem2 =[
        {
            path:"/profile",
            name:"Settings",
            icon:<TuneIcon fontSize='inherit'/>,
        },
        {
            path:"/a",
            name:"HelpCenter",
            icon:"i",
        },
    ]

    return(
        <main className='sidebar-container'>
            <section className='section-menu'>

                <div className='sidebar-logo'>
                    <div className='logo-icon'>
                        <CottageIcon fontSize='inherit'/>
                    </div>
                    <div className='logo-text'>
                        <span className='logo-span'>Home</span> 
                        <span className="logo-span">Assistant</span>
                    </div>
                   
                </div>
                <div className='sidebar-menu'>
                    <div className="menu-option">
                        {/* Link to page */}
                        {
                             menuItem1.map((el, index) =>(
                                <NavLink to={el.path} key={'el-'+index}  
                                    className={({ isActive}) =>
                                    isActive ? "sidebar-menu-link active-link" : "sidebar-menu-link"
                                }>
                                    <div className='sidebar-menu-icon'>{el.icon}</div>
                                    <div className='sidebar-menu-name'>{el.name}</div>
                                </NavLink>
                            ))
                        }
                    </div>

                    <div className='line'></div>

                    <div className="menu-option">
                        {
                             menuItem2.map((el, index) =>(
                                <NavLink to={el.path} key={'el-'+index}
                                    className={({ isActive}) =>
                                    isActive ? "sidebar-menu-link active-link" : "sidebar-menu-link"
                                }>
                                    <div className='sidebar-menu-icon'>{el.icon}</div>
                                    <div className='sidebar-menu-name'>{el.name}</div>
                                </NavLink>
                            ))
                        }
                    </div>
                </div>
            </section>
            
            {/* HERE IS CONTAINER WHERE PAGE SHOULD BE DISPLAYED */}
            <section className='sidebar-context-container'>
                {/* {children} */}
                <Outlet />
            </section>
        </main>
    )

}

export default Sidebar;