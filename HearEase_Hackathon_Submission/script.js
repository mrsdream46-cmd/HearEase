const $=id=>document.getElementById(id);
const S={caption:false,monitor:false,recognition:null,stream:null,ctx:null,analyser:null,source:null,raf:null,lastAlert:0,demo:false,visual:true,access:false};

function toast(m){const t=$("toast");t.textContent=m;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),2400)}
function session(active,text){$("session").textContent=text|| (active?"Session active":"Session inactive");$("sessionDot").style.background=active?"#58d58d":"#b5bbc7"}
function mini(id,on){$(id).textContent=on?"ON":"OFF";$(id).classList.toggle("on",on)}
function html(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function feed(title,detail){const e=document.createElement("div");e.className="feed-item";e.innerHTML=`<b>•</b><div><strong>${html(title)}</strong><small>${html(detail)}</small></div>`;$("feed").prepend(e);while($("feed").children.length>6)$("feed").lastChild.remove()}
function caption(text,source="Speech"){const out=$("captions");out.querySelector(".empty")?.remove();const e=document.createElement("div");e.className="caption-line";e.innerHTML=`<small>${html(source)} · ${new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</small><strong>${html(text)}</strong>`;out.appendChild(e);out.scrollTop=out.scrollHeight;$("heroCaption").textContent=`“${text}”`}
function soundAlert(kind,title,text){const a=$("soundAlert");a.className=`alert ${kind}`;$("alertTitle").textContent=title;$("alertText").textContent=text}
function stopMic(){if(S.raf)cancelAnimationFrame(S.raf);S.raf=null;if(S.stream)S.stream.getTracks().forEach(t=>t.stop());S.stream=null;if(S.ctx)S.ctx.close().catch(()=>{});S.ctx=S.analyser=S.source=null;$("meterFill").style.width="0%";$("percent").textContent="0%"}

async function startMonitor(){
 if(!navigator.mediaDevices?.getUserMedia){toast("Microphone is not supported in this browser.");return}
 try{
  S.stream=await navigator.mediaDevices.getUserMedia({audio:true});
  S.ctx=new (window.AudioContext||window.webkitAudioContext)();S.analyser=S.ctx.createAnalyser();S.analyser.fftSize=256;S.source=S.ctx.createMediaStreamSource(S.stream);S.source.connect(S.analyser);
  S.monitor=true;mini("soundState",true);$("monitorStart").disabled=true;$("monitorStop").disabled=false;session(true,"Microphone active");soundAlert("safe","Monitoring started","HearEase is watching microphone activity visually.");feed("Sound monitor started","Microphone permission granted.");toast("Sound monitor started.");
  const d=new Uint8Array(S.analyser.fftSize);const loop=()=>{if(!S.analyser)return;S.analyser.getByteTimeDomainData(d);let sum=0;for(const x of d){const n=(x-128)/128;sum+=n*n}const pct=Math.min(100,Math.round(Math.sqrt(sum/d.length)*250));$("meterFill").style.width=pct+"%";$("percent").textContent=pct+"%";if(pct>=48&&Date.now()-S.lastAlert>3500){S.lastAlert=Date.now();attention("A significant sound level was detected by the microphone.")}S.raf=requestAnimationFrame(loop)};loop()
 }catch(e){soundAlert("warning","Microphone unavailable","Allow microphone access and try again.");feed("Microphone access failed","Permission was denied or unavailable.");toast("Microphone permission was not granted.")}
}
function stopMonitor(){S.monitor=false;stopMic();mini("soundState",false);$("monitorStart").disabled=false;$("monitorStop").disabled=true;session(S.caption,S.caption?"Captions active":"Session inactive");soundAlert("safe","Monitor stopped","Start monitoring again when ready.");feed("Sound monitor stopped","Microphone monitoring is off.")}

function recognitionAPI(){return window.SpeechRecognition||window.webkitSpeechRecognition||null}
function startCaptions(){
 const R=recognitionAPI();if(!R){toast("Live captions are unavailable here. Try Demo Mode.");caption("Demo caption: speech will appear here visually.","Demo");return}if(S.caption)return;
 const r=new R();S.recognition=r;r.continuous=true;r.interimResults=true;r.lang="en-US";
 r.onstart=()=>{S.caption=true;mini("captionState",true);$("captionStart").disabled=true;$("captionStop").disabled=false;session(true,"Captions active");feed("Live captions started","Speech will appear as text.");toast("Live captions started.")};
 r.onresult=e=>{let final="",interim="";for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;e.results[i].isFinal?final+=t:interim+=t}if(interim)$("heroCaption").textContent=`“${interim}”`;if(final.trim())caption(final.trim(),"Live speech")};
 r.onerror=e=>{if(e.error==="not-allowed")toast("Microphone permission was denied for captions.");else toast("Captioning issue: "+e.error)};
 r.onend=()=>{if(S.caption)try{r.start()}catch(_){}};
 try{r.start()}catch(e){toast("Could not start captions.")}
}
function stopCaptions(){S.caption=false;if(S.recognition){S.recognition.onend=null;try{S.recognition.stop()}catch(_){}S.recognition=null}mini("captionState",false);$("captionStart").disabled=false;$("captionStop").disabled=true;session(S.monitor,S.monitor?"Microphone active":"Session inactive");feed("Live captions stopped","Captioning is off.");toast("Live captions stopped.")}

function attention(msg){soundAlert("danger","Important sound detected",msg);feed("Important sound detected",msg);if(S.visual){$("overlay").classList.add("show");$("overlay").setAttribute("aria-hidden","false")}}
function closeOverlay(){$("overlay").classList.remove("show");$("overlay").setAttribute("aria-hidden","true")}

function accessMode(on){S.access=on;$("accessibility").setAttribute("aria-pressed",String(on));$("largeText").checked=on;document.body.classList.toggle("large-text",on);toast(on?"Accessibility Mode enabled.":"Accessibility Mode disabled.")}
function updateSettings(){document.body.classList.toggle("large-text",$("largeText").checked);document.body.classList.toggle("high-contrast",$("contrast").checked);document.body.classList.toggle("reduced-motion",$("motion").checked);S.visual=$("visualAlerts").checked}
function reset(){["largeText","contrast","motion"].forEach(id=>$(id).checked=false);$("visualAlerts").checked=true;S.access=false;$("accessibility").setAttribute("aria-pressed","false");updateSettings();toast("Accessibility settings reset.")}

function demoSteps(n){document.querySelectorAll(".step").forEach((e,i)=>e.classList.toggle("active",i<=n))}
function runDemo(){
 if(S.demo)return;S.demo=true;demoSteps(0);session(true,"Demo active");feed("Demo started","Simulated accessibility session.");toast("Demo Mode started.");
 const texts=["Welcome to today's meeting.","The next topic is accessibility.","HearEase makes important information visible.","Thank you for trying the demo."];let i=0;caption(texts[i],"Demo speech");
 const interval=setInterval(()=>{i++;if(i<texts.length)caption(texts[i],"Demo speech")},2500);
 setTimeout(()=>{clearInterval(interval);demoSteps(1);attention("Demo event: a simulated important sound was detected.");setTimeout(()=>{closeOverlay();demoSteps(2);feed("Accessibility controls","Large text and contrast controls are ready.")},2800)},10500);
 setTimeout(()=>{S.demo=false;session(S.caption||S.monitor,S.caption?"Captions active":S.monitor?"Microphone active":"Demo complete");toast("Demo complete.")},14500)
}

$("start").onclick=async()=>{accessMode(true);$("dashboard").scrollIntoView({behavior:"smooth"});await startMonitor();startCaptions()}
$("captionStart").onclick=startCaptions;$("captionStop").onclick=stopCaptions;$("monitorStart").onclick=startMonitor;$("monitorStop").onclick=stopMonitor;
$("demo").onclick=()=>{$("demoSection").scrollIntoView({behavior:"smooth"});runDemo()};$("demoNav").onclick=()=>{$("demoSection").scrollIntoView({behavior:"smooth"});runDemo()};$("runDemo").onclick=runDemo;
$("settingsNav").onclick=()=>$("settings").scrollIntoView({behavior:"smooth"});$("closeOverlay").onclick=closeOverlay;$("overlay").onclick=e=>{if(e.target===$("overlay"))closeOverlay()};
$("accessibility").onclick=()=>accessMode(!S.access);["largeText","contrast","motion","visualAlerts"].forEach(id=>$(id).addEventListener("change",updateSettings));$("reset").onclick=reset;
const R=recognitionAPI();$("speechSupport").textContent=R?"✓ Live speech recognition is available in this browser.":"Demo Mode works without microphone access; live recognition varies by browser.";
window.addEventListener("beforeunload",()=>{try{S.recognition?.stop()}catch(_){}stopMic()});
