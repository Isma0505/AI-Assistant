/* ==========================================================================
   AI Assistant Studio - Main Logic (Vanilla JS)
   ========================================================================== */

// State Management
let currentUser = '';
let apiKey = '';
let activePresetId = 'general';
let conversationHistory = [];
let abortController = null;
let isGenerating = false;

// Preset Configurations
const PRESETS = {
    general: {
        id: 'general',
        title: 'Asisten Umum',
        icon: 'fa-robot',
        instruction: 'Anda adalah AI Assistant yang cerdas, ramah, dan siap membantu menjawab berbagai pertanyaan dengan jelas.',
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.95,
        prompts: [
            'Jelaskan konsep dasar Quantum Computing secara sederhana.',
            'Berikan ide resep sarapan sehat yang cepat dibuat.',
            'Tulis email profesional meminta maaf atas keterlambatan pengiriman proyek.'
        ]
    },
    coding: {
        id: 'coding',
        title: 'Pakar Coding / IT',
        icon: 'fa-code',
        instruction: 'Anda adalah pakar pemrograman senior. Tulis kode yang efisien, aman, bersih, dan berikan penjelasan singkat tentang cara kerja kode tersebut. Gunakan format markdown dengan baik.',
        temperature: 0.2,
        maxTokens: 4096,
        topP: 0.9,
        prompts: [
            'Buat fungsi JavaScript untuk memvalidasi alamat email.',
            'Bagaimana cara melakukan fetch API dengan async/await di JS?',
            'Jelaskan perbedaan antara SQL dan NoSQL beserta contoh usecase-nya.'
        ]
    },
    writer: {
        id: 'writer',
        title: 'Penerjemah & Bahasa',
        icon: 'fa-language',
        instruction: 'Anda adalah asisten penerjemah dan penulis profesional. Bantu pengguna menerjemahkan teks, memperbaiki tata bahasa (grammar/ejaan), atau menulis artikel yang menarik.',
        temperature: 0.8,
        maxTokens: 2048,
        topP: 0.95,
        prompts: [
            "Terjemahkan paragraf ini ke bahasa Inggris: 'Hari ini saya belajar banyak hal baru tentang kecerdasan buatan.'",
            'Tulis sebuah puisi singkat tentang keindahan alam di pagi hari.',
            "Bantu saya memperbaiki tata bahasa dari kalimat: 'saya kemarin pergi ke pasar beli ikan segar'."
        ]
    },
    analyst: {
        id: 'analyst',
        title: 'Analisis Data & Riset',
        icon: 'fa-chart-simple',
        instruction: 'Anda adalah analis data dan peneliti yang sangat analitis. Berikan jawaban terstruktur dengan data pendukung, poin-poin penting, dan kesimpulan yang logis.',
        temperature: 0.3,
        maxTokens: 4096,
        topP: 0.95,
        prompts: [
            'Bagaimana tren kecerdasan buatan (AI) memengaruhi lapangan pekerjaan di masa depan?',
            'Jelaskan metode analisis SWOT dan berikan contoh penerapannya.',
            'Buat outline laporan penelitian tentang dampak media sosial pada remaja.'
        ]
    }
};

// Mock Responses for Demo Mode (activated if key is 'demo')
const MOCK_RESPONSES = {
    general: [
        "Itu pertanyaan menarik! Dalam **Demo Mode** ini, saya hanya menyimulasikan respons. Silakan masukkan **API Key Gemini** Anda yang asli di sidebar kiri untuk terhubung langsung dengan AI asli.",
        "Halo! Saya berjalan dalam Demo Mode saat ini karena Anda memasukkan kunci 'demo'. Anda dapat memasukkan API Key Gemini asli agar saya bisa memberikan jawaban asli menggunakan model Gemini terbaru.",
        "Terima kasih atas pesan Anda. Sebagai asisten simulasi, saya merekomendasikan Anda untuk memasukkan API Key asli Anda agar kita bisa mendiskusikan topik ini secara mendalam dengan kemampuan AI Gemini yang sesungguhnya."
    ],
    coding: [
        "```javascript\n// Ini adalah contoh kode simulasi di Demo Mode\nfunction haloDunia() {\n    console.log(\"Halo Dunia! Silakan masukkan API Key Gemini Anda.\");\n}\nhaloDunia();\n```",
        "Untuk menulis kode riil dan menyelesaikan problem pemrograman Anda, silakan hubungkan aplikasi ini dengan API Key Gemini Anda yang asli di sidebar sebelah kiri.",
        "```html\n<!-- Masukkan API Key di sidebar untuk mengaktifkan AI coding -->\n<div class=\"api-key-needed\">\n    <p>Hubungkan API Key untuk memulai coding dengan Gemini!</p>\n</div>\n```"
    ],
    writer: [
        "Teks simulasi: Dalam Demo Mode, saya hanya bisa memberikan contoh tulisan ini. Masukkan API Key Gemini Anda di panel pengaturan untuk mengaktifkan kemampuan menulis kreatif dan menerjemahkan bahasa secara akurat.",
        "*\"Pagi hari yang cerah membawa inspirasi baru...\"*\n\nItu adalah cuplikan puisi singkat. Masukkan API Key asli Anda di sidebar untuk membuat teks/puisi yang lengkap!",
        "Silakan masukkan API Key asli Anda di panel kiri untuk menggunakan fitur penerjemah bahasa secara real-time dari model Gemini 2.5."
    ],
    analyst: [
        "Analisis data membutuhkan model Gemini asli. Silakan masukkan API Key Anda di panel kiri.\n\nBerikut kerangka analisis standar:\n1. Pengumpulan Data\n2. Pembersihan Data\n3. Analisis Deskriptif\n4. Kesimpulan dan Rekomendasi",
        "Berdasarkan simulasi, data menunjukkan bahwa Anda perlu memasukkan API Key Gemini untuk melanjutkan analisis yang mendalam menggunakan kecerdasan buatan.",
        "SWOT Analysis membutuhkan input data yang lengkap dan model AI yang aktif. Aktifkan dengan menempelkan API Key di sidebar."
    ]
};

// DOM Elements
const apiKeyGate = document.getElementById('api-key-gate');
const apiKeyGateInput = document.getElementById('api-key-gate-input');
const apiKeyGateSubmit = document.getElementById('api-key-gate-submit');
const apiKeyInput = document.getElementById('api-key-input');
const toggleApiKeyBtn = document.getElementById('toggle-api-key');
const modelSelect = document.getElementById('model-select');
const tempSlider = document.getElementById('temp-slider');
const tempVal = document.getElementById('temp-val');
const tokensSlider = document.getElementById('tokens-slider');
const tokensVal = document.getElementById('tokens-val');
const toppSlider = document.getElementById('topp-slider');
const toppVal = document.getElementById('topp-val');
const systemInstructionInput = document.getElementById('system-instruction');
const contextWindowSelect = document.getElementById('context-window-select');
const clearChatBtn = document.getElementById('clear-chat-btn');
const exportTxtBtn = document.getElementById('export-txt-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const chatMessages = document.getElementById('chat-messages');
const chatMessagesWrapper = document.getElementById('chat-messages-wrapper');
const welcomeScreen = document.getElementById('welcome-screen');
const starterPromptsGrid = document.getElementById('starter-prompts-grid');
const resetConversationBtn = document.getElementById('reset-conversation-btn');
const chatInput = document.getElementById('chat-input');
const stopBtn = document.getElementById('stop-btn');
const regenerateBtn = document.getElementById('regenerate-btn');
const charCounter = document.getElementById('char-counter');
const sendBtn = document.getElementById('send-btn');
const apiStatusDot = document.getElementById('api-status-dot');
const apiStatusText = document.getElementById('api-status-text');
const latencyText = document.getElementById('latency-text');
const wordCountStat = document.getElementById('word-count-stat');

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
    renderPresets();
    selectPreset('general');

    // Load Saved Theme
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = themeToggleBtn?.querySelector('.theme-icon');
    const themeText = document.getElementById('theme-text');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeIcon) themeIcon.className = 'fa-solid fa-sun theme-icon';
        if (themeText) themeText.textContent = 'Mode Terang';
    }

    // Session validation
    const sessionUser = sessionStorage.getItem('current_user');
    if (sessionUser) {
        loginSession(sessionUser);
    } else {
        logoutSession();
    }

    // Setup All Event Listeners
    setupEventListeners();
});

// Helper for users storage
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '{}');
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Login Session Trigger
function loginSession(username) {
    currentUser = username;
    sessionStorage.setItem('current_user', username);

    // Hide Auth Gate and Show App Container
    const authGate = document.getElementById('auth-gate');
    if (authGate) authGate.style.display = 'none';

    const appContainer = document.querySelector('.app-container');
    if (appContainer) appContainer.style.display = 'flex';

    // Load API Key for this specific logged-in user
    const userKey = localStorage.getItem('api_key_' + username);
    if (userKey) {
        apiKey = userKey;
        if (apiKeyGate) {
            apiKeyGate.style.display = 'none';
            apiKeyGate.setAttribute('aria-hidden', 'true');
        }
        if (apiKeyInput) apiKeyInput.value = userKey;
        if (apiKeyGateInput) apiKeyGateInput.value = userKey;
        updateStatusUI(true);
    } else {
        apiKey = '';
        if (apiKeyInput) apiKeyInput.value = '';
        if (apiKeyGateInput) apiKeyGateInput.value = '';
        if (apiKeyGate) {
            apiKeyGate.style.display = 'flex';
            apiKeyGate.setAttribute('aria-hidden', 'false');
        }
        updateStatusUI(false);
    }

    toggleWelcomeScreen();
    showToast('Info', `Masuk sebagai ${username}`, 'info');
}

// Logout Session Trigger
function logoutSession() {
    currentUser = '';
    apiKey = '';
    sessionStorage.removeItem('current_user');

    // Hide App Container and Show Auth Gate
    const appContainer = document.querySelector('.app-container');
    if (appContainer) appContainer.style.display = 'none';

    const authGate = document.getElementById('auth-gate');
    if (authGate) authGate.style.display = 'flex';

    // Reset Inputs
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-username').value = '';
    document.getElementById('register-password').value = '';

    // Clear chat window silently
    handleClearChatSilently();
}

// Setup Event Listeners
function setupEventListeners() {
    // Auth Gate Tab Switches
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabRegisterBtn = document.getElementById('tab-register-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    tabLoginBtn?.addEventListener('click', () => {
        tabLoginBtn.classList.add('active');
        tabRegisterBtn.classList.remove('active');
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
    });

    tabRegisterBtn?.addEventListener('click', () => {
        tabRegisterBtn.classList.add('active');
        tabLoginBtn.classList.remove('active');
        registerForm.style.display = 'flex';
        loginForm.style.display = 'none';
    });

    // Auth Forms Submission
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            showToast('Error', 'Semua kolom wajib diisi!', 'error');
            return;
        }

        const users = getUsers();
        if (users[username] && users[username] === password) {
            loginSession(username);
        } else {
            showToast('Error', 'Username atau password salah!', 'error');
        }
    });

    registerForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value;

        if (!username || !password) {
            showToast('Error', 'Semua kolom wajib diisi!', 'error');
            return;
        }

        const users = getUsers();
        if (users[username]) {
            showToast('Error', 'Username sudah terdaftar!', 'error');
            return;
        }

        users[username] = password;
        saveUsers(users);
        showToast('Sukses', 'Pendaftaran berhasil!', 'success');
        loginSession(username);
    });

    // Logout Click
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn?.addEventListener('click', () => {
        logoutSession();
        showToast('Sukses', 'Anda telah keluar akun.', 'success');
    });

    // API Key Gate Submit
    apiKeyGateSubmit?.addEventListener('click', handleGateSubmit);
    
    // Auto-fill Sidebar Input if changed in Gate
    apiKeyGateInput?.addEventListener('input', (e) => {
        if (apiKeyInput) apiKeyInput.value = e.target.value;
    });

    // Sidebar API Key Input Change
    apiKeyInput?.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (!val) {
            apiKey = '';
            if (currentUser) {
                localStorage.removeItem('api_key_' + currentUser);
            }
            if (apiKeyGate) {
                apiKeyGate.style.display = 'flex';
                apiKeyGate.setAttribute('aria-hidden', 'false');
            }
            updateStatusUI(false);
            showToast('Peringatan', 'API Key dihapus. Harap isi kembali untuk mengobrol.', 'warning');
        } else {
            apiKey = val;
            if (currentUser) {
                localStorage.setItem('api_key_' + currentUser, val);
            }
            updateStatusUI(true);
        }
    });

    // Toggle Sidebar API Key Visibility
    toggleApiKeyBtn?.addEventListener('click', () => {
        const isPassword = apiKeyInput.type === 'password';
        apiKeyInput.type = isPassword ? 'text' : 'password';
        toggleApiKeyBtn.innerHTML = isPassword ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
    });

    // Sliders Real-time Value Updates
    tempSlider?.addEventListener('input', (e) => {
        if (tempVal) tempVal.textContent = e.target.value;
    });
    tokensSlider?.addEventListener('input', (e) => {
        if (tokensVal) tokensVal.textContent = e.target.value;
    });
    toppSlider?.addEventListener('input', (e) => {
        if (toppVal) toppVal.textContent = e.target.value;
    });

    // Chat Input Auto-grow & Key Event listeners
    chatInput?.addEventListener('input', handleChatInputUpdate);
    chatInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // Send, Stop & Regenerate Buttons
    sendBtn?.addEventListener('click', handleSendMessage);
    stopBtn?.addEventListener('click', () => {
        if (abortController) abortController.abort();
    });
    regenerateBtn?.addEventListener('click', handleRegenerate);

    // Utilities Buttons
    clearChatBtn?.addEventListener('click', handleClearChat);
    resetConversationBtn?.addEventListener('click', () => clearChatBtn?.click());
    exportTxtBtn?.addEventListener('click', handleExportTxt);
    exportJsonBtn?.addEventListener('click', handleExportJson);
    themeToggleBtn?.addEventListener('click', toggleTheme);

    // Sidebar Toggle for Mobile Devices
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebar = document.getElementById('sidebar');

    openSidebarBtn?.addEventListener('click', () => {
        sidebar?.classList.add('active');
    });
    closeSidebarBtn?.addEventListener('click', () => {
        sidebar?.classList.remove('active');
    });
}

// Handle Gate Submission
function handleGateSubmit() {
    const val = apiKeyGateInput.value.trim();
    if (!val) {
        showToast('Error', 'API Key Gemini wajib diisi untuk membuka akses!', 'error');
        return;
    }

    apiKey = val;
    if (currentUser) {
        localStorage.setItem('api_key_' + currentUser, val);
    }
    if (apiKeyInput) apiKeyInput.value = val;
    
    if (apiKeyGate) {
        apiKeyGate.style.display = 'none';
        apiKeyGate.setAttribute('aria-hidden', 'true');
    }
    updateStatusUI(true);
    showToast('Sukses', 'API Key berhasil disimpan!', 'success');
}

// Update API Status UI Elements
function updateStatusUI(isConnected) {
    if (isConnected) {
        if (apiStatusDot) apiStatusDot.className = 'status-indicator status-connected';
        if (apiStatusText) apiStatusText.textContent = apiKey.toLowerCase() === 'demo' ? 'Demo Mode (Simulasi)' : 'API Mode (Terhubung)';
    } else {
        if (apiStatusDot) apiStatusDot.className = 'status-indicator status-demo';
        if (apiStatusText) apiStatusText.textContent = 'API Key Kosong';
    }
}

// Render Preset Cards
function renderPresets() {
    const grid = document.getElementById('preset-grid');
    if (!grid) return;
    grid.innerHTML = '';

    Object.values(PRESETS).forEach(preset => {
        const card = document.createElement('div');
        card.className = `preset-card${preset.id === activePresetId ? ' active' : ''}`;
        card.dataset.presetId = preset.id;
        card.innerHTML = `
            <i class="fa-solid ${preset.icon}"></i>
            <span class="preset-name">${preset.title}</span>
        `;
        card.addEventListener('click', () => selectPreset(preset.id));
        grid.appendChild(card);
    });
}

// Select Preset Use Case
function selectPreset(presetId) {
    const preset = PRESETS[presetId];
    if (!preset) return;
    activePresetId = presetId;

    // Toggle active classes
    document.querySelectorAll('.preset-card').forEach(card => {
        if (card.dataset.presetId === presetId) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });

    // Update Sliders
    if (tempSlider && tempVal) {
        tempSlider.value = preset.temperature;
        tempVal.textContent = preset.temperature;
    }
    if (tokensSlider && tokensVal) {
        tokensSlider.value = preset.maxTokens;
        tokensVal.textContent = preset.maxTokens;
    }
    if (toppSlider && toppVal) {
        toppSlider.value = preset.topP;
        toppVal.textContent = preset.topP;
    }
    if (systemInstructionInput) {
        systemInstructionInput.value = preset.instruction;
    }

    // Update Header Status Display
    const badge = document.getElementById('header-preset-badge');
    const title = document.getElementById('header-preset-title');
    if (badge) badge.innerHTML = `<i class="fa-solid ${preset.icon}"></i>`;
    if (title) title.textContent = preset.title;

    // Refresh starter prompts based on use case
    renderStarterPrompts();
}

// Render Starter Prompts based on Active Preset
function renderStarterPrompts() {
    const grid = document.getElementById('starter-prompts-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const preset = PRESETS[activePresetId];
    if (!preset) return;

    preset.prompts.forEach(promptText => {
        const card = document.createElement('div');
        card.className = 'starter-card';
        card.innerHTML = `
            <div class="starter-title">
                <i class="fa-solid fa-lightbulb"></i>
                <span>Saran Topik</span>
            </div>
            <div class="starter-desc">${promptText}</div>
        `;
        card.addEventListener('click', () => {
            if (chatInput) {
                chatInput.value = promptText;
                handleChatInputUpdate();
                chatInput.focus();
            }
        });
        grid.appendChild(card);
    });
}

// Toggle Welcome Screen Visibility
function toggleWelcomeScreen() {
    if (!welcomeScreen) return;
    const visibleMessages = chatMessages.querySelectorAll('.message:not(.api-key-gate-bubble)').length;
    if (visibleMessages > 0) {
        welcomeScreen.style.display = 'none';
    } else {
        welcomeScreen.style.display = 'flex';
        renderStarterPrompts();
    }
}

// Chat Input Keypress Adjustments
function handleChatInputUpdate() {
    if (!chatInput) return;
    chatInput.style.height = 'auto';
    chatInput.style.height = `${chatInput.scrollHeight}px`;

    const len = chatInput.value.length;
    if (charCounter) charCounter.textContent = `${len}/2000`;
    if (sendBtn) sendBtn.disabled = len === 0 || isGenerating;
}

// Handle Sending Messages
async function handleSendMessage() {
    if (isGenerating) return;
    const text = chatInput.value.trim();
    if (!text) return;

    // Reset Chat Input Area
    chatInput.value = '';
    chatInput.style.height = 'auto';
    if (charCounter) charCounter.textContent = '0/2000';
    if (sendBtn) sendBtn.disabled = true;

    // Add user message to UI and history array
    appendMessage('user', text);
    conversationHistory.push({ role: 'user', parts: [{ text: text }] });

    isGenerating = true;
    toggleInputStates(true);

    // Add AI message placeholder
    const preset = PRESETS[activePresetId];
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const aiMessageDiv = document.createElement('div');
    aiMessageDiv.className = 'message message-ai';
    aiMessageDiv.innerHTML = `
        <div class="message-avatar"><i class="fa-solid ${preset.icon}"></i></div>
        <div class="message-body-wrapper">
            <div class="message-bubble">
                <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
            <div class="message-meta">${preset.title} • Mengetik...</div>
        </div>
    `;
    chatMessages.appendChild(aiMessageDiv);
    scrollToBottom();

    const bubble = aiMessageDiv.querySelector('.message-bubble');
    const meta = aiMessageDiv.querySelector('.message-meta');

    const startTime = performance.now();

    try {
        abortController = new AbortController();
        let responseText = '';

        if (apiKey.toLowerCase() === 'demo') {
            // Simulated response in Demo Mode
            const possibleResponses = MOCK_RESPONSES[activePresetId] || MOCK_RESPONSES.general;
            const fullResponse = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
            responseText = await streamTextSimulation(fullResponse, bubble, abortController.signal);
        } else {
            // Live Gemini API stream call
            responseText = await streamGeminiAPI(bubble, abortController.signal);
        }

        // Finalize contents
        bubble.innerHTML = parseMarkdown(responseText);
        meta.textContent = `${preset.title} • ${time}`;

        // Save AI response to history
        conversationHistory.push({ role: 'model', parts: [{ text: responseText }] });

        // Calculate and Show Latency
        const endTime = performance.now();
        const latencyMs = Math.round(endTime - startTime);
        if (latencyText) latencyText.textContent = `Latensi: ${latencyMs}ms`;

    } catch (err) {
        if (err.name === 'AbortError') {
            bubble.innerHTML = `<p><em>Generasi dihentikan oleh pengguna.</em></p>`;
            meta.textContent = `${preset.title} • Dihentikan`;
            showToast('Info', 'Generasi respons dihentikan.', 'info');
        } else {
            console.error(err);
            bubble.innerHTML = `<p style="color: var(--accent-danger);"><strong>Error:</strong> ${err.message}</p>`;
            meta.textContent = `${preset.title} • Error`;
            showToast('Error', err.message, 'error');
        }
    } finally {
        isGenerating = false;
        abortController = null;
        toggleInputStates(false);
        updateWordCount();
        scrollToBottom();
    }
}

// Typing Simulation for Demo Mode
function streamTextSimulation(text, bubbleElement, signal) {
    return new Promise((resolve, reject) => {
        let index = 0;
        let currentText = '';
        const interval = setInterval(() => {
            if (signal?.aborted) {
                clearInterval(interval);
                reject(new DOMException('Aborted', 'AbortError'));
                return;
            }

            if (index < text.length) {
                currentText += text[index];
                bubbleElement.innerHTML = parseMarkdown(currentText);
                scrollToBottom();
                index++;
            } else {
                clearInterval(interval);
                resolve(text);
            }
        }, 15);
    });
}

// Fetch Streaming Response from Gemini API
async function streamGeminiAPI(bubbleElement, signal) {
    const model = modelSelect?.value || 'gemini-2.5-flash';
    const temp = parseFloat(tempSlider?.value || '0.7');
    const maxTokens = parseInt(tokensSlider?.value || '2048');
    const topP = parseFloat(toppSlider?.value || '0.95');
    const systemInstruction = systemInstructionInput?.value.trim();
    const contextWindow = parseInt(contextWindowSelect?.value || '10');

    // Slice history list to keep within client context window
    let historySlice = conversationHistory.slice(-contextWindow);
    // Ensure the stream payload strictly starts with a user turn
    while (historySlice.length > 0 && historySlice[0].role !== 'user') {
        historySlice.shift();
    }

    if (historySlice.length === 0) {
        throw new Error("Riwayat chat tidak valid untuk dikirim.");
    }

    const payload = {
        contents: historySlice,
        generationConfig: {
            temperature: temp,
            maxOutputTokens: maxTokens,
            topP: topP
        }
    };

    if (systemInstruction) {
        payload.systemInstruction = {
            parts: [{ text: systemInstruction }]
        };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: signal
    });

    if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const errorMessage = errorJson?.error?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let fullResponseText = '';
    let braceCount = 0;
    let objectStart = -1;

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse streaming JSON objects from the HTTP response stream buffer
        for (let i = 0; i < buffer.length; i++) {
            if (buffer[i] === '{') {
                if (braceCount === 0) {
                    objectStart = i;
                }
                braceCount++;
            } else if (buffer[i] === '}') {
                braceCount--;
                if (braceCount === 0 && objectStart !== -1) {
                    const objStr = buffer.slice(objectStart, i + 1);
                    try {
                        const chunkJson = JSON.parse(objStr);
                        const textChunk = chunkJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                        fullResponseText += textChunk;
                        
                        // Dynamically render markdown text streaming chunk in chat window
                        bubbleElement.innerHTML = parseMarkdown(fullResponseText);
                        scrollToBottom();
                    } catch (e) {
                        // ignore parsing error for incomplete/broken chunk
                    }
                    objectStart = -1;
                }
            }
        }

        // Clean buffer of parsed objects
        if (objectStart !== -1) {
            buffer = buffer.slice(objectStart);
        } else {
            buffer = '';
        }
    }

    if (!fullResponseText) {
        throw new Error('Menerima respons kosong dari API.');
    }

    return fullResponseText;
}

// Append Chat Message Elements
function appendMessage(role, text) {
    welcomeScreen.style.display = 'none';

    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${role === 'user' ? 'user' : 'ai'}`;

    const icon = role === 'user' ? 'fa-user' : PRESETS[activePresetId].icon;
    const name = role === 'user' ? 'Anda' : PRESETS[activePresetId].title;
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const htmlContent = role === 'user' ? `<p>${escapeHTML(text)}</p>` : parseMarkdown(text);

    messageDiv.innerHTML = `
        <div class="message-avatar"><i class="fa-solid ${icon}"></i></div>
        <div class="message-body-wrapper">
            <div class="message-bubble">
                ${htmlContent}
            </div>
            <div class="message-meta">${name} • ${time}</div>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    updateWordCount();

    return messageDiv;
}

// Regenerate Last AI Response
function handleRegenerate() {
    if (isGenerating || conversationHistory.length < 2) return;

    const lastMsg = conversationHistory[conversationHistory.length - 1];
    if (lastMsg.role !== 'model') return;

    // Pop the model response
    conversationHistory.pop();

    // Remove the last message element from UI
    const messages = chatMessages.querySelectorAll('.message');
    if (messages.length > 0) {
        messages[messages.length - 1].remove();
    }

    // Get the last user message text
    const lastUserMsg = conversationHistory[conversationHistory.length - 1];
    if (lastUserMsg && lastUserMsg.role === 'user') {
        // Pop user message because handleSendMessage will re-add it
        conversationHistory.pop();

        // Remove user message element from UI
        const newMessages = chatMessages.querySelectorAll('.message');
        if (newMessages.length > 0) {
            newMessages[newMessages.length - 1].remove();
        }

        // Fill chatInput and invoke handleSendMessage
        chatInput.value = lastUserMsg.parts[0].text;
        handleSendMessage();
    }
}

// Clear Chat Messages
function handleClearChat() {
    conversationHistory = [];

    // Remove messages
    const messages = chatMessages.querySelectorAll('.message');
    messages.forEach(msg => msg.remove());

    // Reset Chat Inputs
    if (chatInput) {
        chatInput.value = '';
        chatInput.style.height = 'auto';
    }
    if (charCounter) charCounter.textContent = '0/2000';
    if (sendBtn) sendBtn.disabled = true;
    if (regenerateBtn) regenerateBtn.disabled = true;

    // Display welcome UI and reset metrics
    toggleWelcomeScreen();
    updateWordCount();
    if (latencyText) latencyText.textContent = 'Latensi: N/A';

    showToast('Sukses', 'Riwayat obrolan dibersihkan.', 'success');
}

// Clear Chat Silently on Logout
function handleClearChatSilently() {
    conversationHistory = [];
    const messages = chatMessages.querySelectorAll('.message');
    messages.forEach(msg => msg.remove());

    if (chatInput) {
        chatInput.value = '';
        chatInput.style.height = 'auto';
    }
    if (charCounter) charCounter.textContent = '0/2000';
    if (sendBtn) sendBtn.disabled = true;
    if (regenerateBtn) regenerateBtn.disabled = true;

    toggleWelcomeScreen();
    updateWordCount();
    if (latencyText) latencyText.textContent = 'Latensi: N/A';
}

// Export Chat to TXT
function handleExportTxt() {
    if (conversationHistory.length === 0) {
        showToast('Info', 'Tidak ada pesan untuk diekspor.', 'info');
        return;
    }

    let txtContent = `AI Assistant Studio Chat Export\n`;
    txtContent += `Tanggal: ${new Date().toLocaleString('id-ID')}\n`;
    txtContent += `Preset: ${PRESETS[activePresetId].title}\n`;
    txtContent += `==========================================\n\n`;

    conversationHistory.forEach(msg => {
        const roleName = msg.role === 'user' ? 'USER' : 'AI';
        const text = msg.parts[0].text;
        txtContent += `[${roleName}]:\n${text}\n\n`;
    });

    downloadFile(txtContent, 'text/plain', `chat_export_${activePresetId}_${Date.now()}.txt`);
    showToast('Sukses', 'Riwayat chat berhasil diekspor ke TXT.', 'success');
}

// Export Chat to JSON
function handleExportJson() {
    if (conversationHistory.length === 0) {
        showToast('Info', 'Tidak ada pesan untuk diekspor.', 'info');
        return;
    }

    const exportData = {
        metadata: {
            exportedAt: new Date().toISOString(),
            preset: activePresetId,
            presetTitle: PRESETS[activePresetId].title,
            model: modelSelect?.value || 'gemini-2.5-flash',
            parameters: {
                temperature: tempSlider?.value,
                maxTokens: tokensSlider?.value,
                topP: toppSlider?.value,
                systemInstruction: systemInstructionInput?.value
            }
        },
        history: conversationHistory
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile(jsonContent, 'application/json', `chat_export_${activePresetId}_${Date.now()}.json`);
    showToast('Sukses', 'Riwayat chat berhasil diekspor ke JSON.', 'success');
}

// Helper to Download Content
function downloadFile(content, mimeType, filename) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Toggle Light / Dark Theme Mode
function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    const themeIcon = themeToggleBtn?.querySelector('.theme-icon');
    const themeText = document.getElementById('theme-text');

    if (isLight) {
        if (themeIcon) themeIcon.className = 'fa-solid fa-sun theme-icon';
        if (themeText) themeText.textContent = 'Mode Terang';
        localStorage.setItem('theme', 'light');
    } else {
        if (themeIcon) themeIcon.className = 'fa-solid fa-moon theme-icon';
        if (themeText) themeText.textContent = 'Mode Gelap';
        localStorage.setItem('theme', 'dark');
    }
}

// Escape HTML Characters
function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Helper: Toggle inputs disabled/enabled states
function toggleInputStates(isGenerating) {
    if (chatInput) chatInput.disabled = isGenerating;
    if (sendBtn) sendBtn.disabled = isGenerating || chatInput.value.trim().length === 0;
    if (stopBtn) stopBtn.disabled = !isGenerating;
    if (regenerateBtn) regenerateBtn.disabled = isGenerating || conversationHistory.length < 2;
    if (clearChatBtn) clearChatBtn.disabled = isGenerating;
    if (resetConversationBtn) resetConversationBtn.disabled = isGenerating;

    if (modelSelect) modelSelect.disabled = isGenerating;
    if (tempSlider) tempSlider.disabled = isGenerating;
    if (tokensSlider) tokensSlider.disabled = isGenerating;
    if (toppSlider) toppSlider.disabled = isGenerating;
    if (systemInstructionInput) systemInstructionInput.disabled = isGenerating;
}

// Update Conversation Total Word Count Display
function updateWordCount() {
    let wordCount = 0;
    conversationHistory.forEach(msg => {
        if (msg.parts && msg.parts[0] && msg.parts[0].text) {
            const text = msg.parts[0].text;
            wordCount += text.trim().split(/\s+/).filter(Boolean).length;
        }
    });
    if (wordCountStat) wordCountStat.textContent = `${wordCount} Kata`;
}

// Scroll to bottom of chat list
function scrollToBottom() {
    if (chatMessagesWrapper) {
        chatMessagesWrapper.scrollTo({
            top: chatMessagesWrapper.scrollHeight,
            behavior: 'smooth'
        });
    }
}

// Toast Notifications Helper
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-xmark';

    toast.innerHTML = `
        <div class="toast-icon"><i class="fa-solid ${iconClass}"></i></div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn?.addEventListener('click', () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    });

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

// Copy Code Snippets to Clipboard
window.copyCode = async function(btn) {
    const pre = btn.closest('.code-block-container').querySelector('pre');
    if (!pre) return;
    const text = pre.innerText;
    try {
        await navigator.clipboard.writeText(text);
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
        btn.style.color = 'var(--accent-success)';
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-regular fa-copy"></i> Salin Kode';
            btn.style.color = '';
        }, 2000);
        showToast('Sukses', 'Kode disalin ke clipboard.', 'success');
    } catch (err) {
        showToast('Gagal', 'Gagal menyalin kode.', 'error');
    }
};

/* ==========================================================================
   Markdown Parsing Utility
   ========================================================================== */
function parseMarkdown(md) {
    md = String(md ?? '');

    // Escape HTML first
    let html = md
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Fenced code blocks
    html = html.replace(/```([a-zA-Z0-9+#-]+)?\n([\s\S]+?)\n```/g, (match, lang, code) => {
        const language = (lang ? lang.trim() : 'code');
        const cleanCode = code.replace(/\n+$/, '').trim();
        return `
            <div class="code-block-container">
                <div class="code-block-header">
                    <span>${language}</span>
                    <button class="copy-code-btn" onclick="copyCode(this)">
                        <i class="fa-regular fa-copy"></i> Salin Kode
                    </button>
                </div>
                <pre><code>${cleanCode}</code></pre>
            </div>
        `;
    });

    // Inline code
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

    // Links [text](http(s)://...)
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (m, text, url) => {
        return `<a class="md-link" href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    });

    // Blockquotes per line: > ...
    html = html.replace(/^\s*>\s?(.+?)\s*$/gm, (m, content) => {
        return `<blockquote>${content}</blockquote>`;
    });

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Ordered lists
    html = html.replace(/^(?:\s*)(\d+)\.\s+(.+)$/gm, '<li data-list-ordered="$1">$2</li>');
    // Unordered lists
    html = html.replace(/^(?:\s*[-*])\s+(.+)$/gm, '<li>$1</li>');

    // Wrap consecutive list items
    html = html.replace(/((?:<li(?:[^>]*)?>[\s\S]*?<\/li>\s*)+)/g, (m) => {
        const hasOrdered = m.includes('data-list-ordered');
        return hasOrdered ? `<ol>${m}</ol>` : `<ul>${m}</ul>`;
    });

    // Remove possible nested list container merges
    html = html.replace(/<\/(ul|ol)>\s*<\/(ul|ol)>/g, '');

    // Paragraph splitting
    const parts = html.split(/\n\n+/);
    const out = parts.map(p => {
        const t = p.trim();
        if (!t) return '';
        if (t.startsWith('<div') || t.startsWith('<ul') || t.startsWith('<ol') || t.startsWith('<pre') || t.startsWith('<blockquote')) {
            return t;
        }
        return `<p>${t.replace(/\n/g, '<br>')}</p>`;
    }).filter(Boolean);

    return out.join('');
}
