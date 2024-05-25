const express = require("express");
const router = express.Router();
const { createKanbanRequirement, createScrumRequirement } = require('./testController/RequirementsController');
router.post("/scrum", async (req, res) => {
  try {
    const requirementData = req.body;
    const savedRequirement = await createScrumRequirement(requirementData);

    res.status(201).json(savedRequirement); // Respond with the created requirement
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle errors
  }
});

// Route to create a new Kanban requirement
router.post("/kanban", async (req, res) => {
  try {
    const requirementData = req.body;
    const savedRequirement = await createKanbanRequirement(requirementData);

    res.status(201).json(savedRequirement); // Respond with the created requirement
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle errors
  }
});

module.exports = router;