// const url = "http://192.168.1.12:3000/v1/";
const url ="http://localhost:4000/v1/"


async function loginuser(email,password) {
   try {
      const res = await fetch(`${url}auth/login`,{
        method:"POST",
        headers: {
        "Content-Type": "application/json"  
      }, credentials: "include",
     body: JSON.stringify({email,password})}
        );


     const data = await res.json(); 

    if (!res.ok) {
     
      throw new Error( data.message || "login failed");
    }

    return data; 
    } catch (err) {
      console.error("Error in Login user:", err);
      return err
    }

}

const login = document.getElementById("Login");
login.addEventListener("submit",async e=>{
 
  e.preventDefault();

 const email= document.getElementById("email").value.trim()
 const password= document.getElementById("password").value.trim()

const res=await loginuser(email,password)
  if (!res || !res.user) {
    alert("Invalid email or password");
    return;
  }
   localStorage.setItem("accessToken", res.accessToken);
   sessionStorage.setItem("userId", res.user.id);
   sessionStorage.setItem("username", res.user.username);

    window.location.href = "/chat.html";

})



