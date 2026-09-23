async function idleSharePayload(title,subtitle,metrics=[]){
  const url=window.location.origin;
  const lines=[`My ${title} is sitting IDLE.`,subtitle,...metrics,'','What’s sitting IDLE at your house?',url].filter(Boolean);
  return {title:`My ${title} is sitting IDLE`,text:lines.join('\n'),url};
}

async function idleShareCard(title,subtitle,metrics=[]){
  const canvas=document.createElement('canvas');
  canvas.width=1080;canvas.height=1080;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#f7f8fa';ctx.fillRect(0,0,1080,1080);
  ctx.fillStyle='#151a36';ctx.fillRect(0,0,1080,170);
  ctx.fillStyle='#fff';ctx.font='700 76px system-ui';ctx.fillText('IDLE',70,110);
  ctx.fillStyle='#151a36';ctx.font='700 62px system-ui';
  const wrap=(text,x,y,max,wlh)=>{const words=String(text).split(' ');let line='',yy=y;for(const word of words){const test=line+word+' ';if(ctx.measureText(test).width>max&&line){ctx.fillText(line,x,yy);line=word+' ';yy+=wlh}else line=test}ctx.fillText(line,x,yy);return yy};
  let y=300;y=wrap(title,70,y,940,78)+90;
  ctx.font='500 38px system-ui';ctx.fillStyle='#717485';y=wrap(subtitle,70,y,940,54)+80;
  ctx.font='700 42px system-ui';ctx.fillStyle='#151a36';for(const m of metrics){ctx.fillText(m,70,y);y+=66}
  ctx.font='600 34px system-ui';ctx.fillStyle='#717485';ctx.fillText('What’s sitting IDLE at your house?',70,930);
  ctx.font='500 28px system-ui';ctx.fillText(window.location.origin,70,985);
  return new Promise(resolve=>canvas.toBlob(resolve,'image/png',0.95));
}

async function idleDoShare(payload,blob){
  try{
    if(blob){const file=new File([blob],'idle-result.png',{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({title:payload.title,text:payload.text,url:payload.url,files:[file]});return}}
    if(navigator.share){await navigator.share(payload);return}
    await navigator.clipboard.writeText(payload.text);alert('IDLE result copied. Paste it into TikTok, Instagram, Facebook, text, or email.');
  }catch(e){if(e?.name!=='AbortError'){try{await navigator.clipboard.writeText(payload.text);alert('IDLE result copied to your clipboard.')}catch{alert('Could not open sharing on this device.')}}}
}

window.shareIdleResult=async()=>{
  if(!lastScan)return;
  const x=lastScan;
  const title=x.identity?.title||'item';
  const value=`Estimated value: $${x.valuation?.resaleLow||0}–$${x.valuation?.resaleHigh||0}`;
  const rental=`AI rental estimate: $${x.valuation?.rentalLow||0}–$${x.valuation?.rentalHigh||0}/day`;
  const score=`IDLE Score: ${x.idleScore||0}`;
  const payload=await idleSharePayload(title,'IDLE analyzed something I own.',[value,rental,score,'AI estimates, not guaranteed income.']);
  const blob=await idleShareCard(title,'IDLE analyzed something I own.',[value,rental,score,'AI estimates, not guaranteed income.']);
  await idleDoShare(payload,blob);
};

window.shareIdleAsset=async()=>{
  if(!currentAsset)return;
  const title=currentAsset.title||'item';
  const value=`Estimated value: $${Number(currentAsset.value||0).toFixed(0)}`;
  const rental=`Suggested rental: $${Number(currentAsset.rate||0).toFixed(0)}/day`;
  const score=`IDLE Score: ${currentAsset.score||0}`;
  const payload=await idleSharePayload(title,'A fresh look at what I already own.',[value,rental,score,'AI estimates, not guaranteed income.']);
  const blob=await idleShareCard(title,'A fresh look at what I already own.',[value,rental,score,'AI estimates, not guaranteed income.']);
  await idleDoShare(payload,blob);
};

