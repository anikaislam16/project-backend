const express = require("express");
const {ScrumBoard}=require('../../modules/ScrumBoards')
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  deleteMemberfromProject,
  addMemberInProject,
  dependentcard,
  getProjectByMember,
} = require("./ScrumController/ScrumProjectController");
const {
  logRequestInfo,

  addBoard,
  showBoardById,
  updateBoard,
  deleteBoard,
  moveCardsToNewBoard
} = require("./ScrumController/ScrumBoardController.js");
const {
  addCard,
  updateCardName,
  updateCardField,
  deleteCardField,
  deleteCard,
  showCard,
  reorderCardsInSameBoard,
  reorderCardsInDiffBoard,
  deleteCardFieldbyMember,
  reorderCards,
  updateDocuments,
} = require("./ScrumController/ScrumBoardCardController");
  

const {
  getDailyScrumsByParam,
  createDailyScrum,
  updateDailyScrum,
} = require("./ScrumController/ScrumReviewController");
router.use(logRequestInfo);
router.post("/add-tdd", async (req, res) => {
  try {
    // Update documents to add the new attribute
    await ScrumBoard.updateMany({}, { $set: { "cards.$[].Tdd": false } });
    res
      .status(200)
      .json({ message: "Tdd attribute added successfully to all documents." });
  } catch (error) {
    console.error("Error adding Tdd attribute:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding Tdd attribute." });
  }
});
router.route("/").get(getAllProjects).post(createProject).put(getProjectByMember);
// project id diye project er schema change kora hbe.

router.post("/DailyScrum", async (req, res) => {
  const { name, type, scrumDate, content, projectId } = req.body;
  console.log(name, type, scrumDate, content, projectId);
  try {
    // Create a new DailyScrum
    const newScrum = await createDailyScrum({
      name,
      type,
      scrumDate,
      content,
      projectId,
    });

    // Send the created DailyScrum as response
    res.status(201).json(newScrum);
  } catch (error) {
    console.error("Error creating daily scrum:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating daily scrum" });
  }
});
// Route to get daily scrums by projectId
router.get("/DailyScrum", async (req, res) => {

  const { paramType, paramValue } = req.query;

  try {
    if (!paramType || !paramValue) {
      return res.status(400).json({ error: "Missing paramType or paramValue" });
    }

    // Call the function to fetch daily scrums based on paramType and paramValue
    const scrums = await getDailyScrumsByParam(paramType, paramValue);
    res.json(scrums);
  } catch (error) {
    console.error(`Error fetching daily scrums by ${paramType}:`, error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching daily scrums" });
  }
});
// Route to update the content of a DailyScrum document by ID
router.put("/DailyScrum/:id", async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    // Update the content of the DailyScrum document by ID
    const updatedScrum = await updateDailyScrum(id, content);

    // Send the updated DailyScrum as response
    res.json(updatedScrum);
  } catch (error) {
    console.error("Error updating daily scrum:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating daily scrum" });
  }
});
router
  .route("/:id")
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject) //eta te oi project er board delete hbe na.
  .post(addBoard);
//project id r board id diye, board er info niye kaaj hbe.
router
  .route("/:id/:boardId")
  .put(updateBoard)
  .get(showBoardById)
  .delete(deleteBoard)
  .post(addCard);
//porject id, board id, card id diye card niye kaaj hbe.
router.route("/:id/:boardId/:cardId").get(showCard).delete(deleteCard);
router.route("/:id/:boardId/:cardId").put(updateCardName);
//card move er khetre eita kaj krbe. drag n drop er jonno.
router
  .route(
    "/:id/cards/reorderCards/:board1Id/:board2Id/:sourceIndex/:destinationIndex"
  )
  .put(reorderCardsInDiffBoard);
router
  .route("/:id/:boardId/cards/reorderCards/:sourceIndex/:destinationIndex")
  .put(reorderCardsInSameBoard);
//board e card er emn element jader specific id ace. tader info change er jonno or delete er jonno. eta korte , oi element name r oi element er id lagbe.
router
  .route("/:id/:boardId/:cardId/:subDocumentKey/:subDocumentId")
  .put(updateCardField)
  .post(deleteCardFieldbyMember)
  .delete(deleteCardField);
router.route("/boards/reorder/IHateThis/:boardId").put(moveCardsToNewBoard);
router.route("/member/member/:id/:memberId").delete(deleteMemberfromProject).post(addMemberInProject);
router
  .route(
    "/reorder/reorder/reorder/reorder/reorder/reorder/reorder/reorder/reorder/reorder"
  )
  .put(reorderCards);
router.route("/:id/:boardId/:cardId/dependency/card/check").get(dependentcard);
module.exports = router;