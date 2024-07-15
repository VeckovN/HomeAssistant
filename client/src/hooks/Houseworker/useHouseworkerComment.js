import {useState, useRef, useEffect} from 'react';
import {getComments, postComment} from '../../services/houseworker.js';
import {deleteComment} from '../../services/client.js';
import {emitCommentNotification} from '../../sockets/socketEmit.js'
import { toast } from 'react-toastify';
import { getErrorMessage } from '../../utils/ThrowError.js';

const useHouseworkerComment = (socket, isClient, client_username) =>{
    
    const [comments, setComments] = useState(null);
    const postCommentRef = useRef();
    const commentClick = useRef(false);

    //houseworker which comment modal is showned
    const [houseworker, setHouseworker] = useState({
        username:'',
        id:''
    })

    useEffect(()=>{
        if(commentClick.current == true) //if is clicked or newComment added
            getHouseworkerComments(houseworker.username)
    },[houseworker.username])

    const getHouseworkerComments = async(username) =>{
        const comms = await getComments(username);

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

            //also trigger
            setComments(newComments);

            toast.success("Comment successfully deleted",{
                className:'toast-contact-message'
            })
        }   
        catch(err){
            const error = getErrorMessage(err);
            const errorMessage = error.messageError || "Please try again later";
            toast.error(`Failed to delete the comment. ${errorMessage}`, {
                className: 'toast-contact-message'
            });
            console.error(error);
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
            
                const commentResult = await postComment(newPostComment);

                toast.success("Comment successfully posted",{
                    className:'toast-contact-message'
                })

                const newComment = {
                    commentID:commentResult.commentID,
                    date:commentResult.commentDate,
                    from: client_username, //client
                    houseworkerID: houseworker.id,
                    comment:newCommentContext,
                    new:true //animation flag for entering modal 
                }

                emitCommentNotification(socket, newComment);

                //this will trigger Comp re-render
                if(comments){
                    setComments(oldComments =>[
                        ...oldComments,
                        newComment
                    ]);
                }
                else
                    setComments([newComment])
                
                    
                postCommentRef.current.value='';
                    
            }catch(err){
                const error = getErrorMessage(err);
                const errorMessage = error.messageError || "Please try again later";
                toast.error(`Failed to post the comment. ${errorMessage}`, {
                    className: 'toast-contact-message'
                });
                console.error(error);
            }
        }
    }

    return {comments, postCommentRef, commentClick, houseworkerUsername:houseworker.username, onCommentHandler, onCommentSubmit, onCommentDelete, onCloseComment}
}


export default useHouseworkerComment
