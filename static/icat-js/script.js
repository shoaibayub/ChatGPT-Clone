const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");

function updateURL(formType) {
  const stateObj = { form: formType };
  const title = `${formType.charAt(0).toUpperCase() + formType.slice(1)} Form`;
  const url = `/${formType}`;
  history.pushState(stateObj, title, url);
}

signUpButton.addEventListener("click", () => {
  container.classList.add("right-panel-active");
  document.title = "Signup";
  updateURL("signup");
});

signInButton.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
  document.title = "Signin";
  updateURL("signin");
});

const form = document.getElementById("signup-form");
const email = document.getElementById("email");
const password = document.getElementById("password");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);

  const response = await fetch("/signup", {
    method: "POST",
    body: formData,
  });

  const responseData = await response.json();
  if (responseData.result) {
    window.location.href = "/";
  } else {
    if (responseData.type == "email") {
      emailError.textContent = responseData.error;
      email.focus();
    } else {
      passwordError.textContent = responseData.error;
      password.focus();
    }
  }
});
email.addEventListener("input", () => {
  emailError.textContent = "";
});

password.addEventListener("input", () => {
  passwordError.textContent = "";
});

const forms = document.getElementById("signin-form");
const emails = document.getElementById("emails");
const passwords = document.getElementById("passwords");
const emailsError = document.getElementById("emails-error");
const passwordsError = document.getElementById("passwords-error");

forms.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(forms);

  const response = await fetch("/signin", {
    method: "POST",
    body: formData,
  });

  const responseData = await response.json();
  if (responseData.result) {
    window.location.href = "/";
  } else {
    if (responseData.type == "email") {
      emailsError.textContent = responseData.error;
      emails.focus();
    } else {
      passwordsError.textContent = responseData.error;
      passwords.focus();
    }
  }
});
emails.addEventListener("input", () => {
  emailsError.textContent = "";
});

passwords.addEventListener("input", () => {
  passwordsError.textContent = "";
});
