import defPhoto from './defaultPhoto.js';

const input = document.querySelector(".input");
const form = document.querySelector("form");
const chatContainer = document.querySelector(".chat-container");
const async = document.querySelector('[data-name="async"]');
const user = document.querySelector(".user-name");
const upload = document.querySelector('.inputfile');
const submit = document.querySelector('.submit');
const label = document.querySelector('label');
const box = document.querySelector('.box');
const regForm = document.querySelector('.register-form');
let avatar;
var uluru = {};
let ws = new WebSocket("wss://venify.herokuapp.com/chat");
var map;
const googleMap = document.querySelector('#map');


if (!localStorage.getItem("settings")) {
  removeDisplayNone([user]);
  addDisplayNone([googleMap,chatContainer, form, upload]);
} else {
  regForm.remove();
}

navigator.geolocation.getCurrentPosition(position => {
  uluru.lat = Number(position.coords.latitude);
  uluru.lng = Number(position.coords.longitude);
});

setTimeout(
  (async.onload = async () => {
    map = await new google.maps.Map(document.getElementById("map"), {
      zoom: 4,
      center: uluru
    });
  }),
  500
);

ws.onmessage = ({ data }) => {
  const message = JSON.parse(data);

  if (message.image === undefined) {
    message.image = defPhoto;
  } 
  createElements(message);
  console.log(message);
  const cords = message.cords;
  let marker = new google.maps.Marker({ position: cords, map: map });
};

form.addEventListener("submit", handleFormSubmit);
input.addEventListener("keypress", handleEnterPressSubmit);
upload.addEventListener("change", handleImageLoad);
regForm.addEventListener('submit', handleRegFormSubmit);



function handleRegFormSubmit(e){
e.preventDefault();
removeDisplayNone([googleMap,chatContainer, form]);
localStorage.setItem(
  "settings",
  JSON.stringify({
    name: user.value,
    image: avatar
}));
regForm.remove();
}

function handleEnterPressSubmit(e){
if(e.which === 13 && !e.shiftKey){
    return handleFormSubmit(e);
 }
}

function handleFormSubmit(e) {
  e.preventDefault();
  if(input.value === ''){
    return;
  }
  if (localStorage.getItem("settings")) {
    const { name, image } = JSON.parse(localStorage.getItem("settings"));
    user.value = name;
    avatar = image;
  }
  ws.send(
    JSON.stringify({
      name: user.value,
      message: input.value,
      cords: uluru,
      image: avatar
    })
  );
  input.value = "";
}

function createElements(data) {
  const messageContainer = document.createElement("div");
  const messageBubble = document.createElement('div');
  const chatMessage = document.createElement("p");
  const msgInfo = document.createElement('div');
  const userName = document.createElement("p");
  const time = document.createElement("p");
  const photo = document.createElement("img");
  photo.src = data.image;
  handleImageLoad();
  createTime(time);
  contentAddind(userName, chatMessage, data, messageContainer);
  classAdding(messageContainer, chatMessage, userName, time, photo, messageBubble, msgInfo);
  addElements(chatMessage, time, messageContainer, userName, photo, messageBubble, msgInfo);
}

function createTime(time) {
  let today = new Date();
  let h = pad(today.getHours());
  let m = pad(today.getMinutes());
  let s = pad(today.getSeconds());
  time.textContent = `${h}:${m}:${s}`;
}

function classAdding(messageContainer, chatMessage, userName, time, img, messageBubble, msgInfo) {
  messageContainer.classList.add("msg");
  messageBubble.classList.add('msg-bubble');
  msgInfo.classList.add('msg-info');
  chatMessage.classList.add('msg-text');
  userName.classList.add("msg-info-name");
  time.classList.add("msg-info-time");
  img.classList.add("msg-img");
}

function contentAddind(userName, chatMessage, data, messageContainer) {
  userName.textContent = `${data.name}:`;
  chatMessage.textContent = data.message;
  if(JSON.parse(localStorage.getItem('settings')).name === `${data.name}`){
    messageContainer.classList.add('right-msg');
  }
}

function addElements(chatMessage, time, messageContainer, userName, img, messageBubble, msgInfo) {
  msgInfo.append(userName, time)
  messageBubble.append(msgInfo, chatMessage);
  messageContainer.append(img, messageBubble);
  chatContainer.append(messageContainer);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function handleImageLoad() {
  const FR = new FileReader();
  if (upload.files && upload.files[0]) {
    console.log(upload.files);
    FR.addEventListener("load", function(e) {
      avatar = e.target.result;
      console.log(e.target.result);
      console.log(avatar);
    });
    FR.readAsDataURL(upload.files[0]);
  }
}

function addDisplayNone(args){
Array.from(args).forEach(arg=>{
arg.classList.add('none');
})}

function removeDisplayNone(args){
Array.from(args).forEach(arg=>{
 arg.classList.remove('none');
  })
}
