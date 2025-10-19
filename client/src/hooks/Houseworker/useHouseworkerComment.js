import {useState, useRef, useEffect} from 'react';
import {handlerError} from '../../utils/ErrorUtils.js';
import {getComments, postComment} from '../../services/houseworker.js';
import {deleteComment} from '../../services/client.js';
import {emitCommentNotification} from '../../sockets/socketEmit.js'
import {toast} from 'react-toastify';

const useHouseworkerComment = (socket, isClient, clientUsername, houseworker, commentClick) =>{
    const [comments, setComments] = useState(null);
    const postCommentRef = useRef();
    const pageNumberRef = useRef(0);
    const allCommentsLoadedRef = useRef(false);

    useEffect(()=>{
        if(commentClick.current == true && houseworker.username !='') //if is clicked or newComment added
        {
            getHouseworkerComments();
        }    
    },[houseworker.username])

    const getHouseworkerComments = async() =>{
        const pageNumber = 0; 
        try{
            const comms = await getComments(houseworker.username, pageNumber);
            if(comms)
                setComments(comms)
            else
                setComments(null)
        }
        catch(err){
            handlerError(err);
        }
    }

    const onLoadMoreComments = async() =>{
        const pageNumber = pageNumberRef.current + 1;
        pageNumberRef.current = pageNumber;
        try{
            const moreComms = await getComments(houseworker.username, pageNumber);
            
            if(moreComms.length > 0)
                setComments(oldComments =>[...oldComments, ...moreComms]);
            else
                allCommentsLoadedRef.current = true;
        }
        catch(err){
            handlerError(err);
        }
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
            handlerError(err);
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
                    client:clientUsername,
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
                    from: clientUsername,
                    houseworkerID: houseworker.id,
                    comment:newCommentContext,
                    read:false,
                    new:true //animation flag for entering modal 
                }

                emitCommentNotification(socket, {newComment, notificationObj:commentResult.notificationObj});

                //this will trigger Comp re-render
                if(comments){
                    setComments(oldComments =>[
                        newComment,
                        ...oldComments
                    ]);
                }
                else
                    setComments([newComment])
                
                postCommentRef.current.value='';
                    
            }
            catch(err){
                handlerError(err);
            }
        }
    }

    return {
        comments, 
        postCommentRef, 
        allCommentsLoadedRef,
        houseworkerUsername:houseworker.username, 
        onCommentSubmit, 
        onCommentDelete, 
        onLoadMoreComments
    }
}


export default useHouseworkerComment
