
import {memo} from 'react';

const ChatMessages = memo(({roomMessages, user, lastMessageRef, observerTarget, roomInfo}) => {
return (
    <>
        {roomMessages.map((el,index) =>{
            if(user.userID==el.from || el.from === "Server"){
                return(
                <div 
                    key={`r-${index}`}
                    className={`${el.from === "Server" ? "server" : "message text-only"} ${index == 0 && 'scroll-el'}`}
                    ref={index === 0 ? lastMessageRef : null}
                >
                    <div className="response">
                        {el.date && el.from !== "Server" && <p className='date-response'>{`${el.date.day}.${el.date.month}.${el.date.year} ${el.date.time}`}</p>}
                        <p className="text"> {el.message}</p>
                    </div>
                </div>
                )
            }
            else{
                let userPicturePath;
                roomInfo.users.forEach(element => {
                    if(element.username === el.fromUsername){
                        userPicturePath = element.picturePath;
                    }
                });

                return(
                <div className="message" key={`msg-${index}`}>
                    <div className="photo" style={{ backgroundImage: `url(assets/userImages/${userPicturePath})` }}>
                        <div className='photo-hover-username'>{el.fromUsername}</div>
                        <div className="online"></div>
                    </div>
                    <p className="text"> {el.message}</p>
                    {el.date && <p className='date'>{`${el.date.day}.${el.date.month}.${el.date.year} ${el.date.time}`}</p>}
                </div>
                )
            }
        })}
        <div ref={observerTarget}></div>
    </>
    )
});

export default ChatMessages;