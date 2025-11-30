
//const url = "http://192.168.1.12:3000/v1/"



let socket;

 const chatList = document.getElementById("chat");
let currentUser = sessionStorage.getItem("username");
let userId = sessionStorage.getItem("userId");
let chatId

const currentPage = window.location.pathname;



// index page--------------------------
  const userslist = document.getElementById("users");
  async function fetchMessage(chatId) {
    try {
      const res = await api.get(`messages?chatId=${chatId}`);
      return res.data;
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
   const msgs = await fetchMessage(chatId);
 
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
async function getCurrentUser() {
    try {
      const res = await api.get(`auth/me`);
  
    sessionStorage.setItem("userId", res.data.user.id);
     sessionStorage.setItem("username",res.data.user.username)
     
      userId = sessionStorage.getItem("userId");
      currentUser=sessionStorage.getItem("username");
      
      
     return currentUser
    } catch (err) {
      console.error("Error fetching users:", err);
    }
}
  async function fetchUsers() {
    try {
      const res = await api.get(`users`);
      const data = res
   
      return data.data;
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }
 async function populateUsers() {
   const users = await fetchUsers();

    users.forEach((user) => {
      console.log(user._id,"ye hai");
       if (userId && user._id === userId ) return;

      const option = document.createElement("option");
      option.value = user._id;
      option.textContent = user.username;
      userslist.appendChild(option);
    })
  }

async function getorCreatePrivateChatId(selectedUser){
     const res = await api.post(`chat/private`,{
  otherUserId: selectedUser,
});

return res.data._id
   
}

  // ----------------------------chat page----------------

if (currentPage.endsWith("chat.html")) {
  const input = document.getElementById("inputs");
  const button = document.getElementById("send");
 const name= document.getElementById("name")



  if (!currentUser) {
        await getCurrentUser()
      name.textContent= currentUser
       
       }
  name.textContent=currentUser;
   populateUsers();
    const accessToken=localStorage.getItem("accessToken")
  

const socket = io("http://localhost:3000", {
  auth: { token: accessToken }
});
  socket.on("connect", () => {
    console.log("Connected:", socket.id);
     
  });

  socket.on("online_users", (users) => {
    console.log("Online Users:", users);
  });

  let selectedUser = "";
  userslist.addEventListener("change", async() => {
    selectedUser = userslist.options[userslist.selectedIndex].value;

    console.log("User selected:", selectedUser);
    chatId = await getorCreatePrivateChatId(selectedUser)
     socket.emit("joinChat",chatId)
  
     RemoveMessages()
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
