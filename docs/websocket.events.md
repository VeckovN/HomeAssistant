# WebSocket Events

## Table of Contents
- [Overview](#overview)
- [Connection Lifecycle](#connection-lifecycle)
- [Client → Server Events](#client--server-events)
  - [User Presence](#user-presence)
  - [Chat Room Management](#chat-room-management)
  - [Messaging](#messaging)
  - [Typing Indicators](#typing-indicators)
  - [Group Management](#group-management)
  - [Notifications](#notifications)
- [Server → Client Events](#server--client-events)
  - [Presence Updates](#presence-updates)
  - [Message Events](#message-events)
  - [Typing Events](#typing-events)
  - [Group Updates](#group-updates)
  - [Notification Events](#notification-events)
- [Room Naming Convention](#room-naming-convention)
- [Connection Flow Example](#connection-flow-example)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling)

---

## Overview

The HomeAssistant API uses Socket.IO for real-time bidirectional communication between clients and the server. WebSocket connections enable instant notifications, live chat messaging, typing indicators, and online presence tracking.

**WebSocket URL:**
- **Development:** `http://localhost:5000`


**Related Documentation:**
- [REST API Reference](./api-reference.md) - For initial data fetching and user management

---

## Connection Lifecycle

### `connect`
Automatically triggered when socket successfully connects.

**Emitted by:** Server

**Action Required:** Client should emit `addOnlineUser` and `joinRoom` events.

--

### `disconnect`
Automatically triggered when socket disconnects.

**Emitted by:** Server

**Server Action:** Removes user from online users set in Redis.

---

## Client → Server Events

### User Presence

#### `addOnlineUser`
Add user to online users set when they connect.

**Emitted by:** Client

**Data:**
```javascript
{
  userID: "123",
  userUsername: "john_doe"
}
```

**Server Action:**
- Adds user to Redis set `onlineUsers`
- Broadcasts `newOnlineUser` event to all clients

--

#### `joinRoom`
Join a user-specific room for receiving personal notifications.

**Emitted by:** Client

**Data:**
```javascript
"123"  // userID
```

**Server Action:** Joins socket to room `user:{userID}`

--

#### `leaveRoom`
Leave a user-specific notification room.

**Emitted by:** Client

**Data:**
```javascript
"123"  // userID
```

**Server Action:** Removes socket from room `user:{userID}`

--

### Chat Room Management

#### `chatRoom.join`
Join a specific chat room to receive messages.

**Emitted by:** Client

**Data:**
```javascript
"1:2"  // roomID
```

**Server Action:** Joins socket to room `room:{roomID}`

--

#### `chatRoom.leave`
Leave a chat room.

**Emitted by:** Client

**Data:**
```javascript
"1:2"  // roomID
```

**Server Action:** Removes socket from room `room:{roomID}`

--

### Messaging

#### `message`
Send a message to a chat room.

**Emitted by:** Client

**Data:**
```javascript
{
  data: {
    message: "Hello!",
    from: "1",
    roomID: "1:2",
    fromUsername: "john_doe",
    roomKey: "room:1:2",
    lastMessage: "Hello!",
    unreadMessArray: [
      {
        recipientID: "2",
        roomID: "1:2",
        countNumber: 1,
        updateStatus: true
      }
    ],
    createRoomNotification: null,
    contact: false
  }
}
```

**Server Actions:**
- Emits `messageRoom` to all users in the room
- Emits `messagePage` to recipients for room list updates
- Emits `firstMessageConversation` if `contact` is true
- Emits `messageResponseNotify` to recipients

--

### Typing Indicators

#### `startTypingRoom`
Notify room that user started typing.

**Emitted by:** Client

**Data:**
```javascript
{
  roomID: "1:2",
  user: {
    userID: "1",
    username: "john_doe"
  }
}
```

**Server Action:** Emits `typingMessageStart` to all users in room

--

#### `stopTypingRoom`
Notify room that user stopped typing.

**Emitted by:** Client

**Data:**
```javascript
{
  roomID: "1:2",
  user: {
    userID: "1",
    username: "john_doe"
  }
}
```

**Server Action:** Emits `typingMessageStop` to all users in room

--

### Group Management

#### `createUserGroup`
Create a new group chat by adding a user to existing private chat.

**Emitted by:** Client

**Data:**
```javascript
{
  data: {
    newUserID: "3",
    newUsername: "sara_cleaner",
    roomID: "1:2",
    newRoomID: "1:2:3",
    currentMember: [{userID: "2", username: "jane"}],
    clientID: "1",
    clientUsername: "john_doe",
    newUserPicturePath: "https://...",
    online: true,
    notifications: [...]
  }
}
```

**Server Actions:**
- Emits `createUserToGroupNotify` to affected users
- Emits `createUserGroupChange` to update room lists

-- -- --

#### `addUserToGroup`
Add a user to an existing group chat.

**Emitted by:** Client

**Data:**
```javascript
{
  data: {
    newUserID: "4",
    newUsername: "mike_butler",
    roomID: "1:2:3",
    newRoomID: "1:2:3:4",
    currentMember: [...],
    clientID: "1",
    clientUsername: "john_doe",
    newUserPicturePath: "https://...",
    online: false,
    notifications: [...]
  }
}
```

**Server Actions:**
- Emits `addUserToGroupNotify` to affected users
- Emits `addUserToGroupChange` to update room lists
- Emits `addUserToGroupChangeInRoom` to users in current room

---

#### `kickUserFromGroup`
Remove a user from a group chat.

**Emitted by:** Client

**Data:**
```javascript
{
  firstRoomID: "1:2",
  roomID: "1:2:3:4",
  newRoomID: "1:2:4",
  kickedUserID: "3",
  kickedUsername: "sara_cleaner",
  clientID: "1",
  clientUsername: "john_doe",
  notifications: [...]
}
```

**Server Actions:**
- Emits `kickUserFromGroupNotify` to affected users
- Emits `kickUserFromGroupChange` to update room lists
- Emits `kickUserFromGroupChangeInRoom` to users in current room

---

#### `deleteUserRoom`
Delete an entire chat room.

**Emitted by:** Client

**Data:**
```javascript
{
  roomID: "1:2:3",
  clientID: "1",
  clientUsername: "john_doe",
  notifications: [...]
}
```

**Server Actions:**
- Emits `deleteUserRoomNotify` to affected users
- Emits `deleteUserRoomChange` to update room lists

---

### Notifications

#### `commentNotification`
Notify houseworker about a new comment.

**Emitted by:** Client

**Data:**
```javascript
{
  newComment: {
    commentID: 240,
    comment: "Great service!",
    from: "john_doe",
    houseworkerID: "2",
    date: "25.10.2025",
    read: false
  },
  notificationObj: {
    id: 388,
    from: "1",
    to: "2",
    type: "comment",
    date: {...},
    message: "You've got comment from john_doe",
    read: false
  }
}
```

**Server Actions:**
- Emits `privateCommentNotify` to houseworker
- Emits `newCommentChange` to houseworker

---

#### `ratingNotification`
Notify houseworker about a new rating.

**Emitted by:** Client

**Data:**
```javascript
{
  client: "john_doe",
  houseworker: "sara_cleaner",
  rating: 5,
  houseworkerID: "2",
  notification: {...}
}
```

**Server Action:** Emits `privateRatingNotify-{houseworkerID}` to houseworker

---

## Server → Client Events

### Presence Updates

#### `newOnlineUser`
Broadcast when a user comes online or goes offline.

**Emitted to:** All connected clients

**Data:**
```javascript
{
  type: "Add",      // "Add" or "Remove"
  userID: "123"
}
```

---

### Message Events

#### `messageRoom`
Receive a new message in the current room.

**Emitted to:** All users in the room

**Data:**
```javascript
{
  message: "Hello!",
  from: "1",
  roomID: "1:2",
  fromUsername: "john_doe",
  date: {
    day: 25,
    month: 10,
    year: 2025,
    time: "14:30"
  }
}
```

---

#### `messagePage`
Update room list with last message when user is on messages page.

**Emitted to:** Recipients not in the room

**Data:**
```javascript
{
  roomID: "1:2",
  lastMessage: "Hello!"
}
```

---

#### `firstMessageConversation`
Notify houseworker when a client initiates first contact.

**Emitted to:** Houseworker

**Data:**
```javascript
{
  roomID: "1:2",
  from: "1",
  fromUsername: "john_doe",
  lastMessage: "Hello!"
}
```

---

#### `messageResponseNotify`
Notification about new message received.

**Emitted to:** Message recipients

**Data:**
```javascript
{
  roomID: "1:2",
  fromUsername: "john_doe",
  fromUserID: "1",
  userID: "2",
  lastMessage: "Hello!",
  unreadUpdateStatus: true,
  createRoomNotification: null
}
```

---

### Typing Events

#### `typingMessageStart`
Notification that a user in the room started typing.

**Emitted to:** All users in room (except sender)

**Data:**
```javascript
{
  senderID: "1",
  senderUsername: "john_doe",
  roomID: "1:2"
}
```

---

#### `typingMessageStop`
Notification that a user in the room stopped typing.

**Emitted to:** All users in room (except sender)

**Data:**
```javascript
{
  senderID: "1",
  senderUsername: "john_doe",
  roomID: "1:2"
}
```

---

### Group Updates

#### `createUserToGroupNotify`
Notification that you were added to a new group.

**Emitted to:** Affected users

**Data:**
```javascript
{
  id: 394,
  from: "1",
  to: "2",
  type: "chatGroup",
  date: {...},
  message: "The client john_doe has added you to the chat",
  read: false
}
```

---

#### `createUserGroupChange`
Update room list after group creation.

**Emitted to:** Affected users

**Data:**
```javascript
{
  newUserID: "3",
  newUsername: "sara_cleaner",
  roomID: "1:2",
  newRoomID: "1:2:3",
  currentMember: [...],
  clientUsername: "john_doe",
  newUserPicturePath: "https://...",
  online: true
}
```

---

#### `addUserToGroupNotify`
Notification about being added to a group.

**Emitted to:** Affected users

**Data:**
```javascript
{
  id: 395,
  from: "1",
  to: "4",
  type: "chatGroup",
  date: {...},
  message: "You've been added to the group by john_doe",
  read: false
}
```

---

#### `addUserToGroupChange`
Update room list after user is added to group.

**Emitted to:** All group members

**Data:**
```javascript
{
  newUserID: "4",
  newUsername: "mike_butler",
  roomID: "1:2:3",
  newRoomID: "1:2:3:4",
  currentMember: [...],
  clientUsername: "john_doe",
  newUserPicturePath: "https://...",
  online: false
}
```

---

#### `addUserToGroupChangeInRoom`
Notify users currently in the room about the new room ID.

**Emitted to:** Users in current room

**Data:**
```javascript
"1:2:3:4"  // newRoomID
```

---

#### `kickUserFromGroupNotify`
Notification about being kicked from a group.

**Emitted to:** Affected users

**Data:**
```javascript
{
  roomID: "1:2:3:4",
  newRoomID: "1:2:4",
  kickedUserID: "3",
  notification: {
    id: 396,
    from: "1",
    to: "3",
    type: "chatGroup",
    date: {...},
    message: "You've been removed from the group",
    read: false
  }
}
```

---

#### `kickUserFromGroupChange`
Update room list after user is kicked.

**Emitted to:** Remaining group members

**Data:**
```javascript
{
  roomID: "1:2:3:4",
  newRoomID: "1:2:4",
  kickedUsername: "sara_cleaner",
  kickedUserID: "3"
}
```

---

#### `kickUserFromGroupChangeInRoom`
Notify users in the room about the kick and new room ID.

**Emitted to:** Users in current room

**Data:**
```javascript
{
  firstRoomID: "1:2",
  kickedUserID: "3",
  newRoomID: "1:2:4"
}
```

---

#### `deleteUserRoomNotify`
Notification that a room was deleted.

**Emitted to:** All room members

**Data:**
```javascript
{
  id: 389,
  from: "1",
  to: "room",
  type: "chatGroup",
  date: {...},
  message: "The room has been deleted by john_doe",
  read: false,
  roomID: "1:2:3"
}
```

---

#### `deleteUserRoomChange`
Update room list after deletion.

**Emitted to:** All room members

**Data:**
```javascript
{
  roomID: "1:2:3"
}
```

---

### Notification Events

#### `privateCommentNotify`
Receive notification about new comment.

**Emitted to:** Houseworker (`user:{houseworkerID}` room)

**Data:**
```javascript
{
  newComment: {
    commentID: 240,
    comment: "Great service!",
    from: "john_doe",
    houseworkerID: "2",
    date: "25.10.2025",
    read: false
  },
  notificationObj: {
    id: 388,
    from: "1",
    to: "2",
    type: "comment",
    date: {...},
    message: "You've got comment from john_doe",
    read: false
  }
}
```

---

#### `newCommentChange`
Update comment list after new comment is posted.

**Emitted to:** Houseworker (`user:{houseworkerID}` room)

**Data:**
```javascript
{
  commentID: 240,
  comment: "Great service!",
  from: "john_doe",
  houseworkerID: "2",
  date: "25.10.2025",
  read: false
}
```

---

#### `privateRatingNotify-{houseworkerID}`
Receive notification about new rating.

**Emitted to:** Specific houseworker (broadcast to all)

**Data:**
```javascript
{
  client: "john_doe",
  houseworker: "sara_cleaner",
  rating: 5,
  houseworkerID: "2",
  notification: {
    id: 387,
    from: "1",
    to: "2",
    type: "comment",
    date: {...},
    message: "The user john_doe has rated you with 5",
    read: false
  }
}
```

---

## Room Naming Convention

Rooms use the format `room:{id1}:{id2}:{id3}...` where IDs are sorted numerically.

**Examples:**
- Private chat between users 1 and 2: `room:1:2`
- Group chat with users 1, 2, and 5: `room:1:2:5`
- After kicking user 2: `room:1:5`

**User-specific notification rooms:**
- Format: `user:{userID}`
- Example: `user:123`

---

## Connection Flow Example

### 1. Initial Connection
```
Client connects → Server emits 'connect'
Client emits 'addOnlineUser' with {userID, username}
Server adds to Redis onlineUsers set
Server broadcasts 'newOnlineUser' to all clients
Client emits 'joinRoom' with userID
Server joins socket to 'user:{userID}' room
```

### 2. Joining Chat Room
```
Client emits 'chatRoom.join' with roomID
Server joins socket to 'room:{roomID}'
Client can now receive 'messageRoom' events
```

### 3. Sending Message
```
Client emits 'message' with message data
Server emits 'messageRoom' to all in room
Server emits 'messagePage' to recipients
Server emits 'messageResponseNotify' for unread tracking
```

### 4. Disconnection
```
Socket disconnects
Server removes user from Redis onlineUsers set
Server broadcasts 'newOnlineUser' with type: "Remove"
```

---

## Error Handling

WebSocket errors are logged to the server console. Common error scenarios:

- **Redis connection failure:** User cannot be added to online set
- **Room join failure:** Invalid room ID format
- **Message delivery failure:** Recipient not connected

**Client-side Error Handling:**
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  // Implement reconnection logic
});

socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // Server forcefully disconnected, manual reconnect needed
    socket.connect();
  }
  // else socket will automatically try to reconnect
});
```

**Error Response Format:**
```javascript
{
  error: "Error message",
  code: "ERROR_CODE",
  timestamp: "2025-10-25T14:30:00.000Z"
}
```