// Universal Banjo Chord Inversion Generator
// Based on the "Color Coded Method" and community forum insights

// ============================================
// CHORD FAMILIES (SRS Section 2.2)
// ============================================
const CHORD_FAMILIES = {
    MAJOR: { name: "Major", key: "major", intervals: [0, 4, 7], degrees: ['1', '3', '5'] },
    DOM7:  { name: "Dominant 7th", key: "dom7", intervals: [0, 4, 7, 10], degrees: ['1', '3', '5', '♭7'] },
    MAJ7:  { name: "Major 7th", key: "maj7", intervals: [0, 4, 7, 11], degrees: ['1', '3', '5', '7'] },
    MIN7:  { name: "Minor 7th", key: "min7", intervals: [0, 3, 7, 10], degrees: ['1', '♭3', '5', '♭7'] }
};

// ============================================
// INVERSION CLASSIFICATION (SRS Section 2.3)
// ============================================
const INVERSION_STYLES = {
    root:    { name: 'Root Form',      bassInterval: 0,  shape: 'triangle', color: '#3366cc', alias: 'F Shape' },
    first:   { name: '1st Inversion',  bassInterval: null, shape: 'triangle', color: '#cc3333', alias: 'D Shape' },
    second:  { name: '2nd Inversion',  bassInterval: 7,  shape: 'rectangle', color: '#cc9900', alias: 'Barre Shape' },
    third:   { name: '3rd Inversion',  bassInterval: null, shape: 'diamond',   color: '#339933', alias: null }
};

// Set the bass intervals for first/third dynamically based on chord type
function getInversionStyle(bassIntervalFromRoot, chordFamily) {
    if (bassIntervalFromRoot === 0) return { ...INVERSION_STYLES.root };

    if (bassIntervalFromRoot === 7) return { ...INVERSION_STYLES.second };

    // 3rd interval (major or minor)
    if (bassIntervalFromRoot === 4 || bassIntervalFromRoot === 3) {
        return { ...INVERSION_STYLES.first };
    }

    // 7th interval (dominant 7th = 10, major 7th = 11)
    if (bassIntervalFromRoot === 10 || bassIntervalFromRoot === 11) {
        return { ...INVERSION_STYLES.third };
    }

    return null;
}

// ============================================
// ACTIVE STRINGS RESOLVER
// ============================================
function getActiveStrings(tuning) {
    const strings = tuning.strings;
    const shortIdx = tuning.shortStringIndex;

    // For 5-string banjo, primary strings are indices 1-4 (strings 4,3,2,1)
    // For 4-string banjo, all strings are primary
    if (shortIdx === 0 && strings.length === 5) {
        return {
            primary: strings.slice(1),
            primaryIndices: [1, 2, 3, 4],
            drone: { note: strings[0], index: 0 },
            stringCount: 4
        };
    }
    return {
        primary: strings.slice(),
        primaryIndices: strings.map((_, i) => i),
        drone: null,
        stringCount: strings.length
    };
}

// ============================================
// UNIVERSAL SHAPE GENERATOR (SRS Section 3.1)
// ============================================

/**
 * Generate all valid chord shapes for a given root, chord family, and tuning.
 *
 * @param {string} rootNote - Root note name (e.g., 'F', 'G', 'C#')
 * @param {string} chordFamilyKey - Key into CHORD_FAMILIES (e.g., 'MAJOR', 'DOM7')
 * @param {object} tuning - Tuning object from TUNINGS_DATA
 * @param {string} voicingMode - 'full' or 'partial'
 * @param {number} maxFret - Maximum fret to search
 * @returns {Array} Array of shape objects
 */
function generateChordShapes(rootNote, chordFamilyKey, tuning, voicingMode = 'full', maxFret = 15) {
    const family = CHORD_FAMILIES[chordFamilyKey];
    if (!family) return [];

    const rootPitch = noteToPitchClass(rootNote);
    if (rootPitch === -1) return [];

    const activeStrings = getActiveStrings(tuning);
    const stringPitches = activeStrings.primary.map(s => noteToPitchClass(normalizeNote(s)));
    const numStrings = activeStrings.stringCount;
    const chordIntervals = family.intervals;
    const chordPitches = chordIntervals.map(iv => (rootPitch + iv) % 12);

    // Find all fret positions where chord tones occur on each string
    const stringChordTones = [];
    for (let si = 0; si < numStrings; si++) {
        const tones = [];
        for (let fret = 0; fret <= maxFret; fret++) {
            const pitch = (stringPitches[si] + fret) % 12;
            const intervalIdx = chordPitches.indexOf(pitch);
            if (intervalIdx !== -1) {
                tones.push({
                    fret: fret,
                    pitch: pitch,
                    interval: chordIntervals[intervalIdx],
                    intervalIndex: intervalIdx,
                    degree: family.degrees[intervalIdx],
                    note: CHROMATIC_SCALE[pitch]
                });
            }
        }
        stringChordTones.push(tones);
    }

    const fullShapes = findFullShapes(stringChordTones, numStrings, chordPitches, chordIntervals, family, rootPitch, rootNote, activeStrings, maxFret);

    if (voicingMode === 'partial') {
        return generatePartialShapes(fullShapes, activeStrings);
    }

    return fullShapes;
}

/**
 * Find all valid full chord shapes (3+ notes on adjacent or near-adjacent strings).
 */
function findFullShapes(stringChordTones, numStrings, chordPitches, chordIntervals, family, rootPitch, rootNote, activeStrings, maxFret) {
    const shapes = [];
    const maxReach = 5; // Max fret span within a shape
    const minNotes = Math.min(3, numStrings); // At least 3 notes (or all strings for 3-string instruments)

    // Use sliding window approach: for each possible cluster of adjacent strings
    for (let startStr = 0; startStr < numStrings; startStr++) {
        for (let endStr = startStr + minNotes - 1; endStr < numStrings; endStr++) {
            const strRange = endStr - startStr + 1;

            // Generate combinations of one tone per string in this range
            findCombinations(stringChordTones, startStr, endStr, maxReach, chordPitches, (combo) => {
                // Check that we have enough unique chord tones
                const uniquePitches = new Set(combo.map(c => c.pitch));
                const coveredTones = chordPitches.filter(p => uniquePitches.has(p));

                // For triads: need all 3 tones. For 7ths: need at least 3 (ideally all 4)
                const minRequired = chordIntervals.length <= 3 ? chordIntervals.length : 3;
                if (coveredTones.length < minRequired) return;

                // Classify the shape based on the lowest-pitched string's interval
                const bassNote = combo[0]; // Lowest string = first in the combo
                const bassInterval = bassNote.interval;
                const inversionStyle = getInversionStyle(bassInterval, family);
                if (!inversionStyle) return;

                const frets = combo.map(c => c.fret);
                const frettedFrets = frets.filter(f => f > 0);
                const lowestFret = frettedFrets.length > 0 ? Math.min(...frettedFrets) : 0;
                const highestFret = frets.length > 0 ? Math.max(...frets) : 0;

                // Skip shapes that extend beyond the fretboard
                if (highestFret > maxFret) return;

                shapes.push({
                    notes: combo.map((c, ci) => ({
                        stringIndex: activeStrings.primaryIndices[startStr + ci],
                        localStringIndex: startStr + ci,
                        fret: c.fret,
                        pitch: c.pitch,
                        interval: c.interval,
                        intervalIndex: c.intervalIndex,
                        degree: c.degree,
                        note: c.note
                    })),
                    frets: frets,
                    lowestFret: lowestFret,
                    highestFret: highestFret,
                    startString: startStr,
                    endString: endStr,
                    classification: inversionStyle,
                    bassInterval: bassInterval,
                    bassNote: bassNote.degree,
                    rootNote: rootNote,
                    rootPitch: rootPitch,
                    chordFamily: family,
                    intervals: combo.map(c => c.degree),
                    relativePosition: null // Will be assigned after sorting
                });
            });
        }
    }

    // Sort by lowest fret (ascending) for position naming
    shapes.sort((a, b) => a.lowestFret - b.lowestFret || a.startString - b.startString);

    // Assign relative position names (SRS Section 2.4)
    shapes.forEach((shape, idx) => {
        shape.relativePosition = ordinalPosition(idx + 1);
    });

    return shapes;
}

/**
 * Generate all valid combinations of one chord tone per string within fret reach.
 */
function findCombinations(stringChordTones, startStr, endStr, maxReach, chordPitches, callback) {
    const strCount = endStr - startStr + 1;

    function recurse(strIdx, combo, minFret, maxFret) {
        if (strIdx > endStr) {
            callback([...combo]);
            return;
        }

        const tones = stringChordTones[strIdx];
        for (const tone of tones) {
            const newMin = combo.length === 0 ? (tone.fret === 0 ? 999 : tone.fret) : Math.min(minFret, tone.fret === 0 ? 999 : tone.fret);
            const newMax = combo.length === 0 ? (tone.fret === 0 ? 0 : tone.fret) : Math.max(maxFret, tone.fret);
            const actualMin = newMin === 999 ? 0 : newMin;
            const reach = (newMax === 0 && actualMin === 0) ? 0 : newMax - actualMin;

            if (reach <= maxReach) {
                combo.push(tone);
                recurse(strIdx + 1, combo, newMin, newMax);
                combo.pop();
            }
        }
    }

    recurse(startStr, [], 999, 0);
}

/**
 * Generate partial voicings (Double Stops / Dyads) from full shapes.
 * Deconstructs full shapes into adjacent 2-string pairs that contain defining chord tones.
 */
function generatePartialShapes(fullShapes, activeStrings) {
    const partials = [];
    const seen = new Set();

    for (const shape of fullShapes) {
        const notes = shape.notes;

        // Generate adjacent 2-string pairs
        for (let i = 0; i < notes.length - 1; i++) {
            const pair = [notes[i], notes[i + 1]];

            // Check that the pair contains at least one defining tone (root or 3rd/b3)
            const hasRoot = pair.some(n => n.interval === 0);
            const hasThird = pair.some(n => n.interval === 3 || n.interval === 4);

            if (hasRoot || hasThird) {
                const key = `${pair[0].stringIndex}_${pair[0].fret}_${pair[1].stringIndex}_${pair[1].fret}`;
                if (seen.has(key)) continue;
                seen.add(key);

                // Classify based on lowest string's interval
                const bassInterval = pair[0].interval;
                const inversionStyle = getInversionStyle(bassInterval, shape.chordFamily);
                if (!inversionStyle) continue;

                partials.push({
                    notes: pair.map(n => ({ ...n })),
                    frets: pair.map(n => n.fret),
                    lowestFret: Math.min(...pair.map(n => n.fret > 0 ? n.fret : 999)) === 999 ? 0 : Math.min(...pair.filter(n => n.fret > 0).map(n => n.fret)),
                    highestFret: Math.max(...pair.map(n => n.fret)),
                    startString: pair[0].localStringIndex,
                    endString: pair[1].localStringIndex,
                    classification: inversionStyle,
                    bassInterval: bassInterval,
                    bassNote: pair[0].degree,
                    rootNote: shape.rootNote,
                    rootPitch: shape.rootPitch,
                    chordFamily: shape.chordFamily,
                    intervals: pair.map(n => n.degree),
                    relativePosition: null,
                    isPartial: true,
                    parentShape: shape.classification.name
                });
            }
        }
    }

    // Sort and assign positions
    partials.sort((a, b) => a.lowestFret - b.lowestFret || a.startString - b.startString);
    partials.forEach((shape, idx) => {
        shape.relativePosition = ordinalPosition(idx + 1);
    });

    return partials;
}

// ============================================
// DYNAMIC CONNECTOR LOGIC (SRS Section 3.2)
// ============================================

/**
 * Calculate the tuning interval between specific strings for connector arrows.
 * Generalized "5-Fret Rule".
 */
function calculateTuningInterval(tuning) {
    const active = getActiveStrings(tuning);
    if (active.stringCount < 2) return 0;

    // SRS: TuningInterval = (Tuning.strings[Index3] - Tuning.strings[Index4] + 12) % 12
    // In musical notation: String 4 is the lowest main string, String 3 is next.
    // In our primary array: index 0 = String 4, index 1 = String 3
    const str4Idx = 0; // String 4 (lowest main string)
    const str3Idx = Math.min(1, active.stringCount - 1); // String 3

    if (str4Idx === str3Idx) return 0;

    const pitch3 = noteToPitchClass(normalizeNote(active.primary[str3Idx]));
    const pitch4 = noteToPitchClass(normalizeNote(active.primary[str4Idx]));

    return (pitch3 - pitch4 + 12) % 12;
}

/**
 * Determine valid connectors between shape pairs based on tuning interval.
 */
function findShapeConnectors(shapes, tuning) {
    const tuningInterval = calculateTuningInterval(tuning);
    const connectors = [];

    for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
            const current = shapes[i];
            const next = shapes[j];

            const fretDistance = next.lowestFret - current.lowestFret;

            if (fretDistance === tuningInterval && fretDistance > 0) {
                connectors.push({
                    from: current,
                    to: next,
                    fromIndex: i,
                    toIndex: j,
                    fretDistance: fretDistance,
                    tuningInterval: tuningInterval
                });
            }
        }
    }

    return connectors;
}

// ============================================
// MOVABLE SHAPE LOGIC
// ============================================

/**
 * Calculate the movable shape information for a chord shape.
 * E.g., "F Shape + 2 Frets" for a G chord at fret 2.
 */
function getMovableShapeInfo(shape) {
    const classAlias = shape.classification.alias;
    if (!classAlias) return null;

    const lowestFret = shape.lowestFret;
    if (lowestFret === 0) {
        return { alias: classAlias, offset: 0, description: classAlias };
    }
    return {
        alias: classAlias,
        offset: lowestFret,
        description: `${classAlias} + ${lowestFret} Fret${lowestFret !== 1 ? 's' : ''}`
    };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function ordinalPosition(n) {
    const suffix = (n === 1) ? 'st' : (n === 2) ? 'nd' : (n === 3) ? 'rd' : 'th';
    return `${n}${suffix} Position`;
}

/**
 * Filter shapes by inversion type(s).
 * @param {Array} shapes - Array of shape objects
 * @param {Array} inversionTypes - Array of inversion names to include (e.g., ['Root Form', '1st Inversion'])
 */
function filterShapesByInversion(shapes, inversionTypes) {
    if (!inversionTypes || inversionTypes.length === 0) return shapes;
    return shapes.filter(s => inversionTypes.includes(s.classification.name));
}

/**
 * Get the note frequencies for a shape (for audio playback).
 * Uses standard A4=440Hz equal temperament.
 */
function getShapeFrequencies(shape, tuning) {
    const A4 = 440;
    const active = getActiveStrings(tuning);

    return shape.notes.map(note => {
        const stringIdx = note.localStringIndex;
        const openNote = active.primary[stringIdx];
        const parsed = parseNoteWithOctave(openNote);
        if (!parsed) return null;

        // Calculate MIDI-like note number
        const openPitchClass = CHROMATIC_SCALE.indexOf(parsed.note);
        const openMidi = (parsed.octave + 1) * 12 + openPitchClass;
        const actualMidi = openMidi + note.fret;

        // Convert MIDI to frequency
        const freq = A4 * Math.pow(2, (actualMidi - 69) / 12);
        return {
            frequency: freq,
            note: note.note,
            degree: note.degree,
            stringIndex: note.stringIndex,
            midi: actualMidi
        };
    }).filter(Boolean);
}
