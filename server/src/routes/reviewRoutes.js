import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { analyzeDocument, getReview, exportReview } from "../controllers/reviewController.js";

const router = Router();

router.post("/analyze", upload.single("file"), analyzeDocument);
router.get("/:id", getReview);
router.get("/:id/export", exportReview);

export default router;
