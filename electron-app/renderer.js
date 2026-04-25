let currentUser = null;
let selectedUser = null;

const API = "http://localhost:8080";

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  const res = await fetch(`${API}/login.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.status === "success") {
    currentUser = data.user;

    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "flex";

    loadUsers();
  } else {
    alert(data.message || "Login failed");
  }
}

async function loadUsers() {
  const res = await fetch(`${API}/users.php`);
  const data = await res.json();

  const usersDiv = document.getElementById("users");
  usersDiv.innerHTML = "";

  data.users.forEach(user => {
    if (user.id == currentUser.id) return;

    const div = document.createElement("div");
    div.innerText = user.name;

    div.onclick = () => {
      selectedUser = user;
      document.getElementById("chatTitle").innerText = user.name;

      document.querySelectorAll("#users div").forEach(el => {
        el.classList.remove("active-user");
      });

      div.classList.add("active-user");
      loadMessages();
    };

    usersDiv.appendChild(div);
  });
}

async function loadMessages() {
  if (!selectedUser) return;

  const res = await fetch(`${API}/messages.php?sender_id=${currentUser.id}&receiver_id=${selectedUser.id}`);
  const data = await res.json();

  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";

  data.messages.forEach(msg => {
    const wrapper = document.createElement("div");
    wrapper.className = "message-wrapper";

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";

    if (msg.sender_id == currentUser.id) {
      wrapper.classList.add("me-wrapper");
      bubble.classList.add("me-bubble");
    } else {
      wrapper.classList.add("other-wrapper");
      bubble.classList.add("other-bubble");
    }

    bubble.innerText = msg.message;

    wrapper.appendChild(bubble);
    messagesDiv.appendChild(wrapper);
  });

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendMessage() {
  if (!selectedUser) {
    alert("Please select a user first.");
    return;
  }

  const message = document.getElementById("msg").value.trim();

  if (!message) {
    return;
  }

  await fetch(`${API}/send-message.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      message: message
    })
  });

  document.getElementById("msg").value = "";
  loadMessages();
}

window.addEventListener("DOMContentLoaded", () => {
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const msg = document.getElementById("msg");

  if (email) {
    email.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        password.focus();
      }
    });
  }

  if (password) {
    password.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        login();
      }
    });
  }

  if (msg) {
    msg.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  setInterval(() => {
    if (currentUser && selectedUser) {
      loadMessages();
    }
  }, 2000);
});
