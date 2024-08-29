const typingform = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const toggleThemebutton = document.querySelector("#toggle-theme-button")
const suggestions =document.querySelectorAll(".suggestion-list .suggestion");
const deleteChatbutton =document.querySelector("#delete-chat-button")

let userMessage = null;


const API_KEY ="AIzaSyCxUSmo-cDVzr0RuFgjzuorcLqRBgz3pEU"
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;
;

const loadLocalstorageData =()=>{
    const savedChats =localStorage.getItem("savedChats")
    chatList.innerHTML =savedChats || "";
}
loadLocalstorageData();

const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const showtypingEffect =(text ,textElement)=>{
    const words = text.split('');
    let currentwordIndex =0;

    const typingInterval = setInterval(()=>{
        textElement.innerText += (currentwordIndex === 0 ? '' : '')+ words[currentwordIndex++];
        if(currentwordIndex === words.length){
            clearInterval(typingInterval);
            localStorage.setItem("savedChats", chatList.innerHTML);
        }
    },75);

}

const generateAPIResponse = async (incomingMessagesDiv) => {
    const textElement =incomingMessagesDiv.querySelector(".text");
  try{
    const response =await fetch(API_URL,{
        method:"POST", headers : {"Content-Type": "application/json"},body :JSON.stringify({
            contents: [{ role:"user",  parts:[{text :userMessage}] }]
        })
    });

    const data = await response.json();

    const apiResponse = data?.candidates[0].content.parts[0].text;
   showtypingEffect(apiResponse,textElement);


    const loadingElement = document.querySelector(".loading");
    if(loadingElement){
        loadingElement.querySelector(".text").innerText =apiResponse;
        loadingElement.classList.remove("loading");
    }

  }catch(error){
    console.log("Error:",error);
  }finally{
    incomingMessagesDiv.classList.remove(".loading");
  }
};


const showLoadingAnimation = () => {
  const html = `<div class="message-content">
    <img src="images/gemini.svg" alt="GEMINI image" class="avatar"/>
    <p class="text"></p>
                <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                </div>  
            </div>
      <span onclick ="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

  const incomingMessagesDiv = createMessageElement(html, "incoming", "loading");
  chatList.appendChild(incomingMessagesDiv);

  generateAPIResponse(incomingMessagesDiv);
}
const copyMessage =(copyIcon)=>{
    const messageText = copyIcon.parentElement.querySelector(".text").innerText
    navigator.clipboard.writeText(messageText);
    copyIcon.innerText ="done";
    setTimeout(() => copyIcon.innerText ="content_copy",1000)
}

const handleOutgoingChat = () => {
  userMessage = typingform.querySelector(".typing-input").value.trim() || userMessage;
  if (!userMessage) return;

  const html = `<div class="message-content">
    <img src="images/user.jpg" alt="User image" class="avatar"/>
    <p class="text">Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe, quidem!</p>
</div>`;

  const outgoingMessagesDiv = createMessageElement(html, "outgoing");
  outgoingMessagesDiv.querySelector(".text").innerText = userMessage;
  chatList.appendChild(outgoingMessagesDiv);
  typingform.querySelector(".typing-input").value='';
  typingform.querySelector(".typing-input").blur();

//   typingform.requestFullscreen();
  setTimeout(showLoadingAnimation, 500);
};
suggestions.forEach(suggestions =>{
  suggestions.addEventListener("click",()=>{
    userMessage =suggestions.querySelector(".text").innerText;
    handleOutgoingChat();
  });
})

toggleThemebutton.addEventListener("click",()=>{
    document.body.classList.toggle("light_mode");
});


deleteChatbutton.addEventListener("click",()=>{
    if(confirm("Are you sure you want to delete all messages?")){
        localStorage.removeItem("savedChats")
        loadLocalstorageData();
    }
})
typingform.addEventListener("submit", (e) => {
  e.preventDefault();

  handleOutgoingChat();
});
