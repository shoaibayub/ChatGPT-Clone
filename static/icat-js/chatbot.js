const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");
const micButton = document.querySelector("#mic-btn");
const recognition = new webkitSpeechRecognition();

let image = null;
let userText = null;

isRequestInProgress = false;

const loadDataFromLocalstorage = () => {
  // Load saved chats and theme from local storage and apply/add on the page
  const themeColor = localStorage.getItem("themeColor");

  document.body.classList.toggle("light-mode", themeColor === "light_mode");
  themeButton.innerText = document.body.classList.contains("light-mode")
    ? "dark_mode"
    : "light_mode";

  const defaultText = `<div class="default-text">
                            <h1>ChatGPT Clone</h1>
                            <p>Start a conversation and explore the power of AI.<br> Your chat history will be displayed here.</p>
                        </div>`;

  chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to bottom of the chat container
};

const createChatElement = (content, className) => {
  // Create new div and apply chat, specified class and set html content of div
  const chatDiv = document.createElement("div");
  chatDiv.classList.add("chat", className);
  chatDiv.innerHTML = content;
  return chatDiv; // Return the created chat div
};

async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

const getChatResponse = async (incomingChatDiv) => {
  // const API_URL = "https://api.openai.com/v1/chat/completions";
  const pElement = document.createElement("p");
  if (isRequestInProgress) {
    setTimeout(() => getChatResponse(incomingChatDiv), 1000); // Wait for 1 second and retry
    return;
  }

  // Send POST request to API, get response and set the reponse as paragraph element text
  try {
    // const response = await (await fetch(API_URL, requestOptions)).json();
    let result = await postData("/chatbot", { question: userText });
    const text = result.answer;
    console.log(text);
    // pElement.textContent = text;
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        pElement.textContent += text.charAt(index);
        chatContainer.scrollTo(0, chatContainer.scrollHeight);
        index++;
      } else {
        localStorage.setItem("all-chats", chatContainer.innerHTML);
        clearInterval(interval); // Stop the interval when the response is fully displayed
      }
    }, 50);
  } catch (error) {
    pElement.classList.add("error");
    pElement.textContent =
      "Oops! Something went wrong while retrieving the response. Please try again.";
  }

  // Remove the typing animation, append the paragraph element and save the chats to local storage
  incomingChatDiv.querySelector(".typing-animation").remove();
  incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
  localStorage.setItem("all-chats", chatContainer.innerHTML);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const copyResponse = (copyBtn) => {
  // Copy the text content of the response to the clipboard
  const reponseTextElement = copyBtn.parentElement.querySelector("p");
  navigator.clipboard.writeText(reponseTextElement.textContent);
  copyBtn.textContent = "done";
  setTimeout(() => (copyBtn.textContent = "content_copy"), 1000);
};

const showTypingAnimation = () => {
  // Display the typing animation and call the getChatResponse function
  const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="http://localhost:5000/static/images/chatbot-removebg-preview.png" alt="chatbot-img">
                        <div class="typing-animation">
                        <div class="typing-dot" style="--delay: 0.2s"></div>
                        <div class="typing-dot" style="--delay: 0.3s"></div>
                        <div class="typing-dot" style="--delay: 0.4s"></div>
                    </div>
                </div>
                <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
            </div>`;
  // Create an incoming chat div with typing animation and append it to chat container
  const incomingChatDiv = createChatElement(html, "incoming");
  chatContainer.appendChild(incomingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  getChatResponse(incomingChatDiv);
};

async function getImage() {
  try {
    const response = await fetch("/image", {
      method: "GET", // Use "GET" to retrieve the image URL
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    const userImage = data.image;

    return userImage; // Return the image URL
  } catch (error) {
    console.error("Error:", error);
    throw error; // Rethrow the error for handling at the calling site if needed
  }
}

const handleOutgoingChat = async () => {
  userText = chatInput.value.trim(); // Get chatInput value and remove extra spaces
  if (!userText) return; // If chatInput is empty return from here
  if (isRequestInProgress) {
    return;
  }
  // Clear the input field and reset its height
  chatInput.value = "";
  chatInput.style.height = `${initialInputHeight}px`;

  let image = await getImage();

  const html = `<div class="chat-content">
                <div class="chat-details"> 
                    <img src="${image}" alt="user-img">
                    <p>${userText}</p>
                </div>
            </div>`;

  // Create an outgoing chat div with user's message and append it to chat container
  const outgoingChatDiv = createChatElement(html, "outgoing");
  chatContainer.querySelector(".default-text")?.remove();
  chatContainer.appendChild(outgoingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  // setTimeout(showTypingAnimation, 500);
  showTypingAnimation();
};

deleteButton.addEventListener("click", () => {
  // Remove the chats from local storage and call loadDataFromLocalstorage function
  if (confirm("Are you sure you want to delete all the chats?")) {
    localStorage.removeItem("all-chats");
    loadDataFromLocalstorage();
  }
});

themeButton.addEventListener("click", () => {
  // Toggle body's class for the theme mode and save the updated theme to the local storage
  document.body.classList.toggle("light-mode");
  localStorage.setItem("themeColor", themeButton.innerText);
  themeButton.innerText = document.body.classList.contains("light-mode")
    ? "dark_mode"
    : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
  // Adjust the height of the input field dynamically based on its content
  chatInput.style.height = `${initialInputHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  // If the Enter key is pressed without Shift and the window width is larger
  // than 800 pixels, handle the outgoing chat
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleOutgoingChat();
  }
});
recognition.lang = "en-US";
const activeLanguageElement = document.getElementById("active-language");

micButton.addEventListener("click", () => {
  // const supportedLanguages = ["en-US", "es-ES", "fr-FR", "ur-PK"];

  if (!recognition.continuous) {
    recognition.start();
    micButton.classList.add("listening");
  } else {
    recognition.stop();
    micButton.classList.remove("listening");
  }
});

recognition.onresult = function (event) {
  const speechToText = event.results[0][0].transcript;
  chatInput.value = speechToText;
  handleOutgoingChat();
};
recognition.onend = function () {
  micButton.classList.remove("listening");
};
activeLanguageElement.addEventListener("click", (e) => {
  e.preventDefault();
  toggleRecognitionLanguage();
});

function toggleRecognitionLanguage() {
  // Get the current language code
  const currentLangCode = recognition.lang;

  // Find the next supported language in your list (you can expand the list)
  const supportedLanguages = ["en-US", "ur-PK"];
  const currentLangIndex = supportedLanguages.indexOf(currentLangCode);
  const nextLangIndex = (currentLangIndex + 1) % supportedLanguages.length;
  const nextLangCode = supportedLanguages[nextLangIndex];

  // Update the recognition language
  recognition.lang = nextLangCode;
  activeLanguageElement.textContent = `${getLanguageName(nextLangCode)}`;
  console.log(`Switched to ${nextLangCode} language`);
}

function getLanguageName(langCode) {
  switch (langCode) {
    case "en-US":
      return "en";
    case "ur-PK":
      return "ur";
    default:
      return "Unknown";
  }
}

loadDataFromLocalstorage();
// sendButton.addEventListener("click", getChatResponse);
sendButton.addEventListener("click", handleOutgoingChat);
