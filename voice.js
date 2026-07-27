// Voice Feature Implementation
// Includes Speech-to-Text and Text-to-Speech functionality

// ============================================
// 1. SPEECH RECOGNITION (Speech-to-Text)
// ============================================

class SpeechRecognizer {
    constructor() {
        // Get Speech Recognition API (cross-browser)
        this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!this.SpeechRecognition) {
            console.warn('Speech Recognition not supported in this browser');
            return;
        }

        this.recognition = new this.SpeechRecognition();
        this.isListening = false;
        this.transcript = '';
        
        this.configureRecognition();
    }

    configureRecognition() {
        // Set language (English and Tamil support)
        this.recognition.lang = 'en-US'; // Default: English
        
        // Continuous recognition
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;

        // On result
        this.recognition.onresult = (event) => {
            this.transcript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                this.transcript += transcript;
                
                if (event.results[i].isFinal) {
                    this.onFinalTranscript(this.transcript);
                } else {
                    this.onInterimTranscript(this.transcript);
                }
            }
        };

        // On error
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.onError(event.error);
        };

        // On end
        this.recognition.onend = () => {
            this.isListening = false;
            this.onEnd();
        };
    }

    start() {
        if (this.isListening) return;
        this.isListening = true;
        this.transcript = '';
        this.recognition.start();
        this.onStart();
    }

    stop() {
        if (!this.isListening) return;
        this.recognition.stop();
    }

    setLanguage(lang) {
        // 'en-US' for English, 'ta-IN' for Tamil
        this.recognition.lang = lang;
    }

    // Callbacks (override these in subclasses)
    onStart() {
        console.log('Listening started...');
    }

    onInterimTranscript(text) {
        console.log('Interim:', text);
    }

    onFinalTranscript(text) {
        console.log('Final:', text);
    }

    onEnd() {
        console.log('Listening ended');
    }

    onError(error) {
        console.error('Error:', error);
    }
}

// ============================================
// 2. TEXT-TO-SPEECH (Speech Synthesis)
// ============================================

class SpeechSynthesizer {
    constructor() {
        this.synth = window.speechSynthesis;
        this.isSpeaking = false;
        this.currentUtterance = null;
    }

    speak(text, options = {}) {
        if (!this.synth) {
            console.error('Speech synthesis not supported');
            return;
        }

        // Stop any ongoing speech
        this.stop();

        // Create utterance
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        
        // Configure options
        this.currentUtterance.rate = options.rate || 0.9; // Speed (0.1-2)
        this.currentUtterance.pitch = options.pitch || 1; // Pitch (0-2)
        this.currentUtterance.volume = options.volume || 1; // Volume (0-1)
        this.currentUtterance.lang = options.lang || 'en-US'; // Language
        
        // Select voice (optional)
        if (options.voiceIndex !== undefined) {
            const voices = this.synth.getVoices();
            if (voices[options.voiceIndex]) {
                this.currentUtterance.voice = voices[options.voiceIndex];
            }
        }

        // Event listeners
        this.currentUtterance.onstart = () => {
            this.isSpeaking = true;
            if (options.onStart) options.onStart();
        };

        this.currentUtterance.onend = () => {
            this.isSpeaking = false;
            if (options.onEnd) options.onEnd();
        };

        this.currentUtterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            if (options.onError) options.onError(event.error);
        };

        // Speak
        this.synth.speak(this.currentUtterance);
    }

    stop() {
        if (this.synth.speaking) {
            this.synth.cancel();
            this.isSpeaking = false;
        }
    }

    pause() {
        if (this.synth.speaking && !this.synth.paused) {
            this.synth.pause();
        }
    }

    resume() {
        if (this.synth.paused) {
            this.synth.resume();
        }
    }

    getVoices() {
        return this.synth.getVoices();
    }

    setLanguage(lang) {
        // 'en-US' or 'ta-IN'
        if (this.currentUtterance) {
            this.currentUtterance.lang = lang;
        }
    }
}

// ============================================
// 3. VOICE-ENABLED SYMPTOM CHECKER
// ============================================

class VoiceSymptomChecker extends SpeechRecognizer {
    constructor() {
        super();
        this.symptomChecker = new SymptomChecker();
        this.synthesizer = new SpeechSynthesizer();
        this.symptoms = [];
        this.currentLanguage = 'en-US';
        this.initializeVoiceUI();
    }

    initializeVoiceUI() {
        const container = document.querySelector('#symptom-checker-container') || document.body;
        
        // Add voice controls to symptom checker
        const voiceControls = document.createElement('div');
        voiceControls.className = 'voice-controls';
        voiceControls.innerHTML = `
            <div class="voice-section">
                <h4>🎤 Voice Input</h4>
                
                <div class="language-selector">
                    <label for="symptom-language">Language:</label>
                    <select id="symptom-language">
                        <option value="en-US">English</option>
                        <option value="ta-IN">Tamil</option>
                    </select>
                </div>

                <div class="voice-buttons">
                    <button class="btn btn-voice btn-listen" id="symptom-listen-btn">
                        <i class="fas fa-microphone"></i> Listen
                    </button>
                    <button class="btn btn-voice btn-stop" id="symptom-stop-listen-btn" style="display:none;">
                        <i class="fas fa-microphone-slash"></i> Stop
                    </button>
                </div>

                <div id="symptom-voice-transcript" class="voice-transcript" style="display:none;">
                    <p><strong>You said:</strong> <span id="symptom-transcript-text"></span></p>
                </div>

                <div class="voice-options">
                    <label>
                        <input type="checkbox" id="symptom-auto-speak" checked>
                        Speak responses out loud
                    </label>
                </div>
            </div>
        `;

        // Insert after symptom input
        const symptomInput = container.querySelector('.symptom-input');
        if (symptomInput) {
            symptomInput.parentNode.insertBefore(voiceControls, symptomInput.nextSibling);
        }

        this.attachVoiceEventListeners();
    }

    attachVoiceEventListeners() {
        const listenBtn = document.querySelector('#symptom-listen-btn');
        const stopBtn = document.querySelector('#symptom-stop-listen-btn');
        const langSelect = document.querySelector('#symptom-language');

        if (listenBtn) {
            listenBtn.addEventListener('click', () => this.startListening());
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopListening());
        }

        if (langSelect) {
            langSelect.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
                this.currentLanguage = e.target.value;
            });
        }

        // Override parent callbacks
        this.onStart = () => this.handleListeningStart();
        this.onFinalTranscript = (text) => this.handleFinalTranscript(text);
        this.onEnd = () => this.handleListeningEnd();
        this.onError = (error) => this.handleListeningError(error);
    }

    startListening() {
        const listenBtn = document.querySelector('#symptom-listen-btn');
        const stopBtn = document.querySelector('#symptom-stop-listen-btn');

        if (listenBtn) listenBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'inline-block';

        this.start();
    }

    stopListening() {
        this.stop();
    }

    handleListeningStart() {
        console.log('Started listening...');
        showNotification('🎤 Listening... Speak your symptoms', 'info');
    }

    handleFinalTranscript(text) {
        const transcriptDiv = document.querySelector('#symptom-voice-transcript');
        const transcriptText = document.querySelector('#symptom-transcript-text');
        
        if (transcriptDiv && transcriptText) {
            transcriptText.textContent = text;
            transcriptDiv.style.display = 'block';
        }

        // Add to symptoms list
        const input = document.querySelector('#symptom-input');
        if (input) {
            input.value = text;
            this.symptomChecker.addSymptom();
        }
    }

    handleListeningEnd() {
        const listenBtn = document.querySelector('#symptom-listen-btn');
        const stopBtn = document.querySelector('#symptom-stop-listen-btn');

        if (listenBtn) listenBtn.style.display = 'inline-block';
        if (stopBtn) stopBtn.style.display = 'none';

        console.log('Stopped listening');
    }

    handleListeningError(error) {
        showNotification(`❌ Listening error: ${error}`, 'error');
    }

    speakResponse(text) {
        const autoSpeak = document.querySelector('#symptom-auto-speak');
        
        if (autoSpeak && autoSpeak.checked) {
            this.synthesizer.speak(text, {
                lang: this.currentLanguage,
                rate: 0.9,
                onStart: () => {
                    showNotification('🔊 Speaking...', 'info');
                },
                onEnd: () => {
                    showNotification('✓ Done speaking', 'success');
                }
            });
        }
    }
}

// ============================================
// 4. VOICE-ENABLED FIRST-AID GUIDE
// ============================================

class VoiceFirstAidGuide extends SpeechRecognizer {
    constructor() {
        super();
        this.firstAidGuide = new FirstAidGuide();
        this.synthesizer = new SpeechSynthesizer();
        this.currentLanguage = 'en-US';
        this.initializeVoiceUI();
    }

    initializeVoiceUI() {
        const container = document.querySelector('#first-aid-container') || document.body;
        
        const voiceControls = document.createElement('div');
        voiceControls.className = 'voice-controls';
        voiceControls.innerHTML = `
            <div class="voice-section">
                <h4>🎤 Voice Commands</h4>
                
                <div class="voice-instructions">
                    <p>Say: "burns", "cuts", "snake bite", or "heat stroke"</p>
                </div>

                <div class="language-selector">
                    <label for="firstaid-language">Language:</label>
                    <select id="firstaid-language">
                        <option value="en-US">English</option>
                        <option value="ta-IN">Tamil</option>
                    </select>
                </div>

                <div class="voice-buttons">
                    <button class="btn btn-voice btn-listen" id="firstaid-listen-btn">
                        <i class="fas fa-microphone"></i> Listen
                    </button>
                    <button class="btn btn-voice btn-stop" id="firstaid-stop-listen-btn" style="display:none;">
                        <i class="fas fa-microphone-slash"></i> Stop
                    </button>
                </div>

                <div class="voice-options">
                    <label>
                        <input type="checkbox" id="firstaid-auto-speak" checked>
                        Read instructions aloud
                    </label>
                </div>
            </div>
        `;

        const injurySelection = container.querySelector('.injury-selection');
        if (injurySelection) {
            injurySelection.parentNode.insertBefore(voiceControls, injurySelection.nextSibling);
        }

        this.attachVoiceEventListeners();
    }

    attachVoiceEventListeners() {
        const listenBtn = document.querySelector('#firstaid-listen-btn');
        const stopBtn = document.querySelector('#firstaid-stop-listen-btn');
        const langSelect = document.querySelector('#firstaid-language');

        if (listenBtn) {
            listenBtn.addEventListener('click', () => this.startListening());
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopListening());
        }

        if (langSelect) {
            langSelect.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
                this.currentLanguage = e.target.value;
            });
        }

        this.onFinalTranscript = (text) => this.handleCommand(text);
    }

    startListening() {
        const listenBtn = document.querySelector('#firstaid-listen-btn');
        const stopBtn = document.querySelector('#firstaid-stop-listen-btn');

        if (listenBtn) listenBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'inline-block';

        this.start();
    }

    stopListening() {
        const listenBtn = document.querySelector('#firstaid-listen-btn');
        const stopBtn = document.querySelector('#firstaid-stop-listen-btn');

        if (listenBtn) listenBtn.style.display = 'inline-block';
        if (stopBtn) stopBtn.style.display = 'none';

        this.stop();
    }

    handleCommand(text) {
        const command = text.toLowerCase().trim();
        const injurySelect = document.querySelector('#injury-type');
        
        // Map voice commands to injury types
        const commandMap = {
            'burns': 'burns',
            'burn': 'burns',
            'cuts': 'cuts',
            'cut': 'cuts',
            'snake': 'snake_bite',
            'snake bite': 'snake_bite',
            'heat': 'heat_stroke',
            'heat stroke': 'heat_stroke'
        };

        let selectedInjury = null;
        for (const [key, value] of Object.entries(commandMap)) {
            if (command.includes(key)) {
                selectedInjury = value;
                break;
            }
        }

        if (selectedInjury && injurySelect) {
            injurySelect.value = selectedInjury;
            this.firstAidGuide.getFirstAid();
            showNotification(`Getting first-aid for ${selectedInjury}...`, 'success');
        } else {
            showNotification('Injury not recognized. Please try again.', 'warning');
        }
    }

    speakGuidance(text) {
        const autoSpeak = document.querySelector('#firstaid-auto-speak');
        
        if (autoSpeak && autoSpeak.checked) {
            this.synthesizer.speak(text, {
                lang: this.currentLanguage,
                rate: 0.8,
                onStart: () => console.log('Speaking guidance...')
            });
        }
    }
}

// ============================================
// 5. VOICE CONTROL CENTER
// ============================================

class VoiceControlCenter {
    constructor() {
        this.synthesizer = new SpeechSynthesizer();
        this.recognizer = new SpeechRecognizer();
        this.currentLanguage = 'en-US';
        this.initializeUI();
    }

    initializeUI() {
        const container = document.querySelector('body');
        
        const voiceCenter = document.createElement('div');
        voiceCenter.id = 'voice-control-center';
        voiceCenter.className = 'voice-control-center';
        voiceCenter.innerHTML = `
            <div class="voice-center-content">
                <button class="voice-center-toggle" id="voice-center-toggle" title="Open Voice Control">
                    <i class="fas fa-microphone"></i>
                </button>

                <div class="voice-center-panel" id="voice-center-panel" style="display:none;">
                    <div class="voice-center-header">
                        <h3>🎤 Voice Control</h3>
                        <button class="close-btn" id="voice-center-close">×</button>
                    </div>

                    <div class="voice-center-body">
                        <div class="voice-settings">
                            <label for="voice-language-center">Language:</label>
                            <select id="voice-language-center">
                                <option value="en-US">🇺🇸 English</option>
                                <option value="ta-IN">🇮🇳 Tamil</option>
                            </select>
                        </div>

                        <div class="voice-settings">
                            <label for="voice-rate">Speech Rate:</label>
                            <input type="range" id="voice-rate" min="0.5" max="2" step="0.1" value="0.9">
                            <span id="voice-rate-value">0.9x</span>
                        </div>

                        <div class="voice-settings">
                            <label for="voice-volume">Volume:</label>
                            <input type="range" id="voice-volume" min="0" max="1" step="0.1" value="1">
                            <span id="voice-volume-value">100%</span>
                        </div>

                        <div class="voice-commands">
                            <h4>Quick Commands</h4>
                            <button class="voice-command-btn" data-command="symptoms">
                                🤖 Check Symptoms
                            </button>
                            <button class="voice-command-btn" data-command="firstaid">
                                🩹 First-Aid Help
                            </button>
                            <button class="voice-command-btn" data-command="medicine">
                                💊 Medicine Reminder
                            </button>
                            <button class="voice-command-btn" data-command="qa">
                                ❓ Ask Question
                            </button>
                        </div>

                        <div class="voice-shortcuts">
                            <p><strong>Voice Shortcuts:</strong></p>
                            <ul>
                                <li>Say "Help" for assistance</li>
                                <li>Say "Repeat" to repeat last message</li>
                                <li>Say "Stop" to stop speaking</li>
                            </ul>
                        </div>

                        <button class="btn btn-danger" id="voice-center-test">
                            🔊 Test Voice
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(voiceCenter);
        this.attachEventListeners();
    }

    attachEventListeners() {
        const toggle = document.querySelector('#voice-center-toggle');
        const close = document.querySelector('#voice-center-close');
        const panel = document.querySelector('#voice-center-panel');
        const langSelect = document.querySelector('#voice-language-center');
        const rateSlider = document.querySelector('#voice-rate');
        const volumeSlider = document.querySelector('#voice-volume');
        const testBtn = document.querySelector('#voice-center-test');
        const commandBtns = document.querySelectorAll('.voice-command-btn');

        if (toggle) {
            toggle.addEventListener('click', () => {
                if (panel.style.display === 'none') {
                    panel.style.display = 'block';
                } else {
                    panel.style.display = 'none';
                }
            });
        }

        if (close) {
            close.addEventListener('click', () => {
                panel.style.display = 'none';
            });
        }

        if (langSelect) {
            langSelect.addEventListener('change', (e) => {
                this.currentLanguage = e.target.value;
            });
        }

        if (rateSlider) {
            rateSlider.addEventListener('input', (e) => {
                document.querySelector('#voice-rate-value').textContent = e.target.value + 'x';
            });
        }

        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                document.querySelector('#voice-volume-value').textContent = Math.round(e.target.value * 100) + '%';
            });
        }

        if (testBtn) {
            testBtn.addEventListener('click', () => this.testVoice());
        }

        commandBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const command = e.target.closest('.voice-command-btn').dataset.command;
                this.executeCommand(command);
            });
        });
    }

    testVoice() {
        const lang = document.querySelector('#voice-language-center').value;
        const rate = parseFloat(document.querySelector('#voice-rate').value);
        const volume = parseFloat(document.querySelector('#voice-volume').value);

        const testMessage = lang === 'ta-IN' 
            ? 'வணக்கம்! குரல் சோதனை வேலை செய்கிறது.' 
            : 'Hello! Voice test is working.';

        this.synthesizer.speak(testMessage, {
            lang: lang,
            rate: rate,
            volume: volume,
            onStart: () => {
                showNotification('🔊 Playing test message...', 'info');
            },
            onEnd: () => {
                showNotification('✓ Test complete', 'success');
            }
        });
    }

    executeCommand(command) {
        const messages = {
            'symptoms': 'Say your symptoms one by one.',
            'firstaid': 'Say the type of injury: burns, cuts, snake bite, or heat stroke.',
            'medicine': 'Tell me the medicine name and dosage.',
            'qa': 'Ask your health question.'
        };

        const message = messages[command] || 'Command recognized.';
        
        this.synthesizer.speak(message, {
            lang: this.currentLanguage,
            rate: parseFloat(document.querySelector('#voice-rate').value)
        });

        showNotification(`🎤 ${message}`, 'info');
    }
}

// ============================================
// 6. BROWSER COMPATIBILITY CHECK
// ============================================

function checkVoiceSupport() {
    const support = {
        speechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
        speechSynthesis: !!window.speechSynthesis,
        browser: getBrowserInfo()
    };

    console.log('Voice Support:', support);

    if (!support.speechRecognition || !support.speechSynthesis) {
        const missing = [];
        if (!support.speechRecognition) missing.push('Speech Recognition');
        if (!support.speechSynthesis) missing.push('Speech Synthesis');
        
        showNotification(`⚠️ Your browser doesn't support: ${missing.join(', ')}`, 'warning');
        return false;
    }

    return true;
}

function getBrowserInfo() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    return 'Unknown';
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Voice Features...');
    
    // Check browser support
    if (checkVoiceSupport()) {
        // Initialize voice features
        window.voiceSymptomChecker = new VoiceSymptomChecker();
        window.voiceFirstAidGuide = new VoiceFirstAidGuide();
        window.voiceControlCenter = new VoiceControlCenter();
        
        console.log('✓ Voice features initialized successfully!');
    } else {
        console.warn('Voice features partially unavailable');
    }
});
