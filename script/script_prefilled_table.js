// Get User Parameter
JFCustomWidget.subscribe('ready', function() {
    const moreRows = JFCustomWidget.getWidgetSetting('initialRows');
    const moreColumns = JFCustomWidget.getWidgetSetting('initialColumns');

    const noRows = parseInt(moreRows);
    const noColumns = parseInt(moreColumns);

    for (let i = 0; i < noRows; i++) addRow();
    for (let i = 0; i < noColumns; i++) addColumn();
});

const table = document.getElementById('dynamicTable');
let rowCount = 2;
let dataColCount = 2;          // editable columns **before** the Total column
let extraColCount = 0;         // columns **after** the Total column

/* ---------- SUM LOGIC ---------- */
function updateAllSums() {
    if (dataColCount < 2) return;
    table.querySelectorAll('tbody tr').forEach(row => {
        const cells = row.cells;
        const len = cells.length;
        if (len < 4) return;                         // need at least #, A, B, Total
        const idxA = len - 2 - extraColCount - 1;    // second-last data col
        const idxB = len - 2 - extraColCount;        // last data col before Total
        const valA = parseFloat(cells[idxA].textContent) || 0;
        const valB = parseFloat(cells[idxB].textContent) || 0;
        cells[len - 1 - extraColCount].textContent = (valA + valB).toFixed(2);
    });
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
        c.textContent = '0';
        makeCellEditable(c);
    }
    const sumCell = row.insertCell();                       // Total column
    sumCell.className = 'sum-cell';
    sumCell.textContent = '0';
    for (let i = 0; i < extraColCount; i++) {               // extra columns after Total
        const c = row.insertCell();
        c.textContent = '0';
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

function getTableData() {
  const data = [];
  document.querySelectorAll('tbody tr').forEach(row => {
    data.push({
      row: row.cells[0].textContent,
      a: row.cells[1].textContent,
      b: row.cells[2].textContent,
      total: row.cells[3].textContent
    });
  });
  return JSON.stringify(data);
}

// Send data when form submits
JFCustomWidget.subscribe('submit', function(){
  JFCustomWidget.sendSubmit({
    value: getTableData()
  });
});