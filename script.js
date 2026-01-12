/*
  Balance Scale — Toddler Numbers
  Minimal, touch-friendly drag-and-drop with live "physics" tilt.
*/

const state = {
  theme: 'apple',
  maxNumber: 10,
  target: 3,
  rightCount: 0,
  draggingEl: null,
  offsetX: 0,
  offsetY: 0,
};

const elems = {
  beam: document.getElementById('beam'),
  leftPan: document.getElementById('leftPan'),
  rightPan: document.getElementById('rightPan'),
  rightContent: document.getElementById('rightContent'),
  leftAssembly: document.querySelector('.left-assembly'),
  rightAssembly: document.querySelector('.right-assembly'),
  targetCard: document.getElementById('targetCard'),
  tray: document.getElementById('trayItems'),
  celebration: document.getElementById('celebration'),
  successAudio: document.getElementById('successAudio'),
  newRoundBtn: document.getElementById('newRoundBtn'),
  speakBtnEn: document.getElementById('speakBtnEn'),
  speakBtnRu: document.getElementById('speakBtnRu'),
  speakBtnEt: document.getElementById('speakBtnEt'),
  themeSelect: document.getElementById('themeSelect'),
  maxNumber: document.getElementById('maxNumber'),
  soundToggle: document.getElementById('soundToggle'),
};

function randomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setTarget(n){
  state.target = n;
  elems.targetCard.textContent = String(n);
  updateTilt();
}

function buildTray(){
  elems.tray.innerHTML = '';
  // Single endless item - always stays in tray
  const div = document.createElement('div');
  div.className = 'item';
  div.setAttribute('role','img');
  div.setAttribute('aria-label', state.theme === 'apple' ? 'Apple' : 'Cat');
  div.dataset.weight = 1;
  const img = document.createElement('img');
  img.src = `assets/${state.theme}.svg`;
  img.alt = '';
  div.appendChild(img);
  attachDragHandlers(div);
  elems.tray.appendChild(div);
}

function attachDragHandlers(el){
  el.addEventListener('pointerdown', (e)=>{
    e.preventDefault();
    // Clean up any existing dragging element first
    if(state.draggingEl && state.draggingEl.parentNode){
      state.draggingEl.parentNode.removeChild(state.draggingEl);
    }
    state.draggingEl = el.cloneNode(true); // clone so tray keeps items
    state.draggingEl.classList.add('dragging');
    document.body.appendChild(state.draggingEl);
    const rect = el.getBoundingClientRect();
    state.offsetX = e.clientX - rect.left;
    state.offsetY = e.clientY - rect.top;
    moveDrag(e.clientX, e.clientY);
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', (e)=>{
    if(state.draggingEl){ moveDrag(e.clientX, e.clientY); }
  });
  el.addEventListener('pointerup', (e)=>{
    finishDrag(e.clientX, e.clientY);
    try{ el.releasePointerCapture(e.pointerId); }catch(err){}
  });
  el.addEventListener('pointercancel', (e)=>{
    finishDrag(e.clientX, e.clientY);
    try{ el.releasePointerCapture(e.pointerId); }catch(err){}
  });
}

function finishDrag(x, y){
  if(state.draggingEl){
    const dropOk = dropIntoRightPan(x, y);
    if(state.draggingEl.parentNode){
      state.draggingEl.parentNode.removeChild(state.draggingEl);
    }
    state.draggingEl = null;
    if(dropOk){
      addObjectToRight();
    }
  }
}

function moveDrag(x,y){
  if(state.draggingEl){
    state.draggingEl.style.left = (x - state.offsetX) + 'px';
    state.draggingEl.style.top  = (y - state.offsetY) + 'px';
  }
}

function dropIntoRightPan(x,y){
  // Check if dropped on right assembly area with expanded hit zone for easier dropping
  const assemblyRect = elems.rightAssembly.getBoundingClientRect();
  const padding = 50; // Extra pixels around the drop zone
  return (
    x >= assemblyRect.left - padding && 
    x <= assemblyRect.right + padding && 
    y >= assemblyRect.top - padding && 
    y <= assemblyRect.bottom + padding
  );
}

function addObjectToRight(){
  state.rightCount += 1;
  const icon = document.createElement('img');
  icon.src = `assets/${state.theme}.svg`;
  icon.alt = '';
  icon.className = 'pile-item';
  
  // Create natural pile positioning
  const count = state.rightCount;
  const positions = getPilePosition(count);
  icon.style.position = 'absolute';
  icon.style.left = positions.x + '%';
  icon.style.bottom = positions.y + '%';
  icon.style.zIndex = count;
  icon.style.pointerEvents = 'none';
  icon.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,.15))';
  icon.style.transform = `rotate(${positions.rotation}deg)`;
  
  elems.rightContent.appendChild(icon);
  updateTilt();
  checkWin();
}

// Generate natural pile positions for items (percentages for responsiveness)
function getPilePosition(index){
  // Predefined positions for a natural-looking pile (up to 10 items)
  // Tighter spacing, 3-3-2-2 layout
  const pilePositions = [
    // Bottom row - 3 items
    { x: 10, y: 5, rotation: -5 },
    { x: 35, y: 7, rotation: 3 },
    { x: 60, y: 5, rotation: -3 },
    // Second row - 3 items
    { x: 10, y: 32, rotation: 5 },
    { x: 35, y: 34, rotation: -4 },
    { x: 60, y: 32, rotation: 6 },
    // Third row - 2 items
    { x: 22, y: 58, rotation: -6 },
    { x: 48, y: 60, rotation: 5 },
    // Top row - 2 items
    { x: 22, y: 82, rotation: 4 },
    { x: 48, y: 84, rotation: -3 },
  ];
  
  if(index <= pilePositions.length){
    return pilePositions[index - 1];
  }
  // Fallback for more than 10 items
  return {
    x: 30 + Math.random() * 40,
    y: 5 + (index - 1) * 8,
    rotation: (Math.random() - 0.5) * 20
  };
}

function resetRightPan(){
  elems.rightContent.innerHTML = '';
  state.rightCount = 0;
  updateTilt();
}

function updateTilt(){
  const diff = state.rightCount - state.target; // negative = left heavier, positive = right heavier
  const maxAngle = 15; // degrees
  // Scale the angle based on how far off we are relative to the target
  // This ensures even small differences show noticeable tilt
  // For target of 8, diff of 1 should still be visible
  let angle = 0;
  if(diff !== 0){
    // Use a formula that gives meaningful tilt for any non-zero difference
    // Minimum tilt of ~3 degrees for diff of 1, scaling up to maxAngle
    const scale = Math.min(Math.abs(diff), state.target) / state.target;
    const baseAngle = 3 + (maxAngle - 3) * scale;
    angle = diff > 0 ? baseAngle : -baseAngle;
    angle = Math.max(-maxAngle, Math.min(maxAngle, angle));
  }
  elems.beam.style.transform = `translateX(-50%) rotate(${angle}deg)`;
  
  // Counter-rotate pan assemblies to keep them vertical (gravity effect)
  elems.leftAssembly.style.transform = `rotate(${-angle}deg)`;
  elems.rightAssembly.style.transform = `rotate(${-angle}deg)`;
}

function checkWin(){
  if(state.rightCount === state.target){
    celebrate();
    showNextRoundButton();
  }
}

function showNextRoundButton(){
  elems.newRoundBtn.textContent = 'Next Round!';
  elems.newRoundBtn.classList.add('success');
  // Hide tray to prevent adding more items
  elems.tray.style.display = 'none';
}

function celebrate(){
  if(elems.soundToggle.checked){
    try { 
      elems.successAudio.volume = 0.4; // Keep applause not too loud
      elems.successAudio.currentTime = 0; 
      elems.successAudio.play(); 
    } catch(e){}
  }
  spawnConfetti();
}

function spawnConfetti(){
  elems.celebration.innerHTML = '';
  elems.celebration.classList.add('active');
  
  // Add dancing cat
  const cat = document.createElement('div');
  cat.className = 'dancing-cat';
  cat.textContent = '🐱';
  elems.celebration.appendChild(cat);
  
  setTimeout(()=>{
    elems.celebration.classList.remove('active');
    elems.celebration.innerHTML = '';
  }, 4000);
}

function startRound(){
  resetRightPan();
  const n = randomInt(1, state.maxNumber);
  setTarget(n);
  // Reset button state
  elems.newRoundBtn.textContent = 'New Round';
  elems.newRoundBtn.classList.remove('success');
  // Show tray again
  elems.tray.style.display = 'block';
}

// Controls

elems.newRoundBtn.addEventListener('click', startRound);

elems.speakBtnEn.addEventListener('click', () => speakNumber('en'));
elems.speakBtnRu.addEventListener('click', () => speakNumber('ru'));
elems.speakBtnEt.addEventListener('click', () => speakNumber('et'));

const russianNumbers = ['ноль','один','два','три','четыре','пять','шесть','семь','восемь','девять','десять'];
const estonianNumbers = ['null','üks','kaks','kolm','neli','viis','kuus','seitse','kaheksa','üheksa','kümme'];

// Cache voices to avoid delay
let voiceCache = { en: null, ru: null, et: null };
let voicesLoaded = false;

function loadVoices(){
  // Only load once to keep voices consistent within session
  if(voicesLoaded) return;
  
  const voices = speechSynthesis.getVoices();
  if(voices.length > 0){
    // Find best English voice - prefer female voices
    voiceCache.en = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) ||
                    voices.find(v => v.lang.startsWith('en')) || 
                    voices[0];
    // Find best Russian voice
    voiceCache.ru = voices.find(v => v.lang.startsWith('ru') && v.name.toLowerCase().includes('female')) ||
                    voices.find(v => v.lang.startsWith('ru')) || 
                    null;
    // Find best Estonian voice
    voiceCache.et = voices.find(v => v.lang.startsWith('et')) || null;
    
    voicesLoaded = true;
  }
}

// Load voices immediately and on change
if('speechSynthesis' in window){
  loadVoices();
  // Keep listening until voices are loaded
  speechSynthesis.onvoiceschanged = () => {
    if(!voicesLoaded) loadVoices();
  };
  // Warm up the speech synthesis engine
  const warmup = new SpeechSynthesisUtterance('');
  warmup.volume = 0;
  speechSynthesis.speak(warmup);
}

function speakNumber(lang){
  // For Estonian, use pre-recorded audio files since TTS support is poor
  if(lang === 'et'){
    playEstonianAudio(state.target);
    return;
  }
  
  if('speechSynthesis' in window){
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    let text = String(state.target);
    let voice = voiceCache.en;
    let langCode = 'en-US';
    
    if(lang === 'ru'){
      text = russianNumbers[state.target] || String(state.target);
      voice = voiceCache.ru;
      langCode = 'ru-RU';
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    if(voice) utterance.voice = voice;
    utterance.rate = 1.0; // Natural pace, not too slow
    utterance.pitch = 1.4; // Higher pitch = more cheerful/playful
    utterance.volume = 1.0; // Full volume
    speechSynthesis.speak(utterance);
  }
}

// Estonian audio files - using pre-recorded native pronunciation
const estonianAudioUrls = {
  1: 'assets/audio/et/üks.mp3',
  2: 'assets/audio/et/kaks.mp3',
  3: 'assets/audio/et/kolm.mp3',
  4: 'assets/audio/et/neli.mp3',
  5: 'assets/audio/et/viis.mp3',
  6: 'assets/audio/et/kuus.mp3',
  7: 'assets/audio/et/seitse.mp3',
  8: 'assets/audio/et/kaheksa.mp3',
  9: 'assets/audio/et/üheksa.mp3',
  10: 'assets/audio/et/kümme.mp3',
};

// Cache audio elements for instant playback
const estonianAudioCache = {};

function preloadEstonianAudio(){
  for(const [num, url] of Object.entries(estonianAudioUrls)){
    const audio = new Audio(url);
    audio.preload = 'auto';
    estonianAudioCache[num] = audio;
  }
}

function playEstonianAudio(num){
  const audio = estonianAudioCache[num];
  if(audio){
    audio.currentTime = 0;
    audio.play().catch(e => {
      // Fallback to speech synthesis if audio fails
      console.log('Estonian audio failed, falling back to TTS');
      speakEstonianFallback(num);
    });
  } else {
    speakEstonianFallback(num);
  }
}

function speakEstonianFallback(num){
  if('speechSynthesis' in window){
    speechSynthesis.cancel();
    const text = estonianNumbers[num] || String(num);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'et-EE';
    if(voiceCache.et) utterance.voice = voiceCache.et;
    utterance.rate = 1.0;
    utterance.pitch = 1.4;
    speechSynthesis.speak(utterance);
  }
}

// Preload Estonian audio on page load
preloadEstonianAudio();

elems.themeSelect.addEventListener('change', (e)=>{
  state.theme = e.target.value;
  buildTray();
  startRound(); // Reset the game with new theme
});

elems.maxNumber.addEventListener('change', (e)=>{
  state.maxNumber = parseInt(e.target.value, 10);
  startRound();
  buildTray();
});

// Init
buildTray();
startRound();
