import {useState, useRef, useEffect} from 'react';
import {getComments} from '../../services/houseworker.js';
import { toast } from 'react-toastify';

const useHouseworkerComment = (socket, isClient, client_username) =>{

    const [comments, setComments] = useState(null);
    const [newComment, setNewComments] = useState(false);
    const postCommentRef = useRef();
    const commentClick = useRef(false);

    //houseworker which comment modal is showned
    const [houseworkerUsername,setHouseworkerUsername] = useState('');
    const [houseworkerID, setHouseworkerID] = useState('');

    useEffect(()=>{
        console.log("REFF CURRENT " + commentClick.current + " US: " + houseworkerUsername);

        if(commentClick.current == true || newComment == true) //if is clicked --- true
            getHouseworkerComments(houseworkerUsername)
    },[houseworkerUsername])

    const getHouseworkerComments = async(username) =>{
        const comms = await getComments(username);

        if(comms)
            if(comms.length > 0)
                setComments(comms)
    }

    const onCommentHandler = (e) =>{
        if(!isClient){
            toast.error("Uloguj se da bi komentarisao",{
                className:"toast-contact-message"
            })
            return 
        }
        const username = e.target.value;
        const id = e.target.id;

        console.log("US:" + username);
        setHouseworkerUsername(username);
        setHouseworkerID(id);

        commentClick.current = true;

    }

    const onCommentSubmit = async (e) =>{
        e.preventDefault();
        //const newComment = e.target.postComment.value; //postComment is name of input field
        const newCommentContext = postCommentRef.current.value;

        if(newCommentContext == ''){
            toast.error("Unesite komentar");
        }
        else{
            //comment is intended for this houseworker (For comment Notify)
            // const houseworkerID = '4';
            //fetch out of useEffect(in this example won't be a problem)
            //this fetch will be only trigger on Comment submit this is a reason why we can fetch over the useEffect
            try{
                //obj for POST Method
                const postComment = {
                    client:client_username,
                    houseworker:houseworkerUsername,
                    comment: newCommentContext
                }
                const result = await axios.post(`http://localhost:5000/api/clients/comment`, postComment);
                
                toast.success("Komentar je postavljen",{
                    className:'toast-contact-message'
                })
                // //SOCKET EMIT TO Server (IN Home.js is received)
                socket.emit('comment', JSON.stringify({...postComment, houseworkerID:houseworkerID}))

                const newComment = {
                    //we send (looged user) comment to (showenedModal ->oldComment)
                    from: client_username,
                    //comment:newCommentContext
                    comment:postComment.comment
                }
                console.log(comments.length);

                //this will trigger Comp re-render
                if(comments.length > 0) //if exist comments(push new comment)
                    setComments(oldComments =>[
                        // ...oldComments,
                        // newComment
                        //FIRST show NewComment
                        newComment,
                        ...oldComments
                    ]);
                else{
                    setNewComments(true)
                    setComments([
                        newComment,
                    ])
                }
                    
            }catch(err){
                console.log(err);
            }
        }
        
    }

    const onCloseComment = ()=>{
        setHouseworkerUsername('');
        commentClick.current = false;
    }

    return {comments, postCommentRef, commentClick, houseworkerUsername, onCommentHandler, onCommentSubmit, onCloseComment}
}


export default useHouseworkerComment
