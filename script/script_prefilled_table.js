let ColumnNames = [];
let ColumnsToSum = [];
let ColumnToShowSumResult = "";
let PrefilledCellData = [];

// Get User Parameter
JFCustomWidget.subscribe('ready', function() {
    const moreRows = JFCustomWidget.getWidgetSetting('initialRows');
    const moreColumns = JFCustomWidget.getWidgetSetting('initialColumns');

    const _ColumnNames = JFCustomWidget.getWidgetSetting('ColumnNames');   //strings: "Col1, Col2, Col3"
    const _ColumnsToSum = JFCustomWidget.getWidgetSetting('ColumnsToSum'); //strings: "Col1, Col2"

    const _ColumnToShowSumResult = JFCustomWidget.getWidgetSetting('ColumnToShowSumResult'); //string: "Total"

    const _PrefilledCellData = JFCustomWidget.getWidgetSetting('PrefilledCellData'); //cell00, cell01, Marc Bom; row 2 cell 1, hello, Marc Bom; (for next rows...)

    const noRows = parseInt(moreRows);
    const noColumns = parseInt(moreColumns);

    for (let i = 0; i < noRows; i++) addRow();
    for (let i = 0; i < noColumns; i++) addColumn();

    ColumnNames = parseColumnNames(_ColumnNames);
    renameAllColumns(ColumnNames);

    ColumnsToSum = parseColumnNames(_ColumnsToSum);
    ColumnToShowSumResult = _ColumnToShowSumResult;
    PrefilledCellData = parsePrefilledCellData(_PrefilledCellData);

    // Fill prefilled data  
    applyPrefilledCellData();
});

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
let dataColCount = 2;          // editable columns **before** the Total column
let extraColCount = 0;         // columns **after** the Total column

/* ---------- SUM LOGIC ---------- */
function updateAllSums() {
    if (ColumnsToSum.length === 0) return;

    const headers = Array.from(table.querySelectorAll('thead th'));
    const sumColIndex = headers.findIndex(h => h.textContent === ColumnToShowSumResult);

    if (sumColIndex === -1) return;

    table.querySelectorAll('tbody tr').forEach(row => {
        let total = 0;

        ColumnsToSum.forEach(colName => {
            const colIndex = headers.findIndex(h => h.textContent === colName);
            if (colIndex !== -1) {
                const v = parseFloat(row.cells[colIndex].textContent) || 0;
                total += v;
            }
        });

        row.cells[sumColIndex].textContent = total.toFixed(2);
    });
}

function applyPrefilledCellData() {
    if (!PrefilledCellData.length) return;

    const rows = table.querySelectorAll('tbody tr');

    PrefilledCellData.forEach((rowData, r) => {
        if (!rows[r]) return;

        const cells = rows[r].querySelectorAll('td');

        rowData.forEach((val, c) => {
            if (cells[c]) {          
                cells[c].textContent = val;
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
    row.insertCell(0).textContent = rowCount;               // #
    for (let i = 0; i < dataColCount; i++) {                // data columns before Total
        const c = row.insertCell();
        //c.textContent = '0';
        makeCellEditable(c);
    }
    const sumCell = row.insertCell();                       // Total column
    //sumCell.className = 'sum-cell';
    sumCell.textContent = '0';
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
        newCell.textContent = '0';
        makeCellEditable(newCell);
    });

    // No need to recalc sum – it still looks at the two columns before the Total column
    updateAllSums();
}

/* ---------- DELETE LAST DATA COLUMN (the column just before Total) ---------- */
function deleteLastColumn() {
    if (dataColCount <= 2) {
        alert('Cannot delete – at least 2 data columns are required for the sum!');
        return;
    }
    dataColCount--;

    // Header: delete the column right before Total
    const headerRow = table.querySelector('thead tr');
    headerRow.deleteCell(headerRow.cells.length - 2 - extraColCount); // before Total

    // Body
    table.querySelectorAll('tbody tr').forEach(row => {
        row.deleteCell(row.cells.length - 2 - extraColCount);
    });

    updateAllSums();
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