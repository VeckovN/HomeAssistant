import {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import axios from 'axios';
import CommentItem  from '../../../UI/CommentItem.js';
import {getAuthenticatedUserComments} from '../../../../services/houseworker.js'

import './CommentsList.css'
import Spinner from '../../../UI/Spinner.js';


const CommentsList = () =>{
    //{comment:commentProp, from:clientProp}
    const [comments, setComments] = useState(null);
    const [loading, setLoading] = useState(true);

    const userAuth = useSelector((state) => state.auth)
    const user = userAuth.user.username;
    console.log("YS2: " + user);

    useEffect(()=>{
        fetchComments()
    },[])

    const fetchComments = async() =>{
        const comms = await getAuthenticatedUserComments();
        setComments(comms);
        setLoading(false);
    }
    console.log("COMMENTS: " + JSON.stringify(comments));

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
        <div className='comments_container'>
            {loading ? <Spinner/> : 
            <>
                {commentList.length >0 
                    ?
                    <>
                        <h1>Comments</h1>
                        {commentList}
                    </>
                    :
                    <div className='no_commentsHouseworker'>No comments</div>
                    
                }
            </>
            }
            {/* <h1>Komentari</h1> */}
            {/* {comments ? commentList : <div>No comments</div>} */}
            {/* {commentList.length >0 ? commentList : <div className='no_comments'>Nemate komentara</div>} */}
        </div>
    )

}

export default CommentsList;