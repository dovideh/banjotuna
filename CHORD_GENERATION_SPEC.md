# Banjo Chord Generation - Project Specification

## Project Overview

This specification describes the addition of a **Chord Generation Module** to the existing Interactive Banjo Tunings Reference application. The feature will generate chord diagrams for all 12 keys and 8 chord types, displayed in standard chord grid format, integrated with the existing tuning system.

---

## Current Architecture Summary

**File Structure:** Single HTML file (`index.html`) with embedded CSS (~800 lines) and JavaScript (~970 lines)

**Key Existing Components:**
- `CHROMATIC_SCALE`: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
- `getNoteAtFret(openNote, fret)`: Core function for note calculation
- `normalizeNote(note)`: Converts any notation to canonical form
- `displayNote(note)`: Applies display preferences (e.g., G# → Ab)
- 24 tuning definitions with full metadata
- SVG-based fretboard visualization
- Capo transposition support
- Solfège notation toggle

---

## Requirements

### 1. Keys (12 Total)

| Key | Display Format |
|-----|---------------|
| A | A |
| A#/Bb | A#/Bb |
| B | B |
| C | C |
| C#/Db | C#/Db |
| D | D |
| D#/Eb | D#/Eb |
| E | E |
| F | F |
| F#/Gb | F#/Gb |
| G | G |
| G#/Ab | G#/Ab |

**Display:** Use slash notation for enharmonic equivalents (A#/Bb)

### 2. Chord Types (8 Per Key)

| Type | Symbol | Intervals | Example (C) |
|------|--------|-----------|-------------|
| Major | (none) | 1, 3, 5 | C, E, G |
| Minor | m | 1, ♭3, 5 | C, E♭, G |
| Minor 7 | m7 | 1, ♭3, 5, ♭7 | C, E♭, G, B♭ |
| Sixth | 6 | 1, 3, 5, 6 | C, E, G, A |
| Seventh | 7 | 1, 3, 5, ♭7 | C, E, G, B♭ |
| Diminished | dim | 1, ♭3, ♭5 | C, E♭, G♭ |
| Suspended 4 | sus4 | 1, 4, 5 | C, F, G |
| Augmented | aug | 1, 3, #5 | C, E, G# |

**Total:** 12 keys × 8 types = **96 chord diagrams per tuning**

### 3. Chord Intervals (Semitones from Root)

```javascript
CHORD_INTERVALS = {
    'major':  [0, 4, 7],           // 1, 3, 5
    'minor':  [0, 3, 7],           // 1, ♭3, 5
    'm7':     [0, 3, 7, 10],       // 1, ♭3, 5, ♭7
    '6':      [0, 4, 7, 9],        // 1, 3, 5, 6
    '7':      [0, 4, 7, 10],       // 1, 3, 5, ♭7
    'dim':    [0, 3, 6],           // 1, ♭3, ♭5
    'sus4':   [0, 5, 7],           // 1, 4, 5
    'aug':    [0, 4, 8]            // 1, 3, #5
}
```

### 4. Chord Diagram Display (Grid Format)

#### Layout Structure
```
         ○              ← Open string indicator
    ┌────┬────┬────┬────┬────┐
    │    │    │    │    │    │  ← Thick top line (nut)
    ├────┼────┼────┼────┼────┤
    │    │ ①  │    │ ②  │    │  ← Fret 1 (circled = finger position)
    ├────┼────┼────┼────┼────┤
    │    │    │ ③  │    │    │  ← Fret 2
    ├────┼────┼────┼────┼────┤
    │    │    │    │    │    │  ← Fret 3
    ├────┼────┼────┼────┼────┤
    │    │    │    │    │    │  ← Fret 4
    └────┴────┴────┴────┴────┘
      5    4    3    2    1     ← String numbers (5th string on left)
      G    D    G    B    D     ← Open string notes
      5    1    5    3    1     ← Chord degree indicators
```

#### Visual Elements

| Element | Symbol | Description |
|---------|--------|-------------|
| Open string | ○ | Circle above nut - string played open |
| Muted string | ✕ | X above nut - string not played |
| Finger position | ①②③④ | Circled number showing which finger |
| Barre | ⌒ | Arc connecting multiple positions on same fret |
| Nut | ━━━━ | Thick horizontal line at top |
| Fret lines | ──── | Thinner horizontal lines |
| Strings | │ | Vertical lines, left to right = low to high |

#### Finger Notation (Toggleable)

**Numbered (Default):**
- 1 = Index finger
- 2 = Middle finger
- 3 = Ring finger
- 4 = Pinky
- T = Thumb (rare)

**PIMA (Classical Guitar):**
- P = Pulgar (Thumb)
- I = Índice (Index)
- M = Medio (Middle)
- A = Anular (Ring)

### 5. Fret Range Display

- **Default:** Show frets 1-5 (with nut)
- **Higher positions:** If chord requires frets 5+, show appropriate range with fret number indicator
- **Example:** If chord starts at fret 5, show "5fr" next to first fret line

### 6. Note Highlighting

For print-friendly display (black & white), use:
- **Root notes:** Solid filled circle (black fill)
- **Third/Fifth/etc:** Hollow circle with black outline
- **Optional:** Gray fill for secondary chord tones

### 7. Chord Degree Labels

Show scale degrees below each string:
- 1 = Root
- 3 = Third (or ♭3 for minor)
- 5 = Fifth (or ♭5 for dim, #5 for aug)
- 6 = Sixth
- 7 = Seventh (or ♭7)
- 4 = Fourth (for sus4)

---

## Data Structure Design

### Chord Definition

```javascript
const CHORD_DATA = {
    // Key: chord fingering data for a specific tuning
    // This will be generated algorithmically based on tuning
};

// Chord type definitions
const CHORD_TYPES = {
    'major': { symbol: '', name: 'Major', intervals: [0, 4, 7] },
    'minor': { symbol: 'm', name: 'Minor', intervals: [0, 3, 7] },
    'm7':    { symbol: 'm7', name: 'Minor 7', intervals: [0, 3, 7, 10] },
    '6':     { symbol: '6', name: 'Sixth', intervals: [0, 4, 7, 9] },
    '7':     { symbol: '7', name: 'Seventh', intervals: [0, 4, 7, 10] },
    'dim':   { symbol: 'dim', name: 'Diminished', intervals: [0, 3, 6] },
    'sus4':  { symbol: 'sus4', name: 'Suspended 4', intervals: [0, 5, 7] },
    'aug':   { symbol: 'aug', name: 'Augmented', intervals: [0, 4, 8] }
};

// Key definitions with enharmonic display
const KEYS = [
    { root: 'A',  display: 'A' },
    { root: 'A#', display: 'A#/B♭' },
    { root: 'B',  display: 'B' },
    { root: 'C',  display: 'C' },
    { root: 'C#', display: 'C#/D♭' },
    { root: 'D',  display: 'D' },
    { root: 'D#', display: 'D#/E♭' },
    { root: 'E',  display: 'E' },
    { root: 'F',  display: 'F' },
    { root: 'F#', display: 'F#/G♭' },
    { root: 'G',  display: 'G' },
    { root: 'G#', display: 'G#/A♭' }
];
```

### Chord Shape Structure

```javascript
// A chord shape definition
{
    key: 'G',
    type: 'major',
    tuning: 'Open G',
    positions: [
        { string: 5, fret: 0, finger: null, degree: 5 },    // Open G
        { string: 4, fret: 0, finger: null, degree: 1 },    // Open D
        { string: 3, fret: 0, finger: null, degree: 5 },    // Open G
        { string: 2, fret: 0, finger: null, degree: 3 },    // Open B
        { string: 1, fret: 0, finger: null, degree: 1 }     // Open D
    ],
    barre: null,  // or { fret: 2, fromString: 1, toString: 4 }
    baseFret: 1,  // First fret shown in diagram
    muted: []     // Array of muted string numbers
}
```

---

## UI Design

### New Tab: "Chords"

Add as 4th tab alongside existing Tunings, Fretboards, Reference tabs.

#### Controls
1. **Tuning Selector** - Dropdown to select tuning (inherit from existing)
2. **Key Selector** - Buttons or dropdown for 12 keys
3. **Chord Type Filter** - Buttons to filter by type (or show all)
4. **Finger Notation Toggle** - Switch between 1234 and PIMA
5. **View Mode** - Grid view (all chords) or Single chord view

#### Layout Options
- **Grid View:** 4×2 grid showing all 8 chord types for selected key
- **Full View:** All 96 chords organized by key (for printing)

### Print Layout

Optimize for A4/Letter paper:
- 4 chord diagrams per row
- Key headers with separator lines
- Page breaks between keys (optional)

---

## Implementation Phases

### Phase 1: Core Music Theory
- [ ] Add CHORD_TYPES constant with intervals
- [ ] Add KEYS constant
- [ ] Create `getChordNotes(root, type)` function
- [ ] Create `findChordPositions(tuning, chordNotes)` algorithm

### Phase 2: Chord Diagram SVG Generator
- [ ] Create `generateChordDiagramSVG(chordShape)` function
- [ ] Implement finger position circles
- [ ] Implement open/muted string indicators
- [ ] Implement barre chord arcs
- [ ] Implement degree labels
- [ ] Add root note highlighting

### Phase 3: UI Integration
- [ ] Add Chords tab to navigation
- [ ] Create chord grid container
- [ ] Add key selector
- [ ] Add chord type filter
- [ ] Add finger notation toggle (1234/PIMA)
- [ ] Integrate with existing tuning selector

### Phase 4: Chord Calculation Algorithm
- [ ] Implement voicing algorithm for each tuning
- [ ] Handle 5-string banjo specifics (short 5th string)
- [ ] Generate optimal fingerings
- [ ] Support alternative voicings

### Phase 5: Polish & Print
- [ ] Add print-specific styles
- [ ] Optimize diagram sizing
- [ ] Add batch export option
- [ ] Test across all tunings

---

## Technical Considerations

### 5th String Handling
The 5th string on a 5-string banjo starts at fret 5, not the nut. Chord diagrams must account for this:
- If chord uses frets 1-4, 5th string cannot be fretted (only played open at its pitch)
- Show 5th string position correctly based on `shortStringStartFret` from tuning data

### Chord Voicing Algorithm
Finding optimal chord voicings is complex. Considerations:
1. Playability (finger stretch limits)
2. Voice leading (smooth transitions)
3. Open strings where beneficial
4. Avoiding string muting conflicts

**Approach:** Start with a database of common chord shapes, then algorithmically transpose based on tuning.

### Capo Support
Extend existing capo logic:
- With capo at fret 2, G tuning becomes A tuning
- Chord shapes remain same, key shifts up
- Display effective key with capo position

---

## File Organization

**Option A: Single File (Recommended)**
Keep everything in `index.html` for maximum portability:
- Add chord CSS to `<style>` section (~150 lines)
- Add chord JS to `<script>` section (~400 lines)

**Option B: Split Files**
If size becomes unwieldy:
```
/index.html        - Main app
/chords.js         - Chord data and logic
/chords.css        - Chord diagram styles (optional)
```
Note: Split requires serving from HTTP server for local development.

---

## Appendix: Common Open G Chord Voicings

Example chord data for Open G tuning (gDGBD):

```javascript
// These are reference voicings to be expanded algorithmically
const OPEN_G_CHORDS = {
    'G_major': {
        positions: [0, 0, 0, 0, 0],  // All open
        fingers: [null, null, null, null, null],
        degrees: ['5', '1', '5', '3', '1']
    },
    'C_major': {
        positions: [null, 2, 1, 0, 2],  // x-2-1-0-2
        fingers: [null, 2, 1, null, 3],
        degrees: ['x', '5', '1', '3', '5']
    },
    'D_major': {
        positions: [0, 0, 2, 3, 2],  // 0-0-2-3-2
        fingers: [null, null, 1, 3, 2],
        degrees: ['3', '1', '5', '1', '5']
    }
    // ... etc
};
```

---

## Next Steps

1. Review this specification
2. Confirm UI/UX preferences
3. Begin Phase 1 implementation
4. Iterate based on feedback

---

*Document created: 2026-02-01*
*For: Interactive Banjo Tunings Reference v1.0*
