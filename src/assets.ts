// Static client scripts served by the Worker. Plain ES5-ish JS, no build step.

export const WIDGET_JS = `(function(){
  var base = (document.currentScript && document.currentScript.src || "").replace(/\\/widget\\.js.*$/, "") || "";
  function esc(s){var d=document.createElement("div");d.textContent=s==null?"":String(s);return d.innerHTML;}
  function stars(r){if(!r)return "";var s="";for(var i=0;i<5;i++){s+= i<r?"&#9733;":"&#9734;";}return '<div style="color:#fbbf24;letter-spacing:2px">'+s+'</div>';}
  function card(t){
    var body = t.image_url ? '<img src="'+esc(t.image_url)+'" style="width:100%;border-radius:8px">' : '<div>'+esc(t.text)+'</div>';
    var who = (t.name||t.company) ? '<div style="margin-top:10px;font-size:13px;color:#666"><b>'+esc(t.name||"")+'</b> '+esc(t.company||"")+'</div>' : "";
    return '<div style="break-inside:avoid;border:1px solid #e5e7eb;border-radius:12px;padding:14px;margin:0 0 14px;background:#fff;color:#111">'+stars(t.rating)+body+who+'</div>';
  }
  function render(el, slug){
    fetch(base+"/api/wall/"+encodeURIComponent(slug)).then(function(r){return r.json();}).then(function(d){
      if(!d || !d.testimonials){el.innerHTML="";return;}
      var html = '<div style="column-width:280px;column-gap:14px;font:14px/1.5 -apple-system,Segoe UI,Roboto,Arial">';
      d.testimonials.forEach(function(t){html+=card(t);});
      if(d.branding){html+='<div style="font-size:11px;color:#9ca3af;margin-top:6px">Collected with <a href="'+base+'" style="color:#6366f1">ProofClip</a></div>';}
      html+='</div>';
      el.innerHTML=html;
      // count a view
      try{navigator.sendBeacon(base+"/api/event",new Blob([JSON.stringify({slug:slug,type:"view"})],{type:"application/json"}));}catch(e){}
      el.addEventListener("click",function(){try{fetch(base+"/api/event",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({slug:slug,type:"click"}),keepalive:true});}catch(e){}});
    }).catch(function(){});
  }
  var nodes = document.querySelectorAll("[data-proofclip]");
  for(var i=0;i<nodes.length;i++){render(nodes[i], nodes[i].getAttribute("data-proofclip"));}
})();`;

export const CARD_JS = `(function(){
  var C = window.__CARD__ || {};
  var canvas = document.getElementById("c");
  var ctx = canvas.getContext("2d");
  var ratio = "9:16";
  var SIZES = {"9:16":[1080,1920],"1:1":[1080,1080],"16:9":[1920,1080]};

  function rounded(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}

  function wrap(text,maxW,font){
    ctx.font=font;var words=(text||"").split(/\\s+/),lines=[],line="";
    for(var i=0;i<words.length;i++){var test=line?line+" "+words[i]:words[i];if(ctx.measureText(test).width>maxW&&line){lines.push(line);line=words[i];}else{line=test;}}
    if(line)lines.push(line);return lines;
  }

  function draw(){
    var s=SIZES[ratio];canvas.width=s[0];canvas.height=s[1];
    var W=s[0],H=s[1];
    var g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,"#0b0b10");g.addColorStop(1,"#1a1130");
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    // accent bar
    ctx.fillStyle=C.accent||"#6366f1";rounded(W*0.08,H*0.12,W*0.10,12,6);ctx.fill();
    // stars
    if(C.rating){ctx.fillStyle="#fbbf24";ctx.font="bold "+Math.round(W*0.05)+"px Arial";ctx.textBaseline="top";
      var st="";for(var i=0;i<5;i++)st+= i<C.rating?"\\u2605":"\\u2606";ctx.fillText(st,W*0.08,H*0.16);}
    // quote
    ctx.fillStyle="#f3f3fb";var qf="600 "+Math.round(W*0.058)+"px Georgia";ctx.font=qf;
    var lines=wrap('\\u201C'+(C.text||"")+'\\u201D',W*0.84,qf);
    var lh=Math.round(W*0.082),y=H*0.30;
    for(var j=0;j<lines.length && j<10;j++){ctx.fillText(lines[j],W*0.08,y);y+=lh;}
    // author
    ctx.fillStyle=C.accent||"#a855f7";ctx.font="bold "+Math.round(W*0.04)+"px Arial";
    ctx.fillText(C.name||"",W*0.08,y+lh*0.4);
    if(C.company){ctx.fillStyle="#9a9ab0";ctx.font=Math.round(W*0.034)+"px Arial";ctx.fillText(C.company,W*0.08,y+lh*0.4+Math.round(W*0.055));}
    // brand footer
    if(C.branding){ctx.fillStyle="#6b6b80";ctx.font=Math.round(W*0.026)+"px Arial";ctx.textBaseline="bottom";ctx.fillText((C.brand||"")+"  \\u00B7  ProofClip",W*0.08,H*0.93);}
  }

  document.querySelectorAll("[data-ratio]").forEach(function(b){
    b.addEventListener("click",function(){
      ratio=b.getAttribute("data-ratio");
      document.querySelectorAll("[data-ratio]").forEach(function(x){x.className="btn sm ghost";});
      b.className="btn sm";draw();
    });
  });
  document.getElementById("dl").addEventListener("click",function(){
    var a=document.createElement("a");a.download="proofclip-"+ratio.replace(":","x")+".png";a.href=canvas.toDataURL("image/png");a.click();
  });
  draw();
})();`;
