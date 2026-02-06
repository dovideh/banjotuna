// Chromatic Scale & Note Utilities

const CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Normalize note names (flats to sharps, handle case)
const NOTE_MAP = {
    'c': 'C', 'c#': 'C#', 'db': 'C#', 'Db': 'C#',
    'd': 'D', 'd#': 'D#', 'eb': 'D#', 'Eb': 'D#',
    'e': 'E', 'fb': 'E', 'Fb': 'E',
    'f': 'F', 'e#': 'F', 'E#': 'F', 'f#': 'F#', 'gb': 'F#', 'Gb': 'F#',
    'g': 'G', 'g#': 'G#', 'ab': 'G#', 'Ab': 'G#',
    'a': 'A', 'a#': 'A#', 'bb': 'A#', 'Bb': 'A#',
    'b': 'B', 'cb': 'B', 'Cb': 'B', 'b#': 'C', 'B#': 'C',
    'C': 'C', 'C#': 'C#', 'D': 'D', 'D#': 'D#', 'E': 'E',
    'F': 'F', 'F#': 'F#', 'G': 'G', 'G#': 'G#', 'A': 'A', 'A#': 'A#', 'B': 'B'
};

// Display note mapping - prefer flats for G# and A# (as per user's Python script)
const DISPLAY_NOTE_MAP = {
    'G#': 'Ab',
    'A#': 'Bb'
    // Keep D#, C#, F# as sharps
};

// Solfège mapping: C=Do, D=Re, E=Mi, F=Fa, G=Sol, A=La, B=Si
const SOLFEGE_MAP = {
    'C': 'Do', 'D': 'Re', 'E': 'Mi', 'F': 'Fa',
    'G': 'Sol', 'A': 'La', 'B': 'Si'
};

function normalizeNote(note) {
    return NOTE_MAP[note] || note.toUpperCase();
}

// Check if a note is natural (no sharps or flats)
function isNaturalNote(note) {
    const normalized = normalizeNote(note);
    return ['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(normalized);
}

function displayNote(note) {
    // Convert internal sharp note to preferred display (mix of flats and sharps)
    if (DISPLAY_NOTE_MAP[note]) {
        return DISPLAY_NOTE_MAP[note];
    }
    return note;
}

function toSolfege(note) {
    // Convert a note to solfège notation
    // Handle sharps/flats: C# -> Do#, Db -> Reb, etc.
    const baseNote = note.charAt(0).toUpperCase();
    const accidental = note.slice(1); // # or b or empty
    const solfege = SOLFEGE_MAP[baseNote] || baseNote;
    return solfege + accidental;
}

function getNoteAtFret(openNote, fret) {
    const normalized = normalizeNote(openNote);
    const startIndex = CHROMATIC_SCALE.indexOf(normalized);
    if (startIndex === -1) return openNote;
    const newIndex = (startIndex + fret) % 12;
    return CHROMATIC_SCALE[newIndex];
}

