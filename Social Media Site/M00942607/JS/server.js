const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
const { Readable } = require('stream');

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(cors());

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);
let db;
let gridFSBucket;

// In this section it connects to MongoDB
client
    .connect()
    .then(() => {
        console.log("Connected to MongoDB");
        db = client.db("social_network");
        gridFSBucket = new GridFSBucket(db, { bucketName: "uploads" }); 
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1);
    });

// In this section the setup for image uploads is created. Images not working, so i have commented out the code.
//const storage = multer.memoryStorage();
//const upload = multer({ storage });

// In this section the ability to upload images is created
//app.post("/upload", upload.single("image"), async (req, res) => {
  //if (!req.file) {
      //return res.status(400).json({ error: "No file uploaded" });
 // }

  //const { username, postId } = req.body; 
  //const fileStream = Readable.from(req.file.buffer);

  //try {
      //const uploadStream = gridFSBucket.openUploadStream(req.file.originalname, {
          //metadata: { username },
      //});
      //fileStream.pipe(uploadStream);

      //uploadStream.on("finish", async () => {
          //const fileId = uploadStream.id.toString(); 

          //await db.collection("posts").updateOne(
              //{ _id: new ObjectId(postId) }, 
              //{ $set: { imageId: fileId } }
          //);

          //res.json({ message: "Image uploaded successfully!", fileId });
      //});
  //} catch (error) {
      //console.error("Error uploading image:", error);
      //res.status(500).json({ error: "Failed to upload image" });
  //}
//});

// In this section the image is loaded. 
//app.get("/images/:id", async (req, res) => {
  //const { id } = req.params;

  //try {
      //if (!ObjectId.isValid(id)) {
          //return res.status(400).json({ error: "Invalid image ID" });
      //}

      //const fileId = new ObjectId(id);
      //const downloadStream = gridFSBucket.openDownloadStream(fileId);

      //res.set("Content-Type", "image/jpeg"); 
      //downloadStream.pipe(res);

      //downloadStream.on("error", (err) => {
          //console.error("Error streaming image:", err);
          //res.status(404).json({ error: "Image not found" });
      //});
  //} catch (error) {
      //console.error("Error retrieving image:", error);
      //res.status(500).json({ error: "Failed to retrieve image" });
  //}
//});

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the football updates social media site!" });
});

// In this section the ability to register a user is created
app.post('/users', async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  try {
    const userCollection = db.collection("users");
    const existingUser = await userCollection.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists!" });
    }

    await userCollection.insertOne({ email, username, password, followers: [], following: [] });
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// In this section the ability to login a user is created
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  try {
    const userCollection = db.collection("users");
    const user = await userCollection.findOne({ username, password });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials!" });
    }

    res.json({ message: "Login successful!", user: { username, email: user.email } });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// In this section the ability to create a new post is created
app.post('/posts', async (req, res) => {
  const { username, content } = req.body;

  if (!username || !content) {
    return res.status(400).json({ error: "Username and content are required!" });
  }

  try {
    const postCollection = db.collection("posts");

    const result = await postCollection.insertOne({
      username,
      content,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Post created successfully!", postId: result.insertedId });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// In this section all posts are loaded
app.get('/posts', async (req, res) => {
  try {
      const postCollection = db.collection("posts");
      const posts = await postCollection.find().sort({ createdAt: -1 }).toArray();
      //This section is commented out due to it being related to images and i was not able to get that fixed
      //const postsWithImages = posts.map(post => ({
          //...post,
          //imageUrl: post.imageId ? `/images/${post.imageId}` : null 
      //}));

      res.json(posts);
  } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

// In this section the ability to delete a user account is created
app.delete('/users/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const userCollection = db.collection("users");
    const postCollection = db.collection("posts");
    const deleteUserResult = await userCollection.deleteOne({ username });

    await postCollection.deleteMany({ username });

    if (deleteUserResult.deletedCount === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// In this section the ability to search is created
app.get('/search', async (req, res) => {
    const { q } = req.query; 
    if (!q) {
        return res.status(400).json({ error: "Search query is required!" });
    }

    try {
        const users = await db.collection("users").find({ 
            username: { $regex: q, $options: "i" } 
        }).toArray();

        const posts = await db.collection("posts").find({ 
            content: { $regex: q, $options: "i" } 
        }).toArray();

        res.json({ users, posts });
    } catch (error) {
        console.error("Error during search:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// In this section the ability to follow is created
app.post('/users/:username/follow', async (req, res) => {
  const { username } = req.params; 
  const { currentUsername } = req.body; 

  if (!currentUsername) {
      return res.status(400).json({ error: "You must be logged in to follow users." });
  }

  try {
      const userCollection = db.collection("users");

      await userCollection.updateOne(
          { username: currentUsername },
          { $addToSet: { following: username } }
      );

      await userCollection.updateOne(
          { username },
          { $addToSet: { followers: currentUsername } }
      );

      res.json({ message: `You are now following ${username}` });
  } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ error: "Internal server error." });
  }
});

// In this section the ability to unfollow is created
app.post('/users/:username/unfollow', async (req, res) => {
  const { username } = req.params; 
  const { currentUsername } = req.body; 

  if (!currentUsername) {
      return res.status(400).json({ error: "You must be logged in to unfollow users." });
  }

  try {
      const userCollection = db.collection("users");

      await userCollection.updateOne(
          { username: currentUsername },
          { $pull: { following: username } }
      );

      await userCollection.updateOne(
          { username },
          { $pull: { followers: currentUsername } }
      );

      res.json({ message: `You have unfollowed ${username}` });
  } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ error: "Internal server error." });
  }
});

// In this section the ability to see users following is created
app.get('/users/:username/following', async (req, res) => {
  const { username } = req.params;

  try {
      const user = await db.collection('users').findOne({ username });
      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      res.json({ following: user.following || [] });
  } catch (error) {
      console.error("Error fetching following list:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

// In this section a users details is loaded
app.get('/users/:username', async (req, res) => {
  const { username } = req.params;
  console.log(`Fetching user with username: ${username}`);

  try {
      const user = await db.collection('users').findOne({ username });
      if (!user) {
          console.log("User not found");
          return res.status(404).json({ error: "User not found" });
      }

      res.json({
          username: user.username,
          email: user.email,
          followers: user.followers || [],
          following: user.following || [],
      });
  } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
