
console.log("SCRIPT STARTED");

let socket;

const chatList = document.getElementById("chat");
let currentUser = sessionStorage.getItem("username");
let userId = sessionStorage.getItem("userId");
let chatId;

const currentPage = window.location.pathname;

// index page--------------------------
const userslist = document.getElementById("users");

async function fetchMessage(chatId) {
  try {
    const res = await api.get(`messages?chatId=${chatId}&page=1`);
    return res.data
  } catch (err) {
    console.error("Error fetching users:", err);
  }
}

async function RemoveMessages() {
  const items = document.getElementsByTagName("li");

  while (items.length > 0) {
    items[0].remove();
  }
}

async function populateMessages(chatId) {
  const data= await fetchMessage(chatId);
  let msgs=[...data.messages].reverse();
  msgs.forEach((msg) => {
    const li = document.createElement("li");

    if (userId !== msg.sender._id) {
      li.classList.add("right");
    } else {
      li.classList.add("left");
    }
    li.textContent = `${msg.sender.username}: ${msg.text}`;
    chatList.appendChild(li);
  });
}

async function getCurrentUser() {
  try {
    const res = await api.get(`auth/me`);

    sessionStorage.setItem("userId", res.data.user.id);
    sessionStorage.setItem("username", res.data.user.username);

    userId = sessionStorage.getItem("userId");
    currentUser = sessionStorage.getItem("username");

    return currentUser;
  } catch (err) {
    console.error("Error fetching users:", err);
  }
}

async function fetchUsersAndGroups() {
  try {
    const [usersRes, groupsRes] = await Promise.all([
      api.get(`/users`),             
      api.get(`/chat/get-groups`)    
    ]);

    return {
      users: usersRes.data?.users || usersRes.data,  
      groups: groupsRes.data?.data || groupsRes.data
    };

  } catch (err) {
    console.error("Error fetching users/groups:", err);
  }
}
// async function populateUsers() {
//   const result = await fetchUsersAndGroups();

//   const all = [
//     ...result.users,
//     ...result.groups    ];

//   all.forEach((item) => {
//     const option = document.createElement("option");
//     option.value = item._id;

//     if (item.username) {
     
//       option.textContent = item.username;
//       option.dataset.type = "user";
//     } else {
    
//       option.textContent = item.groupName;
//       option.dataset.type = "group";
//     }

//     userslist.appendChild(option);
//   });
// }

async function populateUsers() {
  const result = await fetchUsersAndGroups();

  // Add placeholder
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select chat";
  placeholder.disabled = true;
  placeholder.selected = true;
  userslist.appendChild(placeholder);

  // Combine users + groups
  const all = [
    ...result.users,
    ...result.groups
  ];

  all.forEach((item) => {
    const option = document.createElement("option");
    option.value = item._id;

    if (item.username) {
      option.textContent = item.username;
      option.dataset.type = "user";
    } else {
      option.textContent = item.groupName;
      option.dataset.type = "group";
    }

    userslist.appendChild(option);
  });
}
async function getorCreatePrivateChatId(selectedUser) {
  const res = await api.post(`chat/private`, {
    otherUserId: selectedUser,
  });

  return res.data.chat._id;
}

// ----------------------------chat page----------------

document.addEventListener("DOMContentLoaded", async () => {
  if (!currentPage.endsWith("chat.html")) return;

  const input = document.getElementById("inputs");
  const button = document.getElementById("send");
  const name = document.getElementById("name");

  if (!currentUser) {
    await getCurrentUser();
    currentUser = sessionStorage.getItem("username");
  }

  name.textContent = currentUser;

  populateUsers();

  const accessToken = localStorage.getItem("accessToken");

  socket = io("http://localhost:4000", {
    auth: { token: accessToken },
  });

  socket.on("connect", () => {
    console.log("Connected:", socket.id);
  });

  socket.on("online_users", (users) => {
    console.log("Online Users:", users);
  });

  let currentRoom = null;

  userslist.addEventListener("change", async () => {
  const selectedId = userslist.value;
  const type = userslist.selectedOptions[0].dataset.type;

  if (type === "group") {
     chatId = selectedId;
  } else {
     chatId = await getorCreatePrivateChatId(selectedId);
  }
  console.log("Final ChatId:", chatId);

    socket.emit("joinChat", chatId);
    currentRoom = chatId;

    socket.emit("messageSeen", chatId);

    RemoveMessages();
    populateMessages(chatId);
  });

  button.addEventListener("click", () => {
    const msg = input.value.trim();

    if (msg) {
      socket.emit("chat", {
        chatId,
        text: msg,
      });
      input.value = "";
    }
  });

  socket.on("chat", (msg) => {
    const li = document.createElement("li");

    if (msg.chatId !== currentRoom) {
      if (msg.senderId !== userId) {
        socket.emit("messageDelivered", { messageId: msg._id });
      }
      return;
    }

    if (userId !== msg.senderId) {
      socket.emit("messageDelivered", { messageId: msg._id });
      socket.emit("messageSeen", chatId);
      li.classList.add("right");
    } else {
      li.classList.add("left");
    }

    li.textContent = `${msg.senderName}: ${msg.text}`;
    chatList.appendChild(li);
  });

  socket.on("messageDeliveredUpdate", ({ messageId, deliveredTo }) => {
    console.log(messageId, deliveredTo, "message is delivered");
  });

  socket.on("messagesSeenUpdate", ({ chatId, viewer }) => {
    console.log(chatId, viewer, "message seen by");
  });

  socket.on("reconnect", () => {
    if (userId) {
      socket.emit("assign", userId);
      console.log("Reconnected and reassigned:", userId);
    }
  });
});
