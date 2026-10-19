import { useState, useEffect, useRef, useCallback } from 'react';

interface TTSOptions {
  enabled: boolean;
  lang?: string;
  rate?: number;
  pitch?: number;
  voiceURI?: string;
  preferFemale?: boolean;
}

export function useSpeechSynthesis({
  enabled,
  lang = 'en-US',
  rate = 1,
  pitch = 1,
  voiceURI,
  preferFemale = true,
}: TTSOptions) {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!supported) return;
    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length) setVoices(v);
    };
    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    };
  }, [supported]);

  const selectVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!voices.length) return null;
    if (voiceURI) {
      const match = voices.find((v) => v.voiceURI === voiceURI);
      if (match) return match;
    }
    const matchingLang = voices.filter((v) => v.lang.startsWith(lang.slice(0, 2)));
    const pool = matchingLang.length ? matchingLang : voices;
    if (preferFemale) {
      const female = pool.find(
        (v) =>
          /\b(?:female|woman|girl|samantha|victoria|karen|moira|zira|susan)\b/i.test(v.name) ||
          /\b(?:google|natural)\b/i.test(v.name)
      );
      if (female) return female;
    }
    return pool[0] || null;
  }, [voices, voiceURI, lang, preferFemale]);

  const cancel = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !enabled || !text.trim()) return;
      cancel();
      // Clean markdown, links, emoji, code blocks for speech
      const cleaned = text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_~#>]/g, '')
        .replace(/\bhttps?:\/\/\S+/gi, 'link')
        .trim();

      if (!cleaned) return;

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = Math.max(0.7, Math.min(1.5, rate));
      utterance.pitch = Math.max(0.8, Math.min(1.4, pitch));
      utterance.lang = lang;

      const voice = selectVoice();
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [supported, enabled, cancel, rate, pitch, lang, selectVoice]
  );

  return {
    supported,
    speaking,
    speak,
    cancel,
    voices,
  };
}

export function useSpeechRecognition(
  enabled: boolean,
  onResult: (transcript: string) => void
) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const recognitionRef = useRef<any>(null);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setListening(false);
  }, []);

  const start = useCallback(() => {
    if (!supported || !enabled) return;
    stop();
    setError(null);

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        onResult(transcript);
      }
      setListening(false);
    };

    recognition.onerror = (e: any) => {
      console.warn('Speech recognition error:', e.error);
      setError(e.error === 'not-allowed' ? 'Microphone permission denied' : 'Speech recognition error');
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.error(err);
      setListening(false);
    }
  }, [supported, enabled, stop, onResult]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    supported,
    listening,
    error,
    start,
    stop,
  };
}

export function useWakeWord({
  enabled,
  wakeWord = 'hey bits',
  onCommand,
  onStop,
}: {
  enabled: boolean;
  wakeWord?: string;
  onCommand: (cmd: string) => void;
  onStop: () => void;
}) {
  const [active, setActive] = useState(false);
  const [armed, setArmed] = useState(false);
  const supported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Background listener for wake word when alwaysListening is true
  useEffect(() => {
    if (!supported || !enabled) {
      setActive(false);
      setArmed(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    let rec: any = null;
    let shouldListen = true;

    const startLoop = () => {
      if (!shouldListen) return;
      try {
        rec = new SpeechRec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onstart = () => setActive(true);
        rec.onresult = (e: any) => {
          const res = e.results[e.results.length - 1];
          const text = res[0]?.transcript?.trim().toLowerCase();
          if (!text) return;

          const wake = wakeWord.toLowerCase();
          if (text.includes(wake)) {
            setArmed(true);
            const remainder = text.split(wake)[1]?.trim();
            if (remainder && remainder.length > 2) {
              setArmed(false);
              onCommand(remainder);
            }
          } else if (armed && res.isFinal) {
            setArmed(false);
            onCommand(text);
          }
        };

        rec.onerror = () => {};
        rec.onend = () => {
          if (shouldListen) {
            setTimeout(startLoop, 400);
          }
        };
        rec.start();
      } catch {
        // loop back after delay
        if (shouldListen) setTimeout(startLoop, 1000);
      }
    };

    startLoop();

    return () => {
      shouldListen = false;
      if (rec) {
        try {
          rec.abort();
        } catch {}
      }
      setActive(false);
      setArmed(false);
    };
  }, [supported, enabled, wakeWord, armed, onCommand]);

  return { supported, active, armed };
}
