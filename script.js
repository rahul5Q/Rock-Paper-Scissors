// --- Persistent scores and sound with reset & mute ---

// Load scores from localStorage or start at 0
let computer_score = parseInt(localStorage.getItem('computer_score')) || 0;
let user_score = parseInt(localStorage.getItem('user_score')) || 0;

const computerScoreRef = document.getElementById("computer_score");
const userScoreRef = document.getElementById("user_score");
const result_ref = document.getElementById("result");

const winAudioElem = document.getElementById("winSound");
const loseAudioElem = document.getElementById("loseSound");
const drawAudioElem = document.getElementById("drawSound");

const resetBtn = document.getElementById("resetBtn");
const muteBtn = document.getElementById("muteBtn");

// track mute state
let muted = (localStorage.getItem('rps_muted') === 'true') || false;
updateMuteUI();

// update UI scores initially
computerScoreRef.textContent = computer_score;
userScoreRef.textContent = user_score;

// choices mapping (win/lose/draw)
let choices_object = {
  rock: { rock: "draw", scissor: "win", paper: "lose" },
  scissor: { rock: "lose", scissor: "draw", paper: "win" },
  paper: { rock: "win", scissor: "lose", paper: "draw" },
};

// main checker invoked by button clicks
function checker(input) {
  const choices = ["rock", "paper", "scissor"];
  const num = Math.floor(Math.random() * 3);
  const computer_choice = choices[num];

  document.getElementById("comp_choice").innerHTML =
    `Computer chose <span>${computer_choice.toUpperCase()}</span>`;
  document.getElementById("user_choice").innerHTML =
    `You chose <span>${input.toUpperCase()}</span>`;

  const outcome = choices_object[input][computer_choice];

  if (outcome === 'win') {
    result_ref.style.cssText = "background-color:#cefdce;color:#689f38;";
    result_ref.innerHTML = "YOU WIN!";
    user_score++;
    playSound('win');
  } else if (outcome === 'lose') {
    result_ref.style.cssText = "background-color:#ffdde0;color:#d32f2f;";
    result_ref.innerHTML = "YOU LOSE!";
    computer_score++;
    playSound('lose');
  } else {
    result_ref.style.cssText = "background-color:#e5e5e5;color:#808080;";
    result_ref.innerHTML = "DRAW!";
    playSound('draw');
  }

  // update UI and localStorage
  computerScoreRef.textContent = computer_score;
  userScoreRef.textContent = user_score;
  localStorage.setItem('computer_score', computer_score);
  localStorage.setItem('user_score', user_score);
}

// Reset button handler
resetBtn.addEventListener('click', () => {
  if (confirm("Reset scores?")) {
    user_score = 0;
    computer_score = 0;
    computerScoreRef.textContent = computer_score;
    userScoreRef.textContent = user_score;
    localStorage.setItem('computer_score', computer_score);
    localStorage.setItem('user_score', user_score);
    result_ref.innerHTML = '';
  }
});

// Mute toggle
muteBtn.addEventListener('click', () => {
  muted = !muted;
  localStorage.setItem('rps_muted', muted);
  updateMuteUI();
});

function updateMuteUI() {
  muteBtn.textContent = muted ? "🔇" : "🔊";
}

// Play sound helper: tries <audio> tag first, otherwise fallback beep via WebAudio
function playSound(type) {
  if (muted) return;

  try {
    if (type === 'win' && winAudioElem && winAudioElem.play) {
      winAudioElem.currentTime = 0;
      winAudioElem.play().catch(()=>{ beep(880, 0.12); });
      return;
    }
    if (type === 'lose' && loseAudioElem && loseAudioElem.play) {
      loseAudioElem.currentTime = 0;
      loseAudioElem.play().catch(()=>{ beep(220, 0.14); });
      return;
    }
    if (type === 'draw' && drawAudioElem && drawAudioElem.play) {
      drawAudioElem.currentTime = 0;
      drawAudioElem.play().catch(()=>{ beep(440, 0.08); });
      return;
    }
  } catch (err) {
    // ignore and fallback to beep
  }

  // Fallback beep
  if (type === 'win') beep(880, 0.12);
  if (type === 'lose') beep(220, 0.14);
  if (type === 'draw') beep(440, 0.08);
}

// Simple WebAudio beep fallback (freq in Hz, duration in seconds)
function beep(freq = 440, duration = 0.1) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.value = 0.05; // low volume
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
    setTimeout(() => { o.stop(); ctx.close(); }, duration * 1000 + 20);
  } catch (e) { /* no audio support */ }
}
