// Audio Synthesis & Metronome Module
// SRS Sections 6.1 and 6.2

// ============================================
// AUDIO CONTEXT MANAGEMENT
// ============================================
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// ============================================
// BANJO SOUND SYNTHESIS
// ============================================

/**
 * Create a banjo-like plucked string sound.
 * Uses Karplus-Strong-inspired synthesis with filtered noise burst.
 */
function createBanjoTone(ctx, frequency, startTime, duration = 0.8) {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Banjo has a bright, percussive attack with quick decay
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, startTime);

    // Add slight detuning for warmth
    const detune = ctx.createOscillator();
    const detuneGain = ctx.createGain();
    detune.type = 'sawtooth';
    detune.frequency.setValueAtTime(frequency * 2, startTime);
    detuneGain.gain.setValueAtTime(0.05, startTime);

    // Bandpass filter for banjo character
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(frequency * 3, startTime);
    filter.Q.setValueAtTime(2, startTime);

    // Envelope: sharp attack, moderate decay, no sustain
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.15, startTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration + 0.02);

    // Connect
    osc.connect(filter);
    detune.connect(detuneGain);
    detuneGain.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
    detune.start(startTime);
    detune.stop(startTime + duration + 0.05);

    return { osc, detune, gainNode };
}

// ============================================
// PLAYBACK MODES (SRS Section 6.1)
// ============================================

/**
 * Play a chord shape in arpeggio mode (sequential notes).
 * @param {Array} frequencies - Array of {frequency, note, degree} objects
 * @param {number} noteSpacing - Time between notes in seconds
 * @param {number} noteDuration - Duration of each note in seconds
 */
function playArpeggio(frequencies, noteSpacing = 0.15, noteDuration = 0.8) {
    if (!frequencies || frequencies.length === 0) return;

    const ctx = getAudioContext();
    const now = ctx.currentTime;

    frequencies.forEach((freq, idx) => {
        if (freq && freq.frequency > 0) {
            createBanjoTone(ctx, freq.frequency, now + idx * noteSpacing, noteDuration);
        }
    });
}

/**
 * Play a chord shape in block mode (simultaneous notes).
 * @param {Array} frequencies - Array of {frequency, note, degree} objects
 * @param {number} duration - Duration in seconds
 */
function playBlock(frequencies, duration = 1.0) {
    if (!frequencies || frequencies.length === 0) return;

    const ctx = getAudioContext();
    const now = ctx.currentTime;

    frequencies.forEach(freq => {
        if (freq && freq.frequency > 0) {
            createBanjoTone(ctx, freq.frequency, now, duration);
        }
    });
}

/**
 * Play a shape using the specified mode.
 */
function playShape(shape, tuning, mode = 'arpeggio') {
    const frequencies = getShapeFrequencies(shape, tuning);
    if (mode === 'arpeggio') {
        playArpeggio(frequencies);
    } else {
        playBlock(frequencies);
    }
}

// ============================================
// METRONOME (SRS Section 6.2)
// ============================================
let metronomeTimer = null;
let metronomeState = {
    bpm: 80,
    isRunning: false,
    currentShapeIndex: 0,
    shapes: [],
    tuning: null,
    cycleMode: false,
    playMode: 'arpeggio',
    beatCount: 0,
    beatsPerShape: 4
};

/**
 * Create a click sound for the metronome.
 */
function createClick(ctx, startTime, isAccent = false) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isAccent ? 1000 : 800, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(isAccent ? 0.3 : 0.15, startTime + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.06);
}

/**
 * Start the metronome with cycle mode.
 * In cycle mode, automatically advances to the "Next Shape Up" on each measure.
 */
function startMetronome(shapes, tuning, options = {}) {
    stopMetronome();

    metronomeState.bpm = options.bpm || 80;
    metronomeState.shapes = shapes || [];
    metronomeState.tuning = tuning;
    metronomeState.cycleMode = options.cycleMode !== false;
    metronomeState.playMode = options.playMode || 'arpeggio';
    metronomeState.beatsPerShape = options.beatsPerShape || 4;
    metronomeState.currentShapeIndex = 0;
    metronomeState.beatCount = 0;
    metronomeState.isRunning = true;

    const intervalMs = 60000 / metronomeState.bpm;

    function tick() {
        if (!metronomeState.isRunning) return;

        const ctx = getAudioContext();
        const isAccent = metronomeState.beatCount % metronomeState.beatsPerShape === 0;

        createClick(ctx, ctx.currentTime, isAccent);

        // On accent beat (first beat of measure), play the current shape and flash
        if (isAccent && metronomeState.cycleMode && metronomeState.shapes.length > 0) {
            const shape = metronomeState.shapes[metronomeState.currentShapeIndex];
            if (shape && metronomeState.tuning) {
                playShape(shape, metronomeState.tuning, metronomeState.playMode);
            }

            // Dispatch event for visual cue
            document.dispatchEvent(new CustomEvent('metronome-shape-change', {
                detail: {
                    shapeIndex: metronomeState.currentShapeIndex,
                    shape: shape,
                    beat: metronomeState.beatCount
                }
            }));

            // Advance to next shape
            metronomeState.currentShapeIndex =
                (metronomeState.currentShapeIndex + 1) % metronomeState.shapes.length;
        }

        metronomeState.beatCount++;
    }

    tick(); // First beat immediately
    metronomeTimer = setInterval(tick, intervalMs);
}

/**
 * Stop the metronome.
 */
function stopMetronome() {
    if (metronomeTimer) {
        clearInterval(metronomeTimer);
        metronomeTimer = null;
    }
    metronomeState.isRunning = false;
    metronomeState.beatCount = 0;
    metronomeState.currentShapeIndex = 0;
}

/**
 * Toggle metronome on/off.
 */
function toggleMetronome(shapes, tuning, options = {}) {
    if (metronomeState.isRunning) {
        stopMetronome();
    } else {
        startMetronome(shapes, tuning, options);
    }
    return metronomeState.isRunning;
}

/**
 * Update metronome BPM while running.
 */
function setMetronomeBPM(bpm) {
    metronomeState.bpm = bpm;
    if (metronomeState.isRunning) {
        // Restart with new BPM
        const shapes = metronomeState.shapes;
        const tuning = metronomeState.tuning;
        const options = {
            bpm: bpm,
            cycleMode: metronomeState.cycleMode,
            playMode: metronomeState.playMode,
            beatsPerShape: metronomeState.beatsPerShape
        };
        startMetronome(shapes, tuning, options);
    }
}
