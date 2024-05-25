const express = require("express");
const router = express.Router();
const { KanbanProject } = require("../../../modules/KanbanModule");

const { KanbanBoard } = require("../../../modules/BoardModule");
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

// Show all boards for a specific Kanban project
const showBoards = async (req, res) => {
  try {
    const project = await KanbanProject.findById(req.params.projectId).populate(
      "boards"
    );
    if (!project) {
      return res.status(404).json({ message: "Kanban project not found" });
    }
    res.json(project.boards);
  } catch (error) {
    handleErrors(res, error);
  }
};

// Show a specific board by its ID within a Kanban project
const showBoardById = async (req, res) => {
  try {
    const project = await KanbanProject.findById(req.params.id).populate({
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

// Add a new board to a Kanban project
const addBoard = async (req, res) => {
  console.log(req.params.id);
  try {
    const project = await KanbanProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Kanban project not found" });
    }

    const newBoard = new KanbanBoard({
      name: req.body.name,
    });

    const savedBoard = await newBoard.save();
    project.boards.push(savedBoard._id);
    await project.save();

    res.status(201).json(savedBoard);
  } catch (error) {
    handleErrors(res, error);
  }
};

// Update a board within a Kanban project
const updateBoard = async (req, res) => {
  try {
    const updatedBoard = await KanbanBoard.findByIdAndUpdate(
      req.params.boardId,
      {
        name: req.body.name,
        // Add more fields as needed
      },
      { new: true }
    );
    res.json(updatedBoard);
  } catch (error) {
    console.error("Error updating board:", error);
    handleErrors(res, error);
  }
};

// Delete a board within a Kanban project
const deleteBoard = async (req, res) => {
  try {
    const project = await KanbanProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Kanban project not found" });
    }

    // Remove the board's ID from the project's boards array
    project.boards = project.boards.filter(
      (boardId) => boardId.toString() !== req.params.boardId
    );

    // Save the updated project
    await project.save();

    // Delete the board
    await KanbanBoard.findByIdAndDelete(req.params.boardId);

    res.json({ message: "Board deleted" });
  } catch (error) {
    handleErrors(res, error);
  }
};


module.exports = {
  logRequestInfo,
  
  addBoard,
  showBoards,
  showBoardById,
  updateBoard,
  deleteBoard,
};
