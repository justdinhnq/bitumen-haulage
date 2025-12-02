/********************************************************************
 * JOTFORM DYNAMIC TABLE WITH LIVE FORMULAS – FINAL CLEAN VERSION
 * Features:
 *   • Fully dynamic rows & columns
 *   • Real-time formula calculation (e.g., "A + B = Total")
 *   • 3-second debounce (no lag while typing)
 *   • Prefilled data support
 *   • Clean JSON output on submit
 *   • Zero redundant code
 ********************************************************************/

const table = document.getElementById('dynamicTable');

let ColumnNames = [];
let EquationsByY = {};                    // { resultColIndex: [colIdx, "+", colIdx, ...] }
const ResultColumnIndices = new Set();    // Columns that are auto-calculated (read-only)

/* ==================================================================
   START – Widget Initialization
   ================================================================== */

JFCustomWidget.subscribe('ready', () => {
    createInitialStructure();   // ← NEW: reads settings & creates rows/cols
    setupColumnNames();
    setupEquations();
    setupPrefilledData();
    setupEditableCellsAndFormulas();   // ← Runs ONLY ONCE
});

/* For testing outside JotForm environment*/
window.onload = () => {
    setupColumnNames();
    setupEquations();
    setupPrefilledData();
    setupEditableCellsAndFormulas();   // ← Runs ONLY ONCE
}

/* ==================================================================
   1. CREATE INITIAL ROWS & COLUMNS FROM SETTINGS
   ================================================================== */

function createInitialStructure() {
    const initialRows = parseInt(JFCustomWidget.getWidgetSetting('initialRows'));
    const initialCols = parseInt(JFCustomWidget.getWidgetSetting('initialColumns'));

    // Create rows
    for (let i = 0; i < initialRows; i++) {
        addRowSilently(); // no formula update yet
    }

    // Create columns 
    for (let i = 0; i < initialCols; i++) {
        addColumnSilently();
    }

    // Now safe to trigger formulas
    updateAllFormulas();
}

/* Silent versions — used during init only */
function addRowSilently() {
    const row = table.querySelector('tbody').insertRow();
    const colCount = table.querySelector('thead tr').cells.length;

    for (let i = 0; i < colCount; i++) {
        const cell = row.insertCell();
        // We'll make editable later in setupEditableCellsAndFormulas()
    }
}

function addColumnSilently() {
    const headerRow = table.querySelector('thead tr');
    const th = document.createElement('th');
    th.textContent = `Column ${headerRow.cells.length}`;
    th.contentEditable = true;
    headerRow.appendChild(th);

    table.querySelectorAll('tbody tr').forEach(row => {
        row.insertCell();
    });
}

/* ==================================================================
   2. COLUMN NAMES
   ================================================================== */

function setupColumnNames() {
    const setting = JFCustomWidget.getWidgetSetting('ColumnNames') || '#, 1, 2, 3';
    ColumnNames = setting.split(',').map(s => s.trim()).filter(Boolean);
    renameHeaders();
}

function renameHeaders() {
    const headers = table.querySelectorAll('thead th');
    //ColumnNames.forEach((name, i) => {
    //    if (headers[i]) headers[i].textContent = name;
    //});

    headers.forEach((th, i) => {
        console.log(`Renaming header ${i} to "${ColumnNames[i]}"`);
        if (ColumnNames[i]) th.textContent = ColumnNames[i];
    });
}

/* ==================================================================
   3. EQUATIONS & FORMULA ENGINE
   ================================================================== */

function setupEquations() {
    const raw = JFCustomWidget.getWidgetSetting('Equations') || 'Value B, +, Value A, =, Total (A+B)';
    if (!raw.trim()) return;

    const equations = parseEquations(raw);
    const grouped = groupByResultColumn(equations);
    EquationsByY = convertToIndexFormulas(grouped);

    console.log('Active formulas:', EquationsByY);
}

function parseEquations(str) {
    return str
        .split(';')
        .map(eq => eq.trim())
        .filter(Boolean)
        .map(eq => eq.split(',').map(t => t.trim()));
}

function groupByResultColumn(equations) {
    const map = {};
    equations.forEach(parts => {
        const eqIdx = parts.indexOf('=');
        if (eqIdx === -1 || eqIdx === parts.length - 1) return;
        const resultName = parts[eqIdx + 1];
        map[resultName] = parts.slice(0, eqIdx);
        const colIdx = ColumnNames.indexOf(resultName);
        if (colIdx !== -1) ResultColumnIndices.add(colIdx);
    });
    return map;
}

function convertToIndexFormulas(grouped) {
    const result = {};
    Object.keys(grouped).forEach(resultName => {
        const tokens = grouped[resultName];
        const indexed = [];

        for (const token of tokens) {
            if (['+', '-', '*', '/'].includes(token)) {
                indexed.push(token);
            } else {
                const idx = ColumnNames.indexOf(token);
                if (idx !== -1) indexed.push(idx);
                else console.warn(`Column not found: "${token}"`);
            }
        }

        const resultIdx = ColumnNames.indexOf(resultName);
        if (resultIdx !== -1 && indexed.length > 0) {
            result[resultIdx] = indexed;
        }
    });
    return result;
}

/* ==================================================================
   3. PREFILLED DATA
   ================================================================== */

function setupPrefilledData() {
    const raw = JFCustomWidget.getWidgetSetting('PrefilledCellData') || '';
    if (!raw.trim()) return;

    const data = raw
        .split(';')
        .map(r => r.trim())
        .filter(Boolean)
        .map(r => r.split('|').map(c => c.trim()));

    const rows = table.querySelectorAll('tbody tr');
    data.forEach((rowData, rowIdx) => {
        if (!rows[rowIdx]) return;
        const cells = rows[rowIdx].cells;
        rowData.forEach((value, colIdx) => {
            if (cells[colIdx] && !ResultColumnIndices.has(colIdx)) {
                cells[colIdx].textContent = value;
            }
        });
    });

    updateAllFormulas();
}

/* ==================================================================
   4. EDITABLE CELLS + LIVE CALCULATION (Debounced 3s)
   ================================================================== */

function setupEditableCellsAndFormulas() {
    updateAllFormulas(); // Initial calculation

    // Set up ALL cells ONCE
    table.querySelectorAll('tbody td').forEach((cell, colIdx) => {
        makeCellEditable(cell);
    });
}

function makeCellEditable(cell) {
    cell.contentEditable = true;
    let timer = null;

    const trigger = () => {
        clearTimeout(timer);
        timer = setTimeout(updateAllFormulas, 2000);
    };

    cell.addEventListener('input', trigger);
    cell.addEventListener('paste', trigger);
    cell.addEventListener('keydown', trigger);
}

function updateAllFormulas() {
    if (Object.keys(EquationsByY).length === 0) return;

    table.querySelectorAll('tbody tr').forEach(row => {
        const cells = row.cells;

        Object.entries(EquationsByY).forEach(([resultIdx, formula]) => {
            const value = evaluateFormula(formula, cells);
            const target = cells[parseInt(resultIdx)]; 
            if (target) target.textContent = value;
        });
    });
}

function evaluateFormula(tokens, cells) {
    let result = 0;
    let op = '+';

    for (const token of tokens) {
        let value = 0;

        if (typeof token === 'number') {
            let tmp = cells[token]?.textContent.trim();
            
            if (tmp.includes(':')) {
                const [h, m] = tmp.split(':').map(Number);
                value = (h || 0) + ((m || 0) / 60);
            }
            else value = parseFloat(tmp) || 0;
        }
        else if (['+', '-', '*', '/'].includes(token)) {
            op = token;
            continue;
        }

        switch (op) {
            case '+': result += value; break;
            case '-': result -= value; break;
            case '*': result *= value; break;
            case '/':
                if (value === 0) return 'Error';
                result /= value;
                break;
        }
    }

    return isFinite(result) ? Number(result.toFixed(2)) : 'Error';
}

/* ==================================================================
   5. DYNAMIC ROWS & COLUMNS
   ================================================================== */

function addRow() {
    const row = table.querySelector('tbody').insertRow();
    const colCount = table.querySelector('thead tr').cells.length;

    for (let i = 0; i < colCount; i++) {
        const cell = row.insertCell();
        if (ResultColumnIndices.has(i)) {
            cell.contentEditable = false;
            cell.style.backgroundColor = '#f0f9f0';
        } else {
            makeCellEditable(cell);
        }
    }
    updateAllFormulas();

    //getTableData(); // Update JSON on add
}

function addColumn() {
    const headerRow = table.querySelector('thead tr');
    const th = document.createElement('th');
    th.textContent = `Column ${headerRow.cells.length}`;
    th.contentEditable = true;
    headerRow.appendChild(th);

    table.querySelectorAll('tbody tr').forEach(row => {
        const cell = row.insertCell();
        makeCellEditable(cell);
    });
    updateAllFormulas();
}

function deleteLastColumn() {
    if (table.querySelector('thead tr').cells.length <= 2) {
        alert("Cannot delete essential columns!");
        return;
    }
    table.querySelector('thead tr').deleteCell(-1);
    table.querySelectorAll('tbody tr').forEach(row => row.deleteCell(-1));
    updateAllFormulas();
}

function deleteLastRow() {
    const tbody = table.querySelector('tbody');
    if (tbody.rows.length <= 1) {
        alert("Cannot delete the last row!");
        return;
    }
    tbody.deleteRow(-1);
    updateAllFormulas();
}

/* ==================================================================
   6. FORM SUBMIT – Return Clean JSON
   ================================================================== */

function getTableData() {
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
    
    const data = [];

    table.querySelectorAll('tbody tr').forEach(row => {
        const obj = {};
        row.querySelectorAll('td').forEach((cell, i) => {
            obj[headers[i] + " "] = cell.textContent.trim();
        });
        data.push(obj);
    });

    console.log('Final table data object:', data);

    const jsonData =  JSON.stringify(data, null, 2);

    return jsonData;
}

JFCustomWidget.subscribe('submit', () => {
    JFCustomWidget.sendSubmit({
        valid: true,
        value: getTableData()
    });
});