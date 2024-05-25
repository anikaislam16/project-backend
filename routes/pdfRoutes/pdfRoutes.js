const express = require("express");
const router = express.Router();
const multer = require("multer");
const PDF = require("../../modules/PdfModules");
const { KanbanBoard } = require("../../modules/BoardModule");
const { ScrumBoard } = require("../../modules/ScrumBoards");
const fs = require("fs");
const path = require("path");
const UPLOADS_DIR = path.join(__dirname, "../../uploads/");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the directory where PDFs will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Customize the file naming as needed
  },
});
const upload = multer({ storage });
const uploadPDF = async (req, res) => {
  const { title, description } = req.body;
  console.log(description);
  const { filename } = req.file;
  const f = req.file.originalname.split(".");
  console.log(f[f.length - 1]);

  try {
    // Assuming you have a route parameter for the board ID and card ID
    const { id, cardId } = req.params;
    let board = null;
    // Find the board by ID
    if (description === "kanban") {
      board = await KanbanBoard.findById(id);
    }
    if (description === "scrum") {
      board = await ScrumBoard.findById(id);
    }

    if (!board) {
      return res.status(404).json({ message: "Board not found." });
    }

    // Find the card within the board by its ID
    const card = board.cards.id(cardId);

    if (!card) {
      return res.status(404).json({ message: "Card not found." });
    }

    // Create a new PDF document
    const newPDF = new PDF({
      title,
      description,
      fileUrl: `/uploads/${filename}`,
      fieldType: f[f.length - 1].toString(),
    });

    // Save the PDF document
    await newPDF.save();

    // Add the ID of the new PDF to the card's pdf array
    card.pdf.push(newPDF._id);

    // Save the board to update the card with the new PDF ID
    await board.save();

    res
      .status(201)
      .json({ message: "PDF uploaded successfully.", pdf: newPDF });
  } catch (error) {
    console.error("PDF upload error:", error);
    res.status(500).json({ message: "PDF upload failed." });
  }
};
async function downloadPDF(req, res) {
  const pdfId = req.params.id;

  try {
    const pdf = await PDF.findById(pdfId);

    if (!pdf) {
      return res.status(404).json({ message: "PDF not found." });
    }

    const filePath = path.join(UPLOADS_DIR, path.basename(pdf.fileUrl));
    console.log(filePath);
    // Serve the file as an attachment
    res.download(filePath, `${pdf.title}.${pdf.fieldType}`, (err) => {
      if (err) {
        console.error("PDF download error:", err);
        res.status(500).json({ message: "PDF download failed." });
      }
    });
  } catch (error) {
    console.error("PDF download error:", error);
    res.status(500).json({ message: "PDF download failed." });
  }
}
router.get("/:boardId/:cardId/:types/all-pdfs", async (req, res) => {
  console.log("d");
  try {
    const { boardId, cardId,types } = req.params;
    let board = null;
    // Use populate to retrieve the entire KanbanBoard document with populated pdf array
    if (types === "kanban")
    {
       board = await KanbanBoard.findById(boardId).populate({
         path: "cards.pdf",
         model: "PDF",
       });
      }
    else if (types === "scrum")
    {board = await ScrumBoard.findById(boardId).populate({
      path: "cards.pdf",
      model: "PDF",
    });
       
      }
    if (!board) {
      return res.status(404).json({ message: "Board not found." });
    }

    // Find the card within the board
    const card = board.cards.find((c) => c._id.toString() === cardId);

    if (!card) {
      return res
        .status(404)
        .json({ message: "Card not found in the specified board." });
    }

    res.status(200).json({ pdfs: card.pdf });
  } catch (error) {
    console.error("Error retrieving PDFs:", error);
    res.status(500).json({ message: "Error retrieving PDFs." });
  }
});
const deleteFile = async (req, res) => {
  const fileId = req.params.id;
  const { boardId, cardId,description } = req.body;

  try {
    // Find the PDF document
    const pdf = await PDF.findById(fileId);

    if (!pdf) {
      return res.status(404).json({ message: "PDF not found." });
    }

    // Remove the file from the server
    const filePath = path.join(UPLOADS_DIR, path.basename(pdf.fileUrl));
    await fs.promises.unlink(filePath);

   let board = null;
   // Find the board by ID
   if (description === "kanban") {
     board = await KanbanBoard.findById(boardId);
   }
  else  if (description === "scrum") {
     board = await ScrumBoard.findById(boardId);
   }

    if (!board) {
      return res.status(404).json({ message: "Board not found for the PDF." });
    }

    const card = board.cards.find((c) => c._id.toString() === cardId);

    if (!card) {
      return res
        .status(404)
        .json({ message: "Card not found in the specified board." });
    }

    // Remove the file ID from the card
    card.pdf = card.pdf.filter((pdfId) => pdfId.toString() !== fileId);

    // Save the updated board
    await board.save();

    // Delete the record from the PDFModule
    await PDF.deleteOne({ _id: fileId });

    console.log("File and record deleted successfully");
    res.status(200).json({ message: "File and record deleted successfully." });
  } catch (error) {
    console.error("Error deleting file and record:", error);
    res.status(500).json({ message: "Delete operation failed." });
  }
};
router.delete("/:id", deleteFile);
router.post("/:id/:cardId/upload-pdf", upload.single("file"), uploadPDF);
router.get("/download-pdf/:id", downloadPDF);
router.get("/getpdf/:id", async (req, res) => {
  const pdfId = req.params.id;

  try {
    // Find the PDF in the database by ID
    const pdf = await PDF.findById(pdfId);

    // Check if the PDF with the given ID exists
    if (!pdf) {
      return res.status(404).json({ message: "PDF not found." });
    }

    // Send the PDF information in the response
    res.status(200).json({ pdf });
  } catch (error) {
    console.error("Error retrieving PDF:", error);
    res.status(500).json({ message: "Error retrieving PDF." });
  }
});
module.exports = router;
