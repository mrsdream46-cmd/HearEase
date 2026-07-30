# HearEase

**Hear the Internet Visually**

A hackathon prototype for people who are hard of hearing.

## Features
- Live speech captions using Web Speech API
- Microphone sound-level monitor using Web Audio API
- Visual important-sound alert
- High contrast
- Larger text
- Reduced motion
- Visual alert toggle
- Demo Mode that works without a microphone

## Run
1. Open the folder in VS Code.
2. Install **Live Server**.
3. Right-click `index.html` → **Open with Live Server**.
4. Allow microphone permission when prompted.
5. Click **Start HearEase** or **Try Demo Mode**.

Use Chrome/Edge for the best chance of browser speech-recognition support.

## Hackathon positioning
Audio input → speech/sound processing → visual information → accessibility.

The current prototype uses sound-level detection. An AI sound classifier can be added next for alarms, sirens, doorbells, claps, voices, and emergency events.
