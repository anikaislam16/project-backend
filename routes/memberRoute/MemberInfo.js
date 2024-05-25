const express = require("express");
const router = express.Router();
const { Member } = require("../../modules/MemberModule");

// Function to handle errors
const handleErrors = (res, error) => {
  console.error(error);
  res.status(500).json({ message: "Internal Server Error" });
};

// Get all members
const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (error) {
    handleErrors(res, error);
  }
};

// Get a specific member
const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (member) {
      res.json(member);
    } else {
      res.status(404).json({ message: "Member not found" });
    }
  } catch (error) {
    handleErrors(res, error);
  }
};

// Create a new member
const createMember = async (req, res) => {
  const member = new Member({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  try {
    const newMember = await member.save();
    res.status(201).json(newMember);
  } catch (error) {
    handleErrors(res, error);
  }
};

// Update a member (using PATCH for partial updates)
const updateMember = async (req, res) => {
  try {
    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      },
      { new: true }
    );
    res.json(updatedMember);
  } catch (error) {
    console.error("Error updating member:", error);
    handleErrors(res, error);
  }
};


// Delete a member
const deleteMember = async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: "Member deleted" });
  } catch (error) {
    handleErrors(res, error);
  }
};

// Routes
router.route("/").get(getAllMembers).post(createMember);
router
  .route("/:id")
  .get(getMemberById)
  .put(updateMember)
  .delete(deleteMember);

module.exports = router;
