const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");

const { gencode } = require("./scripts/gencode");
const { MongoClient } = require("mongodb");

const app = express();

const port = process.env.PORT || 6969;
const mongoURL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const dbName = "file_uploads";
const collectionName = "data";

const client = new MongoClient(mongoURL);

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    return cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    const originalName = file.originalname;
    const newFileName =
      originalName + "-" + Date.now() + path.extname(originalName);
    cb(null, newFileName);
  },
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public", { index: false }));

// Connect to MongoDB
client
  .connect()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });

// Define the MongoDB collection
const fileCollection = client.db(dbName).collection(collectionName);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
  console.log("Request performed");
});

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file || req.file.size === 0) {
    return res.json({ status: 400, msg: "No file uploaded" });
  }

  let gc;
  const name = req.file.filename;

  try {
    let keyExists = true;
    while (keyExists) {
      gc = gencode();
      const existingFile = await fileCollection.findOne({ key: gc });
      if (!existingFile) {
        keyExists = false;
      }
    }
    // Insert the file record into the MongoDB collection
    await fileCollection.insertOne({ key: gc, name: name });
  } catch (err) {
    console.log("Failed to insert file record into MongoDB ");
    return res.status(501).json({ msg: "Server error" });
  }
  console.log(`File : ${name} uploaded with key : ${gc}`);
  res.json({ status: 200, msg: "File uploaded", key: gc });
});

app.get("/download", async (req, res) => {
  const key = req.query.key;
  try {
    const fileRecord = await fileCollection.findOne({ key: key });

    if (fileRecord) {
      const filename = fileRecord.name;
      const filePath = `./public/uploads/${filename}`;
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      console.log(
        "File found at: " + filePath + ` with size ${fileSize / 1024} KB`
      );
      const headers = {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/octet-stream",
        "Content-Length": fileSize,
      };

      res.set(headers);
      res.download(filePath, (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ msg: "Server error" });
        } else {
          console.log("Download request performed");
          res.status(200);
        }
      });
    } else {
      console.log("Key not found");
      res.status(404).json({ msg: "Unrecognized key" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

app.use((req, res, next) => {
  return res.status(404).send("404: Page Not Found");
});

app.use((req, res, next) => {
  res.status(405).send("405: Method Not Allowed");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
