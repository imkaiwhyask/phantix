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
document.getElementById("messageInputArea").style.display = "none";
document.getElementById("messages").innerHTML = `
  <div id="emptyState" style="text-align:center; color:#9ca3af; margin-top:50px;">
    Select a conversation to get started
  </div>
`;

document.getElementById("chatTitle").innerText = "Messages";

loadUsers();
  } else {
    alert(data.message || "Login failed");
  }
}

async function loadUsers() {
  const res = await fetch(`${API}/users.php?user_id=${currentUser.id}`);
  const data = await res.json();

  const usersDiv = document.getElementById("users");
  usersDiv.innerHTML = "";

  data.users.forEach(user => {
    if (user.id == currentUser.id) return;

    const div = document.createElement("div");
    div.className = "user-item";

    // avatar
    const avatar = document.createElement("div");
    avatar.className = "avatar";

    if (user.avatar) {
      avatar.style.backgroundImage = `url(${API}/uploads/avatars/${user.avatar})`;
    } else {
      avatar.innerText = user.name.charAt(0).toUpperCase();
    }

    // name
    const name = document.createElement("span");
    name.innerText = user.name;

    div.appendChild(avatar);
    div.appendChild(name);

    // 🔴 unread badge
    if (user.unread_count > 0) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.innerText = user.unread_count;
      div.appendChild(badge);
    }

   div.onclick = () => {
  selectedUser = user;

document.getElementById("messageInputArea").style.display = "flex";
document.getElementById("emptyState").style.display = "none";
  document.getElementById("chatTitle").innerText = user.name;

  document.querySelectorAll("#users div").forEach(el => {
    el.classList.remove("active-user");
  });

  div.classList.add("active-user");

  loadMessages();

  // 👇 IMPORTANT
  setTimeout(loadUsers, 300);
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
  document.getElementById("messageInputArea").style.display = "none";
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

  // 👇 ADD THIS BLOCK HERE
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    selectedUser = null;

    document.getElementById("chatTitle").innerText = "Messages";

    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = `
      <div id="emptyState" style="text-align:center; color:#9ca3af; margin-top:50px;">
        Select a conversation to get started
      </div>
    `;

    document.getElementById("messageInputArea").style.display = "none";

    document.querySelectorAll("#users div").forEach(el => {
      el.classList.remove("active-user");
    });
  }
});

  //  KEEP THIS AT THE BOTTOM
setInterval(() => {
  if (currentUser) {
    loadUsers(); // refresh unread badges
  }

  if (currentUser && selectedUser) {
    loadMessages();
  }
}, 2000);
});