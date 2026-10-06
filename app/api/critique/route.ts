import { NextResponse } from "next/server";

function clamp(n:number,min:number,max:number){return Math.max(min,Math.min(max,n));}
function unique(values:string[]){return [...new Set(values.filter(Boolean))];}

function extract(html:string){
  const text=html.replace(/<script[\\s\\S]*?<\\/script>/gi," ").replace(/<style[\\s\\S]*?<\\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/\\s+/g," ").trim();
  const headings=[...html.matchAll(/<h[1-3]\\b[^>]*>([\\s\\S]*?)<\\/h[1-3]>/gi)].map(m=>m[1].replace(/<[^>]+>/g," ").replace(/\\s+/g," ").trim()).filter(Boolean).slice(0,20);
  const fonts=unique([...html.matchAll(/font-family\\s*:\\s*([^;}]+)/gi)].map(m=>m[1].trim().replace(/['"]/g,"")).filter(Boolean)).slice(0,10);
  const colors=unique([...html.matchAll(/#[0-9a-fA-F]{3,8}\\b/g)].map(m=>m[0].toLowerCase())).slice(0,20);
  const buttons=(html.match(/<button\\b/gi)||[]).length+(html.match(/role=["']button["']/gi)||[]).length;
  const links=(html.match(/<a\\b/gi)||[]).length;
  const images=(html.match(/<img\\b/gi)||[]).length;
  const sections=(html.match(/<section\\b/gi)||[]).length;
  const cards=(html.match(/card|rounded-|border-radius|shadow-/gi)||[]).length;
  const gradients=(html.match(/gradient/gi)||[]).length;
  const scripts=(html.match(/<script\\b/gi)||[]).length;
  const stylesheets=(html.match(/<link[^>]+stylesheet/gi)||[]).length;
  return {textLength:text.length,headings,fonts,colors,buttons,links,images,sections,cards,gradients,scripts,stylesheets};
}

export async function POST(request:Request){
  try{
    const body=await request.json();
    const rawUrl=String(body?.url||"").trim();
    const project=String(body?.project||"your product").trim();
    const designLanguage=Array.isArray(body?.designLanguage)?body.designLanguage.map(String):[];
    if(!rawUrl) return NextResponse.json({error:"A live URL is required."},{status:400});
    let target:string;
    try{
      target=new URL(rawUrl.startsWith("http")?rawUrl:"https://"+rawUrl).toString();
      if(!/^https?:$/.test(new URL(target).protocol)) throw new Error("Only HTTP(S) URLs are supported.");
    }catch{return NextResponse.json({error:"Enter a valid HTTP(S) URL."},{status:400});}

    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),12000);
    let response:Response;
    try{
      response=await fetch(target,{signal:controller.signal,headers:{"User-Agent":"AKANI-Design-Lab/1.0 (+reference-critique)","Accept":"text/html,application/xhtml+xml"}});
    }finally{clearTimeout(timer);}
    if(!response.ok) return NextResponse.json({error:"The site returned HTTP "+response.status+"."},{status:502});
    const html=await response.text();
    const e=extract(html);
    const h1Count=(html.match(/<h1\\b/gi)||[]).length;
    const hierarchyBase=e.headings.length?Math.min(10,5+(h1Count===1?2:0)+(e.headings.length>=3?2:0)+(e.headings.length>=6?1:0)):3;
    const typography=clamp(5+(e.fonts.length?2:0)+(e.headings.length>=3?1:0)+(e.textLength>500?1:0)-(e.fonts.length>5?1:0),1,10);
    const distinctiveness=clamp(7+(e.colors.length>=4?1:0)+(e.gradients===0?1:0)-(e.cards>12?2:0),1,10);
    const spacing=clamp(7+(e.sections>=4?1:0)+(e.textLength>1000?1:0)-(e.cards>18?2:0),1,10);
    const productIdentity=clamp(6+(designLanguage.length?2:0)+(e.images>0?1:0)-(e.gradients>2?2:0),1,10);
    const score=Math.round(((distinctiveness+hierarchyBase+typography+spacing+productIdentity)/50)*100);

    const strengths:string[]=[];
    const warnings:string[]=[];
    const recommendations:string[]=[];
    if(h1Count===1) strengths.push("Clear single H1 anchor supports hierarchy.");
    else warnings.push(h1Count===0?"No H1 was detected.":"Multiple H1 elements were detected.");
    if(e.fonts.length) strengths.push("Explicit typography signals are present.");
    else warnings.push("No explicit font-family signals were detected.");
    if(e.sections>=4) strengths.push("The page has multiple structural sections to support narrative hierarchy.");
    else recommendations.push("Create stronger section-level rhythm instead of one continuous content block.");
    if(e.cards>12) warnings.push("High card/rounded-pattern density may flatten hierarchy.");
    if(e.gradients>2) warnings.push("Heavy gradient usage can drift toward generic AI-interface aesthetics.");
    if(e.images===0) recommendations.push("Consider meaningful visual evidence where the product benefits from it.");
    if(!designLanguage.length) recommendations.push("Run a Remix synthesis first so the critique can compare implementation against an explicit design language.");
    else recommendations.push("Translate the strongest synthesized principle into one unmistakable product-specific visual signature.");
    if(!strengths.length) strengths.push("The implementation has enough structural data for an initial critique.");

    return NextResponse.json({
      url:target,project,score,
      scores:{distinctiveness,hierarchy:hierarchyBase,typography,spacing,productIdentity},
      findings:{strengths,warnings,recommendations},
      extraction:{title:(html.match(/<title[^>]*>([\\s\\S]*?)<\\/title>/i)?.[1]||"").replace(/<[^>]+>/g," ").trim(),headings:e.headings,fonts:e.fonts,colors:e.colors,stats:{headings:e.headings.length,h1:h1Count,images:e.images,sections:e.sections,buttons:e.buttons,links:e.links,cards:e.cards,gradients:e.gradients,scripts:e.scripts,stylesheets:e.stylesheets,textLength:e.textLength}},
      designLanguage,
      analyzedAt:new Date().toISOString()
    });
  }catch(error){
    const message=error instanceof Error?error.message:"Critique failed.";
    return NextResponse.json({error:message.includes("aborted")?"The site took too long to respond.":message},{status:500});
  }
}
