// Banjo Tunings Data
// 24 tunings including 4-string

const TUNINGS_DATA = {
    // C-Based Tunings
    "Minstrel Tuning": {
        strings: ["f", "C", "F", "A", "c"],
        family: "c-family",
        description: "Historical",
        referenceTuning: "Standard F",
        deltaChanges: "From Standard F: 4th↓C",
        capoPositions: { 0: "Not commonly capoed" },
        songs: "Briggs manual, Coon Hunt",
        changedStrings: [true, true, true, true, true],
        shortStringIndex: 0,
        shortStringStartFret: 6
    },
    "Naomi Weiss": {
        strings: ["g", "C", "G", "A", "d"],
        family: "c-family",
        description: "Song-Specific",
        referenceTuning: "Minstrel",
        deltaChanges: "From Minstrel: 5th↑G, 3rd↑G, 2nd→A (same), 1st↑D",
        capoPositions: { 2: "Key of D" },
        songs: '"Naomi Weiss"',
        changedStrings: [false, false, true, false, true],
        shortStringIndex: 0,
        shortStringStartFret: 6
    },
    "Little Birdie": {
        strings: ["e", "C", "G", "A", "d"],
        family: "c-family",
        description: "Appalachian",
        referenceTuning: "Naomi Weiss",
        deltaChanges: "From Naomi Weiss: 5th↓E",
        capoPositions: { 2: "Key of F# (uncommon)" },
        songs: '"Little Birdie"',
        changedStrings: [true, false, false, false, false],
        shortStringIndex: 0,
        shortStringStartFret: 6
    },
    "Hook-and-Line": {
        strings: ["g", "C", "G", "c", "d"],
        family: "c-family",
        description: "Open C Variant",
        referenceTuning: "Little Birdie",
        deltaChanges: "From Little Birdie: 5th↑G, 2nd↑C",
        capoPositions: { 2: "Key of D", 5: "Key of F" },
        songs: '"Hook and Line"',
        changedStrings: [true, false, false, true, false],
        shortStringIndex: 0,
        shortStringStartFret: 6
    },
    "Cackling Hen": {
        strings: ["g", "C", "G", "c", "e"],
        family: "c-family",
        description: "Open C Major",
        referenceTuning: "Hook-and-Line",
        deltaChanges: "From Hook-and-Line: 1st↑E",
        capoPositions: { 0: "Key of C", 2: "Key of D" },
        songs: "Open C tuning, Irish/Celtic",
        changedStrings: [false, false, false, false, true],
        shortStringIndex: 0,
        shortStringStartFret: 6
    },
    "Darling Cora": {
        strings: ["g", "C", "G", "c", "c"],
        family: "c-family",
        description: "Drone Heavy (Triple C)",
        referenceTuning: "Cackling Hen",
        deltaChanges: "From Cackling Hen: 1st↓C",
        capoPositions: { 2: "Key of D", 5: "Key of F" },
        songs: '"Darling Cora"',
        changedStrings: [false, false, false, false, true],
        shortStringIndex: 0,
        shortStringStartFret: 6
    },
    "Double C": {
        strings: ["g", "C", "G", "c", "d"],
        family: "c-family",
        description: "Old-Time Standard",
        referenceTuning: "Open G",
        deltaChanges: "From Open G: 4th↓C, 2nd↑C",
        capoPositions: { 2: "Key of D", 5: "Key of F" },
        songs: "Wildwood Flower, Billy in the Lowground",
        changedStrings: [false, true, false, true, false],
        shortStringIndex: 0,
        shortStringStartFret: 6
    },
    "Standard C": {
        strings: ["g", "C", "G", "B", "d"],
        family: "c-family",
        description: "C Tuning for Old-Time",
        referenceTuning: "Open G",
        deltaChanges: "From Open G: 4th↓C",
        capoPositions: { 2: "Key of D", 5: "Key of F" },
        songs: "Old-time repertoire",
        changedStrings: [false, true, false, false, false],
        shortStringIndex: 0,
        shortStringStartFret: 6
    },

    // D-Based Tunings
    "Moonshiner": {
        strings: ["g", "D", "G", "A", "d"],
        family: "d-family",
        description: "Modal/Dark",
        referenceTuning: "Standard F",
        deltaChanges: "From Standard F: 4th↑D, 3rd↑G, 2nd→A (same), 1st↑D",
        capoPositions: { 2: "Key of A", 5: "Key of C" },
        songs: '"Moonshiner"',
        changedStrings: [false, true, false, true, true],
        shortStringIndex: 0,
        shortStringStartFret: 6
    },
    "German War": {
        strings: ["g", "D", "G", "A", "f#"],
        family: "d-family",
        description: "Historical",
        referenceTuning: "Moonshiner",
        deltaChanges: "From Moonshiner: 1st↓F#",
        capoPositions: { 2: "Key of A (modal)" },
        songs: "German war songs",
        changedStrings: [false, false, false, false, true],
        shortStringIndex: 0,
        shortStringStartFret: 6
    },
    "Reuben": {
        strings: ["g", "D", "F#", "A", "f#"],
        family: "d-family",
        description: "Song-Specific",
        referenceTuning: "German War",
        deltaChanges: "From German War: 3rd↓F#",
        capoPositions: { 2: "Key of A (modal)" },
        songs: '"Reuben"',
        changedStrings: [false, false, true, false, false],
        shortStringIndex: 0,
        shortStringStartFret: 6
    },
    "F Tuning": {
        strings: ["f", "D", "G", "c", "d"],
        family: "d-family",
        description: "Cumberland Gap",
        referenceTuning: "Reuben",
        deltaChanges: "From Reuben: 5th↓F, 3rd↑G, 2nd↑C, 1st↑D",
        capoPositions: { 2: "Key of G", 5: "Key of Bb" },
        songs: "Cumberland Gap, Drunkard's Doom",
        changedStrings: [true, false, true, true, true],
        shortStringIndex: 0,
        shortStringStartFret: 6
    },
    "East Virginia": {
        strings: ["f", "F", "G", "c", "d"],
        family: "d-family",
        description: "George Gibson Style",
        referenceTuning: "F Tuning",
        deltaChanges: "From F Tuning: 4th↑F",
        capoPositions: { 2: "Key of G", 5: "Key of Bb" },
        songs: "George Gibson style",
        changedStrings: [false, true, false, false, false],
        shortStringIndex: 0,
        shortStringStartFret: 6
    },

    // G-Based Tunings
    "Standard (F)": {
        strings: ["f", "C", "F", "A", "c"],
        family: "g-family",
        description: "Historical Reference",
        referenceTuning: null,
        deltaChanges: "(Reference tuning for historical context)",
        capoPositions: { 2: "Key of G", 5: "Key of Bb" },
        songs: "General playing, historical reference",
        changedStrings: [false, false, false, false, false],
        shortStringIndex: 0,
        shortStringStartFret: 6
    },
    "Open G": {
        strings: ["g", "D", "G", "B", "d"],
        family: "g-family",
        description: "Bluegrass Standard",
        referenceTuning: null,
        deltaChanges: "(Modern standard reference - most common)",
        capoPositions: { 2: "Key of A", 5: "Key of C", 7: "Key of D" },
        songs: "Bill Cheatum, Old Joe Clark, Cripple Creek",
        changedStrings: [true, true, true, true, true],
        featured: true,
        shortStringIndex: 0,
        shortStringStartFret: 6
    },
    "Open G (Low G)": {
        strings: ["G", "D", "G", "B", "d"],
        family: "g-family",
        description: "Open G with Low 5th",
        referenceTuning: "Open G",
        deltaChanges: "From Open G: 5th↓G (one octave lower)",
        capoPositions: { 2: "Key of A", 5: "Key of C" },
        songs: "Low drone sound",
        changedStrings: [true, false, false, false, false],
        shortStringIndex: 0,
        shortStringStartFret: 6
    },
    "Open A": {
        strings: ["a", "E", "A", "C#", "e"],
        family: "g-family",
        description: "High Tension",
        referenceTuning: "Open G",
        deltaChanges: "From Open G: all strings ↑2 frets (whole step)",
        capoPositions: { 2: "Key of B", 5: "Key of D" },
        songs: "Tunes in A key - requires light gauge strings!",
        changedStrings: [true, true, true, true, true],
        warning: true,
        shortStringIndex: 0,
        shortStringStartFret: 6
    },
    "G Variant": {
        strings: ["g", "D", "G", "A", "d"],
        family: "g-family",
        description: "Modal G",
        referenceTuning: "Open G",
        deltaChanges: "From Open G: 2nd↓A",
        capoPositions: { 2: "Key of A", 5: "Key of C" },
        songs: "Leather Britches, Texas, Frosty Morning",
        changedStrings: [false, false, false, true, false],
        shortStringIndex: 0,
        shortStringStartFret: 6
    },
    "G Modal (Sawmill)": {
        strings: ["g", "D", "G", "c", "d"],
        family: "g-family",
        description: "Mountain/Modal",
        referenceTuning: "Open G",
        deltaChanges: "From Open G: 2nd↑C",
        capoPositions: { 2: "Key of A", 5: "Key of C" },
        songs: "Modal tunes, F key songs",
        changedStrings: [false, false, false, true, false],
        shortStringIndex: 0,
        shortStringStartFret: 6
    },
    "Open D": {
        strings: ["a", "D", "F#", "A", "d"],
        family: "g-family",
        description: "Blues/Folk (Graveyard)",
        referenceTuning: "Open G",
        deltaChanges: "From Open G: all strings adjusted for D major",
        capoPositions: { 2: "Key of E", 3: "Key of F", 5: "Key of G" },
        songs: 'Most D key tunes, "Graveyard Tuning" - use light strings!',
        changedStrings: [true, true, true, true, true],
        warning: true,
        shortStringIndex: 0,
        shortStringStartFret: 6
    },
    "D Modal": {
        strings: ["a", "D", "G", "A", "d"],
        family: "g-family",
        description: "Celtic/Medieval",
        referenceTuning: "Open D",
        deltaChanges: "From Open D: 3rd↓G",
        capoPositions: { 2: "Key of E (modal)", 5: "Key of G (modal)" },
        songs: "D modal tunes, medieval tonality",
        changedStrings: [false, false, true, false, false],
        shortStringIndex: 0,
        shortStringStartFret: 6
    },
    "D Tuning (Reno)": {
        strings: ["a", "D", "G", "B", "e"],
        family: "g-family",
        description: "Don Reno Style",
        referenceTuning: "Open G",
        deltaChanges: "From Open G: 5th↑A, 1st↑E",
        capoPositions: { 2: "Key of E", 5: "Key of G" },
        songs: "Don Reno repertoire",
        changedStrings: [true, false, false, false, true],
        shortStringIndex: 0,
        shortStringStartFret: 6
    },

    // Other / 4-String Tunings
    "Plectrum C": {
        strings: ["C", "G", "B", "d"],
        family: "other-family",
        description: "4-String Plectrum",
        referenceTuning: null,
        deltaChanges: "(4-string plectrum standard)",
        capoPositions: { 0: "Key of C" },
        songs: "Jazz, Dixieland",
        changedStrings: [false, false, false, false],
        shortStringIndex: null,
        shortStringStartFret: null,
        stringCount: 4
    },
    "Tenor (Standard)": {
        strings: ["C", "G", "d", "a"],
        family: "other-family",
        description: "4-String Tenor CGDA",
        referenceTuning: null,
        deltaChanges: "(4-string tenor standard - fifths tuning)",
        capoPositions: { 0: "Key of C/G" },
        songs: "Irish, Jazz, Traditional",
        changedStrings: [false, false, false, false],
        shortStringIndex: null,
        shortStringStartFret: null,
        stringCount: 4
    }
};

