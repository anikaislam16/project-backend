
const Question = require("../../../modules/QuestionModule");

// Function to create a question
async function createQuestion(req, res) {
  try {
    // Extracting necessary data from request body
    const { question, scrumProject, kanbanProject, users, groupAdmin } =
      req.body;

    // Creating a new question instance
    const newQuestion = new Question({
      question,
      scrumProject,
      kanbanProject,
      users,
      groupAdmin,
    });

    // Saving the new question to the database
    const savedQuestion = await newQuestion.save();

    // Find the saved question from the database and populate the users and groupAdmin fields
    const populatedQuestion = await Question.findById(savedQuestion._id)
      .populate("users", "-password") // Exclude password field from users
      .populate("groupAdmin", "-password"); // Exclude password field from groupAdmin

    // Print something
    console.log("Question created successfully:", populatedQuestion);

    // Sending the populated question as response
    res.status(201).json(savedQuestion);
  } catch (error) {
    // Handling errors
    console.error("Error creating question:", error.message);
    res.status(500).json({ message: error.message });
  }
}
const findChatsForMe = async (req, res) => {
   console.log("Hell");
    try {
      const { groupAdminId, ProjectId,projectType } = req.body;
      var chats = null;
      if (projectType === "scrum")
      {
        chats = await Question.find({
          $and: [
            { groupAdmin: groupAdminId },
            { scrumProject: ProjectId },
          ],
        }).exec();
        }
      else
      {
         chats = await Question.find({
           $and: [
             { groupAdmin: groupAdminId },
             { kanbanProject: ProjectId },
           ],
         }).exec();
        }

      res.json(chats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

const findChats = async (req, res) => {
  try {
    console.log('Hell no')
    const { groupAdminId, ProjectId, projectType } = req.body;
    let chats = null;

    if (projectType === "scrum") {
      chats = await Question.find({
        $and: [
          { scrumProject: ProjectId },
          { users: { $in: [groupAdminId] } },
          { groupAdmin: { $ne: groupAdminId } }, // Check if groupAdminId is in the users array
        ],
      }).exec();
      console.log(chats)
    } else {
      chats = await Question.find({
        $and: [
         
          { kanbanProject: ProjectId },
          { users: { $in: [groupAdminId] } }, // Check if groupAdminId is in the users array
        ],
      }).exec();
    }
 
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createQuestion, findChats, findChatsForMe }; // Exporting the function
