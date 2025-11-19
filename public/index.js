
const url = "http://localhost:3000/v1/";
let socket;

 const chatList = document.getElementById("chat");
let currentUser = sessionStorage.getItem("username");
let userId = sessionStorage.getItem("userId");
let receiverid
const currentPage = window.location.pathname;



// index page--------------------------
  const userslist = document.getElementById("users");
  async function fetchMessage(selectedUser) {
    try {
      const res = await fetch(`${url}messages?receiver=${selectedUser}&sender=${userId}`);
      const data = await res.json();
      return data;
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
 async function populateMessages(selectedUser) {
   const msgs = await fetchMessage(selectedUser);
 
    msgs.forEach((msg) => {
      
     const li = document.createElement("li");

     if (userId !== msg.sender._id) {
    li.classList.add("right");   
      
  }
  else{
     li.classList.add("left"); 
  }
  li.textContent = `${msg.sender.username}: ${msg.text}`;
    chatList.appendChild(li )
    })
  }

  async function fetchUsers() {
    try {
      const res = await fetch(`${url}users`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }
 async function populateUsers() {
   const users = await fetchUsers();

    users.forEach((user) => {
       if (userId && user._id === userId ) return;

      const option = document.createElement("option");
      option.value = user._id;
      option.textContent = user.username;
      userslist.appendChild(option);
    })
  }



  // ----------------------------chat page----------------

// if (currentPage.endsWith("index.html") || currentPage === "/") {

//   const selectBtn = document.getElementById("select");

 //poupulate user if exists for static index page
 
//   populateUsers();

//   let selectedUser = "";
//   userslist.addEventListener("change", () => {
//     selectedUser = userslist.options[userslist.selectedIndex].text;
   
//   });


//   selectBtn.addEventListener("click", () => {
//     if (!selectedUser) {
//       alert("Please select a user first!");
//       return;
//     }

//    sessionStorage.setItem("username", selectedUser);

//     window.location.href = "/chat.html";
//   });
// }


if (currentPage.endsWith("chat.html")) {
  const input = document.getElementById("inputs");
  const button = document.getElementById("send");
 
const name= document.getElementById("name")


  if (!currentUser) {
      window.location.href = "/index.html";
  }

   populateUsers();
   
  socket = io();
  socket.on("connect", () => {
    console.log("Connected:", socket.id);
    socket.emit("assign", userId);
     name.textContent=currentUser
  });

  socket.on("online_users", (users) => {
    console.log("🧑‍💻 Online Users:", users);
  });

  let selectedUser = "";
  userslist.addEventListener("change", () => {
    selectedUser = userslist.options[userslist.selectedIndex].value;

    console.log("User selected:", selectedUser);
     socket.emit("joinChat",selectedUser)
  
     RemoveMessages()
     populateMessages(selectedUser);
  });
   

  button.addEventListener("click", () => {

    const msg = input.value.trim();
   
 
    if (msg) {
      socket.emit("chat", {
        senderId: userId,
        receiverid:selectedUser,
        text: msg,
      });
      input.value = "";
    } 
  });


  socket.on("chat", (msg) => {

    const li = document.createElement("li");
    
    if (userId !== msg.senderId) {
    li.classList.add("right");   
      
  }
  else{
     li.classList.add("left"); 
  }
  li.textContent = `${msg.senderName}: ${msg.text}`;
    chatList.appendChild(li )
  });

  socket.on("reconnect", () => {
  if (userId) {
    socket.emit("assign", userId);
    console.log("Reconnected and reassigned:", userId);
  }
});
}
