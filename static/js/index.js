document.addEventListener("DOMContentLoaded", () => {
  // MODAL BUTTONS
  const signupOpenBtn = document.getElementById("signUp"); // bottom/main sign up button 
  const signupNavBtn = document.getElementById("navSignupButton"); // nav bar sign up button
  const loginOpenBtn = document.getElementById("loginButton"); // log in nav bar button

  const signupCloseBtn = document.getElementById("signupCloseModal");
  const loginCloseBtn = document.getElementById("loginCloseModal");
  
  // MODAL OVERLAYS (adds dark bg and modal)
  const signupModal = document.getElementById("signupModal");
  const loginModal = document.getElementById("loginModal");
  
  // SIGN UP
  signupOpenBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const signupForm = document.getElementById("signupModalBox");
    signupForm.reset();
    
    signupModal.classList.add("active"); // placeholder, will replace w/ gsap animations
    signupAnimateModalIn() // ← Call animation
  });

  signupNavBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const signupForm = document.getElementById("signupModalBox");
    signupForm.reset();
    
    signupModal.classList.add("active");
    signupAnimateModalIn() // ← Call animation
  });

  signupCloseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    signupAnimateModalOut(); // ← Call animation

    signupModal.querySelectorAll('input').forEach(input => input.value = '');
  });

  // LOG IN
  loginOpenBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const loginForm = document.getElementById("loginModalBox");
    loginForm.reset();

    loginModal.classList.add("active");
    loginAnimateModalIn() // ← Call animation
  });

  
  loginCloseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    loginAnimateModalOut(); // ← Call animation

    loginModal.querySelectorAll('input').forEach(input => input.value = '');
  });

  window.addEventListener("click", (e) => {
    if (e.target === signupModal) {
      e.preventDefault();
      e.stopPropagation();
      signupAnimateModalOut();

      signupModal.querySelectorAll('input').forEach(input => input.value = '');
    }

    if (e.target === loginModal) {
      e.preventDefault();
      e.stopPropagation();
      loginAnimateModalOut();

      loginModal.querySelectorAll('input').forEach(input => input.value = '');
    }
  });

  // modal sign-up/login logic w fetch()
  const signupForm = document.getElementById("signupModalBox");

  signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("signupUsername").value;
  const password = document.getElementById("signupPassword").value;

  try {
    // username and password in a json string object
    const response = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json(); // parse into json 

    if (response.ok) {
      if (data.redirect) {
        window.location.href = data.redirect;
      } else {
        console.log("Signup success:", data.message);
      }
    } else {
      if (response.status === 409) {
        alert("Username already exists! Try another one.");
      } else {
        alert(data.message || "Signup failed.")
      }
    }
  } catch (err) {
    console.error("Signup error:", err);
    alert("Network error or server issue.");
  }
});
  
});
