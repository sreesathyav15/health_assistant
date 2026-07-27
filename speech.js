// ==========================================
// AI Rural Health Assistant
// Speech Recognition + Text To Speech
// ==========================================

// Browser Support
const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

// Create Recognition Object
const recognition = new SpeechRecognition();

// Continuous listening OFF
recognition.continuous = false;

// Return only final result
recognition.interimResults = false;

// Default Language
recognition.lang = "en-IN";

// ============================
// Start Voice Recognition
// ============================

function startListening() {

    const savedLanguage = localStorage.getItem("language") || "en";

    if (savedLanguage === "ta") {

        recognition.lang = "ta-IN";

    } else {

        recognition.lang = "en-IN";

    }

    recognition.start();

}

// ============================
// Speech Result
// ============================

recognition.onresult = function(event) {

    const transcript = event.results[0][0].transcript;

    const input = document.getElementById("userInput");

    input.value = transcript;

};

// ============================
// Recognition Started
// ============================

recognition.onstart = function() {

    console.log("🎤 Listening...");

};

// ============================
// Recognition Ended
// ============================

recognition.onend = function() {

    console.log("Microphone Stopped");

};

// ============================
// Recognition Error
// ============================

recognition.onerror = function(event) {

    alert("Microphone Error : " + event.error);

};

// ===================================
// Text To Speech
// ===================================

function speak(text) {

    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance();

    speech.text = text;

    const lang = localStorage.getItem("language") || "en";

    if (lang === "ta") {

        speech.lang = "ta-IN";

    } else {

        speech.lang = "en-IN";

    }

    speech.rate = 1;

    speech.pitch = 1;

    speech.volume = 1;

    speechSynthesis.speak(speech);

}

// ===================================
// Stop Speaking
// ===================================

function stopSpeaking() {

    speechSynthesis.cancel();

}
