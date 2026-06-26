import mongoose from "mongoose";

const criterionSchema = new mongoose.Schema(
  { score: { type: Number, min: 0, max: 100, required: true }, comment: { type: String, default: "" } },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    readinessScore: { type: Number, min: 0, max: 100, required: true },
    verdict: { type: String, required: true },
    summary: { type: String, default: "" },
    criteria: {
      problemClarity: criterionSchema,
      methodology: criterionSchema,
      obeAlignment: criterionSchema,
      academicWriting: criterionSchema,
    },
    sections: [
      {
        _id: false,
        section: String,
        weakness: String,
        actionItems: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
