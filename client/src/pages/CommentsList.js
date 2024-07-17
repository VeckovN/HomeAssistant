import {useEffect, useState, useRef} from 'react';
// import {useSelector} from 'react-redux';
import CommentItem  from '../components/UI/CommentItem.js';
import {getAuthenticatedUserComments} from '../services/houseworker.js';
import Spinner from '../components/UI/Spinner.js';

import '../sass/pages/_commentsList.scss';

const CommentsList = ({socket, user}) =>{
    //{comment:commentProp, from:clientProp}
    const [comments, setComments] = useState(null);
    const [loading, setLoading] = useState(true);
    const endCommentsRef = useRef(null);

    // const {user} = useSelector((state) => state.auth)

    useEffect(()=>{
        fetchComments()
    },[])

    //listen socket event
    useEffect(() => {
        if (socket) { 
            //Its emited to user-{userID} room that user joined and emit on newCommentchange Event of these room
            socket.on(`newCommentChange`, (data) => {
                setComments(prevComments => [data.postComment, ...prevComments]);
            });

            return () => {
                socket.off(`newCommentChange`);
            };
        }
    }, [socket]);
    

    const fetchComments = async() =>{
        const comms = await getAuthenticatedUserComments();
        setComments(comms);
        setLoading(false);
    }

    let commentList;
    {comments ?
        commentList = comments.map(comm =>(
            <CommentItem
                // key={}
                from={comm.from}
                comment = {comm.comment}
                date={comm.date}
            />
        ))
        : commentList=[];
    }

    return (
        <div className='comments-container'>
            {loading ? <Spinner/> : 
            <>
                {commentList.length >0 
                    ?
                    <>
                        <div className='comment-card'>
                            <div className='context-container'>
                                <div className='comment-list'>
                                    {commentList}
                                    <div ref={endCommentsRef}></div>
                                </div>
                            </div>
                        </div>
                    </>
                    :
                    <div className='no-hs-comments'>No comments</div>
                }
            </>
            }
        </div>
    )

}

export default CommentsList;