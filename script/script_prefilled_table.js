let ColumnNames = [];
let PrefilledCellData = [];

let EquationsAsColumnNames = [];     // Original string format: [["col01", "*", "col02", "-", "col03", "=", "col04"], ...]
let EquationsByYAsColumnNames = [];  // Grouped by result column: { col04: ["col01", "*", "col02", "-", "col03"], ... }
let EquationsByY = [];               // FINAL: { resultColIndex: [op1, operator, op2, operator, ..., opN] } — using 0-based indices

let ResultColumnIndices = []; // Indices of columns that hold results of equations

// Main: Runs when widget is ready
JFCustomWidget.subscribe('ready', function () {
    Start();
});

//window.onload = Start;

function Start() {
    // Setup initial rows and columns
    SetupRowsAndColumns();
    
    // Setup column names
    SetupColumnNames();
    
    // Setup equations
    SetupEquations();
    
    // Setup prefilled cell data
    SetupPrefilledCellData();
}

function SetupPrefilledCellData() {
    const prefilledDataStr = JFCustomWidget.getWidgetSetting('PrefilledCellData');
    PrefilledCellData = parsePrefilledCellData(prefilledDataStr);
    console.log('Parsed PrefilledCellData:', PrefilledCellData);
    applyPrefilledCellData();
}

function SetupColumnNames() {
    //const colNamesStr = '#, Value A, Value B, Total (A+B)';
    const colNamesStr = JFCustomWidget.getWidgetSetting('ColumnNames');
    ColumnNames = parseColumnNames(colNamesStr);
    console.log('Parsed ColumnNames:', ColumnNames);
    renameAllColumns(ColumnNames);
}

function SetupRowsAndColumns() {
    const moreRows = JFCustomWidget.getWidgetSetting('initialRows');
    const moreColumns = JFCustomWidget.getWidgetSetting('initialColumns');

    const noRows = parseInt(moreRows);
    const noColumns = parseInt(moreColumns);
    
    for (let i = 0; i < noRows; i++) addRow();
    for (let i = 0; i < noColumns; i++) addColumn();
}

function SetupEquations() {
    //col01, *, col02, -, col03, =, col04; col10, -, col01, /, col03, =, col11
    //const Equations = "Value A, +, Value B, =, Total (A+B)";
    const Equations = JFCustomWidget.getWidgetSetting('Equations');
    // === NEW: Parse Equations and build EquationsByY ===
    if (Equations.trim()) {
        EquationsAsColumnNames = parseEquationsSetting(Equations);
        EquationsByYAsColumnNames = groupEquationsByResultColumn(EquationsAsColumnNames);
        EquationsByY = convertToIndexBasedEquations(EquationsByYAsColumnNames);
        console.log('EquationsAsColumnNames:', EquationsAsColumnNames);
        console.log('EquationsByYAsColumnNames:', EquationsByYAsColumnNames);
        console.log('EquationsByY (final index-based):', EquationsByY);
        
        // Apply formulas immediately + listen for changes
        applyFormulasAndWatch();
    }
}
// ————————————————————————
// PARSING HELPERS
// ————————————————————————

//function parseColumnNames(str) {
//    if (!str) return [];
//    return str.split(',').map(s => s.trim()).filter(Boolean);
//}

// Parse the raw Equations string into array of arrays
function parseEquationsSetting(equationsStr) {
    const newLocal = equationsStr
        .split(';') // separate equations
        .map(eq => eq.trim()).filter(Boolean);

    console.log('Parsing equations:', newLocal);
    const newLocal_1 = newLocal.map(eq => eq.split(',').map(token => token.trim()).filter(Boolean));
        //.map(eq => eq.split(',').filter(token => token !== '='));

    console.log('Parsed equations (intermediate):', newLocal_1);
    return newLocal_1;
}

// Group equations by result column (the one after =)
function groupEquationsByResultColumn(equations) {
    const map = {};
    equations.forEach(eq => {
        const eqIndex = eq.indexOf('=');
        if (eqIndex === -1 || eqIndex === eq.length - 1) return;
        const resultCol = eq[eqIndex + 1];
        const formula = eq.slice(0, eqIndex); 
        map[resultCol] = formula;

        ResultColumnIndices.push(resultCol);
    });
    return map;
}

// Convert column names → 0-based column indices (excluding row number column)
function convertToIndexBasedEquations(equationsByColName) {
    const result = {};

    Object.keys(equationsByColName).forEach(resultColName => {
        const formulaTokens = equationsByColName[resultColName];
        const formulaIndices = [];

        for (let token of formulaTokens) {
            if (['+', '-', '*', '/'].includes(token)) {
                formulaIndices.push(token);
            } else {
                // Find index of this column name
                const colIndex = ColumnNames.indexOf(token);
                if (colIndex !== -1) {
                    formulaIndices.push(colIndex); // 0-based real data column index
                } else {
                    console.warn(`Column "${token}" not found in ColumnNames`);
                }
            }
        }

        if (formulaIndices.length > 0) {
            const resultColIndex = ColumnNames.indexOf(resultColName);
            if (resultColIndex !== -1) {
                result[resultColIndex] = formulaIndices;
            }
        }
    });

    return result;
}

// ————————————————————————
// APPLY FORMULAS & AUTO-UPDATE
// ————————————————————————

function applyFormulasAndWatch() {
    // Initial calculation
    updateAllFormulaCells();

    // Watch all editable cells for changes
    table.querySelectorAll('tbody td[contenteditable="true"]').forEach(cell => {
        cell.addEventListener('input', updateAllFormulaCells);
        cell.addEventListener('paste', () => setTimeout(updateAllFormulaCells, 10));
    });
}

function updateAllFormulaCells() {
    if (Object.keys(EquationsByY).length === 0) return;

    table.querySelectorAll('tbody tr').forEach(row => {
        const cells = row.cells;

        Object.keys(EquationsByY).forEach(resultColIdx => {
            const formula = EquationsByY[resultColIdx];
            if (!formula || formula.length === 0) return;

            console.log('Evaluating formula for row:', row.rowIndex, 'formula:', formula);

            let result = evaluateFormula(formula, cells);
            if (typeof result === 'number') {
                result = result.toFixed(2).replace(/\.00$/, '');
            } else if (result === Infinity || isNaN(result)) {
                result = 'Error';
            }

            console.log(`Setting result for column index ${resultColIdx}:`, result);

            // resultColIdx is 0-based in data columns → actual DOM index = resultColIdx + 1 (skip row number)
            const targetCell = cells[resultColIdx];
            if (targetCell) {
                targetCell.textContent = result;
                targetCell.contentEditable = true; 
                targetCell.style.backgroundColor = '#e8f5e9';
                targetCell.style.fontWeight = 'bold';
            }
        });
    });
}

function evaluateFormula(formulaTokens, cells) {
    //value is float number
    let value = 0;
    let operator = '+';

    for (let i = 0; i < formulaTokens.length; i++) {
        const token = formulaTokens[i];

        if (typeof token === 'number') {
            // token is column index
            const cellValue = parseFloat(cells[token]?.textContent) || 0; // +1 for row number column
            //console.log(`Token is column index ${token}, cell value:`, cellValue);

            if (operator === '+') value += cellValue;
            if (operator === '-') value -= cellValue;
            if (operator === '*') value *= cellValue;
            if (operator === '/') value /= cellValue;
        } // if token is in the format of hourly such as 17:30
        else if (typeof token === 'string' && token.includes(':')) {
            const parts = token.split(':');
            const hours = parseFloat(parts[0]) || 0;
            const minutes = parseFloat(parts[1]) || 0;
            const cellValue = hours + (minutes / 60);
            console.log(`Token is time "${token}", cell value:`, cellValue);
            
            if (operator === '+') value += cellValue;
            if (operator === '-') value -= cellValue;
            if (operator === '*') value *= cellValue;
            if (operator === '/') value /= cellValue;
        }else if (['+', '-', '*', '/'].includes(token)) {
            //console.log('Token is operator:', token);
            operator = token;
        }
    }

    return value;
}

function parsePrefilledCellData(str) {
    if (!str) return [];

    return str
        .split(';')                     // rows
        .map(r => r.trim())
        .filter(r => r.length > 0)
        .map(r =>
            r.split(',')                // cells
             .map(c => c.trim())        // keep empty string ""
        );
}

function parseColumnNames(str) {
    return str
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

function renameAllColumns(newNamesArray) {
    const headerRow = table.querySelector('thead tr');
    const ths = headerRow.querySelectorAll('th');

    newNamesArray.forEach((name, i) => {
        if (ths[i]) ths[i].textContent = name;
    });
}


const table = document.getElementById('dynamicTable');
let rowCount = 2;
let dataColCount = 3;          // editable columns **before** the Total column
let extraColCount = 0;         // columns **after** the Total column

/* ---------- SUM LOGIC ---------- */
function updateAllSums() {
    applyFormulasAndWatch();
}

function applyPrefilledCellData() {
    if (!PrefilledCellData.length) return;

    const rows = table.querySelectorAll('tbody tr');

    PrefilledCellData.forEach((rowData, r) => {
        if (!rows[r]) return;

        const cells = rows[r].querySelectorAll('td');

        rowData.forEach((val, column) => {
            //only fill non-result columns
            if (cells[column] && ResultColumnIndices.includes(column) === false) {     
                cells[column].textContent = val;
            }
        });
    });

    updateAllSums();
}


/* ---------- EDITABLE CELLS ---------- */
function makeCellEditable(cell) {
    cell.contentEditable = true;
    cell.addEventListener('input', updateAllSums);
    cell.addEventListener('paste', () => setTimeout(updateAllSums, 0));
}

/* ---------- ADD ROW ---------- */
function addRow() {
    rowCount++;
    const row = table.querySelector('tbody').insertRow();
    //row.insertCell(0).textContent = rowCount;               // #
    for (let i = 0; i < dataColCount; i++) {                // data columns before Total
        const c = row.insertCell();
        //c.textContent = '0';
        makeCellEditable(c);
    }
    const sumCell = row.insertCell();                       // Total column
    //sumCell.className = 'sum-cell';
    //sumCell.textContent = '0';
    for (let i = 0; i < extraColCount; i++) {               // extra columns after Total
        const c = row.insertCell();
        //c.textContent = '0';
        makeCellEditable(c);
    }
    updateAllSums();
}

/* ---------- ADD COLUMN (AFTER TOTAL) ---------- */
function addColumn() {
    extraColCount++;

    // Header
    const headerRow = table.querySelector('thead tr');
    const newTh = document.createElement('th');
    newTh.textContent = `Extra ${extraColCount}`;
    newTh.contentEditable = true;
    headerRow.appendChild(newTh);               // **after** everything (including Total)

    // Body rows
    table.querySelectorAll('tbody tr').forEach(row => {
        const newCell = row.insertCell();         // append at end
        //newCell.textContent = '0';
        makeCellEditable(newCell);
    });

    // No need to recalc sum – it still looks at the two columns before the Total column
    updateAllSums();
}

/* ---------- DELETE LAST DATA COLUMN ---------- */
function deleteLastColumn() {
    const headerRow = table.querySelector('thead tr');
    headerRow.deleteCell(-1);  // Delete last TH
    
    // Body
    table.querySelectorAll('tbody tr').forEach(row => {
        row.deleteCell(-1);  // Delete last TD
    });
    
    updateAllSums();
    extraColCount--;
}

/* ---------- DELETE LAST ROW ---------- */
function deleteLastRow() {
    const tbody = table.querySelector('tbody');
    if (tbody.rows.length <= 1) {
        alert('Cannot delete the last row!');
        return;
    }
    tbody.deleteRow(-1);
    rowCount--;
    table.querySelectorAll('tbody tr').forEach((r, i) => r.cells[0].textContent = i + 1);
}

/* ---------- INITIALISE ---------- */
document.querySelectorAll('td[contenteditable="true"]').forEach(makeCellEditable);
updateAllSums();

// Fully dynamic data extractor
function getTableData() {
    const headers = Array.from(table.querySelectorAll('thead th'));

    const data = [];
    table.querySelectorAll('tbody tr').forEach(row => {
        const obj = {};
        row.querySelectorAll('td').forEach((cell, i) => {
        obj[headers[i].textContent] = cell.textContent;
        });
        data.push(obj);
    });

    const newLocal = JSON.stringify(data);
    console.log('Submitting table data...', newLocal);
    return newLocal;
}

// Send on form submit
JFCustomWidget.subscribe('submit', function(){
    JFCustomWidget.sendSubmit({
        valid: true,
        value: getTableData()
    });
});