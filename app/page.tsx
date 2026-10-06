"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Brain, Check, ChevronRight, ExternalLink, FileText, Layers3, Plus, Search, Sparkles, Wand2, X } from "lucide-react";

type Ref = { title:string; url:string; category:string; kind:string; dna:string[]; note:string };

const raw = [
["Awwwards","https://www.awwwards.com","Visual","Web",["Art direction","Editorial","Motion"]],
["Minimal Gallery","https://minimal.gallery","Visual","Web",["Restraint","Whitespace","Typography"]],
["Godly","https://godly.website","Visual","Web",["Product","Distinctive","Minimal"]],
["Landing Love","https://landing.love","Landing","Landing",["Storytelling","Hero","Conversion"]],
["Land-book","https://land-book.com","Landing","Landing",["Composition","Typography","Layout"]],
["Refero","https://styles.refero.design","Systems","UI",["Typography","Spacing","Product UI"]],
["Component Gallery","https://component.gallery","Components","UI",["Patterns","Systems","Consistency"]],
["Navbar Gallery","https://navbar.gallery","Components","UI",["Navigation","Hierarchy","Interaction"]],
["Footer.design","https://footer.design","Components","UI",["Information architecture","Navigation","Closure"]],
["CTA Gallery","https://cta.gallery","Components","UI",["Conversion","Hierarchy","Action"]],
["Supahero","https://supahero.io","Landing","Landing",["Hero","Art direction","Typography"]],
["Pricing Pages","https://pricingpages.design","Components","UI",["Comparison","Hierarchy","Conversion"]],
["404s.design","https://404s.design","Components","UI",["Personality","Recovery","Brand"]],
["Appshot Gallery","https://appshot.gallery","Visual","App",["Product UI","Screens","Presentation"]],
["shadcn/ui","https://ui.shadcn.com","Build","Systems",["Composable","Accessible","Code"]],
["Aceternity UI","https://ui.aceternity.com","Components","UI",["Effects","Components","Motion"]],
["Magic UI","https://magicui.design","Components","UI",["Motion","Components","React"]],
["Motion Primitives","https://motion-primitives.com","Motion","Motion",["Interaction","Transition","React"]],
["21st.dev","https://21st.dev","Components","UI",["AI-ready","Components","Patterns"]],
["UIable","https://uiable.com","Components","UI",["Patterns","Interfaces","Systems"]],
["Uiverse","https://uiverse.io","Components","UI",["CSS","Micro-interaction","Experiment"]],
["Kinetics","https://kinetics.colorion.co","Motion","Motion",["Motion","Interaction","Timing"]],
["Text Effects","https://text-effects.colorion.co","Motion","Motion",["Typography","Effects","Expression"]],
["Glass","https://glass.samasante.com","Visual","Effects",["Glass","Depth","Material"]],
["Anime.js","https://animejs.com","Motion","Motion",["Animation","Timing","Interaction"]],
["Three.js","https://threejs.org","3D","3D",["Spatial","3D","WebGL"]],
["DesignMD","https://designmd.ai","AI Design","AI",["Design systems","Prompting","AI"]],
["Vibeprompts","https://vibeprompts.dev","AI Design","AI",["Prompting","UI","Generation"]],
["Kage","https://kage.design","Visual","Web",["Art direction","Visual language","Experiment"]],
["TypeUI","https://typeui.sh","Typography","Type",["Typography","UI","System"]],
["Neuform","https://neuform.ai","AI Design","AI",["Interfaces","AI","Design"]],
["Aura","https://aura.build","AI Design","AI",["Generation","Interfaces","AI"]],
["Open Design","https://open-design.ai","AI Design","AI",["Design systems","AI","Workflow"]],
["Landdding","https://landdding.com","Landing","Landing",["Landing pages","Composition","Inspiration"]],
["Modulify","https://modulify.ai","AI Design","AI",["Templates","Modules","Generation"]],
["Logo to Use","https://logotouse.com","Typography","Brand",["Logo","Identity","Typography"]],
["Motionin","https://motionin.design","Motion","Motion",["Interaction","Motion","Web"]],
["Closeit","https://closeit.fast","Visual","Web",["Conversion","Product","Direction"]],
["WeDoFlow","https://wedoflow.com","Systems","Systems",["Webflow","Patterns","Build"]],
["Wonderlist","https://wonderlist.design","Visual","Web",["Inspiration","Art direction","Systems"]],
["Iconly","https://iconly.design","Components","Icons",["Iconography","Consistency","UI"]],
["Font in Logo","https://fontinlogo.com","Typography","Brand",["Typography","Identity","Logo"]]
] as const;

const seed:Ref[] = raw.map(function(x){ return {title:x[0],url:x[1],category:x[2],kind:x[3],dna:[...x[4]],note:"A reference for studying "+x[4][0].toLowerCase()+" and "+x[4][1].toLowerCase()+"."}; });
const cats = ["All","Visual","Landing","Components","Motion","Typography","Systems","AI Design","Build","3D"];
const nav = ["Command Center","Explore","Study","Remix","Build","Critique","Memory"];

export default function Home(){
  const [active,setActive]=useState("Command Center");
  const [refs,setRefs]=useState(seed);
  const [selected,setSelected]=useState(seed[0]);
  const [category,setCategory]=useState("All");
  const [query,setQuery]=useState("");
  const [add,setAdd]=useState(false);
  const [url,setUrl]=useState("");
  const [project,setProject]=useState("");

  useEffect(function(){
    try{ setProject(localStorage.getItem("akani-active-project") || ""); }catch{}
  },[]);

  useEffect(function(){
    try{
      if(project.trim()) localStorage.setItem("akani-active-project",project.trim());
      else localStorage.removeItem("akani-active-project");
    }catch{}
  },[project]);
  const [done,setDone]=useState(false);
  const [analysis,setAnalysis]=useState<any>(null);
  const [analyzing,setAnalyzing]=useState(false);
  const [analysisError,setAnalysisError]=useState("");
  const [analyses,setAnalyses]=useState<Record<string,any>>({});
  const [synthesized,setSynthesized]=useState<string[]>([]);
  const [synthesisDone,setSynthesisDone]=useState(false);
  const [critiqueUrl,setCritiqueUrl]=useState("");
  const [critiquing,setCritiquing]=useState(false);
  const [critique,setCritique]=useState<any>(null);
  const [critiqueError,setCritiqueError]=useState("");
  const [critiqueHistory,setCritiqueHistory]=useState<any[]>([]);

  const filtered=useMemo(function(){return refs.filter(function(r){return (category==="All"||r.category===category) && (r.title+" "+r.dna.join(" ")+" "+r.kind).toLowerCase().includes(query.toLowerCase());});},[refs,category,query]);

  async function analyzeReference(){
    setAnalyzing(true); setAnalysisError(""); setDone(false);
    try{
      const response=await fetch("/api/analyze-reference",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:selected.url})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"Analysis failed");
      setAnalysis(data); setAnalyses(function(all){return {...all,[selected.url]:data};}); setDone(true);
      setSelected(function(r){return {...r,title:data.title||r.title,dna:data.dna?.slice(0,3)||r.dna,note:data.dna?.[0]||r.note};});
    }catch(error){setAnalysisError(error instanceof Error?error.message:"Analysis failed");}
    finally{setAnalyzing(false);}
  }

  async function runCritique(){
    setCritiquing(true); setCritiqueError("");
    try{
      const target=critiqueUrl.trim();
      if(!target) throw new Error("Paste the live URL you want AKANI to inspect.");
      const response=await fetch("/api/critique",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:target,project,designLanguage:synthesized})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"Critique failed");
      setCritique(data);
      setCritiqueHistory(function(h){return [data,...h].slice(0,8)});
    }catch(error){setCritiqueError(error instanceof Error?error.message:"Critique failed");}
    finally{setCritiquing(false);}
  }

  function saveReference(){
    if(!url.trim()) return;
    const u=url.startsWith("http")?url:"https://"+url;
    const title=u.split("//")[1].split("/")[0].replace("www.","");
    const item:Ref={title:title,url:u,category:"Visual",kind:"Web",dna:["New reference","Needs study","Unclassified"],note:"Saved to your design memory. Study it to extract transferable principles."};
    setRefs(function(x){return [item,...x]}); setSelected(item); setUrl(""); setAdd(false); setActive("Study");
  }

  return <main className="app">
    <aside className="sidebar">
      <div className="brand"><span>A</span><div>AKANI<strong>DESIGN LAB</strong></div></div>
      <div className="workspace-label">DESIGN INTELLIGENCE</div>
      <nav className="side-nav">{nav.map(function(item){return <button key={item} className={active===item?"on":""} onClick={function(){setActive(item)}}><span>{item==="Command Center"?"⌂":item==="Explore"?"◫":item==="Study"?"◎":item==="Remix"?"◇":item==="Build"?"▱":item==="Critique"?"◈":"≡"}</span>{item}<ChevronRight size={13}/></button>})}</nav>
      <div className="sidebar-bottom"><div className="memory-meter"><span>DESIGN MEMORY</span><b>{refs.length} references</b><i><em/></i></div><button className="project-chip" onClick={function(){setActive("Command Center")}}><span>{project ? project.slice(0,1).toUpperCase() : "A"}</span><div><small>ACTIVE PROJECT</small>{project || "No project selected"}</div></button></div>
    </aside>

    <div className="workspace">
      <header className="topbar"><div><span className="crumb">AKANI /</span> {active.toUpperCase()}</div><div className="top-actions"><button onClick={function(){setAdd(true)}}><Plus size={14}/> Add reference</button><span className="status-dot"/>LOCAL WORKSPACE</div></header>

      {active==="Command Center" && <><section className="command-hero"><div><label>DESIGN INTELLIGENCE / 00</label><h1>What are you <i>designing?</i></h1><p>AKANI studies great design, extracts the principles behind it, and transfers those lessons into an original design language for your product.</p><div className="project-input"><span>PROJECT</span><input value={project} onChange={function(e){setProject(e.target.value)}} placeholder="Enter a product or project"/><button onClick={function(){setActive("Study")}}>Start studying <ArrowUpRight size={15}/></button></div></div><div className="intelligence-map"><div className="map-core"><Brain size={24}/><small>AKANI<br/>INTELLIGENCE</small></div><div className="map-node n1">REFERENCE</div><div className="map-node n2">DECONSTRUCT</div><div className="map-node n3">SYNTHESIZE</div><div className="map-node n4">BUILD</div><div className="map-node n5">CRITIQUE</div></div></section>
      <section className="loop"><div className="section-title"><label>THE LOOP</label><h2>Reference → skill.</h2><p>Not reference → clone.</p></div><div className="loop-grid">{[["01","REFERENCE","Find work worth studying."],["02","DECONSTRUCT","Understand why it works."],["03","SYNTHESIZE","Remix principles across references."],["04","BUILD","Turn the language into instructions."],["05","CRITIQUE","Test the result against the intent."]].map(function(x){return <article key={x[0]}><small>{x[0]}</small><Sparkles size={17}/><h3>{x[1]}</h3><p>{x[2]}</p></article>})}</div></section>
      <section className="project-panel"><div className="section-title"><label>YOUR WORKSPACE</label><h2>{project||"Untitled project"}</h2></div><div className="workspace-grid">{[["01","Explore references","Your visual memory","Explore"],["02","Study a reference","Extract design DNA","Study"],["03","Remix a direction","Combine 2–5 references","Remix"],["04","Generate DESIGN.md","Give your agent design memory","Build"]].map(function(x){return <button key={x[0]} onClick={function(){setActive(x[3])}}><span>{x[0]}</span><b>{x[1]}</b><small>{x[2]}</small><ArrowUpRight/></button>})}</div></section></>}

      {active==="Explore" && <section className="page"><div className="page-heading"><div><label>01 / EXPLORE</label><h1>Build your <i>visual memory.</i></h1><p>Not a gallery. A working library of things worth understanding.</p></div><button className="primary" onClick={function(){setAdd(true)}}><Plus size={15}/> Add reference</button></div><div className="toolbar"><div className="search"><Search size={15}/><input value={query} onChange={function(e){setQuery(e.target.value)}} placeholder="Search references, patterns, principles..."/></div><div className="filters">{cats.map(function(c){return <button key={c} className={category===c?"active":""} onClick={function(){setCategory(c)}}>{c}</button>})}</div></div><div className="reference-grid">{filtered.map(function(r,i){return <article key={r.title+i} className={selected.title===r.title?"selected":""} onClick={function(){setSelected(r)}}><div className="ref-top"><small>{String(i+1).padStart(2,"0")}</small><span>{r.category}</span><a href={r.url} target="_blank" onClick={function(e){e.stopPropagation()}}><ExternalLink size={13}/></a></div><div className="ref-art"><div className="art-lines"/><b>{r.title.slice(0,1)}</b></div><h3>{r.title}</h3><p>{r.note}</p><div className="tags">{r.dna.map(function(x){return <span key={x}>{x}</span>})}</div><footer><span>{r.kind}</span><button onClick={function(e){e.stopPropagation();setSelected(r);setActive("Study")}}>Study <ArrowUpRight size={12}/></button></footer></article>})}</div></section>}

      {active==="Study" && <section className="page study-page"><div className="page-heading"><div><label>02 / STUDY</label><h1>Why does <i>{selected.title}</i> work?</h1><p>Deconstruct the reference into principles that can survive outside the original website.</p></div><a className="source-link" href={selected.url} target="_blank">Open source <ExternalLink size={14}/></a></div><div className="study-grid"><div className="study-preview"><div className="browser-bar"><i/><i/><i/><span>{selected.url.replace("https://","")}</span></div><div className="study-screen"><strong>{selected.title.slice(0,1)}</strong><span>REFERENCE PREVIEW</span></div><button className="study-action" onClick={analyzeReference} disabled={analyzing}>{analyzing?<><Wand2 size={14}/> Analyzing…</>:done?<><Check size={14}/> Analysis complete</>:<><Wand2 size={14}/> Analyze this reference</>}</button></div><div className="analysis-card"><label>CURRENT READ</label><h2>{selected.note}</h2><div className="score-list">{[["Distinctiveness","09"],["Hierarchy","08"],["System quality","08"],["Motion","07"]].map(function(x){return <div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b><i><em style={{width:Number(x[1])*10+"%"}}/></i></div>})}</div></div></div><div className="principles"><div className="section-title"><label>EXTRACTED DESIGN DNA</label><h2>Transferable principles.</h2></div><div className="principle-grid">{selected.dna.map(function(x,i){return <article key={x}><small>0{i+1}</small><h3>{x}</h3><p>A reusable visual decision that can be adapted to a different product context without copying the original surface.</p><button onClick={function(){setActive("Remix")}}>Use in remix <ArrowUpRight size={12}/></button></article>})}</div></div><div className="transfer"><label>TRANSFER TEST</label><h2>What can {selected.title} teach {project||"your product"}?</h2><div className="transfer-row"><span>Borrow the principle</span><b>Not the surface.</b><ArrowUpRight size={16}/></div>{analysis&&<div className="analysis-facts"><label>LIVE EXTRACTION</label><div><span>{analysis.stats?.headings||0} headings</span><span>{analysis.stats?.images||0} images</span><span>{analysis.stats?.stylesheets||0} stylesheets</span><span>{analysis.stats?.scripts||0} scripts</span></div>{analysis.fonts?.length>0&&<p>Detected type signals: <b>{analysis.fonts.slice(0,5).join(" · ")}</b></p>}{analysis.colors?.length>0&&<p>Detected palette values: <b>{analysis.colors.slice(0,8).join(" · ")}</b></p>}</div>}{analysisError&&<p className="analysis-error">{analysisError}</p>}</div></section>}

      {active==="Remix" && <section className="page"><div className="page-heading"><div><label>03 / REMIX</label><h1>Combine. <i>Don't clone.</i></h1><p>Select references from different worlds and ask what they can teach your product together.</p></div><button className="primary" onClick={function(){
  const chosen=[selected,refs[2],refs[17]].filter(Boolean);
  const principles=chosen.flatMap(function(r){return (analyses[r.url]?.dna||r.dna||[]).slice(0,4);});
  const unique=[...new Set(principles)];
  const fallback=["Editorial clarity","High typographic contrast","Restrained interaction","Asymmetric composition","Human visual evidence","Systematic components"];
  setSynthesized((unique.length?unique:fallback).slice(0,6)); setSynthesisDone(true);
}}><Sparkles size={15}/> {synthesisDone?"Direction synthesized":"Synthesize direction"}</button></div><div className="remix-layout"><div className="selected-stack">{[selected,refs[2],refs[17]].filter(Boolean).map(function(r,i){return <div className="remix-ref" key={r.title+i}><span>0{i+1}</span><div><b>{r.title}</b><small>{r.dna.join(" · ")}</small></div><X size={14}/></div>})}</div><div className="remix-result"><label>PROPOSED DESIGN LANGUAGE</label><h2>{project||"Your product"} / first synthesis</h2><div className="language-list">{(synthesisDone?synthesized:["Study the references, then synthesize their transferable principles."]).map(function(x,i){return <p key={x}><small>0{i+1}</small><b>{x}</b><ArrowUpRight size={13}/></p>})}</div></div></div><div className="guardrail"><Sparkles size={17}/><div><b>AKANI PRINCIPLE</b><p>Borrow the reason a reference works. Never reproduce its identity by default.</p>{synthesisDone&&<small className="synthesis-status">SYNTHESIS BUILT FROM {Object.keys(analyses).length} ANALYZED REFERENCE{Object.keys(analyses).length===1?"":"S"}.</small>}</div></div></section>}

      {active==="Build" && <section className="page"><div className="page-heading"><div><label>04 / BUILD</label><h1>Give your agent <i>design memory.</i></h1><p>Turn the synthesis into artifacts an AI coding agent can actually use.</p></div></div><div className="build-grid">{[["DESIGN.md","A durable visual language for the project."],["LANDING SPEC","Page structure, hierarchy and interaction."],["COMPONENT RULES","Reusable UI decisions and constraints."],["AGENT PROMPT","Build-ready instructions for coding agents."]].map(function(x){return <article key={x[0]}><FileText size={19}/><label>{x[0]}</label><h3>{x[1]}</h3><button onClick={function(){setDone(true);if(!synthesisDone){const p=[...new Set([...(selected.dna||[]),...(analysis?.dna||[])])].slice(0,6);setSynthesized(p);setSynthesisDone(true)}}}>{done?<><Check size={13}/> Ready</>:<>Generate</>}<ArrowUpRight size={13}/></button></article>})}</div><div className="design-md"><div className="code-head"><span>DESIGN.md</span><small>{project||"PROJECT"}</small></div><pre>{["# "+(project||"PROJECT")+" — Design Language","","## Visual direction",(synthesisDone?synthesized.join(". "):"Editorial + product clarity. Distinctive, human, and deliberately unlike generic AI interfaces."),"","## Typography","Use typography as a primary visual object. Create hierarchy through scale, weight and rhythm.","","## Layout","Prefer asymmetric compositions and meaningful whitespace over repeated card grids.","","## Motion","Motion communicates state, hierarchy and discovery. Never animate for decoration alone.","","## Avoid","- Generic purple AI gradients","- Excessive rounded cards","- Glassmorphism by default","- Stock illustrations","- Visual decisions with no product reason"].join("\\n")}</pre></div></section>}

      {active==="Critique" && <section className="page"><div className="page-heading"><div><label>05 / CRITIQUE</label><h1>Does it look <i>intentional?</i></h1><p>Point AKANI at the live implementation. It will inspect the HTML structure and compare it with your synthesized design language.</p></div></div><div className="critique-hero"><div className="dropzone"><Sparkles size={22}/><h2>Paste the live URL.</h2><p>This first critique pass is structural: hierarchy, typography signals, section rhythm, visual density and generic AI patterns.</p><div className="critique-input"><input value={critiqueUrl} onChange={function(e){setCritiqueUrl(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")runCritique()}} placeholder="https://your-product.vercel.app"/><button className="primary" onClick={runCritique} disabled={critiquing}>{critiquing?"Inspecting…":"Start critique"}</button></div>{critiqueError&&<p className="analysis-error">{critiqueError}</p>}</div><div className="critique-score">{critique?<><label>LATEST REVIEW</label><strong>{critique.score}</strong><span>/ 100</span><div>{[["Distinctiveness","distinctiveness"],["Hierarchy","hierarchy"],["Typography","typography"],["Spacing","spacing"],["Product identity","productIdentity"]].map(function(x){return <p key={x[0]}><span>{x[0]}</span><b>{critique.scores[x[1]]}</b></p>})}</div></>:<><label>READY TO REVIEW</label><strong>—</strong><span>/ 100</span><p>Run a live URL critique to replace this placeholder with a real assessment.</p></>}</div></div>{critique&&<><div className="warnings"><label>AKANI FINDINGS</label><div>{critique.findings.strengths.map(function(x:string){return <b key={x}>✓ {x}</b>})}{critique.findings.warnings.map(function(x:string){return <b key={x}>! {x}</b>})}</div></div><div className="transfer critique-results"><label>NEXT MOVES</label><div className="language-list">{critique.findings.recommendations.map(function(x:string,i:number){return <p key={x}><small>0{i+1}</small><b>{x}</b><ArrowUpRight size={13}/></p>})}</div><div className="analysis-facts"><label>LIVE EXTRACTION</label><div><span>{critique.extraction.stats.headings} headings</span><span>{critique.extraction.stats.sections} sections</span><span>{critique.extraction.stats.images} images</span><span>{critique.extraction.stats.cards} card signals</span><span>{critique.extraction.stats.gradients} gradient signals</span></div></div></div></>}{critiqueHistory.length>1&&<div className="memory-note"><Brain size={20}/><div><label>CRITIQUE MEMORY</label><h2>{critiqueHistory.length} critiques captured this session.</h2><p>These reviews are now available as accumulated feedback for the current design workspace.</p></div></div>}</section>}

      {active==="Memory" && <section className="page"><div className="page-heading"><div><label>06 / MEMORY</label><h1>Your accumulated <i>taste.</i></h1><p>AKANI should get better at understanding what good design means to you and your products.</p></div></div><div className="memory-grid">{[[String(refs.length),"References in workspace"],[String(synthesisDone?1:0),"Design languages built"],[String(new Set(refs.flatMap(function(r){return r.dna})).size),"Patterns available"],[String(critiqueHistory.length),"Critiques captured"]].map(function(x){return <article key={x[1]}><strong>{x[0]}</strong><span>{x[1]}</span></article>})}</div><div className="memory-note"><Brain size={20}/><div><label>THE LONG GAME</label><h2>Build a personal design intelligence.</h2><p>Every study, synthesis and critique becomes reusable knowledge instead of disappearing after the project ships.</p>{critique&&<small className="synthesis-status">LATEST CRITIQUE: {critique.score}/100 FOR {critique.project.toUpperCase()}.</small>}</div></div></section>}

      <footer className="app-footer"><b>AKANI DESIGN LAB</b><span>REFERENCE INTELLIGENCE FOR THE AI DESIGN ERA.</span><span>{refs.length} REFERENCES / {project||"UNTITLED PROJECT"}</span></footer>
    </div>

    {add&&<div className="modal"><div><button className="close" onClick={function(){setAdd(false)}}><X/></button><label>ADD REFERENCE</label><h2>What should we study?</h2><p>Save a website into your design memory. The analysis pipeline will turn it into structured design DNA.</p><input autoFocus value={url} onChange={function(e){setUrl(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")saveReference()}} placeholder="https://example.com"/><button className="primary full" onClick={saveReference}>Add to design memory <ArrowUpRight size={15}/></button></div></div>}
  </main>;
}
