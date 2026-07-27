// ===============================
// AI Rural Health Assistant Chatbot
// ===============================

const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});

function sendMessage() {

    const message = userInput.value.trim();

    if (message === "") return;

    addMessage(message, "user");

    userInput.value = "";

    setTimeout(() => {

        const reply = getBotResponse(message.toLowerCase());

        addMessage(reply, "bot");

    }, 600);

}

function addMessage(text, sender) {

    const messageDiv = document.createElement("div");

    messageDiv.className = sender + "-message";

    messageDiv.innerHTML = text;

    chatMessages.appendChild(messageDiv);

    chatMessages.scrollTop = chatMessages.scrollHeight;

}

function getBotResponse(message) {

    // ----------------------
    // Fever
    // ----------------------
    if (message.includes("fever") || message.includes("காய்ச்சல்")) {

        return `
        🌡️ <b>Possible Condition</b><br>
        Fever or Viral Infection.<br><br>

        🩹 <b>First Aid</b><br>
        ✔ Drink plenty of water.<br>
        ✔ Take adequate rest.<br>
        ✔ Use Paracetamol if prescribed.<br><br>

        🟡 <b>Recommendation</b><br>
        Visit a doctor if fever lasts more than 2 days.
        `;
    }

    // ----------------------
    // Headache
    // ----------------------
    if (message.includes("headache") || message.includes("தலைவலி")) {

        return `
        🤕 <b>Possible Condition</b><br>
        Stress, Migraine or Dehydration.<br><br>

        ✔ Drink water.<br>
        ✔ Rest in a quiet room.<br>
        ✔ Avoid mobile screens.<br><br>

        🟢 Self Care is recommended.
        `;
    }

    // ----------------------
    // Cold
    // ----------------------
    if (message.includes("cold") || message.includes("சளி")) {

        return `
        🤧 <b>Common Cold</b><br><br>

        ✔ Drink warm water.<br>
        ✔ Take steam inhalation.<br>
        ✔ Get enough sleep.<br><br>

        🟢 Usually improves within a few days.
        `;
    }

    // ----------------------
    // Cough
    // ----------------------
    if (message.includes("cough") || message.includes("இருமல்")) {

        return `
        😷 <b>Cough</b><br><br>

        ✔ Drink warm fluids.<br>
        ✔ Avoid cold drinks.<br>
        ✔ Gargle with warm salt water.<br><br>

        🟡 Visit a doctor if cough continues for more than a week.
        `;
    }

    // ----------------------
    // Stomach Pain
    // ----------------------
    if (message.includes("stomach") ||
        message.includes("abdomen") ||
        message.includes("வயிறு")) {

        return `
        🤢 <b>Stomach Pain</b><br><br>

        ✔ Drink clean water.<br>
        ✔ Eat light food.<br>
        ✔ Avoid oily foods.<br><br>

        🟡 Visit a clinic if pain becomes severe.
        `;
    }

    // ----------------------
    // Burns
    // ----------------------
    if (message.includes("burn") || message.includes("தீக்காயம்")) {

        return `
        🔥 <b>Burn Injury</b><br><br>

        ✔ Cool under running water for 20 minutes.<br>
        ✔ Do NOT apply toothpaste or oil.<br>
        ✔ Cover with a clean cloth.<br><br>

        🔴 Visit the hospital immediately for severe burns.
        `;
    }

    // ----------------------
    // Snake Bite
    // ----------------------
    if (message.includes("snake") || message.includes("பாம்பு")) {

        return `
        🐍 <b>Snake Bite</b><br><br>

        ✔ Keep the patient calm.<br>
        ✔ Do NOT cut the wound.<br>
        ✔ Do NOT suck the venom.<br>
        ✔ Immobilize the affected limb.<br><br>

        🔴 Call 108 immediately.
        `;
    }

    // ----------------------
    // Heat Stroke
    // ----------------------
    if (message.includes("heat") || message.includes("வெயில்")) {

        return `
        ☀️ <b>Heat Stroke</b><br><br>

        ✔ Move to a cool place.<br>
        ✔ Drink ORS or water.<br>
        ✔ Cool the body using wet cloth.<br><br>

        🔴 Seek emergency care if unconscious.
        `;
    }

    // ----------------------
    // Greetings
    // ----------------------
    if (
        message.includes("hello") ||
        message.includes("hi") ||
        message.includes("வணக்கம்")
    ) {

        return `
        👋 Hello!

        I am your AI Rural Health Assistant.

        You can ask me about:

        🌡 Fever
        🤧 Cold
        🤕 Headache
        😷 Cough
        🤢 Stomach Pain
        🔥 Burns
        🐍 Snake Bite
        ☀ Heat Stroke
        `;
    }

    // ----------------------
    // Default Response
    // ----------------------

    return `
    🤖 Sorry, I couldn't understand your symptoms.

    Please describe clearly.

    Example:

    • I have fever
    • I have headache
    • எனக்கு காய்ச்சல்
    • எனக்கு தலைவலி
    `;
}
