const express = require("express");
const router = express.Router();
const {
  createQuestion,
  findChats,
  findChatsForMe
} = require("./messageController/ChatController");
const {
  createMessage,
  getMessagesByChat,
  updateMessageContent,
  toggleLikeForMember
} = require("./messageController/MessageController");
// Route to create a question

router.post("/", createQuestion);
router.post("/sendMsg", async (req, res) => {
  try {
    // Call the createMessage function and pass the request body
    const savedMessage = await createMessage(req.body);
    console.log(savedMessage)
    // Send a success response
    res.status(201).json(savedMessage);
  } catch (error) {
    // Handle errors
    console.error("Error creating message:", error.message);
    res.status(500).json({ error: error.message });
  }
});
router.get("/getmessage", async (req, res) => {
  try {
    const { chatId } = req.query; // Extract chatId from query parameters

    // Call the getMessagesByChat function and pass the chatId
    const messages = await getMessagesByChat(chatId);

    // Send a success response with the messages
    res.json(messages);
  } catch (error) {
    // Handle errors
    console.error("Error retrieving messages:", error.message);
    res.status(500).json({ error: error.message });
  }
});
router.put("/update-message", async (req, res) => {
  try {
    const messageId = req.query.messageId;
    const newContent = req.body.newContent;

    if (!messageId) {
      return res.status(400).json({ error: "Message ID is required" });
    }

    const updatedMessage = await updateMessageContent(messageId, newContent);

    res.json(updatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/toggle-like", async (req, res) => {
  try {
    // Extract memberId and messageId from req.query
    const { memberId, messageId } = req.query;

    // Call toggleLikeForMember function
    const Liked = await toggleLikeForMember({
      memberId,
      messageId,
    });

    // Send response with updatedLikesCount and isLiked
    res.json(Liked);
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
});
router.post("/findChats", findChats);
router.post("/findChatsForMe", findChatsForMe);
module.exports = router;
