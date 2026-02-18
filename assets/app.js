/* ═══════════════════════════════════════════════════════
   DRAG-TO-REORDER COLUMNS
═══════════════════════════════════════════════════════ */
const COLUMN_ORDER_KEY = 'column_order_v1';
let columnOrders = JSON.parse(localStorage.getItem(COLUMN_ORDER_KEY) || '{}');

function saveColumnOrder(panelId, order) {
  columnOrders[panelId] = order;
  localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(columnOrders));
}

function getColumnOrder(panelId, defaultCols) {
  return columnOrders[panelId] || defaultCols.map((c, i) => i);
}

function reorderColumns(cols, order) {
  return order.map(i => cols[i]);
}

function enableColumnDrag(tableId, cols, updateCallback) {
  setTimeout(() => {
    const headerRow = document.querySelector(`#th-${tableId}`);
    if (!headerRow) return;
    
    const headers = headerRow.querySelectorAll('th');
    let dragSrcIdx = null;
    
    headers.forEach((header, idx) => {
      header.draggable = true;
      header.style.cursor = 'grab';
      header.title = 'Drag to reorder';
      
      header.addEventListener('dragstart', (e) => {
        dragSrcIdx = idx;
        header.style.opacity = '0.4';
        header.style.cursor = 'grabbing';
        e.dataTransfer.effectAllowed = 'move';
      });
      
      header.addEventListener('dragend', (e) => {
        header.style.opacity = '1';
        header.style.cursor = 'grab';
      });
      
      header.addEventListener('dragover', (e) => {
        if (e.preventDefault) e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        header.style.background = '#e0f2fe';
        return false;
      });
      
      header.addEventListener('dragleave', (e) => {
        header.style.background = '';
      });
      
      header.addEventListener('drop', (e) => {
        if (e.stopPropagation) e.stopPropagation();
        header.style.background = '';
        
        if (dragSrcIdx !== idx) {
          // Swap columns
          const currentOrder = getColumnOrder(tableId, cols.map((c,i)=>i));
          const newOrder = [...currentOrder];
          const temp = newOrder[dragSrcIdx];
          newOrder[dragSrcIdx] = newOrder[idx];
          newOrder[idx] = temp;
          
          saveColumnOrder(tableId, newOrder);
          updateCallback(); // Refresh the panel
          showToast(`✓ Column moved`, 'success');
        }
        return false;
      });
    });
  }, 100);
}
