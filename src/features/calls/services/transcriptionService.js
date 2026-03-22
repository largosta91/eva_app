/**
 * transcriptionService.js
 * Motor de transcripción en tiempo real usando Web Speech API.
 * Sin backend, sin claves, todo corre en el navegador.
 */

const DEFAULT_OPTIONS = {
  lang: 'es-ES',          // Idioma por defecto
  continuous: true,        // No para después de una pausa
  interimResults: true,    // Resultados parciales mientras habla
  maxAlternatives: 1,
};

export function createTranscriptionService(options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // Detecta prefijo del navegador
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn(
      '[TranscriptionService] Web Speech API no está disponible en este navegador. ' +
      'Usá Chrome para máxima compatibilidad.'
    );
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang              = config.lang;
  recognition.continuous        = config.continuous;
  recognition.interimResults    = config.interimResults;
  recognition.maxAlternatives   = config.maxAlternatives;

  // Estado interno
  let isRunning    = false;
  let onTranscript = null; // callback(text, isFinal)
  let onError      = null; // callback(error)
  let onStatusChange = null; // callback(status: 'started'|'stopped'|'error')

  // ── Handlers ──────────────────────────────────────────────

  recognition.onstart = () => {
    isRunning = true;
    onStatusChange?.('started');
  };

  recognition.onend = () => {
    // Si estaba corriendo y terminó solo (p.ej. silencio largo),
    // lo reiniciamos para mantener continuous de verdad.
    if (isRunning) {
      try {
        recognition.start();
      } catch (e) { void e; }
    } else {
      onStatusChange?.('stopped');
    }
  };

  recognition.onerror = (event) => {
    // 'no-speech' es normal, no lo tratamos como error crítico
    if (event.error === 'no-speech') return;

    // 'aborted' ocurre al detener manualmente
    if (event.error === 'aborted') return;

    console.error('[TranscriptionService] Error:', event.error);
    onError?.(event.error);
    onStatusChange?.('error');
  };

  recognition.onresult = (event) => {
    const resultIndex = event.resultIndex;
    const result      = event.results[resultIndex];
    const transcript  = result[0].transcript.trim();
    const isFinal     = result.isFinal;

    if (transcript) {
      onTranscript?.(transcript, isFinal);
    }
  };

  // ── API pública ────────────────────────────────────────────

  return {
    /**
     * Inicia la escucha.
     * @param {Object} handlers
     * @param {Function} handlers.onTranscript  (text, isFinal) => void
     * @param {Function} [handlers.onError]     (errorCode) => void
     * @param {Function} [handlers.onStatusChange] (status) => void
     */
    start({ onTranscript: _ot, onError: _oe, onStatusChange: _os } = {}) {
      onTranscript    = _ot;
      onError         = _oe;
      onStatusChange  = _os;

      if (isRunning) return;
      isRunning = true;

      try {
        recognition.start();
      } catch (err) {
        console.error('[TranscriptionService] No se pudo iniciar:', err);
        isRunning = false;
      }
    },

    /** Detiene la escucha limpiamente. */
    stop() {
      isRunning = false;
      try {
        recognition.stop();
      } catch (e) { void e; }
    },

    /** Cambia el idioma (detiene y reinicia si estaba activo). */
    setLanguage(lang) {
      const wasRunning = isRunning;
      if (wasRunning) this.stop();
      recognition.lang = lang;
      if (wasRunning) this.start({ onTranscript, onError, onStatusChange });
    },

    get isRunning() { return isRunning; },
    get isSupported() { return true; },
  };
}

/** Verifica soporte sin instanciar el servicio. */
export function isSpeechRecognitionSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}