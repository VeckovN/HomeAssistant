import {useEffect, useState, useRef} from 'react';
import {useDispatch} from 'react-redux';
import {markCommentsAsRead} from '../store/unreadCommentSlice.js';
import CommentItem  from '../components/UI/CommentItem.js';
import {getAuthenticatedUserComments} from '../services/houseworker.js';
import Spinner from '../components/UI/Spinner.js';

import '../sass/pages/_commentsList.scss';

const CommentsList = ({socket, user}) =>{
    const dispatch = useDispatch();
    const [comments, setComments] = useState(null);
    const [loading, setLoading] = useState(true);
    const endCommentsRef = useRef(null);
    const pageNumberRef = useRef(0);
    const observerTarget = useRef(null);
    const allCommentsLoadedRef = useRef(false);

    //unmark unred messagers when the user visit it
    useEffect(()=>{
        fetchComments();
        dispatch(markCommentsAsRead(user.username));
    },[])

    //if the user is in the comments page, mark recivied comment as read
    useEffect(()=>{
        dispatch(markCommentsAsRead(user.username));
    },[comments])

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

    let commentList;
    {comments ?
        commentList = comments.map(comm =>(
            <CommentItem
                key={comm.commentID}
                from={comm.from}
                comment = {comm.comment}
                read={comm.read}
                date={comm.date}
            />
        ))
        : commentList=[];
    }

    const options = {
        threshold: 0.3,
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
          (entries) => {
              if (entries[0] && entries[0].isIntersecting && !allCommentsLoadedRef.current) {
                fetchMoreComments();
            }
          }, options)

        if (observerTarget.current) {
          observer.observe(observerTarget.current)
        }
    
        return () => {
          if (observerTarget.current) {
            observer.unobserve(observerTarget.current)
          }
        }
      }, [observerTarget.current, comments]);
    

    const fetchComments = async() =>{
        const pageNumber = 0;
        const comms = await getAuthenticatedUserComments(pageNumber);
        setComments(comms);
        setLoading(false);
    }

    const fetchMoreComments = async() =>{
        const pageNumber = pageNumberRef.current + 1;
        pageNumberRef.current = pageNumber;

        const comms = await getAuthenticatedUserComments(pageNumber);

        if(comms.length > 0)
            setComments((prev)=>[...prev, ...comms]);   
        else 
            allCommentsLoadedRef.current = true;   
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
                                    <div className='target-observer'ref={observerTarget}>T</div>
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