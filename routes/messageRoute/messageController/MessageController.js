const Message = require("../../../modules/MessageModule");

async function createMessage(reqBody) {
  try {
    const { sender, content, question } = reqBody;

    // Create a new message instance
    const newMessage = new Message({
      sender,
      content,
      question,
      Likes: [],
    });

    // Save the new message to the database
    const savedMessage = await newMessage.save();

    // Find the saved message from the database and populate its fields
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate("sender", "name email")
      .populate("question");

    console.log(populatedMessage);
    return populatedMessage;
  } catch (error) {
    // Handle errors
    throw new Error("Error creating message: " + error.message);
  }
}


async function getMessagesByChat(chatId) {
  try {
    // Find all messages with the given chatId
    const messages = await Message.find({ question: chatId })
      .populate("sender", "name email")
      .populate("question");
    return messages;
  } catch (error) {
    // Handle errors
    throw new Error(error.message);
  }
}
async function updateMessageContent(messageId, newContent) {
  try {
    // Find the message by ID and update its content
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { content: newContent },
      { new: true } // Return the updated document
    );

    if (!updatedMessage) {
      throw new Error("Message not found");
    }
    const populatedMessage = await Message.findById(messageId)
      .populate("sender", "name email")
      .populate("question");

    return populatedMessage;
  } catch (error) {
    throw error;
  }
}
async function toggleLikeForMember(reqQuery) {
  try {
    const { memberId, messageId } = reqQuery;

    // Check if both memberId and messageId are provided
    if (!memberId || !messageId) {
      throw new Error("Both memberId and messageId must be provided.");
    }

    // Find the message by its ID
    const message = await Message.findById(messageId);

    // If message not found, throw an error
    if (!message) {
      throw new Error("Message not found.");
    }

    // Check if the memberId is already in the Likes array
    const index = message.Likes.indexOf(memberId);

    let isLiked;
    let updatedLikesCount = message.Likes.length;

    if (index === -1) {
      // If memberId is not present, add it to Likes array
      message.Likes.push(memberId);
      isLiked = true;
      updatedLikesCount++;
    } else {
      // If memberId is present, remove it from Likes array
      message.Likes.splice(index, 1);
      isLiked = false;
      updatedLikesCount--;
    }

    // Save the updated message
    await message.save();
     const messages = await Message.findById(messageId);
    console.log(messages.Likes);
    const Liked = {
      Likes: messages.Likes,
      updatedLikesCount,
      isLiked,
    };
    console.log(Liked)
   return Liked;
  } catch (error) {
    throw new Error("Error toggling like: " + error.message);
  }
}

module.exports = {
  createMessage,
  getMessagesByChat,
  updateMessageContent,
  toggleLikeForMember
};
