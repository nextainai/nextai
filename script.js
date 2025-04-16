// Particle.js Configuration
particlesJS("particles-js", {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
        move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
    },
    interactivity: {
        detect_on: "canvas",
        events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
        modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
    },
    retina_detect: true
});

const chatContent = document.getElementById("chat-content");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

const chatGPTLogo = "https://i.ibb.co/Z6dDQpwx/ncizgz.jpg";
const userLogo = "https://i.ibb.co/ssQNvBC/67373290.jpg";

// Parse Markdown
function parseMarkdown(text) {
    text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
        const codeWithoutLanguage = code.split('\n').slice(1).join('\n');
        return `<pre class="code-block"><code>${escapeHtml(code)}</code><button class="copy-button" data-code="${encodeURIComponent(codeWithoutLanguage)}"><i class="fa fa-copy"></i></button></pre>`;
    });
    text = text.replace(/`([^`]+)`/g, `<code>${escapeHtml(code)}</code><button class="copy-button-inline" data-code="${encodeURIComponent(code)}"><i class="fa fa-copy"></i></button>`);
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/\n/g, '<br/>');
    return text;
}

// Escape HTML
function escapeHtml(text) {
    return text.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, "\"").replace(/'/g, "'");
}

// Copy to Clipboard
function copyToClipboard(text, button) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    const icon = button.querySelector('i');
    icon.classList.remove('fa-copy');
    icon.classList.add('fa-check');
    setTimeout(() => {
        icon.classList.remove('fa-check');
        icon.classList.add('fa-copy');
    }, 1000);
}

// Event Listener for Copy Buttons
document.addEventListener("click", (event) => {
    const button = event.target.closest('.copy-button, .copy-button-inline');
    if (button) {
        const code = decodeURIComponent(button.getAttribute('data-code'));
        copyToClipboard(code, button);
    }
});

// Create Message Element
function createMessageElement(message, fromUser, isLoading = false) {
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message", fromUser ? "user" : "bot");

    const avatar = document.createElement("img");
    avatar.src = fromUser ? userLogo : chatGPTLogo;
    avatar.alt = fromUser ? "User" : "ChatGPT";
    avatar.classList.add("avatar");

    const bubble = document.createElement("div");
    if (isLoading) {
        bubble.classList.add("loading");
        bubble.innerHTML = `<div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
    } else {
        bubble.classList.add("bubble");
        bubble.innerHTML = parseMarkdown(message);
    }

    messageWrapper.appendChild(fromUser ? bubble : avatar);
    messageWrapper.appendChild(fromUser ? avatar : bubble);

    return messageWrapper;
}

// Fetch Response from API
async function fetchResponse(userMessage) {
    try {
        const response = await fetch("https://backend.buildpicoapps.com/aero/run/llm-api?pk=v1-Z0FBQUFBQm5IZkJDMlNyYUVUTjIyZVN3UWFNX3BFTU85SWpCM2NUMUk3T2dxejhLSzBhNWNMMXNzZlp3c09BSTR6YW1Sc1BmdGNTVk1GY0liT1RoWDZZX1lNZlZ0Z1dqd3c9PQ==", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: userMessage })
        });

        if (!response.ok) throw new Error('Failed to fetch response');
        const data = await response.json();
        if (data.status === "success") return data.text;
        throw new Error('Error in response data');
    } catch (error) {
        console.error("Error:", error);
        return "There was an error. Please try again later.";
    }
}

// Handle Form Submission
chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    // Display User Message
    chatContent.appendChild(createMessageElement(userMessage, true));
    userInput.value = "";
    autoScroll();

    // Show Loading Animation
    const loadingMessage = createMessageElement("", false, true);
    chatContent.appendChild(loadingMessage);
    autoScroll();

    // Fetch and Display Bot Response
    const botResponse = await fetchResponse(userMessage);
    chatContent.removeChild(loadingMessage);
    chatContent.appendChild(createMessageElement(botResponse, false));
    autoScroll();
});

// Auto-Scroll Function
function autoScroll() {
    chatContent.scrollTo({ top: chatContent.scrollHeight, behavior: 'smooth' });
}

// Initial Welcome Message
window.addEventListener('load', () => {
    setTimeout(() => {
        const welcomeMessage = createMessageElement("How can I help you today?", false);
        chatContent.appendChild(welcomeMessage);
        autoScroll();
    }, 100);
});
