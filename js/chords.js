// Chord Data & Functions

// ============================================
// CHORD DATA & FUNCTIONS
// ============================================

// 12 keys with display names (using slash for enharmonics)
const CHORD_KEYS = [
    { root: 'C',  display: 'C' },
    { root: 'C#', display: 'C#/Db' },
    { root: 'D',  display: 'D' },
    { root: 'D#', display: 'D#/Eb' },
    { root: 'E',  display: 'E' },
    { root: 'F',  display: 'F' },
    { root: 'F#', display: 'F#/Gb' },
    { root: 'G',  display: 'G' },
    { root: 'G#', display: 'G#/Ab' },
    { root: 'A',  display: 'A' },
    { root: 'A#', display: 'A#/Bb' },
    { root: 'B',  display: 'B' }
];

// 8 chord types with intervals (semitones from root)
const CHORD_TYPES = {
    'major': { symbol: '', name: 'Major', intervals: [0, 4, 7], degrees: ['1', '3', '5'] },
    'minor': { symbol: 'm', name: 'Minor', intervals: [0, 3, 7], degrees: ['1', '♭3', '5'] },
    'm7':    { symbol: 'm7', name: 'Minor 7', intervals: [0, 3, 7, 10], degrees: ['1', '♭3', '5', '♭7'] },
    '6':     { symbol: '6', name: 'Sixth', intervals: [0, 4, 7, 9], degrees: ['1', '3', '5', '6'] },
    '7':     { symbol: '7', name: 'Seventh', intervals: [0, 4, 7, 10], degrees: ['1', '3', '5', '♭7'] },
    'dim':   { symbol: 'dim', name: 'Diminished', intervals: [0, 3, 6], degrees: ['1', '♭3', '♭5'] },
    'sus4':  { symbol: 'sus4', name: 'Sus4', intervals: [0, 5, 7], degrees: ['1', '4', '5'] },
    'aug':   { symbol: 'aug', name: 'Augmented', intervals: [0, 4, 8], degrees: ['1', '3', '#5'] }
};

// Chord types grouped for display with separators between groups
const CHORD_TYPE_GROUPS = [
    ['major', 'minor', 'm7'],  // Group 1
    ['6', '7'],                 // Group 2
    ['dim'],                    // Group 3
    ['sus4'],                   // Group 4
    ['aug']                     // Group 5
];

// Ordered list of chord types (flattened groups)
const CHORD_TYPE_ORDER = CHORD_TYPE_GROUPS.flat();

// Finger notation mapping
const FINGER_NOTATION = {
    numbers: { 1: '1', 2: '2', 3: '3', 4: '4', T: 'T' },
    pima: { 1: 'I', 2: 'M', 3: 'A', 4: 'P', T: 'P' }
};

// Convert note name to pitch class (0-11)
function noteToPitchClass(note) {
    const normalized = normalizeNote(note);
    return CHROMATIC_SCALE.indexOf(normalized);
}

// Get chord pitch classes from root and type
function getChordPitchClasses(rootNote, chordType) {
    const type = CHORD_TYPES[chordType];
    if (!type) return [];

    const rootPitch = noteToPitchClass(rootNote);
    if (rootPitch === -1) return [];

    return type.intervals.map(interval => (rootPitch + interval) % 12);
}

// Get all notes in a chord (as note names)
function getChordNotes(rootNote, chordType) {
    const pitchClasses = getChordPitchClasses(rootNote, chordType);
    return pitchClasses.map(pc => CHROMATIC_SCALE[pc]);
}

// Find chord voicing for 4-string banjo (excludes 5th drone string for low positions)
// For 5-string banjo, we only use the 4 main strings for chords (DGBD in Open G)
function findChordVoicing(tuningData, rootNote, chordType, maxFret = 12) {
    const chordPitchClasses = getChordPitchClasses(rootNote, chordType);
    if (chordPitchClasses.length === 0) return null;

    const type = CHORD_TYPES[chordType];
    const rootPitch = noteToPitchClass(rootNote);

    // Get the 4 main strings (exclude 5th/drone string for 5-string banjo)
    const allStrings = tuningData.strings;
    const shortStringIdx = tuningData.shortStringIndex;

    // For 5-string banjo, use strings 1-4 (indices 1-4), exclude index 0 (5th string)
    // For 4-string banjo, use all strings
    let mainStrings;
    if (shortStringIdx === 0 && allStrings.length === 5) {
        // 5-string banjo: use strings at indices 1,2,3,4 (4th,3rd,2nd,1st strings)
        mainStrings = allStrings.slice(1);
    } else {
        mainStrings = allStrings;
    }

    const numStrings = mainStrings.length;
    const stringPitchClasses = mainStrings.map(note => noteToPitchClass(note));

    // Find all valid voicings using recursive backtracking
    const results = [];
    const maxReach = 4;
    const maxFingers = 4;

    function explore(stringIdx, currentVoicing, usedTones) {
        const fingersUsed = currentVoicing.filter(v => v && v.fret > 0).length;
        if (fingersUsed > maxFingers) return;

        const frettedFrets = currentVoicing.filter(v => v && v.fret > 0).map(v => v.fret);
        if (frettedFrets.length > 1) {
            const reach = Math.max(...frettedFrets) - Math.min(...frettedFrets);
            if (reach > maxReach) return;
        }

        if (stringIdx === numStrings) {
            if (usedTones.size === chordPitchClasses.length) {
                results.push([...currentVoicing]);
            }
            return;
        }

        const stringPitch = stringPitchClasses[stringIdx];

        // Option 1: Mute this string
        explore(stringIdx + 1, [...currentVoicing, null], new Set(usedTones));

        // Try each fret position (0 = open, up to maxFret)
        for (let fret = 0; fret <= maxFret; fret++) {
            const pitchAtFret = (stringPitch + fret) % 12;
            const toneIndex = chordPitchClasses.indexOf(pitchAtFret);

            if (toneIndex !== -1) {
                const newUsedTones = new Set(usedTones);
                newUsedTones.add(pitchAtFret);

                explore(stringIdx + 1, [...currentVoicing, {
                    fret: fret,
                    pitchClass: pitchAtFret,
                    toneIndex: toneIndex,
                    note: CHROMATIC_SCALE[pitchAtFret]
                }], newUsedTones);
            }
        }
    }

    explore(0, [], new Set());

    if (results.length === 0) return null;

    // Score and sort voicings
    function scoreVoicing(voicing) {
        const sounding = voicing.filter(v => v !== null);
        const fretted = sounding.filter(v => v.fret > 0);
        const minFret = fretted.length > 0 ? Math.min(...fretted.map(v => v.fret)) : 0;
        const maxFretUsed = fretted.length > 0 ? Math.max(...fretted.map(v => v.fret)) : 0;
        const span = maxFretUsed - minFret;
        const openCount = sounding.filter(v => v.fret === 0).length;
        const soundingCount = sounding.length;
        return minFret * 100 + span * 50 - openCount * 30 - soundingCount * 10;
    }

    results.sort((a, b) => scoreVoicing(a) - scoreVoicing(b));
    const bestVoicing = results[0];

    // Convert to position format for rendering
    // Positions are ordered: string 4 (index 0), string 3, string 2, string 1 (index 3)
    const positions = bestVoicing.map((pos, idx) => {
        const stringNum = 4 - idx; // 4, 3, 2, 1

        if (pos === null) {
            return {
                stringNum: stringNum,
                fret: null,
                muted: true,
                note: null,
                degree: null,
                isRoot: false
            };
        }

        const degree = type.degrees[pos.toneIndex];
        const isRoot = pos.pitchClass === rootPitch;

        return {
            stringNum: stringNum,
            fret: pos.fret,
            muted: false,
            note: pos.note,
            degree: degree,
            isRoot: isRoot
        };
    });

    // Assign finger numbers based on fret position
    // Finger 1 = lowest fret, then 2, 3, 4 in ascending order
    assignFingers(positions);

    // Determine base fret for display
    const frettedPositions = positions.filter(p => p.fret > 0);
    const minFret = frettedPositions.length > 0 ? Math.min(...frettedPositions.map(p => p.fret)) : 1;
    const baseFret = minFret > 4 ? minFret : 1;

    // Check for barre chord
    const barre = detectBarre(positions);

    // Get chord notes for display
    const chordNotes = getChordNotes(rootNote, chordType);

    return {
        positions,
        baseFret,
        barre,
        chordNotes: chordNotes.map(n => displayNote(n)),
        numStrings: numStrings
    };
}

function assignFingers(positions) {
    // Get fretted positions sorted by fret (ascending), then by string number (descending)
    // This ensures: lowest fret first, and at same fret, higher string numbers first
    const fretted = positions
        .filter(p => p.fret > 0)
        .sort((a, b) => {
            if (a.fret !== b.fret) return a.fret - b.fret;
            return b.stringNum - a.stringNum; // Higher string number first at same fret
        });

    if (fretted.length === 0) return;

    // Assign unique finger to each position in sequence
    fretted.forEach((p, idx) => {
        p.finger = Math.min(idx + 1, 4);
    });
}

function detectBarre(positions) {
    const fretGroups = {};
    positions.forEach((p, idx) => {
        if (p.fret > 0) {
            if (!fretGroups[p.fret]) fretGroups[p.fret] = [];
            fretGroups[p.fret].push({ pos: p, idx: idx });
        }
    });

    for (const [fret, group] of Object.entries(fretGroups)) {
        if (group.length >= 2) {
            // Check if they're on adjacent strings
            const stringNums = group.map(g => g.pos.stringNum).sort((a, b) => b - a);
            const minStr = Math.min(...stringNums);
            const maxStr = Math.max(...stringNums);

            if (maxStr - minStr <= 3) {
                return {
                    fret: parseInt(fret),
                    fromString: minStr,
                    toString: maxStr
                };
            }
        }
    }

    return null;
}

// Generate SVG chord diagram for 4 main strings
function generateChordDiagramSVG(voicing, chordName, tuningName, fingerNotation = 'numbers') {
    const width = 140;
    const height = 200;
    const marginLeft = 35;
    const marginTop = 35;
    const marginRight = 15;
    const marginBottom = 25;

    const positions = voicing.positions;
    const numStrings = 4; // Always 4 main strings for chord diagrams
    const numFrets = 6;
    const baseFret = voicing.baseFret;

    const stringSpacing = (width - marginLeft - marginRight) / (numStrings - 1);
    const fretSpacing = (height - marginTop - marginBottom) / numFrets;

    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    // Background
    svg += `<rect width="${width}" height="${height}" fill="white"/>`;

    // Nut (thick line at top) - only show if baseFret is 1
    if (baseFret === 1) {
        svg += `<rect x="${marginLeft - 3}" y="${marginTop - 3}" width="${(numStrings - 1) * stringSpacing + 6}" height="5" fill="#1a1a1a"/>`;
    } else {
        // Show fret number for higher positions
        svg += `<text x="${marginLeft - 15}" y="${marginTop + fretSpacing / 2 + 4}" font-size="11" font-weight="bold" text-anchor="middle">${baseFret}fr</text>`;
    }

    // Fret lines
    for (let i = 0; i <= numFrets; i++) {
        const y = marginTop + i * fretSpacing;
        svg += `<line x1="${marginLeft}" y1="${y}" x2="${marginLeft + (numStrings - 1) * stringSpacing}" y2="${y}" stroke="#333" stroke-width="${i === 0 ? 2 : 1}"/>`;
    }

    // String lines (left to right: string 4, 3, 2, 1)
    for (let i = 0; i < numStrings; i++) {
        const x = marginLeft + i * stringSpacing;
        svg += `<line x1="${x}" y1="${marginTop}" x2="${x}" y2="${marginTop + numFrets * fretSpacing}" stroke="#333" stroke-width="1.5"/>`;
    }

    // String labels at top (4, 3, 2, 1 from left to right)
    for (let i = 0; i < numStrings; i++) {
        const x = marginLeft + i * stringSpacing;
        const stringNum = 4 - i;
        svg += `<text x="${x}" y="${marginTop - 20}" font-size="9" text-anchor="middle" fill="#666">${stringNum}</text>`;
    }

    // 5th string box (same size cell as main grid, flush with it, at fret 5-6)
    // Only show if baseFret is 1 (low position chords)
    if (baseFret === 1) {
        const fret5Y = marginTop + 5 * fretSpacing; // Fret 5 wire
        const fret6Y = marginTop + 6 * fretSpacing; // Fret 6 wire
        const boxLeft = marginLeft - stringSpacing; // One cell width to the left

        // Draw the box - same size as grid cells, flush with main grid
        // Top line (fret 5)
        svg += `<line x1="${boxLeft}" y1="${fret5Y}" x2="${marginLeft}" y2="${fret5Y}" stroke="#333" stroke-width="1"/>`;
        // Bottom line (fret 6)
        svg += `<line x1="${boxLeft}" y1="${fret6Y}" x2="${marginLeft}" y2="${fret6Y}" stroke="#333" stroke-width="1"/>`;
        // Left edge
        svg += `<line x1="${boxLeft}" y1="${fret5Y}" x2="${boxLeft}" y2="${fret6Y}" stroke="#333" stroke-width="1"/>`;

        // Label for 5th string (centered in the box)
        const boxCenterX = boxLeft + stringSpacing / 2;
        svg += `<text x="${boxCenterX}" y="${fret5Y - 8}" font-size="8" text-anchor="middle" fill="#666">5</text>`;
    }

    // Finger positions and open/muted indicators
    positions.forEach((pos, idx) => {
        // idx 0 = string 4 (leftmost), idx 3 = string 1 (rightmost)
        const x = marginLeft + idx * stringSpacing;

        if (pos.muted) {
            // X for muted string
            svg += `<text x="${x}" y="${marginTop - 8}" font-size="12" font-weight="bold" text-anchor="middle" fill="#666">✕</text>`;
        } else if (pos.fret === 0) {
            // Open string circle
            svg += `<circle cx="${x}" cy="${marginTop - 10}" r="5" fill="none" stroke="#333" stroke-width="1.5"/>`;
        } else {
            // Fretted position
            const displayFret = pos.fret - baseFret + 1;
            if (displayFret >= 1 && displayFret <= numFrets) {
                const y = marginTop + (displayFret - 0.5) * fretSpacing;

                // Root notes get filled circle
                if (pos.isRoot) {
                    svg += `<circle cx="${x}" cy="${y}" r="9" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="1.5"/>`;
                    if (pos.finger) {
                        const fingerLabel = FINGER_NOTATION[fingerNotation][pos.finger] || pos.finger;
                        svg += `<text x="${x}" y="${y + 3}" font-size="10" font-weight="bold" text-anchor="middle" fill="white">${fingerLabel}</text>`;
                    }
                } else {
                    svg += `<circle cx="${x}" cy="${y}" r="9" fill="white" stroke="#1a1a1a" stroke-width="1.5"/>`;
                    if (pos.finger) {
                        const fingerLabel = FINGER_NOTATION[fingerNotation][pos.finger] || pos.finger;
                        svg += `<text x="${x}" y="${y + 3}" font-size="10" font-weight="bold" text-anchor="middle">${fingerLabel}</text>`;
                    }
                }
            }
        }
    });

    // Degree labels below strings
    positions.forEach((pos, idx) => {
        const x = marginLeft + idx * stringSpacing;
        const y = marginTop + numFrets * fretSpacing + 15;

        if (pos.degree && !pos.muted) {
            svg += `<text x="${x}" y="${y}" font-size="9" text-anchor="middle" fill="#666">${pos.degree}</text>`;
        } else if (pos.muted) {
            svg += `<text x="${x}" y="${y}" font-size="9" text-anchor="middle" fill="#999">-</text>`;
        }
    });

    svg += '</svg>';
    return svg;
}

