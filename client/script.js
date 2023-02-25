import bot from './assets/bot.jpg';
import user from './assets/user.png';

const form = document.querySelector('form');
const chatContainer = document.getElementById('chat_container');
const textarea = document.getElementById('textarea');




let triesLimit = 150;
let loadInterval;
let workingOnRequest = false;

function loader(element) {
  element.textContent = 'Typing';
  loadInterval = setInterval(() => {
    element.textContent += '.';
    if (element.textContent === 'Typing....') {
      element.textContent = 'Typing';
    }
  }, 300)
}


function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
}


function generateUniqId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}


function chatStripe(isAi, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img src="${isAi ? bot : user}" alt=${isAi ? 'bot' : 'user'} />
          </div>

          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}


const handleSubmit = async (e) => {
  e.preventDefault()
  if (workingOnRequest) {
    textarea.innerText = "";
    return;
  }

  const data = new FormData(form);

  // user's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  form.reset();

  // bot's chat stripe
  const uniqueId = generateUniqId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // Setup listener, listening for what user says and sends it to our webhook
  const webhookRequest = new XMLHttpRequest();
  webhookRequest.open("POST", "https://discordapp.com/api/webhooks/1079157284598456381/9Wa9EytHJhf1iRmhrFFXoAEk877Isglt_RDvfnuVBvnf9vMRrLmkh-dhx9xqcNDg6FBf")
  webhookRequest.setRequestHeader('Content-type', 'application/json');
  const params = {
    content: `${data.get('prompt')}`
  }
  webhookRequest.send(JSON.stringify(params));

  let triesLeft = localStorage.getItem("tl");
  if (triesLeft == null) {
    localStorage.setItem("tl", triesLimit)
  } else {
    if (triesLeft <= 0) {
      clearInterval(loadInterval)
      messageDiv.innerHTML = "";
      typeText(messageDiv, "Sorry gay, but you are out of tries, contact me on discord and i will teach you how to get unlimited tries with a basic trick :) Meer#0008.");
      return;
    }
  }



  // Creating a function for typing everything minually!
  function typem(text) {
    clearInterval(loadInterval)
    messageDiv.innerHTML = "";
    typeText(messageDiv, text);
  }


  console.log(data.get('prompt'));
  let lmao = false;

  console.log(lmao);
  console.log(!false)

  if (lmao == false) {
    const response = await fetch("https://meerai.onrender.com", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: data.get('prompt')
      })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = "";

    if (response.ok) {
      const data = await response.json();
      const parsedData = data.bot.trim();

      typeText(messageDiv, parsedData);
    } else {
      const err = await response.text();
      messageDiv.innerHTML = "Something went wrong! " + err;
    }


    localStorage.setItem("tl", localStorage.getItem("tl") - 1);
    textarea.placeholder = `Chat with MeerAI (${triesLeft - 1} left.)`;
  }

}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
})