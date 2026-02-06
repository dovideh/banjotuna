// Fretboard Rendering Functions

// ============================================
// NOTE FORMATTING
// ============================================
function parseNoteWithOctave(noteStr) {
    // Handle format like "G4", "C#3", "g" (lowercase = high octave)
    const match = noteStr.match(/^([A-Ga-g][#b]?)(\d)?$/);
    if (!match) return null;

    let note = match[1];
    let octave = match[2] ? parseInt(match[2]) : null;

    // Lowercase note = high octave (convention from Python script)
    if (note === note.toLowerCase() && !octave) {
        octave = 4; // High octave for 5th string
    } else if (!octave) {
        octave = 3; // Default octave
    }

    return { note: normalizeNote(note), octave };
}

function formatNoteForDisplay(noteStr) {
    const parsed = parseNoteWithOctave(noteStr);
    if (!parsed) return noteStr;

    let note = displayNote(parsed.note);
    // Convert to solfège if enabled
    if (state.useSolfege) {
        note = toSolfege(note);
    }
    // Replace # with sharp symbol, b with flat symbol
    note = note.replace('#', '\u266F').replace('b', '\u266D');

    return `${note}<sub>${parsed.octave}</sub>`;
}

function formatSimpleNote(note) {
    // Format a simple note (no octave) for fretboard display
    let displayed = displayNote(normalizeNote(note));
    // Convert to solfège if enabled
    if (state.useSolfege) {
        displayed = toSolfege(displayed);
    }
    return displayed.replace('#', '\u266F').replace('b', '\u266D');
}

// ============================================
// RENDERING FUNCTIONS
// ============================================
function renderNoteSequence(strings) {
    return strings.map(s => formatNoteForDisplay(s)).join(' ');
}

function renderCapoInfo(capoPositions) {
    return Object.entries(capoPositions)
        .map(([pos, key]) => pos === '0' ? key : `Capo ${pos} → ${key}`)
        .join(' | ');
}

function renderTuningCard(name, tuning) {
    const featuredBadge = tuning.featured ? ' &#11088;' : '';
    const warningBadge = tuning.warning ? ' &#9888;' : '';
    const stringCount = tuning.stringCount || 5;
    const stringBadge = stringCount === 4 ? '<span class="string-count-badge">4-string</span>' : '';

    // Render nut visual
    const nutVisual = tuning.changedStrings.map((changed, i) => {
        const stringNum = stringCount - i;
        return `<div class="string-circle ${changed ? 'changed' : ''}">${stringNum}</div>`;
    }).join('');

    return `
        <div class="tuning-card ${tuning.family}">
            <div class="tuning-header">
                <span class="tuning-name">${name}${featuredBadge}${warningBadge}${stringBadge}</span>
                <span class="genre-tag">${tuning.description}</span>
            </div>
            <div class="note-sequence">${renderNoteSequence(tuning.strings)}</div>
            <div class="nut-visual">
                ${nutVisual}
            </div>
            <div class="tuning-details">
                <div class="delta-line">&#916;: ${tuning.deltaChanges}</div>
                <div class="capo-line">${renderCapoInfo(tuning.capoPositions)}</div>
                <div class="songs-line">${tuning.songs}</div>
            </div>
        </div>
    `;
}

function renderTunings() {
    const container = document.getElementById('tuningsContainer');
    const families = {
        'c-family': { name: 'C-Based Tunings', intro: 'These tunings center around C tonality, ranging from historical minstrel styles to modern old-time favorites. They create bright, modal sounds ideal for melodic playing.' },
        'd-family': { name: 'D-Based Tunings', intro: 'D-based tunings create darker, more mysterious tonal landscapes. These tunings are favored for modal old-time pieces and offer rich harmonic possibilities.' },
        'g-family': { name: 'G-Based Tunings', intro: 'The most common family including the standard bluegrass tuning. These tunings range from bright major chords to modal sounds, offering the widest versatility for different playing styles.' },
        'other-family': { name: 'Other Tunings (4-String)', intro: '4-string banjo tunings for plectrum and tenor banjos. These instruments are commonly used in jazz, Dixieland, and Irish traditional music.' }
    };

    let html = '';

    for (const [familyKey, familyInfo] of Object.entries(families)) {
        if (state.familyFilter !== 'all' && state.familyFilter !== familyKey) continue;

        const tuningsInFamily = Object.entries(TUNINGS_DATA)
            .filter(([_, t]) => t.family === familyKey);

        if (tuningsInFamily.length === 0) continue;

        html += `
            <div class="page-title">${familyInfo.name}</div>
            <div class="family-intro ${familyKey}-intro">
                <strong>${familyKey.toUpperCase().replace('-', ' ')}:</strong> ${familyInfo.intro}
            </div>
            <div class="tunings-grid">
                ${tuningsInFamily.map(([name, tuning]) => renderTuningCard(name, tuning)).join('')}
            </div>
        `;
    }

    container.innerHTML = html;
}

// ============================================
// CHORD INVERSION CALCULATION
// ============================================

// Calculate all major chord inversions for a root note on strings 4-3-2-1
// Returns array of inversion objects with fret positions
function calculateMajorInversions(rootNote, tuningStrings, maxFret = 15) {
    // Major chord intervals: Root=0, 3rd=4, 5th=7
    const ROOT = 0, THIRD = 4, FIFTH = 7;

    // Get pitch class of root note
    const rootPitch = noteToPitchClass(rootNote);
    const thirdPitch = (rootPitch + THIRD) % 12;
    const fifthPitch = (rootPitch + FIFTH) % 12;

    // For Open G tuning, strings 4-3-2-1 are indices 1,2,3,4 (D,G,B,D)
    // We use the 4 main strings for chord shapes
    const mainStrings = tuningStrings.slice(1, 5); // D, G, B, D
    const stringOpenPitches = mainStrings.map(s => noteToPitchClass(normalizeNote(s)));

    // Find fret for a target pitch on a given string
    function findFret(stringPitch, targetPitch, startFret = 0) {
        const diff = (targetPitch - stringPitch + 12) % 12;
        let fret = diff;
        if (fret < startFret) fret += 12;
        return fret;
    }

    // Three inversion patterns (intervals on strings 4-3-2-1):
    // Root Form: 1-3-5-1 (root on string 4)
    // 1st Inversion: 3-5-1-3 (3rd on string 4)
    // 2nd Inversion: 5-1-3-5 (5th on string 4)
    const inversionPatterns = [
        { name: 'Root Form', type: 'root', intervals: [ROOT, THIRD, FIFTH, ROOT], bassNote: 'Root', color: '#3366cc', label: '1 - 3 - 5 - 1' },
        { name: '1st Inversion', type: 'first', intervals: [THIRD, FIFTH, ROOT, THIRD], bassNote: '3rd', color: '#cc3333', label: '3 - 5 - 1 - 3' },
        { name: '2nd Inversion', type: 'second', intervals: [FIFTH, ROOT, THIRD, FIFTH], bassNote: '5th', color: '#cc9900', label: '5 - 1 - 3 - 5' }
    ];

    const inversions = [];

    // Find all occurrences of each inversion pattern
    for (const pattern of inversionPatterns) {
        // Calculate target pitches for each string
        const targetPitches = pattern.intervals.map(interval => (rootPitch + interval) % 12);

        // Find base fret positions (lowest occurrence)
        const baseFrets = [];
        for (let i = 0; i < 4; i++) {
            baseFrets.push(findFret(stringOpenPitches[i], targetPitches[i], 0));
        }

        // Find the minimum fret to normalize the shape
        const minFret = Math.min(...baseFrets.filter(f => f > 0));
        const maxFretInShape = Math.max(...baseFrets);

        // Find all occurrences within the fret range
        for (let offset = 0; offset <= maxFret; offset += 12) {
            const frets = baseFrets.map(f => f === 0 ? 0 : f + offset - (minFret > 0 ? minFret - baseFrets.find(bf => bf === minFret) : 0));
            const adjustedFrets = baseFrets.map(f => {
                let adjusted = f + offset;
                // Handle open strings (fret 0)
                if (f === 0 && offset === 0) return 0;
                if (f === 0 && offset > 0) adjusted = 12 + offset;
                while (adjusted > maxFret + 5) adjusted -= 12;
                return adjusted;
            });

            // Check if this shape is within the displayable range
            const shapeFrets = adjustedFrets.filter(f => f >= 0);
            if (shapeFrets.length > 0 && Math.min(...shapeFrets) <= maxFret) {
                inversions.push({
                    ...pattern,
                    frets: adjustedFrets,
                    baseFret: Math.min(...adjustedFrets.filter(f => f > 0)) || 0
                });
            }
        }
    }

    // Sort by base fret position
    inversions.sort((a, b) => a.baseFret - b.baseFret);

    return inversions;
}

// Render chord inversions on fretboard SVG
function renderInversionsOnFretboard(svg, rootNote, tuning, fbLeft, fbTop, stringSpacing, fretHeight, numFrets, svgWidth) {
    const inversions = calculateMajorInversions(rootNote, tuning.strings, numFrets);
    const displayedNote = displayNote(rootNote);

    // Filter inversions that are fully visible
    const visibleInversions = inversions.filter(inv => {
        const maxFretInShape = Math.max(...inv.frets);
        return maxFretInShape <= numFrets && inv.baseFret >= 1;
    });

    // Render each inversion
    visibleInversions.forEach((inv, idx) => {
        // Calculate positions (strings 4-3-2-1 are at indices 1,2,3,4 in the display)
        const positions = [];
        for (let i = 0; i < 4; i++) {
            const stringIndex = i + 1; // Skip 5th string (index 0)
            const x = fbLeft + stringIndex * stringSpacing;
            const fret = inv.frets[i];
            const y = fbTop + (fret - 0.5) * fretHeight;
            positions.push({ x, y, fret, stringIndex });
        }

        // Draw colored overlay connecting the notes (triangle or polygon)
        const validPositions = positions.filter(p => p.fret > 0 && p.fret <= numFrets);
        if (validPositions.length >= 3) {
            // Create polygon points
            const points = validPositions.map(p => `${p.x},${p.y}`).join(' ');
            svg += `<polygon points="${points}" fill="${inv.color}" fill-opacity="0.25" stroke="${inv.color}" stroke-width="2"/>`;
        }

        // Draw dots on chord positions
        positions.forEach(pos => {
            if (pos.fret > 0 && pos.fret <= numFrets) {
                svg += `<circle cx="${pos.x}" cy="${pos.y}" r="12" fill="${inv.color}" fill-opacity="0.8" stroke="white" stroke-width="2"/>`;
            }
        });

        // Annotation box on the right side
        const annotationX = fbLeft + 5 * stringSpacing + 30;
        const annotationY = fbTop + (inv.baseFret - 0.5) * fretHeight;

        if (inv.baseFret <= numFrets - 2) {
            // Background for annotation
            svg += `<rect x="${annotationX}" y="${annotationY - 30}" width="140" height="70" fill="white" stroke="${inv.color}" stroke-width="2" rx="5"/>`;

            // Chord name and inversion type
            svg += `<text x="${annotationX + 70}" y="${annotationY - 12}" text-anchor="middle" font-size="12" font-weight="bold" fill="${inv.color}">"${displayedNote}" CHORD</text>`;
            svg += `<text x="${annotationX + 70}" y="${annotationY + 5}" text-anchor="middle" font-size="11" font-weight="bold" fill="#333">${inv.name.toUpperCase()}</text>`;

            // Bass note info
            svg += `<text x="${annotationX + 70}" y="${annotationY + 20}" text-anchor="middle" font-size="10" fill="#666">${inv.bassNote} is bass note</text>`;

            // Interval structure
            svg += `<text x="${annotationX + 70}" y="${annotationY + 35}" text-anchor="middle" font-size="10" fill="#666">[${inv.label}]</text>`;
        }
    });

    // Draw 5-fret rule connectors between consecutive inversions
    for (let i = 0; i < visibleInversions.length - 1; i++) {
        const current = visibleInversions[i];
        const next = visibleInversions[i + 1];

        // The rule: 3rd string of current -> 4th string of next (5 frets higher)
        // String 3 is at index 2 (0-indexed in our positions), String 4 is at index 1
        const fromStringIdx = 2; // 3rd string (G string)
        const toStringIdx = 1;   // 4th string (D string)

        const fromX = fbLeft + (fromStringIdx + 1) * stringSpacing;
        const fromY = fbTop + (current.frets[fromStringIdx] - 0.5) * fretHeight;
        const toX = fbLeft + (toStringIdx + 1) * stringSpacing;
        const toY = fbTop + (next.frets[toStringIdx] - 0.5) * fretHeight;

        if (current.frets[fromStringIdx] <= numFrets && next.frets[toStringIdx] <= numFrets) {
            // Draw arrow
            svg += `<line x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}" stroke="#cc0000" stroke-width="3" marker-end="url(#arrowhead)"/>`;

            // Label showing "5 frets"
            const midX = (fromX + toX) / 2 - 25;
            const midY = (fromY + toY) / 2;
            svg += `<text x="${midX}" y="${midY}" font-size="10" font-weight="bold" fill="#cc0000">5 frets</text>`;
        }
    }

    // Add cycling indicator at bottom
    if (visibleInversions.length > 0) {
        const bottomY = fbTop + numFrets * fretHeight + 10;
        svg += `<text x="${fbLeft + 2.5 * stringSpacing}" y="${bottomY}" text-anchor="middle" font-size="11" fill="#666">↓ Inversions keep cycling ↓</text>`;
    }

    return svg;
}

// ============================================
// FRETBOARD SVG GENERATOR (Enhanced from Python)
// ============================================
function generateFretboardSVG(tuningName) {
    const tuning = TUNINGS_DATA[tuningName];
    if (!tuning) return '';

    const numFrets = state.fretCount;
    const capo = state.capoPosition;
    const showNotes = state.showNotes;

    const strings = tuning.strings;
    const numStrings = strings.length;
    const shortStringIdx = tuning.shortStringIndex;
    const shortStringStart = tuning.shortStringStartFret;

    // Determine which strings should be lowercase (first occurrence of duplicate notes)
    // e.g., for tuning with notes F C F A C, the first F and first C should be lowercase: f c F A C
    const lowercaseIndices = new Set();
    const seenNotes = new Map(); // normalized note -> first index
    for (let i = 0; i < strings.length; i++) {
        const normalized = normalizeNote(strings[i]).toUpperCase();
        if (!seenNotes.has(normalized)) {
            seenNotes.set(normalized, i);
        } else {
            // This note has appeared before, mark the first occurrence as lowercase
            lowercaseIndices.add(seenNotes.get(normalized));
        }
    }

    // SVG dimensions
    const marginLeft = 100;
    const marginRight = 150;
    const marginTop = capo > 0 ? 160 : 140;  // Extra space for effective tuning display
    const marginBottom = 80;
    const stringSpacing = 55;
    const fretHeight = 50;

    const fretboardWidth = (numStrings - 1) * stringSpacing;
    const fretboardHeight = numFrets * fretHeight;
    const svgWidth = marginLeft + fretboardWidth + marginRight;
    const svgHeight = marginTop + fretboardHeight + marginBottom;

    const fbLeft = marginLeft;
    const fbTop = marginTop;
    const fbRight = fbLeft + fretboardWidth;
    const bottomY = fbTop + fretboardHeight;

    // Fret markers
    const markerFrets = [3, 5, 7, 10, 12, 15, 17];
    const doubleMarkerFrets = [12];

    let svg = `<svg class="fretboard-svg" width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;

    // Styles and definitions
    svg += `
    <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#cc0000"/>
        </marker>
    </defs>
    <style>
        .title { font-family: Georgia, serif; font-size: 24px; font-weight: bold; fill: #000; }
        .subtitle { font-family: Georgia, serif; font-size: 16px; font-style: italic; fill: #333; }
        .string-label { font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; fill: #000; }
        .fret-number { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #333; }
        .note { font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; fill: #000; }
        .note-circle { fill: white; stroke: #000; stroke-width: 1.5; }
        .note-circle-natural { fill: white; stroke: #000; stroke-width: 4; }
        .fret-line { stroke: #000; stroke-width: 2; }
        .string-line { stroke: #444; stroke-width: 1.5; }
        .nut { stroke: #000; stroke-width: 6; }
        .fret-marker { fill: #ddd; stroke: none; }
        .peg { fill: #333; stroke: #000; stroke-width: 1; }
        .ghost-string { stroke: #999; stroke-width: 1; stroke-dasharray: 3,3; }
        .fret-marker-symbol { fill: #000; stroke: none; }
    </style>`;

    // Background
    svg += `<rect width="100%" height="100%" fill="white"/>`;

    // Title - use lowercase for first occurrence of duplicate notes (e.g., fCFAC -> fcFAC)
    const tuningStr = strings.map((s, idx) => {
        let note = displayNote(normalizeNote(s));
        // Convert to solfège if enabled
        if (state.useSolfege) {
            note = toSolfege(note);
        }
        // Use lowercase if this index is marked as first occurrence of a duplicate
        return lowercaseIndices.has(idx) ? note.toLowerCase() : note;
    }).join('');

    // Calculate effective tuning with capo
    let effectiveTuningStr = '';
    if (capo > 0) {
        effectiveTuningStr = strings.map((s, idx) => {
            // For short string, calculate from its actual starting point
            let effectiveCapo = capo;
            if (idx === shortStringIdx && shortStringStart !== null) {
                // Short string: capo only affects it if capo >= shortStringStart
                if (capo < shortStringStart) {
                    effectiveCapo = 0; // Capo doesn't affect short string
                } else {
                    effectiveCapo = capo - (shortStringStart - 1);
                }
            }
            const transposedNote = getNoteAtFret(s, effectiveCapo);
            let note = displayNote(normalizeNote(transposedNote));
            if (state.useSolfege) {
                note = toSolfege(note);
            }
            return lowercaseIndices.has(idx) ? note.toLowerCase() : note;
        }).join('');
    }

    svg += `<text x="${svgWidth / 2}" y="45" class="title" text-anchor="middle">Banjo Fretboard: ${tuningName}</text>`;

    // Subtitle with effective tuning when capo is applied
    if (capo > 0) {
        svg += `<text x="${svgWidth / 2}" y="70" class="subtitle" text-anchor="middle">Open Tuning: ${tuningStr} — ${tuning.description}</text>`;
        svg += `<text x="${svgWidth / 2}" y="90" class="subtitle" text-anchor="middle" style="fill: #c00; font-weight: bold;">Capo ${capo}: Effective Tuning: ${effectiveTuningStr}</text>`;
    } else {
        svg += `<text x="${svgWidth / 2}" y="70" class="subtitle" text-anchor="middle">Tuning: ${tuningStr} — ${tuning.description}</text>`;
    }

    // Fret markers (on fretboard face)
    for (const fret of markerFrets) {
        if (fret <= numFrets) {
            const y = fbTop + (fret - 0.5) * fretHeight;
            if (doubleMarkerFrets.includes(fret)) {
                svg += `<circle cx="${fbLeft + fretboardWidth/2 - 15}" cy="${y}" r="7" class="fret-marker"/>`;
                svg += `<circle cx="${fbLeft + fretboardWidth/2 + 15}" cy="${y}" r="7" class="fret-marker"/>`;
            } else {
                svg += `<circle cx="${fbLeft + fretboardWidth/2}" cy="${y}" r="7" class="fret-marker"/>`;
            }
        }
    }

    // Nut
    if (shortStringIdx !== null && shortStringStart !== null) {
        const nutStartX = fbLeft + stringSpacing - 10;
        svg += `<line x1="${nutStartX}" y1="${fbTop}" x2="${fbRight + 10}" y2="${fbTop}" class="nut"/>`;
    } else {
        svg += `<line x1="${fbLeft - 10}" y1="${fbTop}" x2="${fbRight + 10}" y2="${fbTop}" class="nut"/>`;
    }

    // Fret lines with ordinal labels on right
    for (let fret = 1; fret <= numFrets; fret++) {
        const y = fbTop + fret * fretHeight;

        let lineStartX, lineEndX;
        if (shortStringIdx !== null && shortStringStart !== null && fret < shortStringStart) {
            lineStartX = fbLeft + stringSpacing - 10;
            lineEndX = fbRight + 10;
        } else {
            lineStartX = fbLeft - 10;
            lineEndX = fbRight + 10;
        }

        // Extend line for marker frets
        if (markerFrets.includes(fret)) {
            lineEndX += 20;
            if (fret === 5) {
                // 5th fret extends to the left edge (where 5th string starts)
                lineStartX = 90;
            }
        }

        svg += `<line x1="${lineStartX}" y1="${y}" x2="${lineEndX}" y2="${y}" class="fret-line"/>`;

        // Ordinal fret labels on right
        if (markerFrets.includes(fret)) {
            const ordinal = fret + (fret === 1 ? 'st' : fret === 2 ? 'nd' : fret === 3 ? 'rd' : 'th') + ' fret';
            const textX = fbRight + 70;
            svg += `<text x="${textX}" y="${y}" class="fret-number" text-anchor="middle" dominant-baseline="middle">${ordinal}</text>`;

            // Marker symbols
            const symbolX = textX + 50;
            if (fret === 5) {
                // Star for 5th fret
                const starPoints = `${symbolX},${y-7} ${symbolX+2},${y-2} ${symbolX+7},${y-2} ${symbolX+3},${y+1} ${symbolX+5},${y+6} ${symbolX},${y+3} ${symbolX-5},${y+6} ${symbolX-3},${y+1} ${symbolX-7},${y-2} ${symbolX-2},${y-2}`;
                svg += `<polygon points="${starPoints}" class="fret-marker-symbol"/>`;
            } else if (fret === 12) {
                // Double circles
                svg += `<circle cx="${symbolX - 8}" cy="${y}" r="6" class="fret-marker-symbol"/>`;
                svg += `<circle cx="${symbolX + 8}" cy="${y}" r="6" class="fret-marker-symbol"/>`;
            } else {
                // Single circle
                svg += `<circle cx="${symbolX}" cy="${y}" r="6" class="fret-marker-symbol"/>`;
            }
        }
    }

    // Neck edges with diagonal for short string
    if (shortStringIdx !== null && shortStringStart !== null) {
        const nutLeftX = fbLeft + stringSpacing - 10;
        const fret4Y = fbTop + 4 * fretHeight;
        const fret5Y = fbTop + 5 * fretHeight;
        const leftEdgeX = fbLeft - 10;

        // Ghost string line (dotted)
        svg += `<line x1="${fbLeft}" y1="${fbTop}" x2="${fbLeft}" y2="${fret5Y - fretHeight}" class="ghost-string"/>`;

        // Polyline neck edge
        svg += `<polyline points="${nutLeftX},${fbTop} ${nutLeftX},${fret4Y} ${leftEdgeX},${fret5Y} ${leftEdgeX},${bottomY}" style="stroke:#000; stroke-width:3; fill:none;"/>`;
        svg += `<line x1="${fbRight + 10}" y1="${fbTop}" x2="${fbRight + 10}" y2="${bottomY}" style="stroke:#000; stroke-width:3;"/>`;
        svg += `<line x1="${leftEdgeX}" y1="${bottomY}" x2="${fbRight + 10}" y2="${bottomY}" style="stroke:#000; stroke-width:3;"/>`;
    } else {
        // 4-string: rectangular edges
        svg += `<line x1="${fbLeft - 10}" y1="${fbTop}" x2="${fbLeft - 10}" y2="${bottomY}" style="stroke:#000; stroke-width:3;"/>`;
        svg += `<line x1="${fbRight + 10}" y1="${fbTop}" x2="${fbRight + 10}" y2="${bottomY}" style="stroke:#000; stroke-width:3;"/>`;
        svg += `<line x1="${fbLeft - 10}" y1="${bottomY}" x2="${fbRight + 10}" y2="${bottomY}" style="stroke:#000; stroke-width:3;"/>`;
    }

    // String lines
    for (let i = 0; i < numStrings; i++) {
        const x = fbLeft + i * stringSpacing;

        if (i === shortStringIdx && shortStringStart !== null) {
            const startY = fbTop + (shortStringStart - 1) * fretHeight;
            svg += `<line x1="${x}" y1="${startY}" x2="${x}" y2="${bottomY}" class="string-line" style="stroke-width:2;"/>`;

            // Peg indicator
            const pegY = startY - 50;
            const pegHeadX = fbLeft - 10;
            const pegShaftStartX = fbLeft + 30;
            svg += `<rect x="${pegHeadX}" y="${pegY - 5}" width="${pegShaftStartX - pegHeadX}" height="8" class="peg" rx="2"/>`;
            svg += `<circle cx="${pegHeadX}" cy="${pegY}" r="10" class="peg"/>`;
            svg += `<circle cx="${pegHeadX}" cy="${pegY}" r="4" fill="white"/>`;
        } else {
            svg += `<line x1="${x}" y1="${fbTop}" x2="${x}" y2="${bottomY}" class="string-line"/>`;
        }
    }

    // String labels at top (lowercase for first occurrence of duplicate notes)
    for (let i = 0; i < numStrings; i++) {
        const x = fbLeft + i * stringSpacing;
        const stringNumber = numStrings - i;
        const note = strings[i];

        // Use lowercase if this is the first occurrence of a duplicate note
        const baseNote = normalizeNote(note);
        let displayedBase = displayNote(baseNote);
        // Convert to solfège if enabled
        if (state.useSolfege) {
            displayedBase = toSolfege(displayedBase);
        }
        // Apply lowercase if marked, then replace symbols
        let displayed = lowercaseIndices.has(i) ? displayedBase.toLowerCase() : displayedBase;
        displayed = displayed.replace('#', '\u266F').replace('b', '\u266D');

        const numberY = fbTop - 35;
        const labelY = fbTop - 12;

        svg += `<text x="${x}" y="${numberY}" class="fret-number" text-anchor="middle">${stringNumber}</text>`;
        svg += `<text x="${x}" y="${labelY}" class="string-label" text-anchor="middle">${displayed}</text>`;
    }

    // Notes at each fret position
    if (showNotes) {
        for (let fret = 1; fret <= numFrets; fret++) {
            const y = fbTop + (fret - 0.5) * fretHeight;

            // Check if this fret is above (behind) the capo
            const isBehindCapo = capo > 0 && fret < capo;

            for (let i = 0; i < numStrings; i++) {
                const x = fbLeft + i * stringSpacing;
                const openNote = strings[i];

                // Handle short string
                if (i === shortStringIdx && shortStringStart !== null) {
                    if (fret < shortStringStart) {
                        continue; // No notes in empty space
                    }
                    // Calculate effective fret for short string
                    const effectiveFret = fret - (shortStringStart - 1);
                    const note = getNoteAtFret(openNote, effectiveFret);
                    const displayedNote = formatSimpleNote(note);

                    // Gray out notes behind capo, use 8-ball style for natural notes
                    const isNatural = isNaturalNote(note);
                    const circleClass = isNatural ? 'note-circle-natural' : 'note-circle';
                    const circleStyle = isBehindCapo ? 'fill: #e0e0e0; stroke: #bbb;' : '';
                    const textStyle = isBehindCapo ? 'fill: #aaa;' : '';

                    svg += `<circle cx="${x}" cy="${y}" r="16" class="${circleClass}" style="${circleStyle}"/>`;
                    svg += `<text x="${x}" y="${y + 5}" class="note" text-anchor="middle" style="${textStyle}">${displayedNote}</text>`;
                } else {
                    const note = getNoteAtFret(openNote, fret);
                    const displayedNote = formatSimpleNote(note);

                    // Gray out notes behind capo, use 8-ball style for natural notes
                    const isNatural = isNaturalNote(note);
                    const circleClass = isNatural ? 'note-circle-natural' : 'note-circle';
                    const circleStyle = isBehindCapo ? 'fill: #e0e0e0; stroke: #bbb;' : '';
                    const textStyle = isBehindCapo ? 'fill: #aaa;' : '';

                    svg += `<circle cx="${x}" cy="${y}" r="16" class="${circleClass}" style="${circleStyle}"/>`;
                    svg += `<text x="${x}" y="${y + 5}" class="note" text-anchor="middle" style="${textStyle}">${displayedNote}</text>`;
                }
            }
        }
    }

    // Capo indicator
    if (capo > 0) {
        const capoY = fbTop + (capo - 0.5) * fretHeight;
        svg += `<rect x="${fbLeft - 15}" y="${capoY - 8}" width="${fretboardWidth + 30}" height="16" fill="#333" rx="4" opacity="0.9"/>`;
        svg += `<text x="${fbLeft + fretboardWidth/2}" y="${capoY + 4}" text-anchor="middle" font-size="10" fill="white" font-weight="bold">CAPO ${capo}</text>`;
    }

    // Chord inversions overlay (if enabled)
    if (state.showInversions && numStrings >= 5) {
        svg = renderInversionsOnFretboard(svg, state.inversionRootNote, tuning, fbLeft, fbTop, stringSpacing, fretHeight, numFrets, svgWidth);
    }

    // Footer
    const footerY = fbTop + fretboardHeight + 30;
    svg += `<rect x="${marginLeft-50}" y="${footerY}" width="${fretboardWidth+150}" height="30" rx="5" fill="#f5f5f5" stroke="#ccc"/>`;
    const footerLine1 = shortStringStart
        ? `String 1 (far right) = 1st string • 5th string starts at fret ${shortStringStart}`
        : `String 1 (far right) = 1st string • ${numStrings}-string banjo`;
    svg += `<text x="${svgWidth/2}" y="${footerY + 12}" text-anchor="middle" font-size="10" fill="#555">${footerLine1}</text>`;
    svg += `<text x="${svgWidth/2}" y="${footerY + 24}" text-anchor="middle" font-size="10" fill="#555">Fret markers: 3,5,7,10,12,15,17 • Peg indicates 5th string tuning point</text>`;

    svg += '</svg>';
    return svg;
}

