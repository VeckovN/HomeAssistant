import { resetNotifications } from "./notificationsSlice";
import { resetUnreadComments } from "./unreadCommentSlice";
import { resetUnreadMessages } from "./unreadMessagesSlice";

export const resetReduxStates = (dispatch) =>{
    dispatch(resetNotifications());
    dispatch(resetUnreadComments());
    dispatch(resetUnreadMessages());
} 