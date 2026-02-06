// Validation & Test Data Structures
// SRS Section 7

// ============================================
// TEST CASE DEFINITIONS (SRS Section 7.1 & 7.2)
// ============================================

const TEST_CASES = [
    // TC_001: Verify F Major Root Form Logic in Standard G
    {
        test_id: "TC_001",
        description: "Verify F Major Root Form Logic in Standard G",
        setup: {
            tuning_id: "Open G",
            root_note: "F",
            chord_quality: "MAJOR"
        },
        expectations: {
            classification: {
                shape_name: "Root Form",
                expected_color: "#3366cc",
                bass_interval: 0 // Root
            },
            voicing: {
                // Strings 4, 3, 2, 1: frets that produce F-A-C-F
                intervals: ['1', '3', '5', '1']
            },
            movable_logic: {
                base_shape_alias: "F Shape",
                fret_offset: 0
            }
        }
    },

    // TC_002: Verify G Major Root Form in Standard G (should be at low position)
    {
        test_id: "TC_002",
        description: "Verify G Major Root Form in Standard G",
        setup: {
            tuning_id: "Open G",
            root_note: "G",
            chord_quality: "MAJOR"
        },
        expectations: {
            classification: {
                shape_name: "Root Form",
                expected_color: "#3366cc",
                bass_interval: 0
            }
        }
    },

    // TC_003: Verify 1st Inversion detection
    {
        test_id: "TC_003",
        description: "Verify 1st Inversion (3rd in bass) for G Major in Open G",
        setup: {
            tuning_id: "Open G",
            root_note: "G",
            chord_quality: "MAJOR"
        },
        expectations: {
            classification: {
                shape_name: "1st Inversion",
                expected_color: "#cc3333",
                bass_interval: 4 // Major 3rd
            }
        }
    },

    // TC_004: Verify 2nd Inversion detection
    {
        test_id: "TC_004",
        description: "Verify 2nd Inversion (5th in bass) for G Major in Open G",
        setup: {
            tuning_id: "Open G",
            root_note: "G",
            chord_quality: "MAJOR"
        },
        expectations: {
            classification: {
                shape_name: "2nd Inversion",
                expected_color: "#cc9900",
                bass_interval: 7 // Perfect 5th
            }
        }
    },

    // TC_005: Verify Dominant 7th 3rd Inversion
    {
        test_id: "TC_005",
        description: "Verify 3rd Inversion (7th in bass) for G7 in Open G",
        setup: {
            tuning_id: "Open G",
            root_note: "G",
            chord_quality: "DOM7"
        },
        expectations: {
            classification: {
                shape_name: "3rd Inversion",
                expected_color: "#339933",
                bass_interval: 10 // Dominant 7th
            }
        }
    },

    // TC_006: Verify partial voicing (Double Stop) generation
    {
        test_id: "TC_006",
        description: "Verify Double Stop generation from G Major in Open G",
        setup: {
            tuning_id: "Open G",
            root_note: "G",
            chord_quality: "MAJOR",
            voicing_mode: "partial"
        },
        expectations: {
            min_shapes: 1,
            all_shapes_have_2_notes: true
        }
    },

    // TC_007: 4-string banjo support
    {
        test_id: "TC_007",
        description: "Verify chord shapes for 4-string Plectrum C tuning",
        setup: {
            tuning_id: "Plectrum C",
            root_note: "C",
            chord_quality: "MAJOR"
        },
        expectations: {
            has_shapes: true,
            classification: {
                shape_name: "Root Form",
                expected_color: "#3366cc",
                bass_interval: 0
            }
        }
    },

    // TC_008: Minor 7th chord family
    {
        test_id: "TC_008",
        description: "Verify Minor 7th shapes in Open G",
        setup: {
            tuning_id: "Open G",
            root_note: "A",
            chord_quality: "MIN7"
        },
        expectations: {
            has_shapes: true
        }
    },

    // TC_009: Major 7th chord family
    {
        test_id: "TC_009",
        description: "Verify Major 7th shapes in Open G",
        setup: {
            tuning_id: "Open G",
            root_note: "G",
            chord_quality: "MAJ7"
        },
        expectations: {
            has_shapes: true
        }
    }
];

// Connector Logic Tests (SRS Section 7.2)
const CONNECTOR_TEST_CASES = [
    {
        test_id: "TC_CONN_01",
        description: "Verify 5-Fret Rule in Open G",
        setup: {
            tuning_id: "Open G"
        },
        expectations: {
            tuning_interval: 5, // G tuning specific: interval between strings 3 and 4
            connector_valid: true
        }
    },
    {
        test_id: "TC_CONN_02",
        description: "Verify tuning interval calculation for Double C",
        setup: {
            tuning_id: "Double C"
        },
        expectations: {
            tuning_interval: 7 // C to G = 7 semitones
        }
    }
];

// ============================================
// TEST RUNNER
// ============================================

function runTests() {
    const results = [];
    let passed = 0;
    let failed = 0;

    // Shape generation tests
    for (const tc of TEST_CASES) {
        const result = runSingleTest(tc);
        results.push(result);
        if (result.passed) passed++;
        else failed++;
    }

    // Connector tests
    for (const tc of CONNECTOR_TEST_CASES) {
        const result = runConnectorTest(tc);
        results.push(result);
        if (result.passed) passed++;
        else failed++;
    }

    return { results, passed, failed, total: passed + failed };
}

function runSingleTest(tc) {
    const result = {
        test_id: tc.test_id,
        description: tc.description,
        passed: false,
        errors: []
    };

    try {
        const tuning = TUNINGS_DATA[tc.setup.tuning_id];
        if (!tuning) {
            result.errors.push(`Tuning "${tc.setup.tuning_id}" not found`);
            return result;
        }

        const voicingMode = tc.setup.voicing_mode || 'full';
        const shapes = generateChordShapes(
            tc.setup.root_note,
            tc.setup.chord_quality,
            tuning,
            voicingMode
        );

        // Check if shapes were generated
        if (tc.expectations.has_shapes !== undefined) {
            if (tc.expectations.has_shapes && shapes.length === 0) {
                result.errors.push('Expected shapes but none were generated');
                return result;
            }
        }

        // Check minimum shapes for partial voicings
        if (tc.expectations.min_shapes !== undefined) {
            if (shapes.length < tc.expectations.min_shapes) {
                result.errors.push(`Expected at least ${tc.expectations.min_shapes} shapes, got ${shapes.length}`);
                return result;
            }
        }

        // Check that all partial shapes have 2 notes
        if (tc.expectations.all_shapes_have_2_notes) {
            const invalid = shapes.filter(s => s.notes.length !== 2);
            if (invalid.length > 0) {
                result.errors.push(`${invalid.length} shapes don't have exactly 2 notes`);
                return result;
            }
        }

        // Check classification expectations
        if (tc.expectations.classification) {
            const exp = tc.expectations.classification;

            // Find a shape matching the expected classification
            const matchingShape = shapes.find(s =>
                s.classification.name === exp.shape_name
            );

            if (!matchingShape) {
                result.errors.push(`No shape with classification "${exp.shape_name}" found. Found: ${[...new Set(shapes.map(s => s.classification.name))].join(', ')}`);
                return result;
            }

            if (exp.expected_color && matchingShape.classification.color !== exp.expected_color) {
                result.errors.push(`Expected color ${exp.expected_color}, got ${matchingShape.classification.color}`);
                return result;
            }

            if (exp.bass_interval !== undefined && matchingShape.bassInterval !== exp.bass_interval) {
                result.errors.push(`Expected bass interval ${exp.bass_interval}, got ${matchingShape.bassInterval}`);
                return result;
            }
        }

        // Check movable logic
        if (tc.expectations.movable_logic && shapes.length > 0) {
            const rootForms = shapes.filter(s => s.classification.name === 'Root Form');
            if (rootForms.length > 0) {
                const info = getMovableShapeInfo(rootForms[0]);
                if (info && tc.expectations.movable_logic.base_shape_alias !== info.alias) {
                    result.errors.push(`Expected alias "${tc.expectations.movable_logic.base_shape_alias}", got "${info.alias}"`);
                    return result;
                }
            }
        }

        result.passed = true;
    } catch (e) {
        result.errors.push(`Exception: ${e.message}`);
    }

    return result;
}

function runConnectorTest(tc) {
    const result = {
        test_id: tc.test_id,
        description: tc.description,
        passed: false,
        errors: []
    };

    try {
        const tuning = TUNINGS_DATA[tc.setup.tuning_id];
        if (!tuning) {
            result.errors.push(`Tuning "${tc.setup.tuning_id}" not found`);
            return result;
        }

        const interval = calculateTuningInterval(tuning);

        if (tc.expectations.tuning_interval !== undefined) {
            if (interval !== tc.expectations.tuning_interval) {
                result.errors.push(`Expected tuning interval ${tc.expectations.tuning_interval}, got ${interval}`);
                return result;
            }
        }

        result.passed = true;
    } catch (e) {
        result.errors.push(`Exception: ${e.message}`);
    }

    return result;
}

/**
 * Render test results to the UI.
 */
function renderTestResults(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const results = runTests();

    let html = `<div class="test-results-header">
        <strong>Test Results:</strong> ${results.passed}/${results.total} passed
        ${results.failed > 0 ? ` <span style="color: #cc3333;">(${results.failed} failed)</span>` : ' <span style="color: #339933;">All passed</span>'}
    </div>`;

    html += '<div class="test-results-list">';
    for (const r of results.results) {
        const statusClass = r.passed ? 'test-pass' : 'test-fail';
        const statusIcon = r.passed ? 'PASS' : 'FAIL';
        html += `<div class="test-result-item ${statusClass}">
            <span class="test-status">[${statusIcon}]</span>
            <span class="test-id">${r.test_id}</span>
            <span class="test-desc">${r.description}</span>
            ${r.errors.length > 0 ? `<div class="test-errors">${r.errors.join('<br>')}</div>` : ''}
        </div>`;
    }
    html += '</div>';

    container.innerHTML = html;
}
