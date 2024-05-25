const express = require('express');
const router = express.Router();
const { ScrumProject } = require("../../../modules/ScrumModule");

const { ScrumBoard } = require("../../../modules/ScrumBoards");
const logRequestInfo = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log("Request Params:", req.params);
  console.log("Request Query:", req.query);
  console.log("Request Body:", req.body);
  next();
};
// Function to handle errors
const handleErrors = (res, error) => {
  console.error(error);
  res.status(500).json({ message: "Internal Server Error" });
};
const addBoard = async (req, res) => {
  console.log(req.params.id);
  try {
    const project = await ScrumProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Scrum project not found" });
    }

    const newBoard = new ScrumBoard({
      name: req.body.name,
      boardType: req.body.boardType,
    });
    // Add other fields later
    newBoard.cards = []; // Initialize cards array as an empty array
    newBoard.sprintStart = new Date(); // Set sprintStart to null or another default value
    newBoard.sprintEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // Set sprintEnd to null or another default value
    newBoard.goal = ""; // Set goal to an empty string or another default value

    const savedBoard = await newBoard.save();
    project.boards.push(savedBoard._id);
    await project.save();

    res.status(201).json(savedBoard);
  } catch (error) {
    handleErrors(res, error);
  }
};
const showBoardById = async (req, res) => {
  try {
    const project = await ScrumProject.findById(req.params.id).populate({
      path: "boards",
      match: { _id: req.params.boardId },
    });

    if (!project || project.boards.length === 0) {
      return res.status(404).json({ message: "Board not found" });
    }

    res.json(project.boards[0]);
  } catch (error) {
    handleErrors(res, error);
  }
};
const updateBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const board = await ScrumBoard.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    const { fieldName, newValue } = req.body;

    // Validate that fieldName is a valid field in the ScrumBoard schema
    if (!Object.keys(board.schema.paths).includes(fieldName)) {
      return res.status(400).json({ message: "Invalid field name" });
    }

    board[fieldName] = newValue;
    await board.save();

    res.status(200).json({
      message: `${fieldName} updated in the Board successfully`,
      updatedBoard: board,
    });
  } catch (error) {
    console.error("Error updating board:", error);
    // Handle errors appropriately, you may want to define and use your handleErrors function here
    res.status(500).json({ message: "Internal server error" });
  }
};
const deleteBoard = async (req, res) => {
  try {
    const project = await ScrumProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Scrum Project not found" });
    }

    // Remove the board's ID from the project's boards array
    project.boards = project.boards.filter(
      (boardId) => boardId.toString() !== req.params.boardId
    );

    // Save the updated project
    await project.save();

    // Delete the board
    await ScrumBoard.findByIdAndDelete(req.params.boardId);

    res.json({ message: "Board deleted" });
  } catch (error) {
    handleErrors(res, error);
  }
};
const moveCardsToNewBoard = async (req, res) => {
  try {
    const { sourceBoardId } = req.params;

    const sourceBoard = await ScrumBoard.findById(sourceBoardId);

    if (!sourceBoard) {
      return res.status(404).json({ message: "Source board not found" });
    }

    // Filter cards with "continue" field set to true
    const cardsToMove = sourceBoard.cards.filter(
      (card) => card.continue === true
    );

    // Get the index of the last board
    const lastIndex = sourceBoard.boards.length - 1;

    // Check if the index is valid
    if (lastIndex < 0) {
      return res.status(404).json({ message: "No boards found" });
    }

    // Access the last board by index
    const lastBoard = sourceBoard.boards[lastIndex];

    // Move the cards to the last board
    lastBoard.cards.push(...cardsToMove);

    // Remove the moved cards from the source board
    sourceBoard.cards = sourceBoard.cards.filter(
      (card) => card.continue !== true
    );

    // Save both boards
    await Promise.all([sourceBoard.save(), lastBoard.save()]);

    return res.json({ message: "Cards moved successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  logRequestInfo,

  addBoard,
  showBoardById,
  updateBoard,
  deleteBoard,
  moveCardsToNewBoard
};