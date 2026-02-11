# COMP3133 – Lab Test 1 (Chat App)

Student: <Fredrich_Tan>  
Student ID: <101318950>  

## Overview
this is a Node.js + Express + Socket.io chat app using MongoDB Atlas (Mongoose).
users can sign up, log in, join chat rooms, send room messages, send private messages, and see typing indicators.
messages are stored in MongoDB.

## Tech Stack
- node.js / Express
- socket.io
- mongoDB Atlas + Mongoose
- HTML (login/signup/chat)

## Features (Rubric)
- signup creates a user record in MongoDB
- login + logout (logout clears localStorage)
- mongoose schemas with validation
- predefined rooms (devops, cloud computing, covid19, sports, nodeJS)
- join / Leave room
- room-only messaging
- private (1-to-1) messaging
- typing indicator
- mongoDB storage for:
  - groupmessages (room chat)
  - privatemessages (direct messages)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ## Setup
2. create env.file:
   ```bash
   PORT=3000
   MONGO_URI=<your mongodb atlas connection string>
1. run the server:
   ```bash
   npm install

## how to use:
1. open signup page create user
2. login
3. will be redirected to chat page
4. join room and start chatiing!
5. open igcongnito to repeat steps 1-4 use 2nd user to see chatting
6 send dm to other user


## ps
must have env file. env file in git has been deleted 
