// Speech Recognition and Synthesis utility for Aura Virtual Assistant

export interface SpeechRecognitionEvent extends Event {
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

export class SpeechHandler {
  private recognition: any = null;
  private isListening = false;
  private isVoiceMuted = false;

  constructor(
    private onTranscript: (text: string) => void,
    private onStatusChange: (status: 'idle' | 'listening' | 'processing' | 'speaking') => void
  ) {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'es-ES';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.onStatusChange('listening');
        };

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            this.onTranscript(currentTranscript);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          this.isListening = false;
          this.onStatusChange('idle');
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.onStatusChange('idle');
        };
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (err) {
        console.warn('Recognition start failed:', err);
      }
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Recognition stop failed:', err);
      }
    }
  }

  public toggleMute(muted: boolean) {
    this.isVoiceMuted = muted;
    if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public speak(text: string, onEnd?: () => void) {
    if (this.isVoiceMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Select Spanish voice if available
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(
        (v) => v.lang.startsWith('es') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Monica') || v.name.includes('Jorge') || v.name.includes('Lucia'))
      ) || voices.find((v) => v.lang.startsWith('es'));

      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      this.onStatusChange('speaking');

      utterance.onend = () => {
        this.onStatusChange('idle');
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.onStatusChange('idle');
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      this.onStatusChange('idle');
      if (onEnd) onEnd();
    }
  }

  public cancelSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.onStatusChange('idle');
    }
  }
}
