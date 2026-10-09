import ToolErrorBoundary from './ToolErrorBoundary';
import { useMemo, useState } from 'react';
import { ClipboardPaste, Download, RotateCcw } from 'lucide-react';
import { parseWhatsAppOrders } from '../lib/orders';
import { downloadText } from '../lib/download';
const demo = `[09/10/2026, 10:12 AM] Rahul: 2 kg Rice
Sugar 1 kg
3x Soap
5 packets Biscuits
Tomatoes 2 kg`;
export default function OrdersTool() {return <ToolErrorBoundary><OrdersToolImpl /></ToolErrorBoundary>}
function OrdersToolImpl() {
  const [input, setInput] = useState('');
  const result = useMemo(() => parseWhatsAppOrders(input), [input]);
  return <>
    <div className="app-intro"><h2>From chat messages to organized orders</h2><p>Paste messages containing one item per line. Recognized quantities appear instantly in a structured table.</p></div>
    <div className="app-grid">
      <section className="panel"><div className="panel-header"><h3>01 / Order messages</h3><span className="panel-hint">Paste text below</span></div><div className="field"><label htmlFor="order-text">WhatsApp order text</label><textarea id="order-text" value={input} onChange={e=>setInput(e.target.value)} placeholder={'2 kg Rice\nSugar 1 kg\n3x Soap\n5 packets Biscuits'} /></div><div className="action-row"><button type="button" className="btn ghost" onClick={() => setInput(demo)}><ClipboardPaste size={15} /> Load sample</button><button type="button" className="btn ghost" onClick={() => setInput('')} disabled={!input}><RotateCcw size={14}/> Clear</button></div><p className="muted" style={{marginTop:18,marginBottom:0}}>Supported formats: “2 kg rice”, “rice 2 kg”, “3x soap”. Each recognized line produces one CSV row.</p></section>
      <section className="panel"><div className="panel-header"><h3>02 / Extracted orders</h3><span className="panel-hint">Ready to review</span></div><div className="stats-line"><span><b>{result.items.length}</b> recognized</span><span><b>{result.skipped.length}</b> need review</span></div>{result.items.length ? <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Product</th><th>Qty</th><th>Unit</th></tr></thead><tbody>{result.items.map((item,i)=><tr key={i}><td>{item.item}</td><td>{item.quantity}</td><td>{item.unit}</td></tr>)}</tbody></table></div> : <div className="image-result-wrap"><p>Recognized orders will appear here as you type.</p></div>}
      {result.skipped.length>0 && <div className="notice warn" role="status"><b>{result.skipped.length} unrecognized line(s), not exported as orders.</b><div style={{marginTop:7,whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{result.skipped.slice(0,5).join('\n')}{result.skipped.length>5?'\n…':''}</div></div>}
      <div className="action-row" style={{marginTop:16}}><button type="button" className="btn primary" disabled={!result.items.length} onClick={()=>downloadText(result.csv,'aetherexa-whatsapp-orders.csv')}><Download size={15}/> Download CSV</button></div><p className="muted" style={{marginTop:14,marginBottom:0}}>Tip: Open the downloaded CSV in Excel or Google Sheets.</p></section>
    </div>
  </>;
}
