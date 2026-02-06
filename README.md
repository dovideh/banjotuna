Available at https://dovideh.github.io/banjotuna/

# Banjo Tuning Reference Web Application
**Version 3.0**

## Version 3 Summary - Chord Grid View & Inversions

### New Feature: Chord Grid View
- Toggle between individual chord display and grid view showing all keys × all chord types
- Keys displayed on left side, chord types at top in organized groups
- Chord type groupings with black separators: Major, Minor, Min7 | 6, 7 | Dim | Sus4 | Aug
- Landscape print support with smart page breaks at F#/Gb
- Table header repetition across pages

### New Feature: Chord Inversions on Fretboard
- Toggle to show chord inversions directly on fretboard diagram
- Root note selector for any of the 12 keys
- Color-coded inversion shapes:
  - Root Form (blue): 1-3-5-1 interval pattern
  - 1st Inversion (red): 3-5-1-3 interval pattern
  - 2nd Inversion (yellow): 5-1-3-5 interval pattern
- Annotation blocks showing chord name, inversion type, bass note, and intervals
- 5-fret rule connector arrows between consecutive inversions
- Cycling indicator at bottom of fretboard

### Visual Enhancements
- 8-ball styling for natural notes (C, D, E, F, G, A, B) on fretboard
- Extended 5th fret line to left edge on fretboard diagram
- Capo effective tuning display showing transposed notes

### Bug Fixes
- Fixed octave notation for all tunings - 1st string correctly set to octave 4

---

## Version 2 Summary - Chord Diagram Generation
New Feature: Chord Diagrams Tab
Added a comprehensive chord diagram generator to the banjo tuning reference application.

Core Functionality:

12 keys (A through G with sharps/flats)
8 chord types per key: Major, Minor, Minor7, 6th, 7th, Diminished, Sus4, Augmented
Toggle between numeric (1-2-3-4) and PIMA finger notation
Works with all existing tunings
Chord Voicing Algorithm:

Recursive backtracking algorithm based on pitch class calculation
(string_pitch + fret) % 12 for accurate note detection
Validates all chord tones are present
Scores and sorts voicings by playability
Display Features:

SVG chord diagrams with 4 main strings (DGBD for Open G)
6 frets shown
Open string indicator (○) and muted string indicator (✕)
Circled finger numbers on fretted positions
Root notes displayed as filled circles (for B&W printing)
Chord degree labels below strings (1, 3, 5, etc.)
5th string box at fret 5-6, flush with main grid
Bug Fixes Applied:

Fixed chord voicing algorithm (was using greedy, now uses recursive backtracking)
Fixed string ordering (left to right = strings 4, 3, 2, 1)
Fixed finger assignment (each position gets unique finger 1, 2, 3, 4 in sequence)
Removed incorrect barre indicator that connected separate finger positions
Properly excludes 5th drone string from low-position chord calculations


**Version 1.0**

A comprehensive, interactive web application for banjo players to explore tunings, view fretboard diagrams, and reference tuning information. Runs entirely in the browser with no server or dependencies required.

---

## Features

### Tuning Management
- **24 tunings** across 4 families:
  - **C-Based** (7): Minstrel, Naomi Weiss, Little Birdie, Hook-and-Line, Cackling Hen, Darling Cora, Double C
  - **D-Based** (5): Moonshiner, German War, Reuben, F Tuning, East Virginia
  - **G-Based** (10): Standard (F), Open G, Open A, G Variant, G Modal (Sawmill), Open D, D Modal, D Tuning (Reno), Double D, High Bass G
  - **Other** (2): Plectrum C (4-string), Tenor Standard (4-string)
- Each tuning includes: string notes, description, delta changes from reference, capo positions, and associated songs

### Fretboard Diagram Generator
- **SVG-based visualizations** with configurable fret count (12, 15, or 18 frets)
- **Notes at every fret position** with proper chromatic calculation
- **5th string handling**: Ghost line from nut to fret 5, solid line from fret 6, peg indicator
- **Fret markers**: Circles at frets 3, 7, 10, 15, 17; double circles at fret 12
- **Capo simulation**: Visual graying of notes behind capo position
- **Side-by-side layout**: Tuning selector list on left, fretboard diagram on right

### Notation Options
- **Scientific Pitch Notation (SPN)** with subscript octaves (e.g., G₄, D₃, B♭₃)
- **Mixed sharp/flat display**: Ab, Bb (flats) with C#, D#, F# (sharps) for musical convention
- **Solfege toggle**: Switch between standard notes (C D E F G A B) and solfege (Do Re Mi Fa Sol La Si)
- **Lowercase convention**: First occurrence of duplicate notes displayed lowercase (e.g., gDGBD for Open G)

### User Interface
- **Three tabs**: Tunings, Fretboards, Reference
- **Tuning cards** with color-coded family borders and nut visualization
- **Interactive controls**: Family filter, capo position (0-12), fret count selector
- **Persistent settings** via localStorage
- **Print-optimized CSS**: Clean output for PDF generation

### Reference Section
- Fret reference for relative tuning
- Capo transposition chart
- String range overview
- High-tension tuning warnings
- Symbol legend

---

## Usage

1. Open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge)
2. Use the **Tunings** tab to browse all available tunings with their details
3. Use the **Fretboards** tab to view detailed fretboard diagrams with notes
4. Use the **Reference** tab for tuning guides and capo charts
5. Click **Print / PDF** to generate a printable document

### Controls
| Control | Description |
|---------|-------------|
| Family Filter | Show tunings from specific family (C, D, G, Other) |
| Capo Position | Simulate capo at frets 0-12 |
| Fret Count | Display 12, 15, or 18 frets on diagrams |
| Show Notes | Toggle note circles on fretboard |
| Use Solfege | Switch to Do-Re-Mi notation |

---

## Technical Details

- **Zero dependencies**: Pure HTML/CSS/JavaScript
- **No build process**: Direct file opening in browser (`file://`)
- **Cross-browser**: Works in all modern browsers
- **No external CDN**: All code embedded inline
- **Responsive**: Adapts to different screen sizes

---

## Version History

### v3.0 (Current)
- Chord grid view with all keys × chord types
- Chord inversions visualization on fretboard
- 8-ball styling for natural notes
- Capo effective tuning display
- Landscape print support with smart page breaks
- Fixed octave notation for all tunings

### v2.0
- Chord diagram generator with 8 chord types per key
- Finger notation options (numeric and PIMA)
- Recursive backtracking algorithm for chord voicings

### v1.0
- Initial release with 24 tunings
- Interactive fretboard SVG generator
- Solfege notation support
- Capo simulation with visual feedback
- Print-optimized layout
- 4-string banjo support (Plectrum, Tenor)

---

## Future Enhancements (Planned)

- Audio playback for tuning reference
- Custom tuning creator
- Additional chord types (9ths, 11ths, etc.)
- Scale pattern overlays on fretboard

---

## License

This project is for personal educational use.
