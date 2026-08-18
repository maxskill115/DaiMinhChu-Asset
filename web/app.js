import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const REPO='maxskill115/DaiMinhChu-Asset';
const BRANCH='main';
const RAW=`https://raw.githubusercontent.com/${REPO}/${BRANCH}/`;
const $=id=>document.getElementById(id);
const ui={canvas:$('sceneCanvas'),viewer:$('viewer'),list:$('effectList'),search:$('searchInput'),count:$('effectCount'),catalogSource:$('catalogSource'),currentName:$('currentName'),currentMeta:$('currentMeta'),loading:$('loading'),loadingTitle:$('loadingTitle'),loadingDetail:$('loadingDetail'),empty:$('emptyState'),error:$('errorBox'),status:$('statusText'),play:$('playPauseBtn'),restart:$('restartBtn'),focus:$('focusBtn'),speed:$('speedRange'),speedValue:$('speedValue'),mode:$('displayMode'),blend:$('blendSelect'),transparent:$('transparentToggle'),depthWrite:$('depthWriteToggle'),autoRotate:$('autoRotateToggle'),gridToggle:$('gridToggle'),fps:$('fps'),layerCount:$('layerCount'),meshCount:$('meshCount'),animCount:$('animCount')};

const seed={effects:[
{id:'am-nhien-tieu-hon-chuong',name:'AmNhienTieuHonChuong',label:'Âm Nhiên Tiêu Hồn Chưởng',defaultMode:'composite',layers:[
['AmNhienTieuHonChuong_01','Skills_C12_2.png'],['AmNhienTieuHonChuong_02','Skills_C12_2.png'],['AmNhienTieuHonChuong_03','Skills_C12_2.png'],['AmNhienTieuHonChuong_04','Skills_C12_1.png'],['AmNhienTieuHonChuong_05','Skills_C12_2.png']].map(([name,tex])=>({name,fbx:`Tài Nguyên Giải nén/Animator/${name}/${name}.fbx`,obj:`Tài Nguyên Giải nén/Mesh/${name}.obj`,texture:`Tài Nguyên Giải nén/Animator/${name}/${tex}`}))},
{id:'attack',name:'Attack',label:'Attack',defaultMode:'composite',layers:Array.from({length:6},(_,i)=>{const name=`Attack_${String(i+1).padStart(2,'0')}`;return{name,fbx:`Tài Nguyên Giải nén/Animator/${name}/${name}.fbx`,obj:`Tài Nguyên Giải nén/Mesh/${name}.obj`,texture:`Tài Nguyên Giải nén/Animator/${name}/Skills_C34_1.png`}})}
]};

const enc=p=>p.split('/').map(encodeURIComponent).join('/');
const raw=p=>RAW+enc(p);
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const human=s=>String(s).replaceAll('_',' ').replace(/([a-z0-9])([A-Z])/g,'$1 $2');

const renderer=new THREE.WebGLRenderer({canvas:ui.canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.setClearColor(0x05070c,1);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x05070c);
const camera=new THREE.PerspectiveCamera(42,1,.001,2000);camera.position.set(0,0,3.5);
const controls=new OrbitControls(camera,ui.canvas);controls.enableDamping=true;controls.dampingFactor=.07;
scene.add(new THREE.HemisphereLight(0xffffff,0x223044,1.2));
const grid=new THREE.GridHelper(8,16,0x33405a,0x18202d);grid.rotation.x=Math.PI/2;grid.visible=false;scene.add(grid);
const clock=new THREE.Clock();

let catalog=[],current=null,root=null,layers=[],mixers=[],token=0,playing=true,seqIndex=0,seqTime=0,frames=0,fpsAt=performance.now();
const textureCache=new Map();

function message(text){ui.status.textContent=text}
function error(text=''){ui.error.textContent=text;ui.error.classList.toggle('hidden',!text)}
function loading(show,title='Đang tải…',detail=''){ui.loading.classList.toggle('hidden',!show);ui.loadingTitle.textContent=title;ui.loadingDetail.textContent=detail}
function normalize(data){if(!data||!Array.isArray(data.effects))throw new Error('manifest không hợp lệ');return data.effects.filter(x=>Array.isArray(x.layers)&&x.layers.length).map(x=>({...x,id:x.id||x.name,label:x.label||human(x.name),defaultMode:x.defaultMode||'composite'}))}

function visibleCatalog(){const q=ui.search.value.trim().toLowerCase();return q?catalog.filter(x=>`${x.label} ${x.name}`.toLowerCase().includes(q)):catalog}
function renderCatalog(){const items=visibleCatalog();ui.count.textContent=items.length;ui.list.innerHTML='';if(!items.length){ui.list.innerHTML='<div class="catalog-empty">Không có effect khớp tìm kiếm.</div>';return}for(const item of items){const b=document.createElement('button');b.className='effect-item'+(current?.id===item.id?' active':'');b.innerHTML=`<span class="icon">✦</span><span><strong>${esc(item.label)}</strong><small>${item.layers.length} layer · ${esc(item.name)}</small></span><em>FX</em>`;b.onclick=()=>loadEffect(item);ui.list.appendChild(b)}}

async function loadCatalog(){loading(true,'Đang đọc manifest…','effects-manifest.json');error('');let data;try{const r=await fetch('./effects-manifest.json',{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);data=await r.json();catalog=normalize(data);ui.catalogSource.textContent=`Manifest tĩnh · ${catalog.length} nhóm effect`}catch(e){console.warn(e);catalog=normalize(seed);ui.catalogSource.textContent=`Fallback nhúng sẵn · ${catalog.length} nhóm effect`}renderCatalog();loading(false);message(`Sẵn sàng: ${catalog.length} nhóm effect. Không dùng GitHub API runtime.`);if(!current&&catalog[0])loadEffect(catalog[0])}

function disposeMaterial(m){if(Array.isArray(m))m.forEach(x=>x?.dispose?.());else m?.dispose?.()}
function clear(){for(const x of mixers){try{x.mixer.stopAllAction();x.mixer.uncacheRoot(x.obj)}catch{}}mixers=[];if(root){scene.remove(root);root.traverse(o=>{o.geometry?.dispose?.();disposeMaterial(o.material)})}root=null;layers=[];seqIndex=0;seqTime=0;ui.layerCount.textContent='0';ui.meshCount.textContent='0';ui.animCount.textContent='0'}

function loadTexture(path){if(!path)return Promise.resolve(null);if(!textureCache.has(path)){textureCache.set(path,new Promise((resolve,reject)=>{new THREE.TextureLoader().load(raw(path),t=>{t.colorSpace=THREE.SRGBColorSpace;t.flipY=true;t.needsUpdate=true;resolve(t)},undefined,reject)}))}return textureCache.get(path)}
function blend(){return ui.blend.value==='normal'?THREE.NormalBlending:ui.blend.value==='multiply'?THREE.MultiplyBlending:THREE.AdditiveBlending}
function meshCount(obj){let n=0;obj?.traverse?.(o=>{if(o.isMesh)n++});return n}
function paint(obj,texture){let n=0;obj.traverse(o=>{if(!o.isMesh)return;n++;disposeMaterial(o.material);const map=texture?texture.clone():null;if(map){map.colorSpace=THREE.SRGBColorSpace;map.needsUpdate=true}o.material=new THREE.MeshBasicMaterial({map,color:0xffffff,transparent:ui.transparent.checked,depthWrite:ui.depthWrite.checked,depthTest:true,side:THREE.DoubleSide,blending:blend(),toneMapped:false});o.frustumCulled=false});return n}

function fbx(path,texture){return new Promise((resolve,reject)=>{const m=new THREE.LoadingManager();const tex=texture?raw(texture):null;m.setURLModifier(url=>tex&&(/\.(png|jpe?g|tga|bmp|dds)(?:$|[?#])/i.test(url)||/skills_/i.test(url))?tex:url);new FBXLoader(m).load(raw(path),resolve,undefined,reject)})}
function obj(path){return new Promise((resolve,reject)=>new OBJLoader().load(raw(path),resolve,undefined,reject))}

async function loadLayer(layer,index,myToken){const tex=await loadTexture(layer.texture).catch(e=>{console.warn('texture lỗi',layer.texture,e);return null});if(myToken!==token)return null;let o=null,source='FBX',anim=0;try{if(layer.fbx){o=await fbx(layer.fbx,layer.texture);anim=o.animations?.length||0;if(meshCount(o)===0)o=null}}catch(e){console.warn('FBX lỗi, fallback OBJ',layer.name,e);o=null}if(!o&&layer.obj){source='OBJ';o=await obj(layer.obj)}if(!o)throw new Error(`${layer.name}: không load được FBX/OBJ`);if(myToken!==token)return null;o.name=layer.name;o.position.z+=index*.0005;const meshes=paint(o,tex);const local=[];if(source==='FBX'&&anim){const mixer=new THREE.AnimationMixer(o);for(const clip of o.animations)mixer.clipAction(clip).reset().play();local.push({mixer,obj:o})}return{root:o,source,meshes,anim,mixers:local}}

function fit(obj){const box=new THREE.Box3().setFromObject(obj);if(box.isEmpty()){camera.position.set(0,0,3.5);controls.target.set(0,0,0);controls.update();return}const s=box.getBoundingSphere(new THREE.Sphere()),r=Math.max(s.radius,.08),f=THREE.MathUtils.degToRad(camera.fov),d=Math.max((r/Math.sin(f/2))*1.7,.8);controls.target.copy(s.center);camera.position.copy(s.center).add(new THREE.Vector3(0,.1,1).normalize().multiplyScalar(d));camera.near=Math.max(d/1000,.001);camera.far=Math.max(d*100,100);camera.updateProjectionMatrix();controls.update()}
function applyVisibility(){layers.forEach((x,i)=>x.root.visible=ui.mode.value==='composite'||i===seqIndex)}
function refreshMaterials(){for(const x of layers)x.root.traverse(o=>{if(!o.isMesh)return;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){if(!m)continue;m.transparent=ui.transparent.checked;m.depthWrite=ui.depthWrite.checked;m.blending=blend();m.needsUpdate=true}})}

async function loadEffect(effect){const my=++token;current=effect;renderCatalog();error('');clear();ui.empty.classList.add('hidden');ui.currentName.textContent=effect.label;ui.currentMeta.textContent=`${effect.layers.length} layer · FBX → OBJ fallback`;ui.mode.value=effect.defaultMode||'composite';loading(true,`Đang dựng ${effect.label}`,'Chuẩn bị layer…');message(`Đang tải ${effect.layers.length} layer…`);const group=new THREE.Group();let meshes=0,anims=0,fbxN=0,objN=0;try{for(let i=0;i<effect.layers.length;i++){const l=effect.layers[i];ui.loadingDetail.textContent=`${i+1}/${effect.layers.length} · ${l.name}`;const x=await loadLayer(l,i,my);if(my!==token)return;if(!x)continue;group.add(x.root);layers.push(x);mixers.push(...x.mixers);meshes+=x.meshes;anims+=x.anim;if(x.source==='FBX')fbxN++;else objN++}if(!layers.length)throw new Error('Không layer nào load thành công');root=group;scene.add(group);ui.layerCount.textContent=layers.length;ui.meshCount.textContent=meshes;ui.animCount.textContent=anims;ui.currentMeta.textContent=`${layers.length} layer · ${fbxN} FBX · ${objN} OBJ fallback · ${meshes} mesh`;seqIndex=0;seqTime=0;applyVisibility();fit(group);message(`Đã dựng ${effect.label}: ${layers.length} layer, ${meshes} mesh, ${anims} animation clip.`)}catch(e){console.error(e);if(my===token){error(`Không thể dựng “${effect.label}”: ${e.message}`);message('Load effect thất bại.')}}finally{if(my===token)loading(false)}}

function togglePlay(){playing=!playing;ui.play.textContent=playing?'⏸ Pause':'▶ Play';message(playing?'Effect đang chạy.':'Effect đã tạm dừng.')}
function restart(){seqIndex=0;seqTime=0;for(const x of mixers){x.mixer.stopAllAction();for(const c of x.obj.animations||[])x.mixer.clipAction(c).reset().play()}playing=true;ui.play.textContent='⏸ Pause';applyVisibility();message('Đã chạy lại effect từ đầu.')}
function resize(){const r=ui.viewer.getBoundingClientRect(),w=Math.max(1,r.width|0),h=Math.max(1,r.height|0);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),speed=Number(ui.speed.value);if(playing){for(const x of mixers)x.mixer.update(dt*speed);if(ui.mode.value==='sequence'&&layers.length>1&&speed>0){seqTime+=dt*speed;if(seqTime>=.12){seqTime%=.12;seqIndex=(seqIndex+1)%layers.length;applyVisibility()}}}controls.autoRotate=ui.autoRotate.checked;controls.update();renderer.render(scene,camera);frames++;const now=performance.now(),span=now-fpsAt;if(span>=700){ui.fps.textContent=Math.round(frames*1000/span);frames=0;fpsAt=now}}

ui.search.addEventListener('input',renderCatalog);ui.play.onclick=togglePlay;ui.restart.onclick=restart;ui.focus.onclick=()=>root&&fit(root);ui.speed.oninput=()=>ui.speedValue.textContent=`${Number(ui.speed.value).toFixed(2)}×`;ui.mode.onchange=()=>{seqIndex=0;seqTime=0;applyVisibility()};ui.blend.onchange=refreshMaterials;ui.transparent.onchange=refreshMaterials;ui.depthWrite.onchange=refreshMaterials;ui.gridToggle.onchange=()=>grid.visible=ui.gridToggle.checked;window.addEventListener('resize',resize);new ResizeObserver(resize).observe(ui.viewer);
resize();animate();loadCatalog();
