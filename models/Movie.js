import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  imageURL: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  liked: { type: Boolean, default: false },
});

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;
