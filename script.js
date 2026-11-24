async function showIsLive() {
    const NAME_TO_CHECK = "Paul from CA"
    try {
        const response = await fetch('https://public.radio.co/stations/s369d6f962/status');
        if (!response.ok) return false;

        const { source } = await response.json();
        // console.log(source?.collaborator?.name)
        return source?.collaborator?.name == NAME_TO_CHECK || false;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}


function handleInputChange(){
    var inputText = document.getElementById('tlemail').value;
    var button = document.getElementById('myButton');

    // Check if the input has any text
    if (inputText.trim() !== '') {
        button.style.opacity = 1; // Set opacity to 100%
    } else {
        button.style.opacity = 0.5; // Set opacity to 50%
    }
}

function joinNewsletter(){
    var inputText = document.getElementById('tlemail').value;
    
    // check that input text is valid email
    if (inputText.trim() !== '' && validateEmail(inputText)) {
        alert('Thank you for joining our newsletter!');
    } else {
        alert('Please enter a valid email address');
    }
}

function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}





async function getGistTextContent(gistId){
    const data = await fetch("https://api.github.com/gists/" + gistId)
    return Object.values((await data.json()).files)[0].content
}

// var gist_id = "53e1780a5a68fe9281cfbbc9820d381f"
// (async () => console.log(await getGistTextContent("53e1780a5a68fe9281cfbbc9820d381f")))();



const SONG_REQUEST_ENDPOINT = "https://groovyrecordshow-song-requests.groovyrecordshow.workers.dev/song-request";

async function sendContact(ev) {
    ev.preventDefault();

    const form = ev.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');
    const runCount = parseInt(getCookie("runCount"), 10) || 0;
    const senderName = document.getElementById("nameInput").value.trim();
    const songRequest = document.getElementById("messageInput").value.trim();
    const honeypot = document.getElementById("website").value.trim();

    if (runCount >= 2) {
        alert("You have already sent two requests. Please try again later.");
        return;
    }

    if (!songRequest) {
        alert("Please enter a song request before submitting.");
        return;
    }

    if (SONG_REQUEST_ENDPOINT.includes("YOUR-WORKER-SUBDOMAIN")) {
        alert("Song requests are being set up. Please try again later.");
        return;
    }

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending…";
    }

    try {
        const response = await fetch(SONG_REQUEST_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: senderName, song: songRequest, website: honeypot })
        });

        if (!response.ok) {
            throw new Error("The request could not be delivered.");
        }

        alert("Song request sent successfully!");
        setCookie("runCount", runCount + 1, 10);
        document.getElementById("nameInput").value = "";
        document.getElementById("messageInput").value = "";
    } catch (error) {
        console.error("Song request could not be sent.");
        alert("Sorry, your request could not be sent. Please try again later.");
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Submit";
        }
    }
}


// helper cookie storage functions to stop song request spam

  function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return cookieValue;
      }
    }
    return null;
  }
  
  // Function to set a cookie with a given name, value, and expiration time in minutes
  function setCookie(name, value, minutes) {
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + minutes * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expirationDate.toUTCString()};path=/`;
  }

  document.addEventListener('DOMContentLoaded', function() {

  var iframe = document.getElementById('myIframe');
  iframe.addEventListener('load', function() {
    iframe.classList.add('loaded');
  });
});