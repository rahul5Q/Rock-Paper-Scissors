// Persistent scores and sound with reset & mute

// Load previous scores
let computer_score = parseInt(localStorage.getItem('computer_score')) || 0;
let user_score = parseInt(localStorage.getItem('user_score')) || 0;

// References
const computerScoreRef = document.getElementById("computer_score");
const userScoreRef = document.getElementById("user_score");
const result_ref = document.getElementById("result");

const winAudioElem = document.getElementById("winSound");
const loseAudioElem = document.getElementById("loseSound");
const drawAudioElem = document.getElementById("drawSound");

const resetBtn = document.getElementById("resetBtn");
const muteBtn = document.getElementById("muteBtn");

// Load mute preference
let muted = (localStorage.getItem('rps_muted') === 'true') || false;
updateMuteUI();

// Display initial scores
computerScoreRef.textContent = computer_score;
userScoreRef.textContent = user_score;

// Rules
const choices_object = {
  rock: { rock: "draw", scissor: "win", paper: "lose" },
  scissor: { rock: "lose", scissor: "draw", paper: "win" },
  paper: { rock: "win", scissor: "lose", paper: "draw" },
};

// Main function
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
    result_ref.style.cssText = "background-color:#cefdce;color:#2e7d32;";
    result_ref.innerHTML = "YOU WIN!";
    user_score++;
    playSound('win');
  } else if (outcome === 'lose') {
    result_ref.style.cssText = "background-color:#ffdde0;color:#b71c1c;";
    result_ref.innerHTML = "YOU LOSE!";
    computer_score++;
    playSound('lose');
  } else {
    result_ref.style.cssText = "background-color:#e5e5e5;color:#616161;";
    result_ref.innerHTML = "DRAW!";
    playSound('draw');
  }

  computerScoreRef.textContent = computer_score;
  userScoreRef.textContent = user_score;

  // Save progress
  localStorage.setItem('computer_score', computer_score);
  localStorage.setItem('user_score', user_score);
}

// Reset Scores
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

// Play sounds
function playSound(type) {
  if (muted) return;

  try {
    if (type === 'win' && winAudioElem) {
      winAudioElem.currentTime = 0;
      winAudioElem.play().catch(() => beep(880, 0.12));
    } else if (type === 'lose' && loseAudioElem) {
      loseAudioElem.currentTime = 0;
      loseAudioElem.play().catch(() => beep(220, 0.14));
    } else if (type === 'draw' && drawAudioElem) {
      drawAudioElem.currentTime = 0;
      drawAudioElem.play().catch(() => beep(440, 0.08));
    }
  } catch {
    // fallback beep
    if (type === 'win') beep(880, 0.12);
    if (type === 'lose') beep(220, 0.14);
    if (type === 'draw') beep(440, 0.08);
  }
}

// Fallback sound generator
function beep(freq = 440, duration = 0.1) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.value = 0.05;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
    setTimeout(() => { o.stop(); ctx.close(); }, duration * 1000 + 20);
  } catch (e) {}
}
