import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Movie from "../models/Movie.js";
import User from "../models/User.js";

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
// const mongoURI = "mongodb://localhost:27017/movieWeb"; // Replace 'yourDatabaseName' with your database name
const mongoURI =
  "mongodb+srv://mumair299792458u:299792458um@cluster0.pp0lbva.mongodb.net/movieWeb"; // Replace 'yourDatabaseName' with your database name

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB at localhost:27017"))
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit if connection fails
  });

// Movies Endpoints
app.get("/movies", async (req, res) => {
  const movies = await Movie.find();
  res.json(movies);
});

app.get("/movies/search", async (req, res) => {
  const { title } = req.query;
  const movies = await Movie.find({ title: { $regex: title, $options: "i" } }); // Case-insensitive search
  res.json(movies);
});

app.post("/movies/user-lists", async (req, res) => {
  const { movieIds } = req.body;
  const movies = await Movie.find({ id: { $in: movieIds } });
  res.json(movies);
});

// Users Endpoints
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});
// GET route to fetch user data by email
app.get("/users/email/:email", async (req, res) => {
  const { email } = req.params;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (user) {
      res.json(user); // Send user data
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/users/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/users", async (req, res) => {
  const { email } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ message: "Email already exists" });

  const newUser = new User(req.body);
  await newUser.save();
  res.status(201).json(newUser);
});

app.get("/users/me", async (req, res) => {
  const cookies = new Cookies(req, res);
  const sessionID = cookies.get("session"); // Get session ID from cookies

  if (!sessionID) {
    return res.status(401).json({ error: "No session ID found" }); // No session ID found in cookies
  }

  try {
    const user = await User.findOne({ cookieSession: sessionID }); // Find user by session ID

    if (!user) {
      return res.status(404).json({ error: "User not found" }); // No user found with the session ID
    }

    res.json(user); // Send back the user data
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Define the port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// API to toggle movie like
app.post("/users/toggle-like", async (req, res) => {
  const { email, movieId } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const movieIndex = user.likedMovies.indexOf(movieId);

    if (movieIndex === -1) {
      user.likedMovies.push(movieId); // Add movie if not present
    } else {
      user.likedMovies.splice(movieIndex, 1); // Remove movie if present
    }

    await user.save(); // Save the updated user document
    res.json(user); // Return updated user data
  } catch (error) {
    console.error("Error toggling movie like:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// API to toggle movie latter
app.post("/users/toggle-later", async (req, res) => {
  const { email, movieId } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const movieIndex = user.watchLater.indexOf(movieId);

    if (movieIndex === -1) {
      user.watchLater.push(movieId); // Add movie if not present
    } else {
      user.watchLater.splice(movieIndex, 1); // Remove movie if present
    }

    await user.save(); // Save the updated user document
    res.json(user); // Return updated user data
  } catch (error) {
    console.error("Error toggling movie watchLater:", error);
    res.status(500).json({ message: "Server error" });
  }
});
