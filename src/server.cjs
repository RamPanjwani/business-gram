const express = require("express");
const cors = require("cors");
const tdl = require("tdl");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs"); // Add file system module
const multer = require("multer");
require('dotenv').config();
// Initialize Express app
const app = express();
const port = 3000;

let fileCount = 0;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); // Create uploads directory if it doesn't exist
    }
    cb(null, uploadDir); // Set your desired upload directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });
// Global variables for username, chats, and client[fileCount] instance
let username = null;
let chats = null;
let client = [];

// Function to create tdlib client[LKKfileCount] instance
let profile_photo_path = null;
function createClient() {
  const instanceDir = path.join(__dirname, `Instance_${fileCount}`);
  const databaseDir = path.join(instanceDir, "_td_database");
  const fileDir = path.join(instanceDir, "_td_files");

  // Create the directories if they don't exist
  if (!fs.existsSync(databaseDir)) {
    fs.mkdirSync(databaseDir, { recursive: true });
  }
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true });
  }
  profile_photo_path = path.join(instanceDir, "_td_database");
  profile_photo_path = path.join(profile_photo_path, "profile_photos");
  console.log(profile_photo_path);
  app.use("/photo", express.static(profile_photo_path));
  const clientInstance = tdl.createClient({
    apiId: process.env.REACT_APP_API_ID,
    apiHash: process.env.REACT_APP_API_HASH,
    databaseDirectory: databaseDir,
    filesDirectory: fileDir,
  });

  clientInstance.on("error", (error) => {
    console.error("client[fileCount] error:", error);
  });

  clientInstance.on("updateAuthorizationState", async (update) => {
    if (update.authorization_state._ === "authorizationStateClosed") {
      console.log("Authorization state closed, recreating client[fileCount].");
    }
  });

  return clientInstance;
}

function InitializeClient() {
  client.push(createClient());
}
InitializeClient();
// Middleware for CORS and JSON parsing
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(bodyParser.json());
async function checkAuthorizationState() {
  try {
    const authState = await client[fileCount].invoke({
      _: "getAuthorizationState",
    });
    console.log("Auth State: ", authState);
    if (authState._ === "authorizationStateReady") {
      return 3;
    } else if (authState._ === "authorizationStateWaitCode") {
      return 2;
    } else if (authState._ === "authorizationStateWaitPhoneNumber") {
      return 1;
    } else if (authState._ === "authorizationStateWaitPassword") {
      return 4;
    }
  } catch (error) {
    console.error("Failed to get authorization state:", error.message);
  }
}

async function logout() {
  try {
    await client[fileCount].invoke({
      _: "logOut",
    });
    console.log("User Logged Out");
  } catch (error) {
    console.error("Logout failed:", error.message);
  }
}

async function getUsername() {
  try {
    const me = await client[fileCount].invoke({
      _: "getMe",
    });
    username = me.first_name + " " + me.last_name;
    userid = me.id;
  } catch (error) {
    console.error("Failed to get username:", error.message);
  }
}
async function getChatDetails(chatId) {
  try {
    const chat = await client[fileCount].invoke({
      _: "getChat",
      chat_id: chatId,
    });
    if (!chat) return null;

    if (chat.type._ === "chatTypePrivate") {
      const user = await client[fileCount].invoke({
        _: "getUser",
        user_id: chat.type.user_id,
      });
      let newPath = null;
      if (user.profile_photo == undefined) {
        newPath = null;
      } else {
        saveProfilePhoto(user.profile_photo.small.id);
        console.log(user.profile_photo.small);
        let filePath = user.profile_photo.small.local.path;
        let prefix =
          "C:\\Projects\\business-gram\\src\\Instance_0\\_td_database\\profile_photos\\";
        newPath = filePath.replace(prefix, "");
        newPath = "http://localhost:3000/photo/" + newPath
      }
      return {
        id: chatId,
        title: user.first_name + " " + user.last_name,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        phone_number: user.phone_number,
        profile_photo: newPath,
      };
    } else {
      return {
        id: chatId,
        title: chat.title,
        first_name: null,
        last_name: null,
        username: null,
        phone_number: null,
      };
    }
  } catch (error) {
    console.error("Failed to get chat details:", error.message);
    return null;
  }
}

async function saveProfilePhoto(id) {
  try {
    const file = await client[fileCount].invoke({
      _: "downloadFile",
      file_id: id,
      priority: 32,
    });
  } catch (error) {
    console.error("Cant save file: ", error);
  }
}

// Function to get chats and download profile photos
async function getChats() {
  try {
    const chatIds = await client[fileCount].invoke({
      _: "getChats",
      chat_list: { _: "chatListMain" },
      limit: 9000,
    });

    const chatDetailsPromises = chatIds.chat_ids.map(getChatDetails);
    const chatDetails = await Promise.all(chatDetailsPromises);

    chats = chatDetails.filter((chat) => chat !== null);
  } catch (error) {
    console.error("Failed to get chats:", error.message);
  }
}
let messageId = 0;
let hasMoreMessages = true;
let messageHistory = []; // Array to store message objects

async function getMessage(chatid, message_id) {
  try {
    const history = await client[fileCount].invoke({
      _: "getChatHistory",
      chat_id: chatid,
      from_message_id: message_id,
      offset: 0,
      limit: 100,
    });

    if (history.messages && history.messages.length > 0) {
      history.messages.forEach((message) => {
        let messageObject = {
          user_id: message.sender_id.user_id,
          message: "",
        };

        if (message.content._ == "messageText") {
          messageObject.message = message.content.text.text;
        } else {
          messageObject.message = "file"; // Placeholder for other types of content
        }

        messageHistory.push(messageObject);
        messageId = message.id;
      });
    } else {
      // No more messages
      hasMoreMessages = false;
    }
  } catch (error) {
    console.error("Error fetching message history:", error.message);
    hasMoreMessages = false; // Stop the loop on error
  }
}

async function getHistory(chatId) {
  let messageHistory = [];
  let hasMoreMessages = true;
  let messageId = 0;

  while (hasMoreMessages) {
    try {
      const history = await client[fileCount].invoke({
        _: "getChatHistory",
        chat_id: chatId,
        from_message_id: messageId,
        offset: 0,
        limit: 100,
      });

      if (history.messages && history.messages.length > 0) {
        history.messages.forEach((message) => {
          let messageObject = {
            user_id: message.sender_id.user_id,
            message: "",
          };

          if (message.content._ == "messageText") {
            messageObject.message = message.content.text.text;
          } else {
            messageObject.message = "file"; // Placeholder for other types of content
          }

          messageHistory.push(messageObject);
          messageId = message.id;
        });
      } else {
        // No more messages
        hasMoreMessages = false;
      }
    } catch (error) {
      console.error("Error fetching message history:", error.message);
      hasMoreMessages = false; // Stop the loop on error
    }
  }

  return messageHistory;
}

async function sendTelegramMessage(chatIds, message) {
  try {
    if (!Array.isArray(chatIds)) {
      chatIds = [chatIds]; // Convert single chat ID to array if needed
    }

    const formattedText = await client[fileCount].invoke({
      _: "parseTextEntities",
      text: message,
      parse_mode: {
        _: "textParseModeMarkdown",
      },
    });

    for (const chatId of chatIds) {
      await client[fileCount].invoke({
        _: "sendMessage",
        chat_id: chatId,
        input_message_content: {
          _: "inputMessageText",
          text: {
            _: "formattedText",
            text: formattedText.text,
            entities: formattedText.entities,
          },
        },
      });
      console.log(`Message sent to chat ID ${chatId}: ${message}`);
    }
  } catch (error) {
    console.error("Failed to send message:", error.message);
    throw error;
  }
}

async function sendPhoto(chatId, filePath, message) {
  try {
    // Ensure the file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File ${filePath} does not exist.`);
      return;
    }
    console.log(filePath);
    if (
      filePath.includes("jpg") ||
      filePath.includes("png") ||
      filePath.includes("gif")
    ) {
      await client[fileCount].invoke({
        _: "sendMessage",
        chat_id: chatId,
        disable_notification: false,
        from_background: true,
        input_message_content: {
          _: "inputMessagePhoto",
          photo: {
            _: "inputFileLocal",
            path: filePath,
          },
          caption: {
            _: "formattedText",
            text: message,
          },
          width: 300,
          height: 300,
        },
      });
      console.log("Photo sent successfully.");
    } else {
      await client[fileCount].invoke({
        _: "sendMessage",
        chat_id: chatId,
        disable_notification: false,
        from_background: true,
        input_message_content: {
          _: "inputMessageDocument",
          document: {
            _: "inputFileLocal",
            path: filePath,
          },
          caption: {
            _: "formattedText",
            text: message,
          },
          width: 300,
          height: 300,
        },
      });
      console.log("Document sent successfully.");
    }
  } catch (error) {
    console.error("Error sending photo:", error);
  }
}

app.get("/history", async (req, res) => {
  const chatId = req.query.chat_id;
  try {
    const history = await getHistory(chatId);
    res.json(history);
  } catch (error) {
    console.error("Error fetching chat history:", error.message);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});
app.get("/username", async (req, res) => {
  try {
    await getUsername();
    res.json({ username, userid });
  } catch (error) {
    console.error("Failed to get user info:", error.message);
    res.status(401).json({ error: "Unauthorized" });
  }
});

// Endpoint to fetch chats
app.get("/chats", async (req, res) => {
  try {
    await getChats();
    res.json({ chats });
  } catch (error) {
    console.error("Failed to get chats:", error.message);
    res.status(500).json({ error: "Failed to get chats" });
  }
});

// Endpoint to check authorization state
app.get("/check", async (req, res) => {
  const isAuthorized = await checkAuthorizationState();
  res.json(isAuthorized);
});

// Endpoint to log out user
app.post("/logout", async (req, res) => {
  console.log("Received /logout");
  await logout();
  res.json({ message: "Logged out successfully" });
  fileCount++;
  InitializeClient();
});

// Endpoint to enter phone number
app.post("/phone", async (req, res) => {
  console.log("Received /phone");
  const phoneNumber = req.body.completephone;
  console.log("Received completephone:", phoneNumber);
  try {
    await client[fileCount].invoke({
      "@type": "setAuthenticationPhoneNumber",
      phone_number: phoneNumber,
    });
    res.json({ message: "Phone number received successfully" });
    checkAuthorizationState();
  } catch (error) {
    console.error("Error in enterPhoneNumber:", error);
    res.status(500).json({
      message: "Failed to process phone number",
      error: error.message,
    });
  }
});

app.post("/password", async (req, res) => {
  console.log("Received /password");
  const password = req.body.password;
  console.log("Received password: ", password);
  try {
    await client[fileCount].invoke({
      "@type": "checkAuthenticationPassword",
      password: password,
    });
    res.json({ message: "Password received successfully" });
    checkAuthorizationState();
  } catch (error) {
    console.error("Error in enterPhoneNumber:", error);
    res.status(500).json({
      message: "Failed to process phone number",
      error: error.message,
    });
  }
});

// Endpoint to enter authentication code
app.post("/code", async (req, res) => {
  const authCode = req.body.code;
  console.log("Received auth_code:", authCode);
  try {
    await client[fileCount].invoke({
      "@type": "checkAuthenticationCode",
      code: authCode,
    });
    res.json({ message: "Auth Code received successfully" });
  } catch (error) {
    console.error("Error in enterPhoneNumber:", error);
    res
      .status(500)
      .json({ message: "Failed to process authcode", error: error.message });
  }
});

app.post("/message", upload.single("file"), async (req, res) => {
  try {
    const { chatIds, message } = JSON.parse(req.body.payload);
    console.log("Received message payload:", chatIds, message);

    if (!Array.isArray(chatIds) || chatIds.length === 0) {
      throw new Error("Invalid chatIds format or empty array");
    }

    if (req.file) {
      // Handle message with file
      const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
      // Process file as needed (e.g., send photo to each chat ID)
      for (const chatId of chatIds) {
        try {
          await sendPhoto(chatId, filePath, message);
          // await sendTelegramMessage(chatId, message);
        } catch (error) {
          console.error(`Failed to send message to chatId ${chatId}:`, error);
          // Optionally handle the specific error, e.g., continue to next chatId
        }
      }
    } else {
      // Handle message without file
      for (const chatId of chatIds) {
        try {
          await sendTelegramMessage(chatId, message);
        } catch (error) {
          console.error(`Failed to send message to chatId ${chatId}:`, error);
          // Optionally handle the specific error, e.g., continue to next chatId
        }
      }
    }

    res.json({ message: "Messages sent successfully" });
  } catch (error) {
    console.error("Error sending messages:", error.message);
    res.status(500).json({ error: "Failed to send messages" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
