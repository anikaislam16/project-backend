const express = require("express");
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  deleteMemberfromProject,
  addMemberInProject,
  getProjectByMember,
  updateDeveloperControl
} = require("./kanbanBoardController/KanbanProjectController");
// Correct import
const {
  logRequestInfo,
  addBoard,
  //  showBoards,
  showBoardById,
  updateBoard,
  deleteBoard,
} = require("./kanbanBoardController/BoardController");
const {
  addCard,
  updateCardName,
  updateCardField,
  deleteCardField,
  deleteCard,
  reorderCardsInSameBoard,
  reorderCardsInDiffBoard,
  showCard,
  deleteCardFieldbyMember,
} = require("./kanbanBoardController/BoardCardController");
router.use(logRequestInfo);
///For projects
router.route("/").get(getAllProjects).post(createProject).put(getProjectByMember);  //shb project nam show. //project create  // 1ta particular member er shb project find kora hoi.
router
  .route("/:id")
  .get(getProjectById) //etai project er id diye oi project er shb info pawa jabe. emn ki oi project er under e shb board er info o pawa jabe.
  .put(updateProject) // project nam change 
  .delete(deleteProject); // delete krbe project. change dorkar.
///For Boards
router.route("/:id").post(addBoard); //board add krbe. initially project id diye project khujbe. tarpore board create korbe. r oi board id project er board attribute e update kore dibe.
router
  .route("/:id/:boardId")  //id holo project er r.
  .get(showBoardById) //board er 1ta id diye board shb result show krbe.
  .put(updateBoard) //board er id diye board er nam update krbe.
  .delete(deleteBoard); //board id diye board delete kbe.

///For Cards
router.route("/:id/:boardId").get(showCard)
  .post(addCard); //board id diye board e card push krbe.
router
  .route("/:id/:boardId/:cardId")
  .get(showCard) //Card info pawa
  .delete(deleteCard);  //board id diye board select then card delete.
router.route("/:id/:boardId/:cardId").put(updateCardName); //etai card er element k update kora hoi. jdi seta array type hoi, tobe push kora hoi, element.
router
  .route("/:id/cards/reorderCards/:board1Id/:board2Id/:sourceIndex/:destinationIndex")
  .put(reorderCardsInDiffBoard);
router
  .route("/:id/:boardId/cards/reorderCards/:sourceIndex/:destinationIndex")
  .put(reorderCardsInSameBoard);
router.route("/:id/:boardId/:cardId/:subDocumentKey/:subDocumentId").put(updateCardField) //card er moddhe array type element gula update k update kora jai. board id r card id r card er subdocument er id diye.
  .post(deleteCardFieldbyMember)
  .delete(deleteCardField); //card er moddhe array type element er kono member delete kora jai.
router.route("/member/member/:id/:memberId").delete(deleteMemberfromProject).post(addMemberInProject).put(updateDeveloperControl);
router.route("/")

module.exports = router;
