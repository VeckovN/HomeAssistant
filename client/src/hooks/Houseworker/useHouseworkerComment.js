import {useState, useRef, useEffect} from 'react';
import {getComments, postComment} from '../../services/houseworker.js';
import {deleteComment} from '../../services/client.js';
import {emitCommentNotification} from '../../sockets/socketEmit.js'
import { toast } from 'react-toastify';
import axios from 'axios';

const useHouseworkerComment = (socket, isClient, client_username) =>{

    const [comments, setComments] = useState(null);
    const [newComment, setNewComments] = useState(false);
    const postCommentRef = useRef();
    const commentClick = useRef(false);

    //houseworker which comment modal is showned
    const [houseworker, setHouseworker] = useState({
        username:'',
        id:''
    })

    useEffect(()=>{
        //console.log("REFF CURRENT " + commentClick.current + " US: " + houseworker.username);
        if(commentClick.current == true || newComment == true) //if is clicked or newComment added
            getHouseworkerComments(houseworker.username)
    },[houseworker.username])

    const getHouseworkerComments = async(username) =>{
        const comms = await getComments(username);
        console.log(" COMMMS: " , comms);

        if(comms)
            if(comms.length > 0)
                setComments(comms)
    }

    const onCommentHandler = (e) =>{
        if(!isClient){
            toast.error("You must be logged in",{
                className:"toast-contact-message"
            })
            return 
        }

        setHouseworker({
            username:e.target.value,
            id:e.target.id
        })
        commentClick.current = true;
    }

    const onCloseComment = ()=>{
        setHouseworker(prevState =>({
            ...prevState,
            username:''
        }))
        commentClick.current = false;
    }

    const onCommentDelete = async (e, comment_id, from)=>{
        e.preventDefault();
        try{
            await deleteComment(from, comment_id);
            const newComments = comments.filter(comm => comm.commentID!=comment_id)
            setComments(newComments);

            toast.success("Comment successfully deleted",{
                className:'toast-contact-message'
            })
        }   
        catch(err){
            console.log(err);
        }
    }

    const onCommentSubmit = async (e) =>{
        e.preventDefault();

        const newCommentContext = postCommentRef.current.value;
        if(newCommentContext == ''){
            toast.error("Enter the comment");
        }
        else{
            //fetch out of useEffect(in this example won't be a problem)
            //this fetch will be only trigger on Comment submit this is a reason why we can fetch over the useEffect
            try{
                const newPostComment = {
                    client:client_username,
                    houseworker:houseworker.username,
                    comment: newCommentContext
                }
                // await axios.post(`http://localhost:5000/api/clients/comment`, postComment);
               
                const commentID = await postComment(newPostComment);
                console.log("COMMENNTASD ASD AS ID: " + commentID);

                toast.success("Comment successfully posted",{
                    className:'toast-contact-message'
                })

                const emitComment = {...newPostComment, houseworkerID: houseworker.id}
                emitCommentNotification(socket, emitComment)


                const newComment = {
                    //we send (looged user) comment to (showenedModal ->oldComment)
                    from: client_username,
                    commentID:commentID,
                    comment:newPostComment.comment,
                    new:true //animation flag for entering modal 
                }

                //this will trigger Comp re-render
                if(comments){
                    setComments(oldComments =>[
                        ...oldComments,
                        newComment
                    ]);
                }
                else{
                    setNewComments(true)
                    setComments([
                        newComment
                    ])
                }
                postCommentRef.current.value='';
                    
            }catch(err){
                console.log(err);
            }
        }
    }

    return {comments, postCommentRef, commentClick, houseworkerUsername:houseworker.username, onCommentHandler, onCommentSubmit, onCommentDelete, onCloseComment}
}


export default useHouseworkerComment
