const url = "http://localhost:3000/v1/";

async function loginuser(email,password) {
   try {
      const res = await fetch(`${url}users/login`,{
        method:"POST",
         headers: {
        "Content-Type": "application/json"  
      },
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

 const email= document.getElementById("email").value
 const password= document.getElementById("password").value

const res=await loginuser(email,password)

   sessionStorage.setItem("userId", res.user._id);
   sessionStorage.setItem("username", res.user.username);

    window.location.href = "/chat.html";

})



