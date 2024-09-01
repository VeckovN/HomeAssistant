import {useSelector} from 'react-redux';
import useMessages from '../hooks/useMessages';
import Chat from '../components/Chat/Chat.js';
import Rooms from '../components/Chat/Rooms.js';
import Spinner from '../components/UI/Spinner.js';

import '../sass/pages/_messages.scss';

const Messages = ({socket, connected}) =>{
    
    const {user} = useSelector((state) => state.auth)
    const {
        state, 
        showMenu,
        isLoadingMessages,
        showChatView,
        showMoreRoomUsers,
        pageNumberRef,
        onShowMenuToggleHandler,
        onUsersFromChatOutHanlder,
        onAddTypingUserHandler, 
        onRemoveTypingUserHandler,
        fetchMoreMessages,
        onRoomClickHanlder,
        onDeleteRoomHandler,
        onAddUserToGroupHanlder,
        onKickUserFromGroupHandler,
        onSendMessageHandler,
        onShowMoreUsersFromChatHandler,
        onShowRoomsButtonHandler
    } = useMessages(socket, user);


    return (
    <div className={`container-${user.type === "Houseworker" ? "houseworker" : "client"}`}> 
        {state.loading ? <Spinner className='profile-spinner'/> :
        <div className='messages-container'>
            <section className={`rooms-container ${showChatView ? 'no-display' : ''}`}>
                <div className='room-chat-header'>
                    <div className='header-label'>Chat Rooms</div>
                </div>

                <Rooms 
                    rooms={state.rooms}
                    roomInfo={state.roomInfo}
                    showMoreRoomUsers={showMoreRoomUsers}
                    onRoomClickHanlder={onRoomClickHanlder}
                    onShowMoreUsersFromChatHandler={onShowMoreUsersFromChatHandler}
                    onUsersFromChatOutHanlder={onUsersFromChatOutHanlder}
                />
            </section>

            <section className={`chat-container ${showChatView ? 'display' : ''}`}>
                <Chat 
                    socket={socket}
                    state={state}
                    user={user}
                    showMenu={showMenu}
                    showChatView={showChatView}
                    isLoadingMessages={isLoadingMessages}
                    pageNumberRef={pageNumberRef}
                    onShowRoomsButtonHandler={onShowRoomsButtonHandler}
                    onSendMessageHandler={onSendMessageHandler}
                    onAddUserToGroupHanlder={onAddUserToGroupHanlder}
                    onKickUserFromGroupHandler={onKickUserFromGroupHandler}
                    onDeleteRoomHandler={onDeleteRoomHandler}
                    onShowMenuToggleHandler={onShowMenuToggleHandler}
                    fetchMoreMessages={fetchMoreMessages}
                    onAddTypingUserHandler={onAddTypingUserHandler}
                    onRemoveTypingUserHandler={onRemoveTypingUserHandler}
                />
                
            </section>
        </div>
        }
    </div>
    )
}

export default Messages;

