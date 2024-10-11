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
    const pageNumberRef = useRef(0);
    const allCommentsLoadedRef = useRef(false);

    //houseworker which comment modal is showned
    const [houseworker, setHouseworker] = useState({
        username:'',
        id:''
    })

    useEffect(()=>{
        // if(commentClick.current == true && houseworker.username !='') //if is clicked or newComment added
        if(commentClick.current == true && houseworker.username !='') //if is clicked or newComment added
            getHouseworkerComments();
    },[houseworker.username])

    const getHouseworkerComments = async() =>{
        const pageNumber = 0; 
        const comms = await getComments(houseworker.username, pageNumber);

        if(comms)
            setComments(comms)
        else
            setComments(null)
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
            console.error(err);
        }
    }

    // const onLoadMoreComments = useCallback(async(username) =>{
    //     //pageNumber is > 0
    //     const pageNumber = pageNumberRef.current + 1;
    //     try{
    //         const moreComms = await getComments(username, pageNumber);
    //         setComments(oldComments =>[
    //             moreComms,
    //             ...oldComments
    //         ]);
    //     }
    //     catch(err){
    //         console.error(err);
    //     }
    // },[])

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
        // pageNumberRef.current = 0;
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
                    from: client_username,
                    houseworkerID: houseworker.id,
                    comment:newCommentContext,
                    read:false,
                    new:true //animation flag for entering modal 
                }

                emitCommentNotification(socket, newComment);

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

    return {
        comments, 
        postCommentRef, 
        commentClick, 
        allCommentsLoadedRef,
        houseworkerUsername:houseworker.username, 
        onCommentHandler, 
        onCommentSubmit, 
        onCommentDelete, 
        onCloseComment, 
        onLoadMoreComments
    }
}


export default useHouseworkerComment
