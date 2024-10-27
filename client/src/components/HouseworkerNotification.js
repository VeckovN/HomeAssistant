import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from "react-router-dom";
import { getMoreHouseworkerNotifications, markNotification} from '../store/notificationsSlice';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { faMessage } from '@fortawesome/free-solid-svg-icons';
import { faComments } from '@fortawesome/free-solid-svg-icons';

import '../sass/components/_notification.scss';

const HouseworkerNotification = ({closeNotifications}) =>{

    const dispatch = useDispatch();
    const {notifications, totalNotificationsCount} = useSelector((state) => state.notifications)
    const {user} = useSelector((state) => state.auth)
    const [batchNumber, setBatchNumber] = useState(0);
    const navigator = useNavigate();

    console.log("batchNumber, "+ batchNumber);

    const loadMoreNotifications = () => {
        const username = user.username;
        const newBatchNumber = batchNumber + 1;
        dispatch(getMoreHouseworkerNotifications({username, batchNumber:newBatchNumber}));
        setBatchNumber(newBatchNumber);
    }

    const hanldeNotificationClick = (path, notificationID) =>{
        if(notificationID){ //when notification is unread
            dispatch(markNotification({notificationID, batchNumber}));
        }

        navigator(path);
        closeNotifications();
    }

    const returnPath = (type) =>{
        let path;
        if(type === 'comment')
            path = "/comments"
        else if(type === 'chatGroup')
            path = "/messages"
        else{
            path = "/";
        }
        return path;
    }

    return(
        <div className='notification-box'>
            <div className='notification-box-title'>
                Notifications
            </div>
            {notifications.length > 0
            ?
            <div className='notifications-list'>
                {notifications.map(el =>
                    <div onClick={() => hanldeNotificationClick(returnPath(el.type), el.read ? null : el.id)}  className='notification'>
                        <div className= {`notification-context-image ${el.read ? ' ' : 'un-read-image'}`}>
                            {el.type === 'comment' && <FontAwesomeIcon icon={faComments}/>}
                            {el.type === 'chatGroup' && <FontAwesomeIcon icon={faMessage}/>}
                            {el.type === 'rating' && <FontAwesomeIcon icon={faHouse}/>}
                        </div>
                        <div className={`notification-context ${el.read ? ' ' : 'un-read'}`}> {el.message } --- {el.id}</div>
                    </div>
                )}
            </div>
            :
            <div className='notifications-empty-list'>
                You have no notifications
            </div>
            }
            
            {totalNotificationsCount > notifications.length  &&
            <div className='notification-more-btn-container'>
                <button onClick={loadMoreNotifications} className='more-btn'>More</button>
            </div>
            }
        </div>
    )
}

export default HouseworkerNotification;