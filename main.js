const input = document.querySelector(".input");
const form = document.querySelector("form");
const chatContainer = document.querySelector(".chat-container");
const async = document.querySelector('[data-name="async"]');
const user = document.querySelector(".user-name");
const upload = document.querySelector('input[type="file"]');
let avatar;
var uluru = {};
let ws = new WebSocket("wss://venify.herokuapp.com/chat");
var map;

if (!localStorage.getItem("settings")) {
  user.classList.remove("none");
  upload.classList.remove("none");
} else {
  user.classList.add("none");
  upload.classList.add("none");
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
  createElements(JSON.parse(data));
  console.log(JSON.parse(data));
  const cords = JSON.parse(data).cords;
  marker = new google.maps.Marker({ position: cords, map: map });
};

form.addEventListener("submit", handleFormSubmit);
upload.addEventListener("change", handleImageLoad);

function handleFormSubmit(e) {
  e.preventDefault();
  if (input.value === "") {
    alert("You can`t send empty message");
    return;
  }
  user.classList.add("none");
  upload.classList.add("none");

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
  localStorage.setItem(
    "settings",
    JSON.stringify({
      name: user.value,
      image: avatar
    })
  );
  input.value = "";
}

function createElements(data) {
  const messageContainer = document.createElement("div");
  const chatMessage = document.createElement("div");
  const userName = document.createElement("div");
  const time = document.createElement("p");
  const photo = document.createElement("img");
  photo.src = data.image;
  createTime(time);
  contentAddind(userName, chatMessage, data);
  classAdding(messageContainer, chatMessage, userName, time, photo);
  addElements(chatMessage, time, messageContainer, userName, photo);
  handleImageLoad();
}

function createTime(time) {
  let today = new Date();
  let h = pad(today.getHours());
  let m = pad(today.getMinutes());
  let s = pad(today.getSeconds());
  time.textContent = `${h}:${m}:${s}`;
}

function classAdding(messageContainer, chatMessage, userName, time, img) {
  messageContainer.classList.add("message-container");
  chatMessage.classList.add("chat-message");
  userName.classList.add("name-of-user");
  time.classList.add("time");
  img.classList.add("photo");
}

function contentAddind(userName, chatMessage, data) {
  userName.textContent = `${data.name}:`;
  chatMessage.textContent = data.message;
}

function addElements(chatMessage, time, messageContainer, userName, img) {
  messageContainer.append(userName, chatMessage, time, img);
  chatContainer.append(messageContainer);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function handleImageLoad() {
  const FR = new FileReader();
  if (upload.files && upload.files[0]) {
    FR.addEventListener("load", function(e) {
      avatar = e.target.result;
    });
    FR.readAsDataURL(upload.files[0]);
  }
}
