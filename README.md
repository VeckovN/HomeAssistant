# HomeAssistant

## Table of Contents
 * [Technical Documentation](#technical-documentation)
 * [Project Overview](#project-overview)
 * [Technologies](#technologies)
 * [Core Features](#core-features)
 * [Setup](#setup)
 * [App Pages](#app-pages)

## Technical Documentation
https://docs.google.com/document/d/1aOVzuddG7fOWAt-W2SW6L6mZmHCbq7oB62SIredRe0s/edit?usp=sharing

## Project Overview
This is a full-stack web application that connects clients with house workers for professional services. It involves real-time communication, user recommendations, and efficient filtering.
In other words, the application enables customers to search for, filter, and get in contact with house workers according to location, profession, and age, using more criteria.
Houseworkers can show their skills, rating, and reviews, aside from communicating with prospective clients.

## Technologies
* Frontend: HTML5, SCSS, ReactJS, Redux Toolkit<br />
* Backend: NodeJS, Express <br />
* Databases:
  - Neo4j for persistent user data and relationship-based recommendations
  - Redis for caching, session storage, and real-time data management
* Real-time: Socket.IO <br />
* Authorization: Cookie - Session-based <br />
* Design(Houseworker Part): Figma <br />

## User Types 
 - Guest
 - Client
 - Houseworker

## Core Features
1. Real-Time Communication
   - House workers can chat with clients and vice versa for instant messaging using SocketIO
   - Event notifications will occur for new messages, create a room, add/remove users from chat, comments, and ratings.

2. Recommendations
   - Recommend houseworkers based on the interests of the clients. Interests will be stored in Neo4j.
   - Results are cached to quickly filter results using Redis.

3. Filtering
   - Clients can filter houseworkers by profession, location, age, and gender.
   - Results will be in real-time with cached filtered users.

4. Dynamic Room Management
   - Users will create, join, or leave chat rooms.
   - Redis Sorted Sets track recent activity for room prioritization.
  
5. Redis Session and Caching
   - Session Management: Redis is used to manage cookie-based sessions, ensuring secure and efficient user authentication.
   - Caching: Frequently accessed data, such as recently filtered users and recommended houseworkers, is cached in Redis for improved performance.

6. User Feedback
   - Houseworkers can be commented on and rated by clients.
   - Real-time ratings and reviews update.

7. User Presence and Typing Indicators
   - Online users and typing status can be tracked using SocketIO

## Setup 
Install this project locally using npm:

## App Pages
### Home Page
![1](https://github.com/VeckovN/HomeAssistant/assets/56490716/0a16663b-7165-472b-80fe-70faf1747662)

### Home Page(logged User - Client)
![2](https://github.com/VeckovN/HomeAssistant/assets/56490716/fe5158e0-cb78-481f-a526-b84c5ea67b87)

### Houseworker's comments preview (Client)
![3](https://github.com/VeckovN/HomeAssistant/assets/56490716/64a65ee3-bd8d-411d-a3e1-d15f5b2c01c1)

### Chat- Group and Private (Client)
![4](https://github.com/VeckovN/HomeAssistant/assets/56490716/03455253-1d11-48dd-852b-3aa75f72c47c)

### Chat - Group chat options
![5](https://github.com/VeckovN/HomeAssistant/assets/56490716/f9cee19b-fef7-44ee-97f7-f915cc11ff52)

### Profile (client)
![6](https://github.com/VeckovN/HomeAssistant/assets/56490716/3ec37a6d-c4ac-4ab6-8bd8-c24f96e2f88a)

### Houseworker Page
![7](https://github.com/VeckovN/HomeAssistant/assets/56490716/34d75e3e-b5e7-491b-aa04-ee4805efb51b)

### Houseworker Comments
![8](https://github.com/VeckovN/HomeAssistant/assets/56490716/846b1aca-6624-43dc-b087-331167371335)

### Houseworker Profile
![9](https://github.com/VeckovN/HomeAssistant/assets/56490716/b0fa426a-3fd3-4f95-9056-66aa2df937fd)

### Houseworker Profile Professions 
![10](https://github.com/VeckovN/HomeAssistant/assets/56490716/34574d56-316f-44d0-b104-ba94431ecfb0)

