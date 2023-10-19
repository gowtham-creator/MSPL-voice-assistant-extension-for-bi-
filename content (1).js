const statusEl = document.getElementById("mspl_status_page");
const inputEl = document.getElementById("mspl_homepage");

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
}

navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

navigator.getUserMedia(
    {audio: true},
    (stream) => {
        function closeWindow() {
            if (inputEl && inputEl.value === "mspl_homepage") {
                window.close();
            }
        }

        function statusChanger(text) {
            if (statusEl) {
                statusEl.innerText = text;
            }
            console.log(text);
        }

        speak("Voice activated Say start mspl");
        statusChanger("Status: Voice Activated");

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition ||
            window.mozSpeechRecognition ||
            window.msSpeechRecognition ||
            window.oSpeechRecognition;

        let activatedVoice = false;
        let speechResult = "";

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.start();

        recognition.onresult = (event) => {
            speechResult = event.results[0][0].transcript;
            console.log(speechResult);
        };

        recognition.onend = async () => {
            if (
                speechResult.toLowerCase().slice(0, 10) === "start mspl" &&
                !activatedVoice
            ) {
                activatedVoice = true;
                speak("Welcome to the mspl-voice assistant. How can I assist you?");
                statusChanger("Status: Started MSPL Voice-Assistant");
            } else if (
                speechResult.toLowerCase().slice(0, 10) === "start mspl" &&
                activatedVoice
            ) {
                speak(
                    "mspl-voice assistant is already activated. How can I assist you?"
                );
                statusChanger("Status: Started MSPL Voice-Assistant");
            } else if (
                (speechResult.toLowerCase().slice(0, 9) === "stop mspl" ||
                    speechResult.toLowerCase().slice(0, 8) === "end mspl") &&
                !activatedVoice
            ) {
                speak("mspl-voice assistant is already terminated.");
                statusChanger("Status: MSPL Voice-Assistant Stopped.");
            } else if (
                (speechResult.toLowerCase().slice(0, 9) === "stop mspl" ||
                    speechResult.toLowerCase().slice(0, 8) === "end mspl") &&
                activatedVoice
            ) {
                activatedVoice = false;
                speak("mspl-voice assistant is stopped, Say start mspl");
                statusChanger("Status: MSPL Voice-Assistant Stopped.");
            } else if (
                speechResult.includes("stop") ||
                speechResult.includes("exit") ||
                speechResult.includes("terminate")
            ) {
                activatedVoice = false;
                speak("Voice terminated.");
                statusChanger("Status: Voice Terminated.");
                stream.getTracks().forEach((track) => track.stop());
                closeWindow();
                return;
            } else if (
                speechResult.toLowerCase().slice(0, 4) === "open" &&
                activatedVoice
            ) {
                const command = await chrome.runtime.sendMessage({
                    text: speechResult
                });
                if (command && command.message) {
                    speak(command.message);
                    speechResult = "";
                }
            }
            speechResult = "";
            recognition.start();
        };

        recognition.onerror = (event) => {
            console.log(event.error);
        };
    },
    (error) => {
        console.log(error);
    }
);
