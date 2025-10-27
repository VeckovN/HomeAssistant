# API Reference

## Table of Contents
- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication-endpoints)
  - [Users - Clients](#client-endpoints)
  - [Users - Houseworkers](#houseworker-endpoints)
  - [Chat & Messaging](#chat-endpoints)
  - [Health Check](#health-check-endpoint)

## Overview

The HomeAssistant API provides RESTful endpoints for managing users (clients and houseworkers), real-time chat, ratings, comments, and recommendations. All endpoints return JSON responses.

**API Version:** 1.0  
**Protocol:** HTTPS (production), HTTP (development)

---

## Base URL

**Development:**
```
http://localhost:5000/api
```

**Production:**
```
https://homeassistant-ed5z.onrender.com/api
```

---

## Authentication

### Session-Based Authentication

The API uses **cookie-based session authentication** stored in Redis.

**Session Cookie:**
- Name: `sessionLog`
- HTTP-Only: `true`
- Secure: `true` (production only)
- SameSite: `strict` (development) / `none` (production)
- Max Age: 1 hour

**Authentication Flow:**
1. User logs in via `POST /auth/login`
2. Server creates session in Redis
3. Session cookie automatically sent with subsequent requests
4. Server validates session on protected routes

**Protected Routes:**
- Require authentication: Routes with `isLogged` middleware
- Client-only routes: Routes with `checkClient` middleware
- Houseworker-only routes: Routes with `checkHouseworker` middleware

---

## Rate Limiting

**Current Implementation:** None (future enhancement)

**Recommended Limits:**
- Authentication endpoints: 5 requests per 15 minutes per IP
- General API: 100 requests per 15 minutes per user
- WebSocket connections: 1,000 concurrent per server

---


## API Endpoints

## Authentication Endpoints

#### POST /auth/register
Register a new user (client or houseworker).

**Authentication:** Not required

**Request Body (multipart/form-data):**
```javascript
{
  username: String,
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  avatar: File,                    // Profile picture
  city: String,
  gender: String,                // "Male" or "Female"
  userType: String,              // "client" or "houseworker"
  
  // Client-specific:
  interests: String[],             // Comma-separated profession titles
  
  // Houseworker-specific:
  address: String,
  description: String,
  phoneNumber: String,
  age: Number,
  professions: String            // JSON array of {label, working_hour}
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Client Sucessfully created"
}
// OR
{
  "success": true,
  "message": "Houseworker Sucessfully created"
}
```

**Error Responses:**
```json
// Username exists (400)
{ "error": "User with this username exists" }
// Email exists (400)
{ "error": "User with this email exists" }
// File too large (400)
{ "error": "File is too large. Max 5MB allowed." }
// Image upload failed (400)
{ "error": "Image uplaod failed" }
// Neo4j error (500)
{ "error": "Error creating user in Neo4j" }
// Redis error (500)
{ "error": "An error during user registration" }
// Unexpected error (500)
{ "error": "An unexpected register error occurred" }
```

--


### POST /auth/login
Authenticate user and create session.

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "username": "john_doe",
  "type": "Client",
  "userID": "123"
}
```

**Error Responses:**
```json
// User not found (404)
{
  "error": "Incorrect username or password, please try again",
  "errorType": "input"
}
// Password incorrect (401)
{
  "error": "Incorrect username or password, please try again",
  "errorType": "input"
}
// Can't get Redis ID (500)
{ "error": "Can't get the redis ID" }
// Session save failed (500)
{ "error": "Session save failed" }
// Internal error (500)
{ "error": "An internal error occurred" }
```

**Sets Session Cookie:** `sessionLog`

--

### POST /auth/logout
Destroy user session and log out.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": "You're logout now"
}
```

**Error Responses:**
```json
// Not logged in (200)
{ "error": "You're not logged" }
// Session destroy error (400)
{ "error": "Session destruction error message" }
```

**Side Effects:**
- Destroys session in Redis
- Clears `sessionLog` cookie

---


## Client Endpoints

**Base Path:** `/api/clients`

--

### GET /clients/profile
Get authenticated client's profile information.

**Authentication:** Client only

**Success Response (200):**
```json
[
  {
    "picturePath": "https://res.cloudinary.com/dwcncwmpb/image/upload/v1759316595/avatars/dzg0p97iqyikbomfic50.jpg",
    "last_name": "Veckov",
    "id": 1,
    "first_name": "Novak",
    "picturePublicId": "avatars/dzg0p97iqyikbomfic50",
    "email": "veckov@gmail.com",
    "username": "Veckov",
    "gender": "Male",
    "city": "Nis"
  }
]
```

**Error Response (500):**
```json
{
  "error": "Error getting clients"
}
```
--

### GET /clients/
Get all clients (admin/houseworker view).

**Authentication:** Client only

**Success Response (200):**
```json
[
	{
		"picturePath": "https://res.cloudinary.com/dwcncwmpb/image/upload/v1759316595/avatars/dzg0p97iqyikbomfic50.jpg",
		"last_name": "Veckov",
		"id": {
			"low": 1,
			"high": 0
		},
		"first_name": "Novak",
		"picturePublicId": "avatars/dzg0p97iqyikbomfic50",
		"email": "veckov@gmail.com",
		"username": "Veckov"
	},
]
```

**Error Response (500):**
```json
{
  "error": "Error getting clients"
}
```

--

### PUT /clients/profile
Update authenticated client's profile.

**Authentication:** Client only

**Request Body (multipart/form-data):**
```javascript
{
  first_name: String,
  last_name: String,
  email: String,
  password: String,           // Optional: will be hashed
  city: String,               // Optional: updates city relationship
  avatar: File                // Optional: new profile picture
}
```

**Success Response (200):**
```
"Successfully updated"
```

**Error Responses:**
```json
// Email exists (409)
{ "error": "User with this email exists" }

// Update error (500)
{ "error": "Error updating username" }
```

--

### GET /clients/recommendations/:username
Get personalized houseworker recommendations.

**Future:** Could remove `:username` and use session

**Authentication:** Required

**URL Parameters:**
- `username` - Client username

**Success Response (200):**
```json

**Success Response (200):**
```json
[
  {
    "id": 456,
    "username": "sara_cleaner",
    "first_name": "Sara",
    "last_name": "Smith",
    "picturePath": "https://cloudinary.com/...",
    "city": "New York",
    "gender": "Female",
    "age": 30,
    "description": "Professional cleaner...",
    "recommended": true
  }
]
```

**Error Response (500):**
```json
{
  "error": "Error getting recommended houseworkers"
}
```

--



### POST /clients/rating
Rate a houseworker (1-5 stars).

**Authentication:** Client only

**Request Body:**
```json
{
	"client":"Veckov",
	"houseworker":"Sara22",
	"rating": 5
}
```

**Success Response (200):**

The Success Response is actually **notification** 
with **type:"comment"**
```json
{
	"notification": {
		"id": 387,
		"from": "1",
		"to": "2",
		"type": "comment",
		"date": {
			"day": 25,
			"month": 10,
			"year": 2025,
			"time": "12:16"
		},
		"message": "The user Veckov has rated you with 5 ",
		"read": false
	}
}
```

**Error Response (500):**
```json
{
  "error": "Error rating houseworker"
}
```

--

### POST /clients/comments
Post a comment/review on a houseworker.

**Authentication:** Required

**Request Body:**
```json
{
	"client":"Veckov",
	"houseworker":"Sara22",
	"comment":"New comment"
}
```

**Success Response (201):**
```json
{
	"commentID": 241,
	"read": false,
	"commentDate": "25.10.2025",
	"notificationObj": {
		"id": 388,
		"from": "1",
		"to": "2",
		"type": "comment",
		"date": {
			"day": 25,
			"month": 10,
			"year": 2025,
			"time": "12:21"
		},
		"message": "You've got comment from Veckov",
		"read": false
	}
}
```

**Error Response (500):**
```json
{
  "error": "Error posting comment"
}
```

### DELETE /clients/comments
Delete a comment posted by the client.

**Authentication:** Client only

**Query Parameters:**
- `client_username` - Client's username
- `comment_id` - Comment ID to delete

**Example:**
```
DELETE /clients/comments?client_username=Veckov?comment_id=241
```

**Success Response (204):**
```json
{
  "success": "Successfully deleted"
}
```

**Error Response (500):**
```json
{
  "error": "Error deleting comment"
}
```

--

### GET /clients/comments/:username
Get all comments posted by a specific client.

**Authentication:** Client only

**URL Parameters:**
- `username` - Client username

**Success Response (200):**
```json
[
	{
		"comment": "Test comment",
		"houseworker": "Sara22"
	},
	{
		"comment": "Hello russel",
		"houseworker": "Russel13"
	},
  ...
]
```

**Error Response (500):**
```json
{
  "error": "Error finding comments"
}
```

--

### GET /clients/:username
Get specific client profile (houseworker access).

**Authentication:** Houseworker only

**URL Parameters:**
- `username` - Client username

**Success Response (200):**
```json
{
	"picturePath": "https://res.cloudinary.com/dwcncwmpb/image/upload/v1759316595/avatars/dzg0p97iqyikbomfic50.jpg",
	"last_name": "Veckov",
	"id": {
		"low": 1,
		"high": 0
	},
	"first_name": "Novak",
	"picturePublicId": "avatars/dzg0p97iqyikbomfic50",
	"email": "veckov@gmail.com",
	"username": "Veckov"
}
```

**Error Response (500):**
```json
{
  "error": "Error with client username"
}
```

---

## Houseworker Endpoints

### GET /houseworkers/
Get all houseworkers (paginated).

**Authentication:** Not required

**Success Response (200):**
```json
[
	{
		"id": 2,
		"first_name": "Sara",
		"last_name": "Veckov",
		"email": "sara22@gmail.com",
		"username": "Sara22"
		"picturePath": "https://res.cloudinary.com/dwcncwmpb/image/upload/v1761232635/avatars/i9zat30g3o2kmmmfia43.jpg",
		"picturePublicId": "avatars/i9zat30g3o2kmmmfia43",
	},
  {
		"id": 13,
		"first_name": "Elisabeth",
		"last_name": "Leffler",
		"email": "Arnoldo.Hackett20@yahoo.com",
		"username": "Robb39"
		"picturePath": "https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/44.jpg",
		"picturePublicId": "2b2d973e-e8c8-49f4-a011-61620df62ca9",
	},
]
```

**Error Response (500):**
```json
{
  "error": "Error getting houseworkers"
}
```

--

### GET /houseworkers/filter
Filter houseworkers by multiple criteria.

**Authentication:** Not required

**Query Parameters:**
- `city`: City name
- `gender`: "Male" or "Female"
- `ageFrom`: Minimum age
- `ageTo`: Maximum age
- `professions`: Comma-separated
- `name`: Search by username
- `sort`: "ASC", "RatingUp", "RatingDown", "AgeUp", "AgeDown"
- `pageNumber`: Page number (default: 0)
- `itemsPerPage`: Items per page (default: 4)

**Example:**
```
GET /houseworkers/filter?city=Beograd&gender=Male&ageFrom=25&ageTo=66&professions=Housekeeper&sort=RatingUp&pageNumber=0&itemsPerPage=10
```

**Success Response (200):**
```json
[
  {
		"picturePath": "https://res.cloudinary.com/dwcncwmpb/image/upload/v1760606449/avatars/hp8jjkehe15ewwfkssqs.png",
		"last_name": "Anderson",
		"id": 66,
		"first_name": "Michael",
		"picturePublicId": "avatars/hp8jjkehe15ewwfkssqs",
		"email": "michael.anderson@example.com",
		"username": "michael.anderson",
		"address": "248 Maple Street",
		"description": "Dependable and hardworking houseworker with over 10 years of experience in maintenance and cleaning",
		"phone_number": "0199218851",
		"age": 27,
		"city": "Beograd",
		"gender": "Male"
	},
]
```

**Error Response (500):**
```json
{
  "error": "Error houseworker filter"
}
```

--

### GET /houseworkers/profile
Get authenticated houseworker's profile.

**Authentication:** Houseworker only

**Success Response (200):**
```json
{
	"picturePath": "https://res.cloudinary.com/dwcncwmpb/image/upload/v1761232635/avatars/i9zat30g3o2kmmmfia43.jpg",
	"last_name": "Veckov",
	"id": 2,
	"first_name": "Sara",
	"picturePublicId": "avatars/i9zat30g3o2kmmmfia43",
	"email": "sara22@gmail.com",
	"username": "Sara22",
	"address": "Mokranjceva 12",
	"phone_number": "0698822081",
	"description": "More than 6 years of experience in domestic help",
	"gender": "Female",
	"city": "Nis"
}
```

**Error Response (500):**
```json
{
  "error": "Error houseworker info"
}
```

--

### PUT /houseworkers/profile
Update authenticated houseworker's profile.

**Authentication:** Houseworker only

**Request Body (multipart/form-data):**
```javascript
{
  first_name: String,
  last_name: String,
  email: String,
  password: String,
  address: String,
  description: String,
  phone_number: String,
  age: Number,
  city: String,
  avatar: File
}
```

**Success Response (200):**
```
"Successfuly updated!!!"
```

**Error Responses:**
```json
// Email exists (409)
{ "error": "User with this email exists" }

// Update error (500)
{ "error": "Error updating houseworker" }
```

--


### GET /houseworkers/stats/count
Get total number of houseworkers.


**Authentication:** Not required

**Success Response (200):**
```json
{
  "count": 1250
}
```

**Error Response (500):**
```json
{
  "error": "Error houseworker count"
}
```

---

### GET /houseworkers/:username
Get specific houseworker's public profile.

**Authentication:** Houseworker only

**URL Parameters:**
- `username` - Houseworker username

**Success Response (200):**
```json
{
  "id": 2,
  "first_name": "Sara",
  "last_name": "Veckov",
  "email": "sara22@gmail.com",
  "username": "Sara22"
  "picturePath": "https://res.cloudinary.com/dwcncwmpb/image/upload/v1761232635/avatars/i9zat30g3o2kmmmfia43.jpg",
  "picturePublicId": "avatars/i9zat30g3o2kmmmfia43",
}
```

**Error Response (500):**
```json
{
  "error": "Error getting houseworker"
}
```

--

### DELETE /houseworkers/:username
Delete houseworker account.

**Authentication:** Houseworker only

**URL Parameters:**
- `username` - Houseworker username

**Success Response (200):**
```json
[
  // Returns remaining houseworkers after deletion
]
```

**Error Response (500):**
```json
{
  "error": "Error deleting houseworker"
}
```


### GET /houseworkers/:username/rating
Get houseworker's average rating.

**Authentication:** Not required

**URL Parameters:**
- `username` - Houseworker username

**Success Response (200):**
```json
4.8
```

**Error Response (500):**
```json
{
  "error": "Error getting houseworker rating"
}
```

--

### GET /houseworkers/rating
Get authenticated houseworker's rating.

**Current Endpoint:** `GET /houseworkers/rating`  

**Authentication:** Houseworker only

**Success Response (200):**
```json
4.8
```

**Error Response (500):**
```json
{
  "error": "Error rating houseworker"
}
```

--

### GET /houseworkers/:username/comments/:pageNumber
Get comments for a houseworker (paginated).

**Authentication:** Client only

**URL Parameters:**
- `username` - Houseworker username
- `pageNumber` - Page number (0-indexed)

**Success Response (200):**
```json
[
	{
		"commentID": 240,
		"comment": "newest",
		"from": "Veckov",
		"read": true,
		"date": "25.10.2025"
	},
  
]
```

**Error Response (500):**
```json
{
  "error": "Error getting houseworker comments"
}
```

--

### GET /houseworkers/:username/comments/count
Get total comment count for houseworker.

**Authentication:** Not required

**URL Parameters:**
- `username` - Houseworker username

**Success Response (200):**
```json
45
```

**Error Response (500):**
```json
{
  "error": "Error getting houseworker cooments count"
}
```

--

### GET /houseworkers/comments/my/:pageNumber
Get authenticated houseworker's received comments.

**Authentication:** Houseworker only

**URL Parameters:**
- `pageNumber` - Page number

**Success Response (200):**
```json
[
  {
		"commentID": 240,
		"comment": "newest",
		"from": "Veckov",
		"read": true,
		"date": "25.10.2025"
	},
]
```

**Error Response (500):**
```json
{
  "error": "Error getting comments"
}
```

--

### GET /houseworkers/:username/comments/unread
Get unread comments for houseworker.

**Authentication:** Houseworker only

**URL Parameters:**
- `username` - Houseworker username

**Success Response (200):**
```json
[
   {
		"commentID": 240,
		"comment": "newest",
		"from": "Veckov",
		"date": "25.10.2025"
	},
]
```

**Error Response (500):**
```json
{
  "error": "Error getting unread comments"
}
```

--

### GET /houseworkers/:username/comments/unread/mark
Mark all comments as read.

**Authentication:** Houseworker only

**URL Parameters:**
- `username` - Houseworker username

**Success Response (200):**
```json
true
```

**Error Response (500):**
```json
{
  "error": "Error getting unread comments"
}
```

--

### GET /houseworkers/professions
Get authenticated houseworker's professions.

**Authentication:** Houseworker only

**Success Response (200):**
```json
[
	{
		"profession": "Housekeeper",
		"working_hour": "4"
	},
	{
		"profession": "Nanny",
		"working_hour": "6"
	},
	{
		"profession": "Personal Chef",
		"working_hour": "3"
	},
	{
		"profession": "Elderly Caregiver",
		"working_hour": "4"
	}
]
```

**Error Response (500):**
```json
{
  "error": "Error getting professions"
}
```

--

### GET /houseworkers/:username/professions
Get professions for specific houseworker.

**Authentication:** Not required

**URL Parameters:**
- `username` - Houseworker username

**Success Response (200):**
```json
[
	{
		"profession": "Gardener",
		"working_hour": 8
	},
	{
		"profession": "Personal Shopper",
		"working_hour": 7
	}
]
```

**Error Response (500):**
```json
{
  "error": "Error getting houseworker professions"
}
```

--

### GET /houseworkers/professions/all
Get all available profession types.

**Authentication:** Not required

**Success Response (200):**
```json
[
  {
    "title": "Housekeeper",
    "description": "Responsible for cleaning, organizing, and maintaining a household to keep it neat and comfortable."
  },
  {
    "title": "Nanny",
    "description": "Provides full or part-time childcare, including daily care, supervision, and educational support for children."
  },
  {
    "title": "Personal Chef",
    "description": "Prepares customized meals based on the client’s preferences, dietary needs, and schedules."
  },
  {
    "title": "Gardener",
    "description": "Maintains and cares for outdoor spaces, including planting, watering, pruning, and landscaping."
  },
  {
    "title": "Butler",
    "description": "Oversees household operations, manages staff, and ensures high-quality service for residents and guests."
  },
  {
    "title": "Personal Driver",
    "description": "Provides safe and reliable transportation for clients, managing routes, schedules, and vehicle upkeep."
  },
  {
    "title": "Elderly Caregiver",
    "description": "Assists seniors with daily activities, personal care, companionship, and basic health monitoring."
  },
  {
    "title": "Pet Sitter",
    "description": "Takes care of pets by feeding, walking, and ensuring their comfort and safety while owners are away."
  },
  {
    "title": "Home Health Aide",
    "description": "Supports patients at home by assisting with hygiene, mobility, medication, and light housekeeping tasks."
  },
  {
    "title": "Personal Shopper",
    "description": "Helps clients choose and purchase clothing, groceries, or other items based on their preferences and needs."
  }
]
```

**Error Response (500):**
```json
{
  "error": "Error getting all professions"
}
```

--

### POST /houseworkers/professions
Add profession to authenticated houseworker.

**Authentication:** Houseworker only

**Request Body:**
```json
{
 {
	"profession":"Nanny",
	"working_hour":"4"
}
}
```

**Success Response (201):**
```json
{
  "data": null,
  "status": 200
}
```

**Error Response (500):**
```json
{
  "error": "Error adding profession"
}
```

--

### DELETE /houseworkers/professions/:profession
Remove profession from authenticated houseworker.

**Authentication:** Houseworker only

**URL Parameters:**
- `profession` - Profession title to remove

**Example:**
```
DELETE /houseworkers/professions/Nanny
```

**Success Response (200):**
```json
//Remainds professions
[
	{
		"profession": "Housekeeper",
		"working_hour": "4"
	},
	{
		"profession": "Personal Chef",
		"working_hour": "3"
	},
	{
		"profession": "Elderly Caregiver",
		"working_hour": "4"
	}
]
```

### PUT /houseworkers/professions
Update working hours for a profession.


**Authentication:** Houseworker only

**Request Body:**
```json
{
	"profession":"Nanny",
	"working_hour":"6"
}
```

**Success Response (200):**
```json
{
	"profession": "Nanny",
	"working_hour": "6"
}
```

**Error Response (500):**
```json
{
  "error": "Error updating profession working hour"
}
```
--

### GET /houseworkers/cities
Get all cities where houseworkers are located.

**Authentication:** Not required

**Success Response (200):**
```json
[
	"Nis",
	"Novi Sad",
	"Sremska Mitrovica",
	"Cacak",
	"Vrsac",
	"Valjevo",
	"Kraljevo",
	"Sabac",
	"Subotica",
	"Jagodina",
	"Kragujevac",
	"Novi Pazar",
	"Kikinda",
	"Pirot",
	"Pozarevac",
	"Beograd",
	"Smederevo",
	"Krusevac",
	"Vranje",
	"Leskovac",
	"Uzice",
	"Sombor"
]
```

**Error Response (500):**
```json
{
  "error": "Error getting houseworker city"
}
```

--

### GET /houseworkers/home/:username
Get home dashboard statistics.

**Authentication:** Required

**URL Parameters:**
- `username` - Houseworker username

**Success Response (200):**
```json
{
	"professions": [
		"Housekeeper",
		"Nanny",
		"Personal Chef",
		"Elderly Caregiver"
	],
	"commentCount": 36,
	"avgRating": 3
}
```

**Error Response (500):**
```json
{
  "error": "Error houseworker home info"
}
```

-

### GET /houseworkers/:username/professions/summary
Get professions and rating together.

**Authentication:** Not required

**URL Parameters:**
- `username` - Houseworker username

**Success Response (200):**
```json
{
	"professions": [
		{
			"profession": "Housekeeper",
			"working_hour": "4"
		},
		{
			"profession": "Nanny",
			"working_hour": "6"
		},
		{
			"profession": "Personal Chef",
			"working_hour": "3"
		},
		{
			"profession": "Elderly Caregiver",
			"working_hour": "4"
		}
	],
	"avgRating": 3.25
}
```

**Error Response (500):**
```json
{
  "error": "Error getting professions and rating"
}
```

--

### GET /houseworkers/:username/notifications
Get notifications for authenticated houseworker.

**Authentication:** Houseworker only

**URL Parameters:**
- `username` - Houseworker username

**Query Parameters:**
- `offset` - Starting index (default: 0)
- `size` - Number of notifications (default: 10)

**Example:**
```
GET /houseworkers/sara_cleaner/notifications?offset=0&size=10
```

**Success Response (200):**
```json
{
	"notifications": [
		{
			"id": 388,
			"from": "1",
			"to": "2",
			"type": "comment",
			"date": {
				"day": 25,
				"month": 10,
				"year": 2025,
				"time": "12:21"
			},
			"message": "You've got comment from Veckov",
			"read": false
		},
  ]
}
```

**Error Response (500):**
```json
{
  "error": "Error getting notifications"
}
```

--

### GET /houseworkers/:username/notifications/:batchNumber
Get more notifications (pagination).

**Authentication:** Houseworker only

**URL Parameters:**
- `username` - Houseworker username
- `batchNumber` - Batch number

**Example:**
```
GET /houseworkers/Sara22/notifications/6
```

**Success Response (200):**
```json
[
	{
		"id": 258,
		"from": "1",
		"to": "2",
		"type": "chatGroup",
		"date": {
			"day": 7,
			"month": 10,
			"year": 2025,
			"time": "9:52"
		},
		"message": "The client Veckov has added the houseworker Aryanna.Nienow66 to the chat",
		"read": false
	},
]
```

**Error Response (500):**
```json
{
  "error": "Error getting more notifications"
}
```

--

### PUT /houseworkers/notifications/mark
Mark a notification as read.

**Authentication:** Houseworker only

**Request Body:**
```json
{
	"notificationID": "284",
	"batchNumber": "5"
}
```

**Success Response (200):**
```
"Successfuly marked"
```

**Error Response (500):**
```json
{
  "error": "Error marking unread notifications"
}
```

---

## Chat Endpoints

**Base Path:** `/api/chat`

### GET /chat/rooms/:username
Get all chat rooms for authenticated user.

**Authentication:** Required

**URL Parameters:**
- `username` - User's username

**Success Response (200):**
```json
{
  "rooms": [
    {
      "roomID": "1:2",
      "lastMessage": {
        "message": "Hello!",
        "dateDiff": "2 hours ago"
      },
      "users": [
        {
          "userID": "2",
          "username": "Sara22",
          "picturePath": "https://cloudinary.com/...",
          "online": true
        }
      ]
    }
  ],
  "unread": [
    {
      "roomID": "1:2",
      "count": 3
    }
  ]
}
```

**Error Response (500):**
```json
{
  "error": "Error durring getting all rooms"
}
```

--


### GET /chat/rooms/:roomID/messages
Get messages from a specific room.

**Authentication:** Required

**URL Parameters:**
- `roomID` - Room ID (e.g., "1:2")

**Query Parameters:**
- `offset` - Starting index (default: 0)
- `size` - Number of messages (default: 50)

**Example:**
```
GET /chat/rooms/1:2/messages?offset=0&size=50
```

**Success Response (200):**
```json
[
	{
		"message": "New messagge",
		"from": "1",
		"roomID": "1:2",
		"fromUsername": "Veckov",
		"date": {
			"day": 25,
			"month": 10,
			"year": 2025,
			"time": "11:50"
		}
	},
  {
		"message": "newest",
		"from": "1",
		"roomID": "1:2",
		"fromUsername": "Veckov",
		"contact": true,
		"date": {
			"day": 25,
			"month": 10,
			"year": 2025,
			"time": "11:00"
		}
	},
]
```

**Error Response (500):**
```json
{
  "error": "Message Errors"
}
```

--

### GET /chat/rooms/:roomID/messages/:pageNumber
Get more messages (pagination).

**Authentication:** Required

**URL Parameters:**
- `roomID` - Room ID
- `pageNumber` - Page number

**Example:**
```
GET /chat/rooms/1:2/messages/1
```

**Success Response (200):**
```json
[
	{
		"message": "sd",
		"from": "1",
		"roomID": "1:2",
		"fromUsername": "Veckov",
		"date": {
			"day": 15,
			"month": 10,
			"year": 2025,
			"time": "13:08"
		}
	},
	{
		"message": "fa",
		"from": "1",
		"roomID": "1:2",
		"fromUsername": "Veckov",
		"date": {
			"day": 15,
			"month": 10,
			"year": 2025,
			"time": "12:22"
		}
	},
]
```

**Error Response (500):**
```json
{
  "error": "Fetching Messages Error"
}
```

--

### POST /chat/rooms/messages
Send a message to a room.

**Authentication:** Required

**Request Body:**
```json
 {
	"message":"New messagge",
	"from":"1",
	"roomID":"1:2",
	"fromUsername":"Veckov"
}
```

**Success Response (201):**
```json
{
	"roomKey": "room:1:2",
	"dateFormat": {
		"day": 25,
		"month": 10,
		"year": 2025,
		"time": "11:50"
	},
	"lastMessage": "New messagge",
	"unreadMessArray": [
		{
			"roomID": "1:2",
			"recipientID": "2",
			"countNumber": 2,
			"updateStatus": true
		}
	],
	"createRoomNotification": null
}
```

**Error Response (500):**
```json
{
  "error": "Message posting Error"
}
```

--

### DELETE /chat/rooms/:roomID
Delete entire room.

**Authentication:** Client only

**URL Parameters:**
- `roomID` - Room ID to delete

**Example:**
```
DELETE /chat/rooms/1:17:46
```

**Success Response (200):**
```json
[
	{
		"id": 389,
		"from": "1",
		"to": "room",
		"type": "chatGroup",
		"date": {
			"day": 25,
			"month": 10,
			"year": 2025,
			"time": "13:50"
		},
		"message": "The room room:1:17:46 has been deleted by Veckov",
		"read": false
	},
]
```

**Error Response (400):**
```json
{
  "error": "Room can't be deleted"
}
```


### DELETE /chat/rooms/:roomID/users/:username
Remove user from room.

**Authentication:** Client only

**URL Parameters:**
- `roomID` - Room ID
- `username` - Username to remove

**Example:**
```
DELETE /chat/rooms/1:2:39:46/users/Adella95
```

**Success Response (200):**
```json
{
	"newRoomID": null,
	"kickedUserID": "39"
}
```

**Error Response (400):**
```json
{
  "error": "You can't add user to Room"
}
```

--

### POST /chat/rooms/users
Add user to existing room.

**Authentication:** Client only

**Request Body:**
```json
{
	"roomID":"1:17",
	"newUsername":"Sara22"
}
```

**Success Response (200):**
```json
{
	"newAddedUserID": "2",
	"roomID": "1:2:17",
	"isPrivate": true,
	"newUserPicturePath": "https://res.cloudinary.com/dwcncwmpb/image/upload/v1761232635/avatars/i9zat30g3o2kmmmfia43.jpg",
	"notifications": [
		{
			"id": 394,
			"from": "1",
			"to": "2",
			"type": "chatGroup",
			"date": {
				"day": 25,
				"month": 10,
				"year": 2025,
				"time": "14:00"
			},
			"message": "The client Veckov has added the houseworker Sara22 to the chat",
			"read": false
		},
		{
			"id": 395,
			"from": "1",
			"to": "17",
			"type": "chatGroup",
			"date": {
				"day": 25,
				"month": 10,
				"year": 2025,
				"time": "14:00"
			},
			"message": "The client Veckov has added the houseworker Sara22 to the chat",
			"read": false
		},
		{
			"id": 396,
			"from": "1",
			"to": "2",
			"type": "chatGroup",
			"date": {
				"day": 25,
				"month": 10,
				"year": 2025,
				"time": "14:00"
			},
			"message": "You've been added to the group by Veckov",
			"read": false
		}
	]
}
```

**Error Response (400):**
```json
{
  "error": "You can't add user to Room"
}
```

--

### DELETE /chat/rooms/:roomID/unread/:userID
Reset unread message count for a room.

**Authentication:** Required

**URL Parameters:**
- `roomID` - Room ID
- `userID` - User's Redis ID

**Example:**
```
DELETE /chat/rooms/1:2/unread/123
```

**Success Response (200):**
```json
{
  "status": "success",
  "removedCount": 3
}
```

**Error Response (400):**
```json
{
  "error": "Remove unread messages Error"
}
```

--

### DELETE /chat/rooms/:roomID/unread/all/:clientID
Reset unread count for all users in a room.

**Authentication:** Required

**URL Parameters:**
- `roomID` - Room ID
- `clientID` - Client's Redis ID

**Success Response (200):**
```json
{
  "status": "success",
  "removedClientUnreadCount": 3
}
```

**Error Response (400):**
```json
{
  "error": "Remove unread messages Error"
}
```

--

### GET /chat/unread/:username
Get all unread messages for user.

**Authentication:** Required

**URL Parameters:**
- `username` - User's username

**Success Response (200):**
```json
{
  "unread": [
    {
      "roomID": "1:2",
      "count": 3
    },
    {
      "roomID": "1:3:5",
      "count": 1
    }
  ],
  "totalUnread": 4
}
```

**Error Response (500):**
```json
{
  "error": "Fetching unread messages error"
}
```

--

### GET /chat/unread/count/:userID
Get total unread message count.

**Authentication:** Required

**URL Parameters:**
- `userID` - User's Redis ID

**Success Response (200):**
```json
4
```

**Error Response (500):**
```json
{
  "error": "Message posting Error"
}
```

--

### PUT /chat/unread/forward
Forward unread messages when room ID changes.

**Authentication:** Required

**Request Body:**
```json
{
  "oldRoomID": "1:2:3",
  "newRoomID": "1:2",
  "kickedUserID": "3"
}
```

**Success Response (200):**
```json
{
  "newRoomID": "1:2"
}
```

**Error Response (400):**
```json
{
  "error": "Remove unread messages Error"
}
```

--

### GET /chat/online-users/:userID
Get list of online users from all rooms.

**Authentication:** Required

**URL Parameters:**
- `userID` - User's Redis ID

**Success Response (200):**
```json
[
  "2", 
  "5", 
  "12"
]
```

**Error Response (500):**
```json
{
  "error": "Fetching online users error"
}
```

--

### GET /chat/friends/:userID
Get list of all users the client has chatted with.

**Authentication:** Required

**URL Parameters:**
- `userID` - User's Redis ID

**Success Response (200):**
```json
[
	"1",
	"2",
	"54",
	"53",
	"59",
	"34",
	"61",
	"46",
	"39",
]
```

**Error Response (500):**
```json
{
  "error": "Friends list error"
}
```

--

### GET /chat/users/:userID/firstRoom
Get houseworker's first room ID.

**Authentication:** Required

**URL Parameters:**
- `userID` - User's Redis ID

**Success Response (200):**
```json
"1:2:17"
```

**Error Response (500):**
```json
{
  "error": "Fetching First room Error"
}
```

--

### GET /chat/stats/conversation-count/:userID
Get total conversation count for houseworker.

**Authentication:** Houseworker only

**URL Parameters:**
- `userID` - User's Redis ID

**Success Response (200):**
```json
15
```

**Error Response (500):**
```json
{
  "error": "Conversetion Count error"
}
```

---

## Health Check Endpoint

### GET /health
Check API and database connectivity status.

**Authentication:** Not required

**Success Response (200):**
```json
{
  "status": "ok",
  "redis": "PONG",
  "neo4j": "1",
  "timestamp": "2025-10-22T14:30:00.000Z"
}
```

**Error Response (500):**
```json
{
  "status": "error",
  "error": "Redis connection failed",
  "timestamp": "2025-10-22T14:30:00.000Z"
}
```

---

## WebSocket Events

The HomeAssistant API uses Socket.IO for real-time bidirectional communication between clients and the server. WebSocket connections enable instant notifications, live chat messaging, typing indicators, and online presence tracking.

**Socket.IO Server:** `http://localhost:5000` (development)

## Connection Events

### `connect`

Automatically triggered when the socket successfully connects to the server.

**Client-side Handler:**

```javascript
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});
```

### `disconnect`

Automatically triggered when the socket disconnects from the server. Cleans up user from online users set.

**Client-side Handler:**

```javascript
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

### Connection Lifecycle

#### `connect`
Automatically triggered when socket successfully connects.

**Emitted by:** Server

```javascript
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});
```


**Action Required:** Client should emit `addOnlineUser` and `joinRoom` events.

--

#### `disconnect`
Automatically triggered when socket disconnects.

**Emitted by:** Server

```javascript
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

**Server Action:** Removes user from online users set in Redis.

---

### Client → Server Events

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