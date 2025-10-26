// ~/script.js

// Socket
const socket = io();

const launchpad = document.getElementById('launchpad');
const boardContainer = document.getElementById('boardContainer');
const nicknameInput = document.getElementById('nickname');
const roomInput = document.getElementById('roomCode');
const roomDisplay = document.getElementById('roomDisplay');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const userListEl = document.getElementById('users');

let currentTool = 'brush';
let currentSize = 5;
let currentColor = colorPicker.value;
let isDrawing = false;
let lastX = 0, lastY = 0;
let canDraw = true;
let currentHost = null;

// ===== Launchpad =====
function validRoomCode(code) { return /^[A-Z0-9]{6}$/i.test(code); }
function generateRoomCode() { const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let code=''; for(let i=0;i<6;i++) code+=chars[Math.floor(Math.random()*chars.length)]; return code; }
function joinRoom(code){
  code = code.toUpperCase();
  const nickname = nicknameInput.value.trim() || 'Anon';
  if(!validRoomCode(code)){ alert("Room code must be 6 letters/numbers."); return; }
  socket.emit('joinRoom',{roomCode:code,nickname});
  launchpad.style.display='none';
  boardContainer.style.display='flex';
  roomDisplay.textContent = "Room: " + code;
}
document.getElementById('createRoom').addEventListener('click',()=>joinRoom(generateRoomCode()));
document.getElementById('joinRoom').addEventListener('click',()=>joinRoom(roomInput.value));
roomInput.addEventListener('keypress',e=>{if(e.key==='Enter') joinRoom(roomInput.value);});
nicknameInput.addEventListener('keypress',e=>{if(e.key==='Enter') joinRoom(roomInput.value);});

// ===== Toolbar =====
colorPicker.addEventListener('input',e=>currentColor=e.target.value);
const sizes={small:2,medium:5,large:10,xlarge:20};
document.querySelectorAll('#toolbar button[data-tool]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    if(!canDraw) return;
    document.querySelectorAll('#toolbar button[data-tool]').forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected');
    currentTool=btn.dataset.tool;
  });
});
document.querySelectorAll('#toolbar button[data-size]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    if(!canDraw) return;
    currentSize=sizes[btn.textContent.toLowerCase()];
  });
});
document.getElementById('clear').addEventListener('click',()=>{
  if(!canDraw) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  socket.emit('clear');
});

// ===== Drawing =====
function drawLine(x0,y0,x1,y1,color,size,tool,emit=false){
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y1);
  ctx.strokeStyle=tool==='eraser'?'white':color;
  ctx.lineWidth=size;
  ctx.lineCap='round';
  ctx.stroke();
  ctx.closePath();
  if(!emit) return;
  socket.emit('draw',{x0,y0,x1,y1,color,size,tool});
}

function hexToRgba(hex){
  const bigint=parseInt(hex.slice(1),16);
  return [(bigint>>16)&255,(bigint>>8)&255,bigint&255,255];
}
function colorMatch(a,b){ return a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2]&&a[3]===b[3]; }

function floodFill(x,y,fillColor,emit=false){
  if(!canDraw) return;
  const img=ctx.getImageData(0,0,canvas.width,canvas.height);
  const data=img.data;
  const w=img.width,h=img.height;
  const stack=[[x,y]];
  const targetPos=(y*w+x)*4;
  const targetColor=[data[targetPos],data[targetPos+1],data[targetPos+2],data[targetPos+3]];
  const replacementColor=hexToRgba(fillColor);
  if(colorMatch(targetColor,replacementColor)) return;
  while(stack.length){
    let [cx,cy]=stack.pop();
    let pos=(cy*w+cx)*4;
    while(cy>=0 && colorMatch([data[pos],data[pos+1],data[pos+2],data[pos+3]],targetColor)){ cy--; pos-=w*4;}
    cy++; pos+=w*4;
    let reachLeft=false, reachRight=false;
    while(cy<h && colorMatch([data[pos],data[pos+1],data[pos+2],data[pos+3]],targetColor)){
      data[pos]=replacementColor[0]; data[pos+1]=replacementColor[1]; data[pos+2]=replacementColor[2]; data[pos+3]=replacementColor[3];
      if(cx>0){ if(colorMatch([data[pos-4],data[pos-3],data[pos-2],data[pos-1]],targetColor) && !reachLeft){ stack.push([cx-1,cy]); reachLeft=true;} else reachLeft=false;}
      if(cx<w-1){ if(colorMatch([data[pos+4],data[pos+5],data[pos+6],data[pos+7]],targetColor) && !reachRight){ stack.push([cx+1,cy]); reachRight=true;} else reachRight=false;}
      cy++; pos+=w*4;
    }
  }
  ctx.putImageData(img,0,0);
  if(emit) socket.emit('fill',{x,y,color:fillColor});
}

// ===== Mouse + Touch =====
function getPointerPos(e){
  const rect = canvas.getBoundingClientRect();
  if(e.touches){ return {x:e.touches[0].clientX-rect.left, y:e.touches[0].clientY-rect.top}; }
  return {x:e.offsetX, y:e.offsetY};
}
function startDrawing(e){
  if(!canDraw) return;
  const {x,y}=getPointerPos(e);
  if(currentTool==='fill'){ floodFill(x,y,currentColor,true); return; }
  isDrawing=true; lastX=x; lastY=y; e.preventDefault();
}
function stopDrawing(e){ if(!canDraw) return; isDrawing=false; e.preventDefault();}
function drawMove(e){
  if(!isDrawing || !canDraw || currentTool==='fill') return;
  const {x,y}=getPointerPos(e);
  drawLine(lastX,lastY,x,y,currentColor,currentSize,currentTool,true);
  lastX=x; lastY=y; e.preventDefault();
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
canvas.addEventListener('mousemove', drawMove);
canvas.addEventListener('touchstart', startDrawing,{passive:false});
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchcancel', stopDrawing);
canvas.addEventListener('touchmove', drawMove,{passive:false});

// ===== Socket =====
socket.on('draw', data=>drawLine(data.x0,data.y0,data.x1,data.y1,data.color,data.size,data.tool,false));
socket.on('fill', data=>floodFill(data.x,data.y,data.color,false));
socket.on('init', history=>history.forEach(data=>{if(data.tool==='fill') floodFill(data.x,data.y,data.color,false); else drawLine(data.x0,data.y0,data.x1,data.y1,data.color,data.size,data.tool,false);}));
socket.on('clear', ()=>ctx.clearRect(0,0,canvas.width,canvas.height));

socket.on('userList', ({ users, host })=>{
  currentHost = host;
  userListEl.innerHTML='';
  Object.entries(users).forEach(([id,u])=>{
    const li = document.createElement('li');
    li.textContent = u.nickname + (u.canDraw ? ' 🖌️ Painter' : ' ❌ Viewer');

    // Host dropdown for other users
    if(socket.id === host && id !== socket.id){
      const dropdown = document.createElement('span');
      dropdown.textContent = '▸';
      dropdown.classList.add('user-dropdown');

      const menu = document.createElement('div');
      menu.classList.add('user-dropdown-menu');
      menu.style.display='none';
      ['Painter','Viewer'].forEach(role=>{
        const item = document.createElement('div');
        item.textContent = role + ' - ' + (role==='Painter'?'Can draw':'Read only');
        item.addEventListener('click',()=>{
          socket.emit('setPermission',{socketId:id, canDraw:role==='Painter'});
          menu.style.display='none';
          dropdown.textContent='▸';
        });
        menu.appendChild(item);
      });

      dropdown.addEventListener('click',()=>{
        const open = menu.style.display==='block';
        menu.style.display=open?'none':'block';
        dropdown.textContent=open?'▸':'▾';
      });

      li.appendChild(dropdown);
      li.appendChild(menu);

      // Kick button
      const kickBtn = document.createElement('button');
      kickBtn.textContent='Kick';
      kickBtn.addEventListener('click',()=>socket.emit('kickUser', id));
      li.appendChild(kickBtn);
    }

    userListEl.appendChild(li);

    // Update local canDraw for current user
    if(id === socket.id) canDraw = u.canDraw;

    // Disable toolbar/buttons if needed
    const toolbarElements = document.querySelectorAll('#toolbar button, #toolbar input[type=color]');
    toolbarElements.forEach(el=>el.disabled = !canDraw);
  });
});

// Handle kicked
socket.on('kicked', ()=>{
  alert('You were kicked from the room.');
  window.location.reload();
});
