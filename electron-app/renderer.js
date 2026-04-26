let currentUser = null;
let avatarCropper = null;
let selectedUser = null;
let typingTimeout = null;
let cropAvatarModal = null;

const API = "http://localhost:8080";

function updateMyProfileUI() {
  const avatarEl = document.getElementById("myAvatar");
  const modalAvatarEl = document.getElementById("profileModalAvatar");
  const profileName = document.getElementById("profileNickname");
  const profileDept = document.getElementById("profileDepartment");
  const statusText = document.getElementById("profileStatusText");
  const statusDot = document.getElementById("profileStatusDot");

  const fullNameInput = document.getElementById("fullNameInput");
  const emailInput = document.getElementById("emailInput");
  const nicknameInput = document.getElementById("nicknameInput");
  const departmentInput = document.getElementById("departmentInput");
  const statusInput = document.getElementById("statusInput");

  if (!currentUser) return;

  const displayName = currentUser.nickname || currentUser.name || "User";
  const firstLetter = displayName.charAt(0).toUpperCase();

  [avatarEl, modalAvatarEl].forEach(el => {
    if (!el) return;

    if (currentUser.avatar) {
      el.style.backgroundImage =
        `url(${API}/uploads/avatars/${currentUser.avatar}?t=${Date.now()})`;
      el.innerText = "";
    } else {
      el.style.backgroundImage = "none";
      el.innerText = firstLetter;
    }
  });

  if (profileName) profileName.innerText = displayName;
  if (profileDept) profileDept.innerText = currentUser.department || "No department";

  if (fullNameInput) fullNameInput.value = currentUser.name || "";
  if (emailInput) emailInput.value = currentUser.email || "";
  if (nicknameInput) nicknameInput.value = currentUser.nickname || "";
  if (departmentInput) departmentInput.value = currentUser.department || "";
  if (statusInput) statusInput.value = currentUser.status || "online";

  const status = currentUser.status || "online";

  if (statusText) {
    statusText.innerText = status.charAt(0).toUpperCase() + status.slice(1);
  }

  if (statusDot) {
    statusDot.className = "status-dot " + status;
  }
}

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  try {
    const res = await fetch(`${API}/login.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.status === "success") {
      currentUser = data.user;

      updateMyProfileUI();

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
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    alert("Cannot connect to backend.");
  }
}

async function loadUsers() {
  if (!currentUser) return;

  const res = await fetch(`${API}/users.php?user_id=${currentUser.id}`);
  const data = await res.json();

  const usersDiv = document.getElementById("users");
  usersDiv.innerHTML = "";

  data.users.forEach(user => {
    if (user.id == currentUser.id) return;

    const div = document.createElement("div");
    div.className = "user-item";
    div.dataset.userId = user.id;

    const avatar = document.createElement("div");
    avatar.className = "avatar";

    if (user.avatar) {
      avatar.style.backgroundImage = `url(${API}/uploads/avatars/${user.avatar})`;
      avatar.innerText = "";
    } else {
      avatar.style.backgroundImage = "none";
      avatar.innerText = user.name.charAt(0).toUpperCase();
    }

    const name = document.createElement("span");
    name.innerText = user.name;

    div.appendChild(avatar);
    div.appendChild(name);

    if (user.unread_count > 0) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.innerText = user.unread_count;
      div.appendChild(badge);
    }

    div.onclick = () => {
      selectedUser = user;

      document.getElementById("messageInputArea").style.display = "flex";
      document.getElementById("chatTitle").innerText = user.name;
      document.getElementById("typingIndicator").innerHTML = "";

      document.querySelectorAll("#users div").forEach(el => {
        el.classList.remove("active-user");
      });

      div.classList.add("active-user");

      loadMessages();
      setTimeout(refreshUnreadCounts, 300);
    };

    usersDiv.appendChild(div);
  });
}

async function loadMessages() {
  if (!selectedUser) return;

  document.getElementById("messageInputArea").style.display = "flex";

  const res = await fetch(
    `${API}/messages.php?sender_id=${currentUser.id}&receiver_id=${selectedUser.id}`
  );

  const data = await res.json();

  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";

  data.messages.forEach((msg, index) => {
    const wrapper = document.createElement("div");
    const isMine = msg.sender_id == currentUser.id;

    wrapper.className = isMine
      ? "message-wrapper me-wrapper"
      : "message-wrapper other-wrapper";

    const bubble = document.createElement("div");
    bubble.className = isMine ? "message me" : "message other";
    bubble.innerText = msg.message;

    wrapper.appendChild(bubble);
    messagesDiv.appendChild(wrapper);

    const isLastMessage = index === data.messages.length - 1;

    if (isMine && isLastMessage) {
      const seen = document.createElement("div");
      seen.className = "seen-status";
      seen.innerText = msg.is_read == 1 ? "Read" : "Unread";
      messagesDiv.appendChild(seen);
    }
  });

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendMessage() {
  if (!selectedUser) {
    alert("Please select a user first.");
    return;
  }

  const message = document.getElementById("msg").value.trim();

  if (!message) return;

  await fetch(`${API}/send-message.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      message
    })
  });

  await sendTypingStatus(false);

  document.getElementById("msg").value = "";
  loadMessages();
}

async function refreshUnreadCounts() {
  if (!currentUser) return;

  const res = await fetch(`${API}/unread-counts.php?user_id=${currentUser.id}`);
  const data = await res.json();

  document.querySelectorAll(".user-item").forEach(item => {
    const userId = item.dataset.userId;

    let badge = item.querySelector(".badge");
    if (badge) badge.remove();

    const countData = data.counts.find(c => c.sender_id == userId);

    if (countData && countData.unread_count > 0) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.innerText = countData.unread_count;
      item.appendChild(badge);
    }
  });
}

async function sendTypingStatus(isTyping) {
  if (!currentUser || !selectedUser) return;

  await fetch(`${API}/typing.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: currentUser.id,
      receiver_id: selectedUser.id,
      is_typing: isTyping ? 1 : 0
    })
  });
}

async function checkTyping() {
  if (!currentUser || !selectedUser) return;

  const res = await fetch(
    `${API}/typing-status.php?user_id=${currentUser.id}&other_user_id=${selectedUser.id}`
  );

  const data = await res.json();
  const typingDiv = document.getElementById("typingIndicator");

  if (!typingDiv) return;

  if (data.is_typing) {
    typingDiv.innerHTML = `
      <div class="typing-wrapper">
        <div class="typing-bubble">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
  } else {
    typingDiv.innerHTML = "";
  }
}

async function saveProfile() {
  if (!currentUser) return;

  const nickname = document.getElementById("nicknameInput").value.trim();
  const department = document.getElementById("departmentInput").value.trim();
  const status = document.getElementById("statusInput").value;

  await fetch(`${API}/update-profile.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: currentUser.id,
      nickname,
      department,
      status
    })
  });

  currentUser.nickname = nickname;
  currentUser.department = department;
  currentUser.status = status;

  updateMyProfileUI();
  loadUsers();

  alert("Profile updated.");
}

window.addEventListener("DOMContentLoaded", () => {
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const msg = document.getElementById("msg");
  const avatarInput = document.getElementById("avatarInput");
  const saveCroppedAvatarBtn = document.getElementById("saveCroppedAvatarBtn");

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
    msg.addEventListener("input", () => {
      if (!selectedUser) return;

      sendTypingStatus(true);

      if (typingTimeout) clearTimeout(typingTimeout);

      typingTimeout = setTimeout(() => {
        sendTypingStatus(false);
      }, 2000);
    });

    msg.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  if (avatarInput) {
    avatarInput.addEventListener("change", function () {
      if (!currentUser) return;

      const file = this.files[0];

      if (!file) return;

      const image = document.getElementById("cropAvatarImage");
      const reader = new FileReader();

      reader.onload = function (e) {
        image.src = e.target.result;

        cropAvatarModal = new bootstrap.Modal(
          document.getElementById("cropAvatarModal")
        );

        cropAvatarModal.show();

        if (avatarCropper) {
          avatarCropper.destroy();
        }

        avatarCropper = new Cropper(image, {
          aspectRatio: 1,
          viewMode: 1,
          dragMode: "move",
          autoCropArea: 1,
          background: false,
          responsive: true
        });
      };

      reader.readAsDataURL(file);
    });
  }

  if (saveCroppedAvatarBtn) {
    saveCroppedAvatarBtn.addEventListener("click", async () => {
      if (!avatarCropper || !currentUser) {
        alert("Please select an image first.");
        return;
      }

      console.log("SAVE CLICKED");

      const canvas = avatarCropper.getCroppedCanvas({
        width: 400,
        height: 400
      });

      const dataURL = canvas.toDataURL("image/png");

      const byteString = atob(dataURL.split(",")[1]);
      const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];

      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);

      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([ab], { type: mimeString });

      const formData = new FormData();
      formData.append("avatar", blob, `avatar_${currentUser.id}.png`);
      formData.append("user_id", currentUser.id);

      try {
        const res = await fetch(`${API}/upload-avatar.php`, {
          method: "POST",
          body: formData
        });

        const data = await res.json();

        console.log("UPLOAD RESPONSE:", data);

        if (data.status === "success") {
          currentUser.avatar = data.avatar;

          updateMyProfileUI();
          loadUsers();

          const modalEl = document.getElementById("cropAvatarModal");
          const modal = bootstrap.Modal.getInstance(modalEl);

          if (modal) modal.hide();

          avatarCropper.destroy();
          avatarCropper = null;

          document.getElementById("avatarInput").value = "";

          alert("Avatar updated.");
        } else {
          alert(data.message || "Avatar upload failed.");
        }
      } catch (err) {
        console.error("UPLOAD ERROR:", err);
        alert("Something went wrong while uploading avatar.");
      }
    });
  }

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      selectedUser = null;

      document.getElementById("chatTitle").innerText = "Messages";

      document.getElementById("messages").innerHTML = `
        <div id="emptyState" style="text-align:center; color:#9ca3af; margin-top:50px;">
          Select a conversation to get started
        </div>
      `;

      document.getElementById("typingIndicator").innerHTML = "";
      document.getElementById("messageInputArea").style.display = "none";

      document.querySelectorAll("#users div").forEach(el => {
        el.classList.remove("active-user");
      });

      sendTypingStatus(false);
    }
  });

  setInterval(() => {
    if (!currentUser) return;

    refreshUnreadCounts();

    if (selectedUser) {
      loadMessages();
      checkTyping();
    }
  }, 1000);
});