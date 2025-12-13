const url = "http://localhost:4000/v1/";

async function signupuser(username,email,password) {
   try {
      const res = await fetch(`${url}users/signup`,{
        method:"POST",
         headers: {
        "Content-Type": "application/json"  
      },
     body: JSON.stringify({ username,email,password })}
        );


     const data = await res.json(); 

    if (!res.ok) {
     
      throw new Error( data.message || "Signup failed");
    }

    return data; 
    } catch (err) {
      console.error("Error in signup user:", err);
      return err
    }

}

const signup = document.getElementById("Signup");
signup.addEventListener("submit",async e=>{
 
  e.preventDefault();
  
 const username= document.getElementById("username").value
 const email= document.getElementById("email").value
 const password= document.getElementById("password").value

const res=await signupuser(username,email,password)
console.log(res);
})
