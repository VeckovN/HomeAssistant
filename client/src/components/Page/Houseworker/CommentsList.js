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
        // const result = await axios.get(`http://localhost:5000/api/houseworker/comments/${user}`);
        //with req.session
        // try{
        //     const result = await axios.get(`http://localhost:5000/api/houseworker/ourComments/`);
        //     const comms = result.data;
        //     console.log("COMS : " + JSON.stringify(comms))
        //     setComments(comms);
        // }
        // catch(err){
        //     console.log("ERROR " + err);
        // }

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
        <div>
            {/* {comments ? commentList : <div>No comments</div>} */}
            {commentList}
        </div>
    )

}

export default CommentsList;