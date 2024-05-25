const express = require("express");
 // Import http module
const socketIO = require("socket.io");
const morgan = require("morgan");
const memberRoute = require("./routes/memberRoute/MemberInfo");
const TestRoute=require('./routes/testRoute/TestRoute.js')
const kanbanRoute = require("./routes/kanbanRoute/KanbanRoute");
const connectToMongoDB = require("./server.js");


const app = express();


const ScrumRoute = require("./routes/scrumRoute/ScrumRoute.js");
const pdfRoute = require("./routes/pdfRoutes/pdfRoutes.js");
const MessageRoute = require("./routes/messageRoute/MessageRoute.js");
const cors = require("cors");
const env = require("dotenv");
const cookieParser = require("cookie-parser");

const bodyParser = require("body-parser");

// Parse JSON request body
app.use(bodyParser.json({ limit: '1mb' })); // Adjust the limit as needed

env.config({ path: "./data.env" });
app.use(cookieParser());

const Signroute = require("./routes/memberRoute/Signup/signup");

env.config({ path: "./data.env" });



// Parse JSON request body
app.use(bodyParser.json({ limit: '1mb' })); // Adjust the limit as needed
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(morgan("dev"));
connectToMongoDB();

// Define a route for the index page
app.get("/", (req, res) => {
  res.send("Welcome to the Project Management");
});


app.use(
  cors({
    origin: `http://localhost:${process.env.front_port}`,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
const PORT = process.env.PORT || 3000;
 const server=app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
 // Create HTTP server instance
const io = socketIO(server, {
  cors: {
    origin: `http://localhost:${process.env.front_port}`,
    methods: "GET,POST,PUT,DELETE",
  },
}); // Pass the server instance to Socket.IO
// Use the memberRoute for paths starting with "/members"
app.use("/members", memberRoute);
app.use("/projects/kanban", kanbanRoute);
app.use("/projects/scrum", ScrumRoute);
app.use("/signup", Signroute);
app.use("/pdf", pdfRoute);
app.use("/message", MessageRoute);
app.use("/test", TestRoute);

///Practicing socket io
// Socket.io logic
// io.on("connection", (socket) => {
//   console.log(`A user connected${socket.id}`);
//   socket.on("join_room", (data) => {
//     console.log(data);
//     socket.join(data);
//   });
//   socket.on("send_message", (data) => {
//     console.log(data);
    
//     //For sending broadcasted data
//     // socket.broadcast.emit("receive_message",data);
//     //so send a msg in a room
//     socket.to(data.room).emit("receive_message", data);
//   })
//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });
io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData);
   // console.log("gee ", userData);
    socket.emit("connected");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  
  // });
  // socket.on("typing", (room) => socket.in(room).emit("typing"));
  // socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

 socket.on("new message", (newMessageReceived) => {
   var chat = newMessageReceived.question;
   // console.log(chat);
   if (!chat.users) return console.log("chat.users not defined");

   chat.users.forEach((user) => {
     console.log("Sending message to user:", newMessageReceived.sender);
     if (user == newMessageReceived.sender._id) return;

     // Emit the "message received" event and pass a callback function
     socket.in(user).emit("message recieved", newMessageReceived, () => {
       // This callback function will be executed after the event is emitted
       console.log("Message received by user:", user);
     });
   });
 });
   socket.on("edit message", (newMessageReceived) => {
     var chat = newMessageReceived.question;
     // console.log(chat);
     if (!chat.users) return console.log("chat.users not defined");

     chat.users.forEach((user) => {
       console.log("Sending message to user:", newMessageReceived.sender);
       if (user == newMessageReceived.sender._id) return;

       // Emit the "message received" event and pass a callback function
       socket.in(user).emit("message edited", newMessageReceived, () => {
         // This callback function will be executed after the event is emitted
         console.log("Message received by user:", user);
       });
     });
   });
  

  // socket.off("setup", () => {
  //   console.log("USER DISCONNECTED");
  //   socket.leave(userData._id);
  // });
});

