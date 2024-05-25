const express = require("express");
const router = express.Router();
const { sendJoingcardEmail, sendRemovingcardEmail } = require("./SendMail");
const { ScrumBoard } = require("../../../modules/ScrumBoards");
const { Member } = require("../../../modules/MemberModule");
const handleErrors = (res, error) => {
  console.error(error);
  res.status(500).json({ message: "Internal Server Error" });
};

const addCard = async (req, res) => {
  try {
    console.log(req.params.boardId);
    const scrumBoard = await ScrumBoard.findById(req.params.boardId);

    if (!scrumBoard) {
      return res.status(404).json({ message: "Board not found" });
    }
    const email = req.body.email;
    const existingMember = await Member.findOne({ email });
    console.log(existingMember);
    const newCard = {
      cardName: req.body.cardName,
      tags: [], // Assuming labels is an array
      task: [], // Assuming tasks is an array
      startDate: new Date(),
      dueDate: null,
      priority: "low",
      storyPoints: 0,
      creationDate: null,
      storyPoints: 0,
      continue: false,
      members: [
        {
          member_id: existingMember._id,
          role: "Product owner",
        },
      ], // Assuming members is an array,
      // Assuming members is an array
    };

    scrumBoard.cards.push(newCard);
    await scrumBoard.save();
    const newCards = scrumBoard.cards[scrumBoard.cards.length - 1];
    console.log(newCards);
    // Return the added card in the response, including the ID
    return res.json({
      card: {
        ...newCard,
        _id: scrumBoard.cards[scrumBoard.cards.length - 1]._id,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const updateCardName = async (req, res) => {
  console.log("hl");
  try {
    const { id, boardId, cardId } = req.params;
    const { fieldName, newValue } = req.body;

    // Find the board by ID
    const board = await ScrumBoard.findById(boardId);
    const boardName = board.name;
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    // Find the card in the board's cards array by ID
    const cardToUpdate = board.cards.find(
      (card) => card._id.toString() === cardId
    );

    if (!cardToUpdate) {
      return res.status(404).json({ error: "Card not found" });
    }
    const cardName = cardToUpdate.cardName;
    // Check if the field exists in the card
    if (fieldName in cardToUpdate) {
      // If the field is an array, push the new value
      if (Array.isArray(cardToUpdate[fieldName])) {
        cardToUpdate[fieldName].push(newValue);
        // Get the _id of the last added sub-document
        const newSubDocumentId =
          cardToUpdate[fieldName][cardToUpdate[fieldName].length - 1]._id;
        // Respond with the updated card data and new sub-document ID
        if (fieldName === "members") {
          const Memberdetails = await Member.findOne({
            _id: newValue.member_id,
          });
          console.log(Memberdetails);
          sendJoingcardEmail(
            Memberdetails.email,
            Memberdetails.name,
            id,
            boardName,
            cardName,
            newValue.role
          );
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
    const board = await ScrumBoard.findById(boardId);

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
    const board = await ScrumBoard.findById(boardId);
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
      sendRemovingcardEmail(
        Memberdetails.email,
        Memberdetails.name,
        id,
        boardName,
        cardName
      );
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
const deleteCardField = async (req, res) => {
  try {
    const { boardId, cardId, subDocumentKey, subDocumentId } = req.params;
    console.log(boardId, cardId, subDocumentKey, subDocumentId);
    // Find the board by ID
    const board = await ScrumBoard.findById(boardId);

    // Find the card in the board's cards array by ID
    const cardToUpdate = board.cards.find(
      (card) => card._id.toString() === cardId
    );

    // Find the index of the task, label, or member to delete within the array
    let indexToDelete;
    //for the array type element
    if (subDocumentKey === 'dependencies' || subDocumentKey === 'workflow') {
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
const deleteCard = async (req, res) => {
  try {
    const kanbanBoard = await ScrumBoard.findById(req.params.boardId);

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
    const kanbanBoard = await ScrumBoard.findById(req.params.boardId);

    if (!kanbanBoard) {
      return res.status(404).json({ message: "Board not found" });
    }

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
const reorderCardsInSameBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { sourceIndex, destinationIndex } = req.body;

    // Find the board by ID
    const board = await ScrumBoard.findById(boardId);
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
  const { board1Id, board2Id } = req.params;
  const { sourceIndex, destinationIndex } = req.body;
  console.log(board1Id, board2Id);
  try {
    const board1 = await ScrumBoard.findById(board1Id);
    const board2 = await ScrumBoard.findById(board2Id);
    console.log(board1.boardType === "backlog", board2.completed === false, ((board1.cards[sourceIndex].creationDate === null) || (board1.cards[sourceIndex].dueDate === null)));
    if (board1.boardType === "backlog" && board2.completed === false && ((board1.cards[sourceIndex].creationDate === null) || (board1.cards[sourceIndex].dueDate === null))) {
      console.log('d');
      const currentDate = new Date();
      board1.cards[sourceIndex].creationDate = new Date(currentDate);
      board1.cards[sourceIndex].dueDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }
    if (!board1 || !board2) {
      return res.status(404).json({ error: "Boards not found" });
    }
    console.log(board1.cards.length);
    console.log(sourceIndex >= board1.cards.length);
    console.log(destinationIndex >= board2.cards.length);

    const [movedCard] = board1.cards.splice(sourceIndex, 1);
    board2.cards.splice(destinationIndex, 0, movedCard);
    movedCard.startDate = new Date();
    const moveInfo = {
      card_id: movedCard._id,
      status: movedCard.progres,
      priority: movedCard.priority,
    };

    const isCardRemoved = board1.removed.some(
      (removedCard) =>
        removedCard.card_id.toString() === moveInfo.card_id.toString()
    );
  
    const moveInfoCardIdString = moveInfo.card_id.toString();

    if (board2.name !== 'Backlog')
    {
       const filteredRemovedCards = board2.removed.filter((removedCard) => {
         //console.log(removedCard.card_id);
         const removedCardIdString = removedCard.card_id.toString();
         return removedCardIdString !== moveInfoCardIdString;
       });
      board2.removed = filteredRemovedCards;
     }
  

    

    //console.log(filteredRemovedCards);
    //console.log("Sprint Removed Before");
    //console.log(board1.removed);
    if (!isCardRemoved && board2.name === "Backlog") {
      board1.removed.push(moveInfo);
    }
    //console.log(movedCard);
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
const reorderCards = async (req, res) => {
  const { source, dest } = req.body;
  const board1 = await ScrumBoard.findById(source);
  const board2 = await ScrumBoard.findById(dest);

  if (!board1 || !board2) {
    return res.status(404).send("Board Not found");
  }

  console.log(board1.cards.length);
  for (let index = 0; index < board1.cards.length; index++) {
    if (board1.cards[index].progres !== "done") {
      const movedCard = board1.cards[index]; // Access the card object directly

      const moveInfo = {
        card_id: movedCard._id,
        status: movedCard.progres,
        priority: movedCard.priority
      }
      console.log(moveInfo);
      board1.notCompleted.push(moveInfo);
      board2.cards.splice(0, 0, movedCard); // Add the card to the beginning of board2.cards array

      // Remove the moved card from board1
      board1.cards.splice(index, 1);

      index--; // Decrement the index to account for the removed card
    }
  }

  console.log("hello anika again");

  try {
    await board1.save();
    await board2.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error saving boards:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addCard,
  updateCardName,
  updateCardField,
  deleteCardField,
  deleteCard,
  showCard,
  reorderCardsInSameBoard,
  reorderCardsInDiffBoard,
  deleteCardFieldbyMember,
  reorderCards
};
