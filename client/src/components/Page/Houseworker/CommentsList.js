import {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import axios from 'axios';
import CommentItem  from '../../UI/CommentItem';


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
        const result = await axios.get(`http://localhost:5000/api/houseworker/comments/${user}`);
        const comms = result.data;
        console.log("COMS : " + JSON.stringify(comms))
        setComments(comms);
        // console.log("Data: +" + JSON.stringify(comm));
    }


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
        <div>
            {commentList}
        </div>
    )

}

export default CommentsList;