# Banjo Tuning Reference Web Application

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

### v1.0 (Current)
- Initial release with 24 tunings
- Interactive fretboard SVG generator
- Solfege notation support
- Capo simulation with visual feedback
- Print-optimized layout
- 4-string banjo support (Plectrum, Tenor)

---

## Future Enhancements (Planned)

- Chord generation module with finger positions
- Fingering notation system (T, I, M, R)
- Multi-page document generator with pagination
- Audio playback for tuning reference
- Custom tuning creator

---

## License

This project is for personal educational use.
