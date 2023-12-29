import { useState } from 'react'
import { Link } from 'react-router-dom';

import '../../../sass/components/_houseworkerItem.scss'

const HouseworkerItem = ({title, icon, count, link}) =>{

    const [isHovered, setIsHovered] = useState(false);

    //no Link
    const element = link 
    ? 
        <Link to={link} className='houseworker-item' onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div className={`item-title ${isHovered ? 'hovered' : ''}`}>
                <label>{title}</label>
            </div>
            <div className='icon'>
                {icon}
            </div>
            <div className='item-info'>{count}</div>
        </Link>
    :
        <div className="houseworker-item rating-container">
            <div className='item-title'>
                <label>{title}</label>
            </div>
            <div className='icon'>
                {icon}
            </div>
            <div className='item-info'>{count}</div>
        </div>

    return (
        element
    )
}

export default HouseworkerItem