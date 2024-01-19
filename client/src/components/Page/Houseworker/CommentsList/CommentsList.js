import {useEffect, useState, useRef} from 'react';
import {useSelector} from 'react-redux';
import CommentItem  from '../../../UI/CommentItem.js';
import {getAuthenticatedUserComments} from '../../../../services/houseworker.js'
import Spinner from '../../../UI/Spinner.js';

import '../../../../sass/pages/_commentsList.scss';

const CommentsList = () =>{
    //{comment:commentProp, from:clientProp}
    const [comments, setComments] = useState(null);
    const [loading, setLoading] = useState(true);
    const endCommentsRef = useRef(null);

    useEffect(()=>{
        fetchComments()
    },[])

    const fetchComments = async() =>{
        const comms = await getAuthenticatedUserComments();
        setComments(comms);
        setLoading(false);
    }

    const scrollToBottom = () =>{
        endCommentsRef.current?.scrollIntoView({ behavior: "instant", block: 'nearest' });
    }

    useEffect(() =>{
        scrollToBottom();
    },[comments]);

    let commentList;
    {comments ?
        commentList = comments.map(comm =>(
            <CommentItem
                // key={}
                from={comm.from}
                comment = {comm.comment}
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
                        <h1>Comments</h1>
                        <div className='comment-card'>
                            <div className='context-container'>
                                <div className='comment-list'>
                                    {commentList}
                                </div>
                                <div ref={endCommentsRef}></div>
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