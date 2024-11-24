
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { faMessage } from '@fortawesome/free-solid-svg-icons';
import { faComments } from '@fortawesome/free-solid-svg-icons';

const NotificationList = ({notifications, returnPath, handleNotificationClick}) =>{
    return(
        <div className='notifications-list'>
            {notifications.map(el =>
                <div onClick={() => handleNotificationClick(returnPath(el.type), el.read ? null : el.id)} key={el.id} className='notification'>
                    <div className= {`notification-context-image ${el.read ? ' ' : 'un-read-image'}`}>
                        {el.type === 'comment' && <FontAwesomeIcon icon={faComments}/>}
                        {el.type === 'chatGroup' && <FontAwesomeIcon icon={faMessage}/>}
                        {el.type === 'rating' && <FontAwesomeIcon icon={faHouse}/>}
                    </div>
                    <div className={`notification-context ${el.read ? ' ' : 'un-read'}`}> {el.message }</div>
                </div>
            )}
        </div>
    )
}

export default NotificationList

