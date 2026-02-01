# Banjo Tuning Reference Web Application - Requirements Analysis

Based on your Python script and HTML template, here's a comprehensive requirements breakdown for the local web application:

---

## **1. Core Functional Requirements**

### **1.1 Tuning Management System**
- Load banjo tunings from external JSON configuration files
- Support minimum 19 distinct tunings across families:
  - **C-Based**: Minstrel, Naomi Weiss, Little Birdie, Hook-and-Line, Cackling Hen, Darling Cora, Double C
  - **D-Based**: Moonshiner, German War, Reuben, F Tuning, East Virginia
  - **G-Based**: Standard F, Open G, Open A, G Variant, G Modal (Sawmill), Open D, D Modal
- Each tuning must store:
  - String notes (5-string format with octave notation)
  - Description/genre tags
  - Short string configuration (5th string starts at fret 6)
  - Capo transposition data
  - Reference tuning for delta calculations

### **1.2 Scientific Pitch Notation (SPN) Engine**
- Display notes with proper subscript octaves (e.g., `G₄`, `D₃`, `B♭₃`)
- **Sharps/Flats Toggle**: User-switchable notation system
  - Sharps: `C#, D#, F#, G#, A#`
  - Flats: `Db, Eb, Gb, Ab, Bb`
- Automatic enharmonic spelling based on musical context
- Normalize internal representation (store as sharps, display as preferred)

### **1.3 Fretboard Diagram Generator**
- **SVG-based visualizations** with these specifications:
  - **Fret range**: 12-18 frets (user selectable)
  - **String order**: 5th (drone/short) at top, 1st at bottom
  - **5th string handling**: 
    - Ghost/dotted line from nut to fret 5
    - Solid line from fret 6 onward
    - Peg indicator at fret 6 (left side, tied to neck edge)
  - **Fret markers**: 
    - Circles at frets 3, 7, 10, 15, 17
    - Star symbol at fret 5
    - Double circles at fret 12
  - **Visual elements**:
    - Open string notes displayed at top with string numbers (5→1)
    - Note circles at each fret intersection
    - Neck edge with diagonal transition for 5th string
    - No lines drawn in empty 5th string space (frets 0-5)

### **1.4 Capo Simulation Engine**
- Input: Capo position (0-12)
- Output:
  - Transposed effective tuning for all strings
  - New playable key
  - Visual indication of which frets become "open"
  - String alteration warnings (tension changes)

### **1.5 Tuning Comparison System**
- **Delta (Δ) calculations**: Show changes from reference tuning (e.g., Standard F or Open G)
- **String alteration visualization**:
  - Open circle ○ = unchanged string
  - Filled circle ● = altered string
- **Change notation**: Use arrows (↑/↓) and interval descriptions
  - Example: `Δ: From Open G: 4th↓C, 2nd↑C`

---

## **2. User Interface Requirements**

### **2.1 Main Application Layout**
- **Single-page HTML** that runs locally without server
- **Print-optimized CSS**:
  - A4 portrait format with 12mm margins
  - Page break controls for multi-page output
  - High contrast B/W friendly design
  - Minimum 13pt font size for readability

### **2.2 Tuning Display Cards**
Each tuning must show:
- **Header**: Name (uppercase) + genre tag (italic)
- **Color-coded family borders**:
  - C-Family: Red (`#C74242`)
  - D-Family: Green (`#2D7A4F`)
  - G-Family: Blue (`#2E5C8A`)
- **Note sequence**: Centered, monospace, large font with subscripts
- **Nut visual**: 5 circles showing string states (○/●)
- **Details section**:
  - Delta line (bold)
  - Capo transposition line (blue, bold)
  - Associated songs (italic)

### **2.3 Interactive Controls**
- **Sharps/Flats toggle switch** (persistent across sessions)
- **Capo position slider/input** (0-12)
- **Fret count selector** (12, 15, 18 frets)
- **Tuning family filter** (All, C-Based, D-Based, G-Based)
- **Generate/Print button** for creating PDF output

### **2.4 Reference Sections**
- **Fret reference guide**: Which frets to use for relative tuning
- **Capo transposition chart**: Keys for common capo positions
- **String range overview**: Min/max notes per string across all tunings
- **Tuning strategies**: Warnings for high-tension tunings (Open A, Open D)
- **Legend**: Symbol explanations (Δ, ↑, ↓, ○, ●, SPN)

---

## **3. Advanced Features (Future-Ready)**

### **3.1 Chord Generation Module**
- **Input**: Tuning + Chord name (e.g., "G Major")
- **Output**: 
  - Fretboard diagram with finger positions
  - Multiple voicings per chord
  - Suggested fingerings (T, I, M, R)
- **Data structure**: JSON chord library with interval patterns

### **3.2 Fingering Notation System**
- **Symbols**: T (thumb), I (index), M (middle), R (ring)
- **Display**: Overlaid on note circles in chord diagrams
- **Classical guitar style**: Numbers inside circles indicating fingers

### **3.3 Document Generator**
- **Multi-page layout**: 10+ page reference document
- **Page structure**:
  - Page 1: Cover + notation system explanation
  - Pages 2-8: Tuning families (grouped, 2-3 tunings per page)
  - Pages 9-10: Reference guides and capo charts
- **Automatic pagination**: Footer with "Page X of Y"

---

## **4. Technical Requirements**

### **4.1 Local Execution**
- **Zero dependencies**: Pure HTML/CSS/JavaScript
- **No build process**: Direct file opening in browser (`file://`)
- **Cross-browser**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **No external CDN**: All code embedded or inline

### **4.2 Data Architecture**
```json
// tunings.json structure
{
  "tunings": {
    "Tuning Name": {
      "strings": ["note1", "note2", "note3", "note4", "note5"],
      "short_string_index": 0,
      "short_string_start_fret": 6,
      "description": "Usage description",
      "family": "C-Based",
      "reference_tuning": "Standard F",
      "delta_changes": ["4th↓C", "2nd↑C"],
      "capo_positions": {
        "2": "Key of D",
        "5": "Key of F"
      },
      "associated_songs": ["Song 1", "Song 2"]
    }
  }
}
```

### **4.3 Performance**
- **Load time**: < 2 seconds for 19 tunings
- **Memory**: < 50MB RAM usage
- **SVG generation**: < 500ms per fretboard
- **Print rendering**: Clean vector output at 300 DPI

---

## **5. Output Specifications**

### **5.1 Visual Standards**
- **Font hierarchy**:
  - Titles: 24px Georgia, bold
  - Notes: 12px Arial, bold (inside circles)
  - String labels: 18px Courier New, bold
  - Footers: 10px Arial, gray
- **Spacing**: 
  - String spacing: 55px
  - Fret height: 50px
  - Margins: 100px left, 150px right (for markers)
- **Colors**: 
  - Note circles: White fill, black stroke (1.5px)
  - Fret lines: Black (2px)
  - Strings: Gray (#444, 1.5px)
  - Fret markers: Light gray (#ddd) circles

### **5.2 Print Features**
- **Page breaks**: Between tuning families
- **Headers**: Repeating on each page
- **Footers**: Page numbers and tuning family indicator
- **Background**: Optional (toggle for ink saving)

---

## **6. Implementation Roadmap**

### **Phase 1: Core Engine**
1. Create `tunings.json` with all 19 tunings
2. Build SPN notation converter (sharps/flats)
3. Develop fretboard SVG generator in JavaScript
4. Implement 5th string logic with ghost lines

### **Phase 2: UI & Interaction**
5. Create single HTML page with CSS styling
6. Add tuning family filter and display cards
7. Implement capo simulation UI
8. Add print stylesheet and page break logic

### **Phase 3: Advanced Features**
9. Chord generation module
10. Fingering overlay system
11. Multi-page document generator
12. Export to PDF functionality

---

## **7. Example Output Snippet**

```html
<!-- Tuning Card -->
<div class="tuning-card g-family">
  <div class="tuning-header">
    <span class="tuning-name">DOUBLE C</span>
    <span class="genre-tag">Old-Time Standard</span>
  </div>
  <div class="note-sequence">
    G<sub>4</sub> C<sub>2</sub> G<sub>3</sub> C<sub>4</sub> D<sub>4</sub>
  </div>
  <div class="nut-visual">
    <div class="string-circle">5</div>      <!-- Unchanged -->
    <div class="string-circle changed">4</div> <!-- Changed -->
    <div class="string-circle">3</div>
    <div class="string-circle changed">2</div>
    <div class="string-circle">1</div>
  </div>
  <div class="tuning-details">
    <div class="delta-line">Δ: From Open G: 4th↓C, 2nd↑C</div>
    <div class="capo-line">Capo 2 → Key of D | Capo 5 → Key of F</div>
    <div class="songs-line">Wildwood Flower, Billy in the Lowground</div>
  </div>
</div>
```
