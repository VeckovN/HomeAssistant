
// import '../../sass/components/_typingUsers';

const TypingUsers = ({typingUsers}) =>{
    return(
        typingUsers.length > 0 && (
            <div className='typing-users'>
                {typingUsers.map((el,index) => (
                    <div className='user-t' key={el.userID + index}>
                        ...{el.username}
                    </div>
                ))}
            </div>
        )
    )
}

export default TypingUsers;