document.addEventListener("DOMContentLoaded", function () {
  const loginToggle = document.getElementById("login-toggle");
  const signupToggle = document.getElementById("signup-toggle");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  loginToggle.addEventListener("click", function () {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
    loginToggle.classList.add("active");
    signupToggle.classList.remove("active");
  });

  signupToggle.addEventListener("click", function () {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
    loginToggle.classList.remove("active");
    signupToggle.classList.add("active");
  });
});
