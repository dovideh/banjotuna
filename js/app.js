// Application State and UI Logic

// ============================================
// STATE MANAGEMENT
// ============================================
let state = {
    familyFilter: 'all',
    capoPosition: 0,
    fretCount: 15,
    showNotes: true,
    selectedFretboardTuning: 'Open G',
    fretboardFamilyFilter: 'all',
    useSolfege: false,
    // Chord inversion state
    showInversions: false,
    inversionRootNote: 'G',
    inversionChordType: 'major',
    // Chord tab state
    chordTuning: 'Open G',
    chordKey: 'G',
    chordTypeFilter: 'all',
    fingerNotation: 'numbers',
    chordViewMode: 'single'  // 'single' or 'grid' (all keys)
};

function loadState() {
    const saved = localStorage.getItem('banjoTuningsState');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state = { ...state, ...parsed };
        } catch (e) {
            console.error('Failed to load state:', e);
        }
    }
}

function saveState() {
    localStorage.setItem('banjoTuningsState', JSON.stringify(state));
}

function renderFretboard() {
    const container = document.getElementById('fretboardContainer');
    container.innerHTML = generateFretboardSVG(state.selectedFretboardTuning);
}

function populateTuningList() {
    const list = document.getElementById('tuningList');
    const familyFilter = state.fretboardFamilyFilter || 'all';

    const families = {
        'c-family': 'C-Based Tunings',
        'd-family': 'D-Based Tunings',
        'g-family': 'G-Based Tunings',
        'other-family': 'Other (4-String)'
    };

    let html = '';

    for (const [familyKey, familyName] of Object.entries(families)) {
        if (familyFilter !== 'all' && familyFilter !== familyKey) continue;

        const tuningsInFamily = Object.entries(TUNINGS_DATA)
            .filter(([_, t]) => t.family === familyKey);

        if (tuningsInFamily.length === 0) continue;

        // Add group header if showing all families
        if (familyFilter === 'all') {
            html += `<div class="tuning-list-group">${familyName}</div>`;
        }

        for (const [name, tuning] of tuningsInFamily) {
            const isSelected = name === state.selectedFretboardTuning;

            // Determine which indices should be lowercase (first occurrence of duplicates)
            const lowercaseIdx = new Set();
            const seenNotes = new Map();
            for (let i = 0; i < tuning.strings.length; i++) {
                const normalized = normalizeNote(tuning.strings[i]).toUpperCase();
                if (!seenNotes.has(normalized)) {
                    seenNotes.set(normalized, i);
                } else {
                    lowercaseIdx.add(seenNotes.get(normalized));
                }
            }

            const tuningStr = tuning.strings.map((s, idx) => {
                let note = displayNote(normalizeNote(s));
                // Convert to solfège if enabled
                if (state.useSolfege) {
                    note = toSolfege(note);
                }
                return lowercaseIdx.has(idx) ? note.toLowerCase() : note;
            }).join(' ');

            html += `
                <div class="tuning-list-item ${tuning.family} ${isSelected ? 'selected' : ''}"
                     data-tuning="${name}">
                    <span class="tuning-item-name">${name}</span>
                    <span class="tuning-item-notes">${tuningStr}</span>
                </div>
            `;
        }
    }

    list.innerHTML = html;

    // Add click handlers
    list.querySelectorAll('.tuning-list-item').forEach(item => {
        item.addEventListener('click', () => {
            const tuningName = item.dataset.tuning;
            state.selectedFretboardTuning = tuningName;
            saveState();
            populateTuningList(); // Re-render to update selection
            renderFretboard();
        });
    });
}

// ============================================
// EVENT HANDLERS
// ============================================
function setupEventListeners() {
    document.getElementById('familyFilter').addEventListener('change', (e) => {
        state.familyFilter = e.target.value;
        saveState();
        renderTunings();
    });

    document.getElementById('capoPosition').addEventListener('change', (e) => {
        state.capoPosition = parseInt(e.target.value) || 0;
        saveState();
        renderTunings();
        renderFretboard();
    });

    document.getElementById('fretCount').addEventListener('change', (e) => {
        state.fretCount = parseInt(e.target.value);
        saveState();
        renderFretboard();
    });

    document.getElementById('showNotesToggle').addEventListener('change', (e) => {
        state.showNotes = e.target.checked;
        saveState();
        renderFretboard();
    });

    document.getElementById('solfegeToggle').addEventListener('change', (e) => {
        state.useSolfege = e.target.checked;
        saveState();
        renderTunings();
        renderFretboard();
        populateTuningList();
    });

    // Chord inversion controls (button-based in fretboard section)
    document.querySelectorAll('#inversionTypeButtons .chord-type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.target.dataset.type;
            const isActive = e.target.classList.contains('active');

            // Toggle the button
            if (isActive) {
                e.target.classList.remove('active');
                state.showInversions = false;
                document.getElementById('inversionKeyContainer').style.display = 'none';
            } else {
                e.target.classList.add('active');
                state.showInversions = true;
                state.inversionChordType = type;
                document.getElementById('inversionKeyContainer').style.display = 'block';
            }
            saveState();
            renderFretboard();
        });
    });

    document.querySelectorAll('#inversionKeyButtons .key-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active from all key buttons
            document.querySelectorAll('#inversionKeyButtons .key-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.inversionRootNote = e.target.dataset.key;
            saveState();
            renderFretboard();
        });
    });

    // Fretboard family filter
    document.getElementById('fretboardFamilyFilter').addEventListener('change', (e) => {
        state.fretboardFamilyFilter = e.target.value;
        saveState();
        populateTuningList();
    });

    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

function resetSettings() {
    state = {
        familyFilter: 'all',
        capoPosition: 0,
        fretCount: 15,
        showNotes: true,
        selectedFretboardTuning: 'Open G',
        fretboardFamilyFilter: 'all',
        useSolfege: false,
        showInversions: false,
        inversionRootNote: 'G',
        inversionChordType: 'major',
        chordTuning: 'Open G',
        chordKey: 'G',
        chordTypeFilter: 'all',
        fingerNotation: 'numbers',
        chordViewMode: 'single'
    };
    saveState();
    applyStateToUI();
    populateTuningList();
    renderTunings();
    renderFretboard();
    initChordTab();
}

function applyStateToUI() {
    document.getElementById('familyFilter').value = state.familyFilter;
    document.getElementById('capoPosition').value = state.capoPosition;
    document.getElementById('fretCount').value = state.fretCount;
    document.getElementById('showNotesToggle').checked = state.showNotes;
    document.getElementById('solfegeToggle').checked = state.useSolfege || false;
    document.getElementById('fretboardFamilyFilter').value = state.fretboardFamilyFilter || 'all';

    // Inversion controls (button-based)
    const inversionTypeBtn = document.querySelector('#inversionTypeButtons .chord-type-btn[data-type="major"]');
    if (inversionTypeBtn) {
        if (state.showInversions) {
            inversionTypeBtn.classList.add('active');
            document.getElementById('inversionKeyContainer').style.display = 'block';
        } else {
            inversionTypeBtn.classList.remove('active');
            document.getElementById('inversionKeyContainer').style.display = 'none';
        }
    }

    // Set active key button
    document.querySelectorAll('#inversionKeyButtons .key-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.key === (state.inversionRootNote || 'G'));
    });

    // Chord tab UI
    const chordTuningSelect = document.getElementById('chordTuningSelect');
    if (chordTuningSelect) {
        chordTuningSelect.value = state.chordTuning || 'Open G';
    }

    // Finger notation radio
    const fingerRadio = document.querySelector(`input[name="fingerNotation"][value="${state.fingerNotation || 'numbers'}"]`);
    if (fingerRadio) {
        fingerRadio.checked = true;
    }
}

// ============================================
// CHORD TAB FUNCTIONS
// ============================================
function populateChordTuningSelect() {
    const select = document.getElementById('chordTuningSelect');
    if (!select) return;

    select.innerHTML = '';

    // Group tunings by family
    const families = {
        'g-family': 'G-Based',
        'c-family': 'C-Based',
        'd-family': 'D-Based',
        'other-family': 'Other (4-String)'
    };

    for (const [familyKey, familyName] of Object.entries(families)) {
        const group = document.createElement('optgroup');
        group.label = familyName;

        for (const [name, data] of Object.entries(TUNINGS_DATA)) {
            if (data.family === familyKey) {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                if (name === state.chordTuning) {
                    option.selected = true;
                }
                group.appendChild(option);
            }
        }

        select.appendChild(group);
    }
}

function populateKeyButtons() {
    const container = document.getElementById('keyButtons');
    if (!container) return;

    container.innerHTML = CHORD_KEYS.map(key => {
        const isActive = state.chordKey === key.root ? 'active' : '';
        return `<button class="key-btn ${isActive}" data-key="${key.root}">${key.display}</button>`;
    }).join('');

    // Add click handlers
    container.querySelectorAll('.key-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.chordKey = btn.dataset.key;
            saveState();
            populateKeyButtons();
            renderChords();
        });
    });
}

function populateChordTypeButtons() {
    const container = document.getElementById('chordTypeButtons');
    if (!container) return;

    container.innerHTML = `
        <button class="chord-type-btn ${state.chordTypeFilter === 'all' ? 'active' : ''}" data-type="all">All</button>
        ${CHORD_TYPE_ORDER.map(key => {
            const type = CHORD_TYPES[key];
            const isActive = state.chordTypeFilter === key ? 'active' : '';
            return `<button class="chord-type-btn ${isActive}" data-type="${key}">${type.name}</button>`;
        }).join('')}
    `;

    // Add click handlers
    container.querySelectorAll('.chord-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.chordTypeFilter = btn.dataset.type;
            saveState();
            populateChordTypeButtons();
            renderChords();
        });
    });
}

function populateViewModeButtons() {
    const container = document.getElementById('viewModeButtons');
    if (!container) return;

    container.innerHTML = `
        <button class="view-mode-btn ${state.chordViewMode === 'single' ? 'active' : ''}" data-mode="single">Single Key</button>
        <button class="view-mode-btn ${state.chordViewMode === 'grid' ? 'active' : ''}" data-mode="grid">All Keys Grid</button>
    `;

    // Add click handlers
    container.querySelectorAll('.view-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.chordViewMode = btn.dataset.mode;
            saveState();
            populateViewModeButtons();
            updateKeyButtonsVisibility();
            renderChords();
        });
    });
}

function updateKeyButtonsVisibility() {
    const keyButtonsContainer = document.getElementById('keyButtonsContainer');
    if (keyButtonsContainer) {
        // Hide key buttons in grid mode (since all keys are shown)
        keyButtonsContainer.style.display = state.chordViewMode === 'grid' ? 'none' : 'flex';
    }
}

function renderChords() {
    const container = document.getElementById('chordContainer');
    if (!container) return;

    const tuningData = TUNINGS_DATA[state.chordTuning];
    if (!tuningData) {
        container.innerHTML = '<div class="no-chord-message">Select a tuning to view chords</div>';
        return;
    }

    const fingerNotation = document.querySelector('input[name="fingerNotation"]:checked')?.value || 'numbers';

    // Check view mode
    if (state.chordViewMode === 'grid') {
        renderChordsGrid(container, tuningData, fingerNotation);
    } else {
        renderChordsSingle(container, tuningData, fingerNotation);
    }
}

function renderChordsSingle(container, tuningData, fingerNotation) {
    // Determine which chord types to show (use ordered list)
    const typesToShow = state.chordTypeFilter === 'all'
        ? CHORD_TYPE_ORDER
        : [state.chordTypeFilter];

    let html = '';

    typesToShow.forEach(chordType => {
        const type = CHORD_TYPES[chordType];
        const chordName = `${state.chordKey}${type.symbol}`;

        // Find voicing for this chord
        const voicing = findChordVoicing(tuningData, state.chordKey, chordType, 12);

        if (voicing) {
            const svg = generateChordDiagramSVG(voicing, chordName, state.chordTuning, fingerNotation);

            html += `
                <div class="chord-diagram-container">
                    <div class="chord-diagram-title">${displayNote(state.chordKey)}${type.symbol}</div>
                    <div class="chord-diagram-subtitle">${type.name}</div>
                    ${svg}
                    <div class="chord-notes-display">
                        Notes: ${voicing.chordNotes.join(' - ')}
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="chord-diagram-container">
                    <div class="chord-diagram-title">${displayNote(state.chordKey)}${type.symbol}</div>
                    <div class="chord-diagram-subtitle">${type.name}</div>
                    <div class="no-chord-message">Voicing not available for this tuning</div>
                </div>
            `;
        }
    });

    container.className = 'chord-grid';
    container.innerHTML = html;
}

function renderChordsGrid(container, tuningData, fingerNotation) {
    // Determine which chord types to show as columns (use ordered groups)
    const typesToShow = state.chordTypeFilter === 'all'
        ? CHORD_TYPE_ORDER
        : [state.chordTypeFilter];

    // Helper to check if we need a separator after this chord type
    function needsSeparatorAfter(chordType) {
        if (state.chordTypeFilter !== 'all') return false;
        for (let i = 0; i < CHORD_TYPE_GROUPS.length - 1; i++) {
            const group = CHORD_TYPE_GROUPS[i];
            if (group[group.length - 1] === chordType) return true;
        }
        return false;
    }

    // Build table header with chord types and separators
    let headerHtml = '<tr><th class="key-header">Key</th>';
    typesToShow.forEach(chordType => {
        const type = CHORD_TYPES[chordType];
        headerHtml += `<th>${type.name}</th>`;
        if (needsSeparatorAfter(chordType)) {
            headerHtml += '<th class="group-separator"></th>';
        }
    });
    headerHtml += '</tr>';

    // Build table rows for each key
    let rowsHtml = '';
    CHORD_KEYS.forEach((key, keyIndex) => {
        // Add page break class before F#/Gb (index 6) for print
        const pageBreakClass = key.root === 'F#' ? ' class="page-break-before"' : '';
        rowsHtml += `<tr${pageBreakClass}><td class="key-cell">${key.display}</td>`;

        typesToShow.forEach(chordType => {
            const type = CHORD_TYPES[chordType];
            const voicing = findChordVoicing(tuningData, key.root, chordType, 12);

            if (voicing) {
                const svg = generateChordDiagramSVG(voicing, `${key.root}${type.symbol}`, state.chordTuning, fingerNotation);
                rowsHtml += `
                    <td class="grid-chord-cell">
                        <div class="grid-chord-diagram">
                            <div class="grid-chord-title">${displayNote(key.root)}${type.symbol}</div>
                            ${svg}
                            <div class="grid-chord-notes">${voicing.chordNotes.join(' - ')}</div>
                        </div>
                    </td>
                `;
            } else {
                rowsHtml += `
                    <td class="grid-chord-cell">
                        <div class="grid-no-voicing">Not available</div>
                    </td>
                `;
            }

            if (needsSeparatorAfter(chordType)) {
                rowsHtml += '<td class="group-separator"></td>';
            }
        });

        rowsHtml += '</tr>';
    });

    container.className = 'chord-keys-grid-container';
    container.innerHTML = `
        <table class="chord-keys-grid">
            <thead>${headerHtml}</thead>
            <tbody>${rowsHtml}</tbody>
        </table>
    `;
}

function setupChordEventListeners() {
    // Tuning selector
    const tuningSelect = document.getElementById('chordTuningSelect');
    if (tuningSelect) {
        tuningSelect.addEventListener('change', (e) => {
            state.chordTuning = e.target.value;
            saveState();
            renderChords();
        });
    }

    // Finger notation toggle
    document.querySelectorAll('input[name="fingerNotation"]').forEach(radio => {
        radio.addEventListener('change', () => {
            state.fingerNotation = document.querySelector('input[name="fingerNotation"]:checked')?.value || 'numbers';
            saveState();
            renderChords();
        });
    });
}

function initChordTab() {
    populateChordTuningSelect();
    populateViewModeButtons();
    populateKeyButtons();
    populateChordTypeButtons();
    setupChordEventListeners();
    updateKeyButtonsVisibility();
    renderChords();
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    loadState();
    applyStateToUI();
    populateTuningList();
    setupEventListeners();
    renderTunings();
    renderFretboard();
    initChordTab();
}

document.addEventListener('DOMContentLoaded', init);

