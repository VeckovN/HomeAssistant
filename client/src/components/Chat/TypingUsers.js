
import '../../sass/components/_typingUsers.scss';

const TypingUsers = ({typingUsers}) =>{
    return(
        typingUsers.length > 0 && (
            <div className='typing-users'>
                {typingUsers.map((el,index) => (
                    <div className='user-typing-container' key={el.userID + index}>
                        <div className='dots-container'>
                            <div id='dot1'> </div>
                            <div id='dot2'> </div>
                            <div id='dot3'> </div>
                        </div>
                        <div className='user-info-element'>
                            {el.username}
                        </div>

                    </div>
                ))}
            </div>
        )
    )
}

export default TypingUsers;