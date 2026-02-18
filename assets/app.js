# Gold/SGB Current Value Input - Code Changes

## What This Does
- Adds an editable "Current Value" input field in the Gold/SGB table
- User can type the current market value directly
- Return % and Gain/Loss auto-calculate based on entered value
- Values are saved in localStorage (persist across page refreshes)

---

## File: `assets/app.js`

### Change 1: Update `calcGold` function (around line 111)

**FIND this code:**
```javascript
function calcGold(g) {
  const live     = LIVE[g.symbol];
  const curPrice = live ? live.price : g.purchasePrice;
  const curVal   = curPrice * g.units;
  const gl       = curVal - g.invested;
  return { curPrice, curVal, gl, ret:(gl/g.invested)*100, isLive:!!live };
}
```

**REPLACE with:**
```javascript
function calcGold(g) {
  // Check if user manually entered current value
  if (g.manualCurrentValue !== undefined && g.manualCurrentValue !== null) {
    const curVal = parseFloat(g.manualCurrentValue);
    const gl = curVal - g.invested;
    return { 
      curPrice: curVal / g.units, 
      curVal, 
      gl, 
      ret: (gl / g.invested) * 100, 
      isLive: false,
      isManual: true 
    };
  }
  
  // Otherwise use live price or purchase price
  const live = LIVE[g.symbol];
  const curPrice = live ? live.price : g.purchasePrice;
  const curVal = curPrice * g.units;
  const gl = curVal - g.invested;
  return { curPrice, curVal, gl, ret: (gl / g.invested) * 100, isLive: !!live, isManual: false };
}
```

---

### Change 2: Update `buildGoldPanel` function (around line 401)

**FIND this code:**
```javascript
function buildGoldPanel(el) {
  const id='gold';
  if(!sortState[id])  sortState[id]={col:'invested',asc:false};
  if(!filterState[id]) filterState[id]={q:''};
  const cols=[
    {key:'name',         label:'Instrument',  fn:v=>`<span style="font-weight:600">${v}</span>`},
    {key:'type',         label:'Type',        fn:v=>`<span class="chip gold">${v}</span>`},
    {key:'units',        label:'Units',       fn:v=>`<span class="mono">${v}</span>`},
    {key:'purchasePrice',label:'Buy Price',   fn:v=>fmtINR(v)},
    {key:'invested',     label:'Invested',    fn:v=>fmtINR(v)},
    {key:'_liveP',       label:'Live Price',  fn:(_,r)=>{const c=calcGold(r);return liveCell(c.curPrice,c.isLive);}},
    {key:'_curVal',      label:'Current Value',fn:(_,r)=>fmtINR(calcGold(r).curVal)},
    {key:'_gl',          label:'Gain / Loss', fn:(_,r)=>chipGL(calcGold(r).gl)},
    {key:'_ret',         label:'Return %',    fn:(_,r)=>chipRet(calcGold(r).ret)},
    {key:'_actions',     label:'Actions',     fn:(_,r,i)=>rowActions('gold',PORTFOLIO.gold.indexOf(r))},
  ];
  const rows=PORTFOLIO.gold||[];
  el.innerHTML=mkControls(id,false,'gold')+mkTable(id,cols);
  renderTable(id,cols,rows);
}
```

**REPLACE with:**
```javascript
function buildGoldPanel(el) {
  const id='gold';
  if(!sortState[id])  sortState[id]={col:'invested',asc:false};
  if(!filterState[id]) filterState[id]={q:''};
  const cols=[
    {key:'name',         label:'Instrument',  fn:v=>`<span style="font-weight:600">${v}</span>`},
    {key:'type',         label:'Type',        fn:v=>`<span class="chip gold">${v}</span>`},
    {key:'units',        label:'Units',       fn:v=>`<span class="mono">${v}</span>`},
    {key:'purchasePrice',label:'Buy Price',   fn:v=>fmtINR(v)},
    {key:'invested',     label:'Invested',    fn:v=>fmtINR(v)},
    {key:'_liveP',       label:'Live Price',  fn:(_,r)=>{const c=calcGold(r);return liveCell(c.curPrice,c.isLive);}},
    {key:'_manualVal',   label:'Current Value (Manual)', fn:(_,r,idx)=>{
      const val = r.manualCurrentValue !== undefined ? r.manualCurrentValue : '';
      return `<input type="number" class="gold-manual-input" 
        data-idx="${idx}" 
        value="${val}" 
        placeholder="Enter value" 
        style="width:120px;padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;font-family:'JetBrains Mono',monospace;font-size:13px;"
        onchange="updateGoldManualValue(${idx}, this.value)">`;
    }},
    {key:'_curVal',      label:'Calculated Value', fn:(_,r)=>{
      const c=calcGold(r);
      return `<span style="font-weight:600;color:${c.isManual?'#059669':'#64748b'}">${fmtINR(c.curVal)}</span>`;
    }},
    {key:'_gl',          label:'Gain / Loss', fn:(_,r)=>chipGL(calcGold(r).gl)},
    {key:'_ret',         label:'Return %',    fn:(_,r)=>chipRet(calcGold(r).ret)},
    {key:'_actions',     label:'Actions',     fn:(_,r,i)=>rowActions('gold',PORTFOLIO.gold.indexOf(r))},
  ];
  const rows=PORTFOLIO.gold||[];
  el.innerHTML=mkControls(id,false,'gold')+mkTable(id,cols);
  renderTable(id,cols,rows);
}
```

---

### Change 3: Add new function `updateGoldManualValue` (add after `buildGoldPanel`)

**ADD this new function right after the closing brace of `buildGoldPanel`:**

```javascript
/* ═══════════════════════════════════════════════════════
   UPDATE GOLD MANUAL VALUE
═══════════════════════════════════════════════════════ */
function updateGoldManualValue(idx, value) {
  const gold = PORTFOLIO.gold[idx];
  if (!gold) return;
  
  if (value === '' || value === null) {
    delete gold.manualCurrentValue;
  } else {
    gold.manualCurrentValue = parseFloat(value);
  }
  
  saveToStorage();
  updateSummaryCards();
  showPanel('gold'); // refresh the panel to show updated calculations
  showToast('✓ Gold value updated', 'success');
}
```

---

## How to Apply Changes

### Method 1: Direct Edit on GitHub (Easiest)

1. Go to: `https://github.com/vignesh08ai/InvestmentPortfolio_Vignesh/blob/main/assets/app.js`
2. Click the **pencil icon ✏️** (top right)
3. Find each section using Ctrl+F
4. Make the 3 changes above
5. Scroll to bottom → **Commit changes**

### Method 2: Download, Edit, Re-upload

1. Download your current `assets/app.js` from GitHub
2. Open in text editor (VS Code, Notepad++, etc.)
3. Make the 3 changes above
4. Save file
5. Go to GitHub → Delete old `app.js` → Upload new one

---

## Testing

After deploying:

1. Go to **Gold / SGB** tab
2. You'll see a new **"Current Value (Manual)"** column with input box
3. Type current market value (e.g., `57600`)
4. Press Enter or click outside
5. **Calculated Value**, **Gain/Loss**, and **Return %** update instantly
6. Refresh page → your entered value persists

---

## Features

✅ Manual input overrides live price fetching
✅ Values saved in localStorage (persist across sessions)
✅ Leave blank to use live/purchase price
✅ Green text in "Calculated Value" when manual value is used
✅ Auto-updates summary cards
✅ Works with Add/Edit/Delete

---

## Example

| Current Value (Manual) | Calculated Value | Gain/Loss | Return % |
|---|---|---|---|
| `57600` ← type here | **₹57,600** (green) | ▲ +₹34,108 | +145.19% |

Clear the input to go back to live price fetching.
