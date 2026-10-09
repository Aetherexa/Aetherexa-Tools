import ToolErrorBoundary from './ToolErrorBoundary';
import { useEffect, useRef, useState } from 'react';
import { Download, ImageUp, SlidersHorizontal } from 'lucide-react';
import { compressImage, validateImageOptions } from '../lib/image';
import type { CompressedImage, FitMode } from '../lib/image';
import { downloadBlob } from '../lib/download';
export default function ImageTool({mode}: {mode:'photo'|'signature'}) {return <ToolErrorBoundary><ImageToolImpl mode={mode}/></ToolErrorBoundary>;}
function ImageToolImpl({ mode }: {mode: 'photo'|'signature'}) {
  const signature = mode === 'signature';
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState(signature?140:200);
  const [height, setHeight] = useState(signature?60:230);
  const [target, setTarget] = useState(signature?10:50);
  const [fit, setFit] = useState<FitMode>('contain');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<CompressedImage|null>(null);
  const [error, setError] = useState('');
  const [sourceUrl, setSourceUrl] = useState(''); const [resultUrl, setResultUrl] = useState('');
  const latestRequest = useRef(0);
  useEffect(()=> {if(!file){setSourceUrl('');return;}const u=URL.createObjectURL(file);setSourceUrl(u);return ()=>URL.revokeObjectURL(u);},[file]);
  useEffect(()=> {if(!result){setResultUrl('');return;}const u=URL.createObjectURL(result.blob);setResultUrl(u);return ()=>URL.revokeObjectURL(u);},[result]);
  useEffect(() => {latestRequest.current++;setResult(null);setError('');setProcessing(false);},[file,width,height,target,fit]);
  async function process() {
    if(!file) return; const request = ++latestRequest.current;
    setError('');setProcessing(true);setResult(null);
    try {const compressed = await compressImage(file,{width,height,maxKB:target,fit});if(request===latestRequest.current) setResult(compressed);}
    catch(e) {if(request===latestRequest.current)setError(e instanceof Error?e.message:'Image processing failed.');}
    finally {if(request===latestRequest.current)setProcessing(false);}
  }
  function selectPreset(kind:string) {if(kind==='passport'){setWidth(350);setHeight(450);setTarget(100);}else if(kind==='exam'){setWidth(200);setHeight(230);setTarget(50);}else if(kind==='sign'){setWidth(140);setHeight(60);setTarget(10);}}
  return <><div className="app-intro"><h2>{signature ? 'Resize your signature, precisely' : 'Get your application photo ready'}</h2><p>Process in the browser, preview the result, and verify dimensions and actual file size before downloading.</p></div>
    <div className="app-grid"><section className="panel"><div className="panel-header"><h3>01 / Image and settings</h3><span className="panel-hint">JPEG output</span></div><div className="field"><label htmlFor="image-upload">Choose an image</label><div className="upload-box"><ImageUp size={20} style={{display:'block',margin:'0 auto 10px'}}/><input id="image-upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/bmp" onChange={e=>{const f=e.target.files?.[0]??null;if(f){try{validateImageOptions(f,{width,height,maxKB:target,fit});setFile(f);setError('');}catch(err){setFile(null);setError(err instanceof Error?err.message:'Unsupported image.');}}else setFile(null);}}/></div></div>{sourceUrl && <><img className="preview-image" src={sourceUrl} alt="Your original selected image"/><p className="image-meta">Original: {file?.name} · {file ? (file.size/1024).toFixed(1):'0'} KB</p></>}
      <div className="field-row three"><div className="field"><label htmlFor="target-width">Width (px)</label><input id="target-width" type="number" min="1" max="4000" value={width} onChange={e=>setWidth(Number(e.target.value))}/></div><div className="field"><label htmlFor="target-height">Height (px)</label><input id="target-height" type="number" min="1" max="4000" value={height} onChange={e=>setHeight(Number(e.target.value))}/></div><div className="field"><label htmlFor="max-image-kb">Max size (KB)</label><input id="max-image-kb" type="number" min="1" max="10000" value={target} onChange={e=>setTarget(Number(e.target.value))}/></div></div><div className="field"><label htmlFor="fit-mode">Fit image</label><select id="fit-mode" value={fit} onChange={e=>setFit(e.target.value as FitMode)}><option value="contain">Contain whole image (white padding)</option><option value="cover">Fill area (center-crop if needed)</option></select></div><div className="action-row"><button className="btn ghost" type="button" onClick={()=>selectPreset('exam')}><SlidersHorizontal size={14}/> Exam 200×230</button><button className="btn ghost" type="button" onClick={()=>selectPreset('passport')}>350×450</button><button className="btn ghost" type="button" onClick={()=>selectPreset('sign')}>Signature 140×60</button></div><div className="action-row" style={{marginTop:17}}><button className="btn primary" type="button" disabled={!file||processing} onClick={()=>void process()}>{processing?'Processing…':'Resize and compress →'}</button></div></section>
      <section className="panel"><div className="panel-header"><h3>02 / Compressed result</h3><span className="panel-hint">Actual size shown</span></div>{resultUrl&&result ? <><div className="image-result-wrap"><img className="preview-image" src={resultUrl} alt="Your compressed image preview" /></div><div className="stats-line" style={{marginTop:16}}><span><b>{result.width}×{result.height}</b> px</span><span><b>{(result.blob.size/1024).toFixed(2)}</b> KB</span><span><b>JPEG</b></span></div>{result.metTarget ? <p className="notice success" role="status">✓ Meets the selected maximum file size of {target} KB.</p> : <p className="notice warn" role="alert">The requested {target} KB limit could not be met at these dimensions, even at low JPEG quality. Reduce width/height or increase the limit. The output is available for inspection, but does not meet your requirements.</p>}<div className="action-row" style={{marginTop:18}}><button className="btn primary" type="button" onClick={()=>downloadBlob(result.blob,signature?'aetherexa-signature.jpg':'aetherexa-exam-photo.jpg')}><Download size={15}/> Download JPEG</button></div></> : <div className="image-result-wrap"><p aria-live="polite">{processing ? 'Processing image…' : 'Your compressed image will appear here after processing. No upload required.'}</p></div>}{error&&<p className="notice error" role="alert">{error}</p>}<div className="notice" style={{marginTop:22}}>Always follow your exam or portal instructions for image dimensions, file format, background and size. A successfully compressed file is not an approval guarantee.</div></section></div></>;
}
