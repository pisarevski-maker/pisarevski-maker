export const TOOLS={
  pencil:{label:'Олівець',symbol:'✎',size:8,hint:'Олівець залишає легкий штрих. Менший розмір допоможе промалювати деталі.'},
  ink:{label:'Туш',symbol:'⌁',size:7,hint:'Туш дає чітку плавну лінію. Спробуй намалювати контур, а колір додай на іншому шарі.'},
  marker:{label:'Маркер',symbol:'▰',size:30,hint:'Широкий маркер нашаровує колір. Повторний прохід робить штрих насиченішим.'},
  watercolor:{label:'Акварель',symbol:'◒',size:60,hint:'Акварельний ефект — прозорі м’які мазки. Кілька легких проходів поєднують кольори.'},
  oil:{label:'Олійний',symbol:'≋',size:35,hint:'Олійний ефект дає густий фактурний мазок. Спробуй різні розміри й кольори.'},
  pastel:{label:'Пастель',symbol:'░',size:40,hint:'Пастель створює суху зернисту фактуру. Гарно поєднується з кольоровим папером.'},
  eraser:{label:'Гумка',symbol:'▱',size:40,hint:'Гумка стирає тільки активний шар малювання. Фотографія під ним залишається цілою.'},
  picker:{label:'Піпетка',symbol:'⊙',size:1,hint:'Натисни на колір у малюнку або на фото, щоб узяти його для пензля.'},
  fill:{label:'Заливка',symbol:'◩',size:1,hint:'Заливка фарбує замкнену область активного шару. На порожньому шарі вона заповнить усе полотно.'},
  line:{label:'Лінія',symbol:'╱',size:5,hint:'Проведи від початку до кінця. Фігури зручно малювати на окремому шарі.'},
  rect:{label:'Прямокутник',symbol:'□',size:5,hint:'Потягни від одного кута до іншого. Увімкни «Залита фігура», якщо потрібен колір усередині.'},
  ellipse:{label:'Еліпс',symbol:'○',size:5,hint:'Потягни по діагоналі. Коло або овал доповнить твою композицію.'}
};
export function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
export function hexColor(r,g,b){return '#'+[r,g,b].map(n=>Math.round(Math.max(0,Math.min(255,n))).toString(16).padStart(2,'0')).join('');}
export function photoFilter(photo){return `brightness(${2**photo.exposure}) contrast(${photo.contrast/100}) saturate(${photo.saturation/100})`;}
export function photoPlacement(imageWidth,imageHeight,width,height,rotation,fit){
  const turned=Math.abs(rotation%180)===90;
  const effectiveWidth=turned?imageHeight:imageWidth,effectiveHeight=turned?imageWidth:imageHeight;
  const scale=(fit==='cover'?Math.max:Math.min)(width/effectiveWidth,height/effectiveHeight);
  return {width:imageWidth*scale,height:imageHeight*scale,angle:rotation*Math.PI/180};
}
export function validProject(data){
  const image=value=>typeof value==='string'&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value);
  return Boolean(data&&data.version===1&&Number.isInteger(data.width)&&Number.isInteger(data.height)&&data.width>=100&&data.height>=100&&data.width<=2400&&data.height<=2400&&typeof data.title==='string'&&data.title.length<=80&&/^#[0-9a-f]{6}$/i.test(data.paper)&&typeof data.transparent==='boolean'&&Array.isArray(data.layers)&&data.layers.length>=1&&data.layers.length<=6&&new Set(data.layers.map(l=>l.id)).size===data.layers.length&&data.layers.some(l=>l.id===data.activeId)&&data.layers.every(l=>typeof l.id==='string'&&l.id.length<100&&typeof l.name==='string'&&l.name.length<=60&&typeof l.visible==='boolean'&&Number.isFinite(l.opacity)&&l.opacity>=0&&l.opacity<=1&&image(l.data))&&(!data.photo||(image(data.photo.data)&&Number.isFinite(data.photo.exposure)&&data.photo.exposure>=-2&&data.photo.exposure<=2&&Number.isFinite(data.photo.contrast)&&data.photo.contrast>=0&&data.photo.contrast<=200&&Number.isFinite(data.photo.saturation)&&data.photo.saturation>=0&&data.photo.saturation<=200&&Number.isFinite(data.photo.opacity)&&data.photo.opacity>=0&&data.photo.opacity<=1&&[0,90,180,270].includes(data.photo.rotation)&&['contain','cover'].includes(data.photo.fit))));
}
export function floodFill(image,x,y,color,opacity=1,tolerance=24){
  const {width,height,data}=image;x=Math.floor(x);y=Math.floor(y);
  if(x<0||y<0||x>=width||y>=height)return false;
  const start=(y*width+x)*4,target=Array.from(data.slice(start,start+4)),replacement=[...rgb(color),Math.round(opacity*255)];
  if(replacement.every((v,i)=>Math.abs(v-target[i])<=1))return false;
  const queue=new Int32Array(width*height),visited=new Uint8Array(width*height);let head=0,tail=0;
  queue[tail++]=y*width+x;visited[y*width+x]=1;
  const matches=offset=>target[3]===0?data[offset+3]===0:target.every((v,i)=>Math.abs(data[offset+i]-v)<=tolerance);
  while(head<tail){
    const p=queue[head++],offset=p*4;if(!matches(offset))continue;
    for(let i=0;i<4;i++)data[offset+i]=replacement[i];
    const px=p%width;
    for(const next of [px>0?p-1:-1,px<width-1?p+1:-1,p>=width?p-width:-1,p<width*(height-1)?p+width:-1])if(next>=0&&!visited[next]){visited[next]=1;queue[tail++]=next;}
  }
  return true;
}
function stamp(ctx,p,settings,tool){
  const size=settings.size*(p.pressure||1),opacity=settings.opacity,[r,g,b]=rgb(settings.color);ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle=settings.color;
  if(tool==='eraser'){ctx.globalCompositeOperation='destination-out';ctx.globalAlpha=opacity;ctx.beginPath();ctx.arc(0,0,size/2,0,Math.PI*2);ctx.fill();}
  else if(tool==='watercolor'){
    ctx.globalAlpha=opacity*.13;
    const gradient=ctx.createRadialGradient(0,0,size*.09,0,0,size*.55);gradient.addColorStop(0,`rgba(${r},${g},${b},.48)`);gradient.addColorStop(.8,`rgba(${r},${g},${b},.34)`);gradient.addColorStop(1,`rgba(${r},${g},${b},0)`);ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(0,0,size*.55,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=opacity*.04;ctx.fillStyle=settings.color;for(let i=0;i<5;i++){const angle=Math.random()*Math.PI*2,rad=Math.random()*size*.4;ctx.fillRect(Math.cos(angle)*rad,Math.sin(angle)*rad,1,1);}
  }else if(tool==='pastel'){
    ctx.globalAlpha=opacity*.5;for(let i=0;i<24;i++){const a=Math.random()*Math.PI*2,radius=Math.sqrt(Math.random())*size/2;ctx.fillRect(Math.cos(a)*radius,Math.sin(a)*radius,.7+size*.045,.7+size*.025);}
  }else if(tool==='oil'){
    ctx.globalAlpha=opacity*.55;ctx.rotate(-.35);ctx.beginPath();ctx.ellipse(0,0,size*.52,size*.27,0,0,Math.PI*2);ctx.fill();
    for(let i=0;i<5;i++){ctx.globalAlpha=opacity*.23;ctx.fillStyle=hexColor(r+i*5-8,g+i*5-8,b+i*5-8);ctx.fillRect(-size*.38,-size*.22+i*size*.09,size*.75,Math.max(.6,size*.035));}
  }else if(tool==='marker'){ctx.globalAlpha=opacity*.16;ctx.rotate(-.45);ctx.fillRect(-size*.45,-size*.22,size*.9,size*.44);}
  else if(tool==='pencil'){ctx.globalAlpha=opacity*.23;ctx.beginPath();ctx.arc(0,0,Math.max(.45,size*.4),0,Math.PI*2);ctx.fill();ctx.globalAlpha=opacity*.2;ctx.fillRect((Math.random()-.5)*size,(Math.random()-.5)*size,1,1);}
  else{ctx.globalAlpha=opacity;ctx.beginPath();ctx.arc(0,0,size/2,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}
export function brushSegment(ctx,from,to,settings,tool){
  const distance=Math.hypot(to.x-from.x,to.y-from.y),spacing=Math.max(.6,settings.size*(tool==='ink'||tool==='eraser'?.18:.1)),steps=Math.max(1,Math.ceil(distance/spacing));
  for(let i=1;i<=steps;i++){const t=i/steps;stamp(ctx,{x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t,pressure:(from.pressure||1)+((to.pressure||1)-(from.pressure||1))*t},settings,tool);}
}
export function drawShape(ctx,start,end,settings,tool){
  ctx.save();ctx.strokeStyle=settings.color;ctx.fillStyle=settings.color;ctx.globalAlpha=settings.opacity;ctx.lineWidth=settings.size;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
  if(tool==='line'){ctx.moveTo(start.x,start.y);ctx.lineTo(end.x,end.y);ctx.stroke();}
  else{
    const x=Math.min(start.x,end.x),y=Math.min(start.y,end.y),w=Math.abs(end.x-start.x),h=Math.abs(end.y-start.y);
    if(tool==='rect')ctx.rect(x,y,w,h);else ctx.ellipse(x+w/2,y+h/2,Math.max(.1,w/2),Math.max(.1,h/2),0,0,Math.PI*2);
    if(settings.fill)ctx.fill();else ctx.stroke();
  }ctx.restore();
}
