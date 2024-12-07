import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cookieSession: { type: String, default: "" },
  likedMovies: { type: [Number], default: [] }, // References `id` from Movies
  watchLater: { type: [Number], default: [] }, // References `id` from Movies
});

const User = mongoose.model("User", userSchema);

export default User;
