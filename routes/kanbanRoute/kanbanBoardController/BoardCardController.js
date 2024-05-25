// boardController.js
const { KanbanBoard } = require("../../../modules/BoardModule");
const { Member } = require("../../../modules/MemberModule");
const { KanbanProject } = require("../../../modules/KanbanModule")
const { sendJoingcardEmail, sendRemovingcardEmail } = require('./SendMail');
const addCard = async (req, res) => { //lagbe
  try {
    const currentDate = new Date();
    const boardId = req.params.boardId;
    console.log(req.params.boardId);
    const kanbanBoard = await KanbanBoard.findById(req.params.boardId);

    if (!kanbanBoard) {
      return res.status(404).json({ message: "Board not found" });
    }
    const email = req.body.email;
    const existingMember = await Member.findOne({ email });
    const newCard = {
      cardName: req.body.cardName,
      tags: [], // Assuming labels is an array
      task: [], // Assuming tasks is an array
      startDate: new Date(currentDate),
      dueDate: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
      priority: "low",
      members: [
        {
          member_id: existingMember._id,
          role: 'admin',
        },], // Assuming members is an array
      creationTime: new Date(),
      board: [
        {
          new_start: new Date(),
          total: 0,
          id: boardId, // Generating a new ObjectId for the id
        },
      ],
    };

    kanbanBoard.cards.push(newCard);
    await kanbanBoard.save();

    // Return the added card in the response, including the ID
    return res.json({
      card: {
        ...newCard,
        _id: kanbanBoard.cards[kanbanBoard.cards.length - 1]._id,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// const updateCardName = async (req, res) => {
//   try {
//     const kanbanBoard = await KanbanBoard.findById(req.params.boardId);

//     if (!kanbanBoard) {
//       return res.status(404).json({ message: "Board not found" });
//     }

//     const cardIdToFind = req.params.cardId;
//     const cardToUpdate = kanbanBoard.cards.id(cardIdToFind);

//     if (!cardToUpdate) {
//       return res.status(404).json({ message: "Card not found" });
//     }

//     // Update the cardName using Mongoose methods
//     cardToUpdate.set({ cardName: req.body.cardName });

//     // Save the parent document
//     await kanbanBoard.save();

//       return res.json(cardToUpdate);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// const updateCardName = async (req, res) => {
//   try {
//     const { boardId, cardId } = req.params;
//     console.log(boardId);
//     console.log(cardId);

//     const updatedFields = req.body;
//     // Find the board by ID
//     const board = await KanbanBoard.findById(boardId);
//     // Find the card in the board's cards array by ID
//     const cardToUpdate = board.cards.find(
//       (card) => card._id.toString() === cardId
//     );
//     const modifiedSubDocumentKey = req.params.subDocumentKey;
//     // Update the card with the provided fields
//     Object.assign(cardToUpdate, updatedFields);

//     // Save the updated board and wait for the operation to complete
//     await board.save();
//   // Obtain the ID of the newly added sub-document in the array
//   let newSubDocumentId = null;
//    // Check if the sub-document key exists in cardToUpdate
//    // Check if the sub-document key exists in cardToUpdate
//    if (modifiedSubDocumentKey in cardToUpdate) {
//      // Check if it's an array
//      if (
//        Array.isArray(cardToUpdate[modifiedSubDocumentKey]) &&
//        cardToUpdate[modifiedSubDocumentKey].length > 0
//      ) {
//        // Access the _id of the last element in the array
//        newSubDocumentId =
//          cardToUpdate[modifiedSubDocumentKey][
//            cardToUpdate[modifiedSubDocumentKey].length - 1
//          ]._id?.toString();
//      } else {
//        // It's a non-array field
//        // Check if the field has an _id property
//        newSubDocumentId = cardToUpdate[modifiedSubDocumentKey]?._id?.toString();
//      }
//    }
//     res.json({
//       message: "Card updated successfullyfdfdsf",
//       newSubDocumentId,
//     });
//     console.log("card after update",cardToUpdate);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
const updateCardName = async (req, res) => {
  console.log('hellllllll')
  try {
    const { id, boardId, cardId } = req.params;
    const { fieldName, newValue } = req.body;
    // Find the board by ID
    const board = await KanbanBoard.findById(boardId);
    const boardName = board.name;
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    // Find the card in the board's cards array by ID
    const cardToUpdate = board.cards.find(  //lagbe
      (card) => card._id.toString() === cardId
    );
    const cardName = cardToUpdate.cardName;

    if (!cardToUpdate) {
      return res.status(404).json({ error: "Card not found" });
    }

    // Check if the field exists in the card
    if (fieldName in cardToUpdate) {
      // If the field is an array, push the new value
      if (Array.isArray(cardToUpdate[fieldName])) {
        cardToUpdate[fieldName].push(newValue);
        // Get the _id of the last added sub-document
        const newSubDocumentId =
          cardToUpdate[fieldName][cardToUpdate[fieldName].length - 1]._id;

        // Respond with the updated card data and new sub-document ID
        if (fieldName === 'members') {
          const Memberdetails = await Member.findOne({ _id: newValue.member_id });
          console.log(Memberdetails);
          sendJoingcardEmail(Memberdetails.email, Memberdetails.name, id, boardName, cardName, newValue.role)
        }
        res.json({
          message: `${fieldName} added to the card successfully`,
          updatedCard: cardToUpdate,
          newSubDocumentId,
        });
      } else {
        // If it's a single value, update it
        cardToUpdate[fieldName] = newValue;
        // Respond with the updated card data
        res.json({
          message: `${fieldName} updated in the card successfully`,
          updatedCard: cardToUpdate,
        });
      }
    } else {
      // Handle the case where the specified field doesn't exist
      return res.status(400).json({ error: "Invalid field name" });
    }

    // Save the updated board and wait for the operation to complete
    await board.save();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateCardField = async (req, res) => {
  try {
    const { boardId, cardId, subDocumentKey, subDocumentId } = req.params;
    // assuming you only send subDocumentKey and subDocumentId
    const updatedFields = req.body;
    console.log(updatedFields);
    // Find the board by ID
    const board = await KanbanBoard.findById(boardId);
    // Find the card in the board's cards array by ID
    const cardToUpdate = board.cards.find(
      (card) => card._id.toString() === cardId
    );
    // Find the task within the taskArray/ or any array in the card
    const taskToUpdate = cardToUpdate[subDocumentKey].find(
      (task) => task._id.toString() === subDocumentId
    );

    // Update the task fields with the provided values
    Object.assign(taskToUpdate, updatedFields);

    // Save the updated board and wait for the operation to complete
    await board.save();

    // Respond with the updated card
    res.json({
      message: "Card field updated successfully",
      updatedCard: cardToUpdate,
    });

    console.log("Card after update", cardToUpdate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const deleteCardFieldbyMember = async (req, res) => {
  try {
    const { id, boardId, cardId, subDocumentKey, subDocumentId } = req.params;

    // Find the board by ID
    const board = await KanbanBoard.findById(boardId);
    console.log(board.name);
    const boardName = board.name;
    // Find the card in the board's cards array by ID
    const cardToUpdate = board.cards.find(
      (card) => card._id.toString() === cardId
    );
    console.log(cardToUpdate.cardName);
    const cardName = cardToUpdate.cardName;
    // Find the index of the task, label, or member to delete within the array
    const indexToDelete = cardToUpdate[subDocumentKey].findIndex(
      (item) => item.member_id.toString() === subDocumentId
    );

    // Check if the item was found
    if (indexToDelete !== -1) {
      const Memberdetails = await Member.findOne({ _id: subDocumentId });
      console.log(Memberdetails);
      // Remove the task, label, or member from the array
      cardToUpdate[subDocumentKey].splice(indexToDelete, 1);
      sendRemovingcardEmail(Memberdetails.email, Memberdetails.name, id, boardName, cardName);
      // Save the updated board and wait for the operation to complete
      await board.save();

      // Respond with a success message or the updated card
      res.json({
        message: "Card field deleted successfully",
        updatedCard: cardToUpdate,
      });

      console.log("Card after delete", cardToUpdate);
    } else {
      // If the item was not found, respond with an error
      res.status(404).json({ error: "Item not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
// Delete a task, label, or member from the taskArray, labelArray, or memberArray in a card
const deleteCardField = async (req, res) => {//lagbe
  try {
    const { boardId, cardId, subDocumentKey, subDocumentId } = req.params;

    // Find the board by ID
    const board = await KanbanBoard.findById(boardId);

    // Find the card in the board's cards array by ID
    const cardToUpdate = board.cards.find(
      (card) => card._id.toString() === cardId
    );
    let indexToDelete;
    //for the array type element
    if (subDocumentKey === 'dependencies' || subDocumentId === 'workflow') {
      indexToDelete = cardToUpdate[subDocumentKey].indexOf(subDocumentId);
      console.log('dkfa', indexToDelete);
    }
    //for the object of array type element
    else {
      // Find the index of the task, label, or member to delete within the array
      indexToDelete = cardToUpdate[subDocumentKey].findIndex(
        (item) => item._id.toString() === subDocumentId
      );
    }

    // Check if the item was found
    if (indexToDelete !== -1) {
      // Remove the task, label, or member from the array
      cardToUpdate[subDocumentKey].splice(indexToDelete, 1);

      // Save the updated board and wait for the operation to complete
      await board.save();

      // Respond with a success message or the updated card
      res.json({
        message: "Card field deleted successfully",
        updatedCard: cardToUpdate,
      });

      console.log("Card after delete", cardToUpdate);
    } else {
      // If the item was not found, respond with an error
      res.status(404).json({ error: "Item not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCardDetails = async (req, res) => {
  try {
    // Your logic for retrieving and showing the card details
    // ...

    res.json({ message: "Card details retrieved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteCard = async (req, res) => {
  try {
    const kanbanBoard = await KanbanBoard.findById(req.params.boardId);

    if (!kanbanBoard) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Find the index of the card to delete
    const cardIndex = kanbanBoard.cards.findIndex((card) =>
      card._id.equals(req.params.cardId)
    );

    // Check if the card exists
    if (cardIndex === -1) {
      return res.status(404).json({ message: "Card not found" });
    }

    // Remove the card from the array and save the board
    kanbanBoard.cards.splice(cardIndex, 1);
    await kanbanBoard.save();

    return res.status(200).json({ message: "Card deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const showCard = async (req, res) => {
  try {
    const kanbanBoard = await KanbanBoard.findById(req.params.boardId);
    console.log("kd");
    if (!kanbanBoard) {
      return res.status(404).json({ message: "Board not found" });
    }
    console.log("dkd");
    const cardToShow = kanbanBoard.cards.id(req.params.cardId);

    if (!cardToShow) {
      return res.status(404).json({ message: "Card not found" });
    }
    console.log(cardToShow);
    return res
      .status(200)
      .json({ message: "Card retrieved successfully", card: cardToShow });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// boardController.js

// ... (previous code)

const addTask = async (req, res) => {
  try {
    const kanbanBoard = await KanbanBoard.findById(req.params.boardId);

    if (!kanbanBoard) {
      return res.status(404).json({ message: "Board not found" });
    }

    const cardIdToFind = req.params.cardId;
    const cardToAddTask = kanbanBoard.cards.id(cardIdToFind);

    if (!cardToAddTask) {
      return res.status(404).json({ message: "Card not found" });
    }

    const newTask = {
      taskName: req.body.taskName,
      // Add other task properties as needed
    };

    cardToAddTask.tasks.push(newTask);
    await kanbanBoard.save();

    return res
      .status(201)
      .json({ message: "Task added successfully", task: newTask });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateTask = async (req, res) => {
  try {
    const kanbanBoard = await KanbanBoard.findById(req.params.boardId);

    if (!kanbanBoard) {
      return res.status(404).json({ message: "Board not found" });
    }

    const cardIdToFind = req.params.cardId;
    const cardToUpdateTask = kanbanBoard.cards.id(cardIdToFind);

    if (!cardToUpdateTask) {
      return res.status(404).json({ message: "Card not found" });
    }

    const taskIdToFind = req.params.taskId;
    console.log(taskIdToFind);
    const taskToUpdate = cardToUpdateTask.tasks.id(taskIdToFind);

    if (!taskToUpdate) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update task properties using Mongoose methods
    taskToUpdate.set({ taskName: req.body.taskName });
    // Add other task property updates as needed

    // Save the parent document
    await kanbanBoard.save();

    return res.json({
      message: "Task updated successfully",
      task: taskToUpdate,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const kanbanBoard = await KanbanBoard.findById(req.params.boardId);

    if (!kanbanBoard) {
      return res.status(404).json({ message: "Board not found" });
    }

    const cardIdToFind = req.params.cardId;
    const cardToDeleteTask = kanbanBoard.cards.id(cardIdToFind);

    if (!cardToDeleteTask) {
      return res.status(404).json({ message: "Card not found" });
    }

    const taskIdToDelete = req.params.taskId;
    const taskIndex = cardToDeleteTask.tasks.findIndex((task) =>
      task._id.equals(taskIdToDelete)
    );

    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Remove the task from the array and save the board
    cardToDeleteTask.tasks.splice(taskIndex, 1);
    await kanbanBoard.save();

    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const showTask = async (req, res) => {
  try {
    const kanbanBoard = await KanbanBoard.findById(req.params.boardId);

    if (!kanbanBoard) {
      return res.status(404).json({ message: "Board not found" });
    }

    const cardIdToFind = req.params.cardId;
    const cardToShowTask = kanbanBoard.cards.id(cardIdToFind);

    if (!cardToShowTask) {
      return res.status(404).json({ message: "Card not found" });
    }

    const taskIdToShow = req.params.taskId;
    const taskToShow = cardToShowTask.tasks.id(taskIdToShow);

    if (!taskToShow) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res
      .status(200)
      .json({ message: "Task retrieved successfully", task: taskToShow });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const reorderCardsInSameBoard = async (req, res) => {

  try {
    const { boardId } = req.params;
    const { sourceIndex, destinationIndex } = req.body;

    // Find the board by ID
    const board = await KanbanBoard.findById(boardId);
    console.log(board);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    // Ensure source and destination indices are valid
    if (
      sourceIndex < 0 ||
      sourceIndex >= board.cards.length ||
      destinationIndex < 0 ||
      destinationIndex >= board.cards.length
    ) {
      return res
        .status(400)
        .json({ error: "Invalid source or destination index" });
    }
    console.log(board.cards[sourceIndex]);
    console.log(board.cards[destinationIndex]);
    // Remove the card from the source index
    const [movedCard] = board.cards.splice(sourceIndex, 1);
    console.log(movedCard);
    // Insert the card at the destination index
    board.cards.splice(destinationIndex, 0, movedCard);

    // // Update positions of all cards to reflect the new order
    // board.cards.forEach((card, index) => {
    //   card.position = index ; // assuming position starts from 1
    // });

    // Save the updated board and wait for the operation to complete
    await board.save();

    res.json({
      message: "Card reordered successfully",
      updatedBoard: board,
    });

    console.log("Board after reordering cards", board);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const reorderCardsInDiffBoard = async (req, res) => {
  const { id, board1Id, board2Id } = req.params;
  const { sourceIndex, destinationIndex } = req.body;
  console.log(board1Id, board2Id);
  try {

    const board1 = await KanbanBoard.findById(board1Id);
    const board2 = await KanbanBoard.findById(board2Id);
    if (!board1 || !board2) {
      return res.status(404).json({ error: "Boards not found" });
    }
    const projectDocument = await KanbanProject.findById(id);
    console.log(projectDocument);
    if (projectDocument) {
      // Find the last board reference in the 'boards' array
      const lastBoardReference = projectDocument.boards.slice(-1)[0];
      console.log(lastBoardReference);

      if (lastBoardReference.toString() === board2Id) {
        board1.cards[sourceIndex].finishedTime = new Date();
      }
    }
    console.log(sourceIndex, destinationIndex);
    console.log(board1.cards[sourceIndex].board[0].new_start);
    console.log(board1.cards[sourceIndex]);
    // console.log(board2.cards[destinationIndex]);
    const boardIndex = board1.cards[sourceIndex].board.findIndex(boardElement => boardElement.id.equals(board1Id));
    console.log("kd", boardIndex);
    if (boardIndex !== -1) {
      const current = new Date();
      console.log(current);
      // Calculate the day difference between the current date and new_start
      const newStartDate = new Date(board1.cards[sourceIndex].board[boardIndex].new_start);
      const dayDifference = Math.floor((current.setHours(0, 0, 0, 0) - newStartDate.setHours(0, 0, 0, 0)) / (24 * 60 * 60 * 1000));
      console.log(dayDifference);
      // Update total and new_start properties
      board1.cards[sourceIndex].board[boardIndex].total += dayDifference;
      console.log(board1.cards[sourceIndex].board[boardIndex].total)
    }
    const boardIndex2 = board1.cards[sourceIndex].board.findIndex(boardElement => boardElement.id.equals(board2Id));
    if (boardIndex2 !== -1) {
      board1.cards[sourceIndex].board[boardIndex2].new_start = new Date();
      console.log(board1.cards[sourceIndex].board[boardIndex2].new_start);
    }
    else {
      const newBoardElement = {
        new_start: new Date(),
        total: 0,
        id: board2Id, // Assuming board2Id is already defined
      };
      board1.cards[sourceIndex].board.push(newBoardElement);
    }
    console.log(board1.cards.length);
    console.log(sourceIndex >= board1.cards.length);
    console.log(destinationIndex >= board2.cards.length);


    const [movedCard] = board1.cards.splice(sourceIndex, 1);
    board2.cards.splice(destinationIndex, 0, movedCard);
    console.log(movedCard);
    // Save the changes to the boards
    await board1.save();
    await board2.save();

    // Respond with success
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




module.exports = {
  addCard,
  updateCardName,
  updateCardField,
  deleteCardField,
  deleteCard,
  reorderCardsInSameBoard,
  reorderCardsInDiffBoard,
  showCard,
  addTask,
  updateTask,
  deleteTask,
  showTask,
  deleteCardFieldbyMember
};
