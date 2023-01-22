import {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import axios from 'axios';
import CommentItem  from '../../UI/CommentItem';

import './CommentsList.css'


const CommentsList = () =>{
    //{comment:commentProp, from:clientProp}
    const [comments, setComments] = useState(null);

    const userAuth = useSelector((state) => state.auth)
    const user = userAuth.user.username;
    console.log("YS2: " + user);

    
    useEffect(()=>{
        fetchComments()
    },[])

    const fetchComments = async() =>{
        const result = await axios.get(`http://localhost:5000/api/houseworker/ourcomments/`);
        const comms = result.data;
        console.log("COMS : " + JSON.stringify(comms))
        setComments(comms);
      
        // console.log("Data: +" + JSON.stringify(comm));
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
            {commentList.length >0 
                ?
                <>
                    <h1>Komentari</h1>
                    {commentList}
                </>
                :
                <div className='no_commentsHouseworker'>Nemate komentara</div>
                
        }
            {/* <h1>Komentari</h1> */}
            {/* {comments ? commentList : <div>No comments</div>} */}
            {/* {commentList.length >0 ? commentList : <div className='no_comments'>Nemate komentara</div>} */}
        </div>
    )

}

export default CommentsList;