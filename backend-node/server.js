const express = require("express");
const http = require("http");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Server } = require("socket.io");
const pool = require("./db");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Serve uploaded avatars from old PHP uploads folder
app.use("/uploads", express.static("../backend/public/uploads"));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// -------------------- SOCKET.IO --------------------

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(String(userId));
    console.log(`User ${userId} joined room`);
  });

  socket.on("typing", (data) => {
    socket.to(String(data.receiver_id)).emit("user_typing", data);
  });

  socket.on("stop_typing", (data) => {
    socket.to(String(data.receiver_id)).emit("user_stop_typing", data);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// -------------------- AUTH --------------------

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        status: "error",
        message: "Email and password required",
      });
    }

    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    const user = rows[0];

    if (!user) {
      return res.json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    let storedPassword = user.password;

    // PHP password_hash usually starts with $2y$.
    // Node bcrypt works better with $2b$.
    if (storedPassword.startsWith("$2y$")) {
      storedPassword = "$2b$" + storedPassword.slice(4);
    }

    const isPasswordCorrect = await bcrypt.compare(password, storedPassword);

    if (!isPasswordCorrect) {
      return res.json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    res.json({
      status: "success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        department: user.department,
        status: user.status,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({
        status: "error",
        message: "All fields required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
    );

    res.json({
      status: "success",
      message: "User registered",
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);

    res.json({
      status: "error",
      message: "Email already exists",
    });
  }
});

// -------------------- USERS --------------------

app.get("/users", async (req, res) => {
  try {
    const currentUserId = req.query.user_id;

    const [users] = await pool.execute(
      `
      SELECT 
        u.id,
        u.name,
        u.nickname,
        u.email,
        u.avatar,
        u.department,
        u.status,
        (
          SELECT COUNT(*)
          FROM messages m
          WHERE m.sender_id = u.id
          AND m.receiver_id = ?
          AND m.is_read = 0
        ) AS unread_count
      FROM users u
      `,
      [currentUserId],
    );

    users.forEach((user) => {
      if (user.nickname) {
        user.name = user.nickname;
      }
    });

    res.json({
      status: "success",
      users,
    });
  } catch (err) {
    console.error("USERS ERROR:", err);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
});

// -------------------- MESSAGES --------------------

app.get("/messages", async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.query;

    if (!sender_id || !receiver_id) {
      return res.json({
        status: "error",
        message: "Missing IDs",
      });
    }

    // Mark messages as read when opened
    await pool.execute(
      `
      UPDATE messages
      SET is_read = 1
      WHERE sender_id = ?
      AND receiver_id = ?
      AND is_read = 0
      `,
      [receiver_id, sender_id],
    );

    const [messages] = await pool.execute(
      `
      SELECT *
      FROM messages
      WHERE 
        (sender_id = ? AND receiver_id = ?)
        OR
        (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
      `,
      [sender_id, receiver_id, receiver_id, sender_id],
    );

    res.json({
      status: "success",
      messages,
    });
  } catch (err) {
    console.error("MESSAGES ERROR:", err);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
});

app.post("/send-message", async (req, res) => {
  try {
    const { sender_id, receiver_id, message } = req.body;

    if (!sender_id || !receiver_id || !message) {
      return res.json({
        status: "error",
        message: "Missing fields",
      });
    }

    const [result] = await pool.execute(
      `
      INSERT INTO messages (sender_id, receiver_id, message)
      VALUES (?, ?, ?)
      `,
      [sender_id, receiver_id, message],
    );

    const [rows] = await pool.execute("SELECT * FROM messages WHERE id = ?", [
      result.insertId,
    ]);

    const savedMessage = rows[0];

    // Real-time send to receiver and sender
    io.to(String(receiver_id)).emit("receive_message", savedMessage);
    io.to(String(sender_id)).emit("receive_message", savedMessage);

    res.json({
      status: "success",
      message: savedMessage,
    });
  } catch (err) {
    console.error("SEND MESSAGE ERROR:", err);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
});

// -------------------- UNREAD COUNTS --------------------

app.get("/unread-counts", async (req, res) => {
  try {
    const currentUserId = req.query.user_id;

    const [counts] = await pool.execute(
      `
      SELECT sender_id, COUNT(*) AS unread_count
      FROM messages
      WHERE receiver_id = ?
      AND is_read = 0
      GROUP BY sender_id
      `,
      [currentUserId],
    );

    res.json({
      status: "success",
      counts,
    });
  } catch (err) {
    console.error("UNREAD COUNTS ERROR:", err);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
});

// -------------------- PROFILE --------------------

app.post("/update-profile", async (req, res) => {
  try {
    const { id, nickname, department, status } = req.body;

    await pool.execute(
      `
      UPDATE users
      SET nickname = ?, department = ?, status = ?
      WHERE id = ?
      `,
      [nickname, department, status, id],
    );

    res.json({
      status: "success",
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
});

// -------------------- TYPING fallback API --------------------
// We keep this so your old renderer code will not break yet.

app.post("/typing", async (req, res) => {
  try {
    const { user_id, receiver_id, is_typing } = req.body;

    await pool.execute(
      `
      INSERT INTO typing_status (user_id, receiver_id, is_typing)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
      is_typing = VALUES(is_typing),
      updated_at = CURRENT_TIMESTAMP
      `,
      [user_id, receiver_id, is_typing],
    );

    res.json({
      status: "success",
    });
  } catch (err) {
    console.error("TYPING ERROR:", err);
    res.status(500).json({
      status: "error",
    });
  }
});

app.get("/typing-status", async (req, res) => {
  try {
    const { user_id, other_user_id } = req.query;

    const [rows] = await pool.execute(
      `
      SELECT is_typing
      FROM typing_status
      WHERE user_id = ?
      AND receiver_id = ?
      AND updated_at >= NOW() - INTERVAL 3 SECOND
      `,
      [other_user_id, user_id],
    );

    res.json({
      status: "success",
      is_typing: rows.length > 0 && rows[0].is_typing == 1,
    });
  } catch (err) {
    console.error("TYPING STATUS ERROR:", err);
    res.status(500).json({
      status: "error",
      is_typing: false,
    });
  }
});

app.post("/mark-read", async (req, res) => {
  try {
    const { user_id, other_user_id } = req.body;

    if (!user_id || !other_user_id) {
      return res.json({
        status: "error",
        message: "Missing user IDs",
      });
    }

    await pool.execute(
      `
      UPDATE messages
      SET is_read = 1
      WHERE sender_id = ?
      AND receiver_id = ?
      AND is_read = 0
      `,
      [other_user_id, user_id],
    );

    io.to(String(other_user_id)).emit("messages_read", {
      reader_id: user_id,
      sender_id: other_user_id,
    });

    res.json({
      status: "success",
    });
  } catch (err) {
    console.error("MARK READ ERROR:", err);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Phantix Node backend running on http://localhost:${PORT}`);
});
