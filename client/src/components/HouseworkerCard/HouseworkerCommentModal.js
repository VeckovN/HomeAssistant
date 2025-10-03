import { useEffect, useRef } from "react";
import Modal from "../../components/UI/Modal.js";
import CommentItem from "../../components/UI/CommentItem";
import useHouseworkerComment from "../../hooks/Houseworker/useHouseworkerComment.js";
import '../../sass/components/_houseworkerCommentModal.scss';

const HouseworkerCommentModal = ({socket, isClient, clientUsername, houseworker, commentClick, onCloseComment}) =>{
    const observerTarget = useRef(null);

    const handleCloseComment = () =>{
        onCloseComment();
    }
    const {
        comments, 
        postCommentRef, 
        allCommentsLoadedRef, 
        onCommentSubmit, 
        onCommentDelete,
        onLoadMoreComments
    } = useHouseworkerComment(socket, isClient, clientUsername, houseworker, commentClick)

    const options = {
        root: null, 
        rootMargin: '100px',
        threshold: 0.3, 
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
          (entries) => {
              if (entries[0] && entries[0].isIntersecting && !allCommentsLoadedRef.current) {
                  onLoadMoreComments();
            }
          }, options)

        if (observerTarget.current) {
          observer.observe(observerTarget.current)
        }
    
        return () => {
          if (observerTarget.current) {
            observer.unobserve(observerTarget.current)
          }
        }
      }, [observerTarget.current, comments]);

    const commentHeaderContext =
        'Comments';

    const commentBodyContext = 
        <>
            <div className='comment-container'>
            {comments?.length > 0 ?
                <>
                {comments.map((comm, index) => {
                    const isClientComment = clientUsername === comm.from;
                    return(
                        <>
                        <CommentItem
                            key={`comm-${comm.commentID}`}
                            onDeleteCommentHandler={isClientComment ? onCommentDelete : undefined}
                            id={comm.commentID}
                            date={comm.date}
                            from={comm.from}
                            comment={comm.comment}
                            new={comm.new}
                        />

                        {/* observer before last 2-3 items */}
                        {index === comments.length - 3 && (
                            <div className="comment-target" ref={observerTarget}></div>
                        )}
                        </>
                    )}
                )}
                </>
                : <div className='no-comments-modal'>Client doesn't have comments</div>
                }

            </div>
            <div className='comment-input'>
                <input type='text' name="postComment"  ref={postCommentRef} placeholder='Post comment'/>
                <button type="submit" onClick={onCommentSubmit}>Send</button>
            </div>
        </>

    return(
        <>
        {commentClick.current && comments && 
            <Modal
                HeaderContext = {commentHeaderContext}
                BodyContext = {commentBodyContext}
                FooterContext = {null}
                onCloseModal={handleCloseComment}
            />
        }
        </>
        
    )
}

export default HouseworkerCommentModal;