
const DB_NAME = "fionas-closet-db";
const DB_VERSION = 1;
const ITEM_STORE = "items";
const LOOK_STORE = "looks";

let db;
let items = [];
let selectedCategory = "All";
let selectedTop = null;
let selectedBottom = null;

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function openDB(){
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e)=>{
      const d = e.target.result;
      if(!d.objectStoreNames.contains(ITEM_STORE)) d.createObjectStore(ITEM_STORE,{keyPath:"id"});
      if(!d.objectStoreNames.contains(LOOK_STORE)) d.createObjectStore(LOOK_STORE,{keyPath:"id"});
    };
    req.onsuccess=()=>{db=req.result;resolve(db)};
    req.onerror=()=>reject(req.error);
  });
}
function tx(store,mode="readonly"){return db.transaction(store,mode).objectStore(store)}
function getAll(store){return new Promise((res,rej)=>{const r=tx(store).getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
function put(store,val){return new Promise((res,rej)=>{const r=tx(store,"readwrite").put(val);r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})}
function del(store,id){return new Promise((res,rej)=>{const r=tx(store,"readwrite").delete(id);r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})}

async function seedIfNeeded(){
  const existing = await getAll(ITEM_STORE);
  if(existing.length) return;
  const seed = await fetch("seed.json").then(r=>r.json());
  for(const item of seed) await put(ITEM_STORE,item);
}

function imageSrc(item){
  if(item.imageData) return item.imageData;
  return item.image;
}

async function refreshItems(){
  items = await getAll(ITEM_STORE);
  items.sort((a,b)=>a.name.localeCompare(b.name));
  renderAll();
}

function renderFilters(){
  const cats = ["All","Tops","Bottoms","Outerwear","Shoes","Accessories"];
  const wrap = $("#filterChips"); wrap.innerHTML="";
  cats.forEach(cat=>{
    const b=document.createElement("button");
    b.className="chip"+(selectedCategory===cat?" active":"");
    b.textContent=cat;
    b.onclick=()=>{selectedCategory=cat;renderCloset();renderFilters()};
    wrap.appendChild(b);
  });
}

function renderCloset(){
  const q=$("#searchInput").value.trim().toLowerCase();
  const data=items.filter(i=>(selectedCategory==="All"||i.category===selectedCategory) && (!q||i.name.toLowerCase().includes(q)));
  const grid=$("#closetGrid"); grid.innerHTML="";
  const tpl=$("#itemCardTemplate");
  data.forEach(item=>{
    const node=tpl.content.cloneNode(true);
    node.querySelector(".card-img").src=imageSrc(item);
    node.querySelector(".card-img").alt=item.name;
    node.querySelector(".card-name").textContent=item.name;
    node.querySelector(".card-category").textContent=item.category;
    node.querySelector(".delete-btn").onclick=async()=>{
      if(confirm(`Delete ${item.name}?`)){
        await del(ITEM_STORE,item.id);
        if(selectedTop===item.id) selectedTop=null;
        if(selectedBottom===item.id) selectedBottom=null;
        await refreshItems();
      }
    };
    grid.appendChild(node);
  });
}

function picker(containerId, category, selectedId, setter){
  const c=$(containerId); c.innerHTML="";
  items.filter(i=>i.category===category).forEach(item=>{
    const b=document.createElement("button");
    b.className="picker-item"+(item.id===selectedId?" selected":"");
    b.innerHTML=`<img src="${imageSrc(item)}" alt="${item.name}"><div>${item.name}</div>`;
    b.onclick=()=>{setter(item.id);renderBuilder()};
    c.appendChild(b);
  });
}

function showPreview(imgSel, phSel, item){
  const img=$(imgSel), ph=$(phSel);
  if(item){img.src=imageSrc(item); img.style.display="block"; ph.style.display="none"}
  else {img.style.display="none"; ph.style.display="block"}
}

function renderBuilder(){
  picker("#topPicker","Tops",selectedTop,(id)=>selectedTop=id);
  picker("#bottomPicker","Bottoms",selectedBottom,(id)=>selectedBottom=id);
  const top=items.find(i=>i.id===selectedTop);
  const bottom=items.find(i=>i.id===selectedBottom);
  showPreview("#topPreview","#topPlaceholder",top);
  showPreview("#bottomPreview","#bottomPlaceholder",bottom);
}

async function renderSaved(){
  const looks=await getAll(LOOK_STORE);
  looks.sort((a,b)=>b.createdAt-a.createdAt);
  const wrap=$("#savedLooks"); wrap.innerHTML="";
  if(!looks.length){wrap.innerHTML="<p>No saved looks yet.</p>";return}
  looks.forEach(look=>{
    const top=items.find(i=>i.id===look.topId), bottom=items.find(i=>i.id===look.bottomId);
    if(!top||!bottom) return;
    const div=document.createElement("article");
    div.className="saved-look";
    div.innerHTML=`
      <div class="saved-pair">
        <img src="${imageSrc(top)}" alt="${top.name}">
        <img src="${imageSrc(bottom)}" alt="${bottom.name}">
      </div>
      <div class="saved-meta">
        <div><strong>${top.name}</strong><br><span>${bottom.name}</span></div>
        <button class="danger">Delete</button>
      </div>`;
    div.querySelector("button").onclick=async()=>{await del(LOOK_STORE,look.id);renderSaved()};
    wrap.appendChild(div);
  });
}

function renderAll(){
  renderFilters(); renderCloset(); renderBuilder(); renderSaved();
}

function readFileAsDataURL(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>resolve(r.result); r.onerror=()=>reject(r.error); r.readAsDataURL(file);
  });
}

async function addItem(){
  const name=$("#itemName").value.trim();
  const category=$("#itemCategory").value;
  const file=$("#itemPhoto").files[0];
  if(!name||!file) return;
  const imageData=await readFileAsDataURL(file);
  await put(ITEM_STORE,{id:crypto.randomUUID(),name,category,imageData,createdAt:Date.now()});
  $("#itemForm").reset();
  $("#itemDialog").close();
  await refreshItems();
}

function setupUI(){
  $$(".tabs button").forEach(btn=>btn.onclick=()=>{
    $$(".tabs button").forEach(b=>b.classList.remove("active"));
    $$(".tab-panel").forEach(p=>p.classList.remove("active"));
    btn.classList.add("active");
    $("#"+btn.dataset.tab).classList.add("active");
    if(btn.dataset.tab==="saved") renderSaved();
  });
  $("#addBtn").onclick=()=>$("#itemDialog").showModal();
  $("#saveItemBtn").onclick=(e)=>{e.preventDefault(); addItem()};
  $("#searchInput").oninput=renderCloset;
  $("#shuffleBtn").onclick=()=>{
    const tops=items.filter(i=>i.category==="Tops");
    const bottoms=items.filter(i=>i.category==="Bottoms");
    if(tops.length) selectedTop=tops[Math.floor(Math.random()*tops.length)].id;
    if(bottoms.length) selectedBottom=bottoms[Math.floor(Math.random()*bottoms.length)].id;
    renderBuilder();
  };
  $("#saveLookBtn").onclick=async()=>{
    if(!selectedTop||!selectedBottom){alert("Choose a top and a bottom first.");return}
    await put(LOOK_STORE,{id:crypto.randomUUID(),topId:selectedTop,bottomId:selectedBottom,createdAt:Date.now()});
    alert("Look saved.");
  };
}

async function init(){
  await openDB();
  await seedIfNeeded();
  setupUI();
  await refreshItems();
  if("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js");
}
init();
