type WindowWithWebkitAudio = Window &
    typeof globalThis & {
        webkitAudioContext?: typeof AudioContext;
    };

export const playNotificationSound = async () => {
    if (typeof window === "undefined") return;

    const AudioContextConstructor = window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;
    if (!AudioContextConstructor) return;

    const audioContext = new AudioContextConstructor();

    try {
        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const startAt = audioContext.currentTime;
        const stopAt = startAt + 0.16;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, startAt);
        oscillator.frequency.exponentialRampToValueAtTime(660, stopAt);

        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(0.16, startAt + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);

        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.addEventListener("ended", () => {
            void audioContext.close();
        });
        oscillator.start(startAt);
        oscillator.stop(stopAt);
    } catch {
        await audioContext.close();
    }
};
