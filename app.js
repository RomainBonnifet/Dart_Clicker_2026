// ============================================================
// CONFIGURATION
// ============================================================
const BASE_SCORE = 301; // TODO : ajouter la possibilité de changer la valeur du score de base par le user (501)
// ============================================================
// SÉLECTEURS DOM
// ============================================================
const inputPlayerName     = document.querySelector("#playerName");
const displayInfoContainer = document.querySelector(".info");
const divPlayersContainer  = document.querySelector(".divPlayersContainer");
// ============================================================
// ÉTAT DU JEU
// ============================================================
const arrayPlayers      = [];
let currentPlayerIndex  = 0;
let gameIsStarted       = false;
// Vollée en cours : tableau de max 3 scores
let arrayCurrentVolley  = [];
// Verrou anti-double-clic
let isProcessingDart    = false;
// ============================================================
// CLASSE JOUEUR
// ============================================================
class Player {
  constructor(name) {
    this.name           = name;
    this.score          = BASE_SCORE; // BUG CORRIGÉ : utilise la constante
    this.lastScores     = [];
    this.isCurrentPlayer = false;
  }
}
// ============================================================
// AJOUT DE JOUEURS
// ============================================================
const playerForm = document.querySelector("#formAddPlayer");

playerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!gameIsStarted) {
    createNewPlayer();
  }
});

function createNewPlayer() {
  const name = inputPlayerName.value.trim(); //Retire les éventuels espaces

  if (name === "") {
    alert("Le nom du joueur ne peut être vide.");
    inputPlayerName.value = ""; 
    return;
  }
  if (name.length > 12 ) {
    alert("Le nom du joueur ne doit pas dépasser 12 caractères");
    inputPlayerName.value = "";
    return;
  }
  const newPlayer = new Player(name);
  arrayPlayers.push(newPlayer);
  inputPlayerName.value = "";
  displayNewPlayer(newPlayer, arrayPlayers.length - 1);
  // si au moins un joueur est ajouté, on peut lancer la partie
  if (arrayPlayers.length === 1) {
    createStartBtn();
    inputPlayerName.value = "";
  }
}

// ============================================================
// AFFICHAGE DES JOUEURS
// ============================================================

// BUG CORRIGÉ : renommée pour clarté, reçoit le joueur ET son index en paramètre
function displayNewPlayer(player, index) {

  const divPlayerStats = document.createElement("div");
  divPlayerStats.classList.add("playerStat");
  divPlayerStats.id = `player-container-${index}`;
  divPlayersContainer.appendChild(divPlayerStats);
  divPlayersContainer.classList.remove('hidden')

  const divNameStat = document.createElement("div");
  divNameStat.classList.add("nameStat");
  divNameStat.innerText = player.name;
  divPlayerStats.appendChild(divNameStat);

  const volleyStatsContainer = document.createElement("div");
  volleyStatsContainer.classList.add("volleyStatsContainer");
  divPlayerStats.appendChild(volleyStatsContainer);

  for (let i = 0; i < 3; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cellStat");
    cell.innerText = "00";
    volleyStatsContainer.appendChild(cell);
  }

  const divScoreStat = document.createElement("div");
  divScoreStat.classList.add("scoreStat");
  divScoreStat.innerText = player.score;
  divPlayerStats.appendChild(divScoreStat);

  divPlayersContainer.appendChild(divPlayerStats)
}

// Met à jour l'affichage du score et des cellules après validation d'une vollée
function updateDisplayAfterVolley() {
  const playerDiv = document.querySelector(`#player-container-${currentPlayerIndex}`);
  if (!playerDiv) return;

  const player   = arrayPlayers[currentPlayerIndex];
  const scoreDiv = playerDiv.querySelector(".scoreStat");
  scoreDiv.innerText = player.score;
  if (player.score < 10) {
    scoreDiv.innerText = "00" + player.score
  }
  else if (player.score < 100) {
    scoreDiv.innerText = "0" + player.score
  }

  const lastVolley = player.lastScores[player.lastScores.length - 1];
  const cells      = playerDiv.querySelectorAll(".cellStat");

  ["dart1", "dart2", "dart3"].forEach((dart, index) => {
    if (cells[index]) {
      const val = lastVolley[dart];
      cells[index].textContent = val <= 9 ? "0" + val : String(val);
    }
  });
}

// NOUVEAU : met à jour le panneau live (score du joueur décrémenté en temps réel)
function updateLivePanel(dartScore) {
  const player        = arrayPlayers[currentPlayerIndex];
  const dartNum       = arrayCurrentVolley.length; // après push, c'est déjà 1, 2 ou 3

  const liveDartDiv   = document.querySelector(`#live-dart-${dartNum}`);
  const liveScoreDiv  = document.querySelector("#live-score");
  const liveNameDiv   = document.querySelector("#live-player-name");

  if (liveNameDiv)  liveNameDiv.innerText  = player.name;
  if (liveDartDiv)  liveDartDiv.innerText  = formatScore(dartScore);

  // Score décrémenté temporairement pour l'affichage live
  const provisionalScore = player.score - arrayCurrentVolley.reduce((a, b) => a + b, 0);
  if (liveScoreDiv) {
    liveScoreDiv.innerText = provisionalScore < 0 ? "⚠️ Bust !" : provisionalScore;
    liveScoreDiv.style.color = provisionalScore < 0 ? "#e85d5d" : "#5ec8a0";
  }
}

// Réinitialise le panneau live pour le prochain joueur
function resetLivePanel() {
  const player = arrayPlayers[currentPlayerIndex];
  document.querySelector("#live-player-name").innerText = player.name;
  document.querySelector("#live-score").innerText = player.score;
  document.querySelector("#live-score").style.color = "";
  ["#live-dart-1","#live-dart-2","#live-dart-3"].forEach(id => {
    document.querySelector(id).innerText = "—";
  });
}

function formatScore(val) {
  return val <= 9 ? "0" + val : String(val);
}

// ============================================================
// BOUTON START
// ============================================================
function createStartBtn() {
  // Nettoyage des éléments précédents
  document.querySelector(".missedBtn")?.remove();
  document.querySelector(".infoGame")?.remove();
  document.querySelector(".livePanel")?.remove();

  const startBtn = document.createElement("button");
  startBtn.classList.add("startBtn");
  startBtn.textContent = "Start";
  displayInfoContainer.prepend(startBtn);

  startBtn.addEventListener("click", () => {
    gameIsStarted = true;
    startBtn.remove();

    arrayPlayers[currentPlayerIndex].isCurrentPlayer = true;

    addMissedBtn();
    createLivePanel();
    resetLivePanel();
    listenForDart();
  });
}

// ============================================================
// PANNEAU LIVE (NOUVEAU)
// ============================================================
function createLivePanel() {
  document.querySelector(".livePanel")?.remove();

  const panel = document.createElement("div");
  panel.classList.add("livePanel");
  panel.innerHTML = `
    <div class="live-title">Tour de  <span id="live-player-name">—</span> 🎯</div>
    <div class="live-darts">
      <div class="live-dart-cell"><span class="live-dart-label">🎯 1</span><span id="live-dart-1">—</span></div>
      <div class="live-dart-cell"><span class="live-dart-label">🎯 2</span><span id="live-dart-2">—</span></div>
      <div class="live-dart-cell"><span class="live-dart-label">🎯 3</span><span id="live-dart-3">—</span></div>
    </div>
    <div class="live-score-row">Score restant : <span id="live-score">—</span></div>
  `;
  divPlayersContainer.prepend(panel);
}

// ============================================================
// BOUTON RATÉ
// ============================================================
function addMissedBtn() {
  if (!gameIsStarted) return;
  document.querySelector(".missedBtn")?.remove();

  const missedBtn = document.createElement("button");
  missedBtn.classList.add("missedBtn", "zone");
  missedBtn.innerText = "Raté : +0";
  missedBtn.setAttribute("data-value", "0");
  missedBtn.setAttribute("data-type", "simple");
  displayInfoContainer.prepend(missedBtn);
}

// ============================================================
// LOGIQUE DE JEU — ÉCOUTE D'UNE FLÉCHETTE
// ============================================================

function listenForDart() {
  //On s'assure de n'avoir que 3 fléchettes à écouter
  if (arrayCurrentVolley.length >= 3) return;

  const zones = document.querySelectorAll(".zone");
  //On initialise la fonction qui sera call par l'écouteur et qui va traiter le score chaques fléchette
  const onClick = (event) => {
    // Verrou anti-double-clic
    if (isProcessingDart) return;
    isProcessingDart = true;
    // Joue un son à chaques fléchette comptabilisée
    playDartSounds();

    const zone  = event.currentTarget;
    const type  = zone.dataset.type;
    const value = Number(zone.dataset.value);

    let score = value;
    if (type === "double") score *= 2;
    if (type === "triple") score *= 3;

    // Détache tous les listeners
    zones.forEach((z) => z.removeEventListener("click", onClick));
    // Ajoute la valeur du score de la fléchette à la vollée en cours
    arrayCurrentVolley.push(score);
    // Met à jour le panneau live
    updateLivePanel(score);
    // Retire le verrou anti-double clic
    isProcessingDart = false;
    // Si la vollée est complète, on demande validation
    if (arrayCurrentVolley.length === 3) {
      showVolleyValidationModal();
    } else {
      // Sinon, on ré-écoute pour la prochaine fléchette
      listenForDart();
    }
  };

  zones.forEach((zone) => zone.addEventListener("click", onClick));
}

// ============================================================
// MODALE DE VALIDATION DE VOLLÉE (NOUVEAU — remplace alert)
// ============================================================
function showVolleyValidationModal() {
  const [d1, d2, d3] = arrayCurrentVolley;
  const total         = d1 + d2 + d3;
  const player        = arrayPlayers[currentPlayerIndex];
  const newScore      = player.score - total;

  // Crée la modale
  const overlay = document.createElement("div");
  overlay.classList.add("modalOverlay");

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">✅ Valider le tour ?</div>
      <div class="modal-player">${player.name}</div>
      <div class="modal-darts">
        <span>🎯 ${formatScore(d1)}</span>
        <span>🎯 ${formatScore(d2)}</span>
        <span>🎯 ${formatScore(d3)}</span>
      </div>
      <div class="modal-total">Total : <strong>${total}</strong> pts</div>
      <div class="modal-score ${newScore < 0 ? "bust" : ""}">
        ${newScore < 0 ? "⚠️ Bust ! Vollée annulée automatiquement" : `Nouveau score : <strong>${newScore}</strong>`}
      </div>
      <div class="modal-buttons">
        <button id="btn-validate" class="btn-validate">✅ Valider</button>
        ${newScore >= 0 ? '<button id="btn-cancel" class="btn-cancel">❌ Annuler</button>' : ''}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Si bust, seul "Valider" est disponible (annulation automatique)
  document.querySelector("#btn-validate")?.addEventListener("click", () => {
    overlay.remove();
    applyVolley(newScore < 0); // true = annuler si bust
  });

  document.querySelector("#btn-cancel")?.addEventListener("click", () => {
    overlay.remove();
    cancelVolley();
  });
}

// ============================================================
// APPLICATION / ANNULATION DE LA VOLLÉE
// ============================================================

// REFACTORISÉ : responsabilité unique — appliquer une vollée validée
function applyVolley(isBust) {
  const player = arrayPlayers[currentPlayerIndex];

  if (isBust) {
    // Score bust : on ne modifie pas le score
    arrayCurrentVolley.length = 0;
    resetLivePanel();
    listenForDart();
    return;
  }

  const total   = arrayCurrentVolley.reduce((acc, v) => acc + v, 0);
  const [d1,d2,d3] = arrayCurrentVolley;

  // Sauvegarde de l'historique
  player.lastScores.push({ dart1: d1, dart2: d2, dart3: d3, total });
  player.score -= total;

  // Vide la vollée
  arrayCurrentVolley.length = 0;

  updateDisplayAfterVolley();

  if (player.score === 0) {
    alert(`🏆 ${player.name} a gagné !`);
    resetGameLoop();
    return;
  }

  defineNextPlayer();
}

// Annulation de vollée par le joueur (bouton "Annuler")
function cancelVolley() {
  arrayCurrentVolley.length = 0;
  resetLivePanel();
  listenForDart();
}

// ============================================================
// PASSAGE AU JOUEUR SUIVANT
// ============================================================
function defineNextPlayer() {
  arrayPlayers[currentPlayerIndex].isCurrentPlayer = false;

  currentPlayerIndex = (currentPlayerIndex + 1) % arrayPlayers.length;

  arrayPlayers[currentPlayerIndex].isCurrentPlayer = true;

  resetLivePanel();
  listenForDart();
}

// ============================================================
// RESET DU JEU
// ============================================================
function resetGameLoop() {
  arrayPlayers.forEach((player) => {
    player.score          = BASE_SCORE; // BUG CORRIGÉ : utilise la constante
    player.lastScores     = [];
    player.isCurrentPlayer = false;
  });

  gameIsStarted          = false;
  currentPlayerIndex     = 0;
  arrayCurrentVolley.length = 0;

  resetScoresDisplay();
  createStartBtn();
}

function resetScoresDisplay() {
  document.querySelectorAll(".scoreStat").forEach((div) => {
    div.innerText = BASE_SCORE;
  });
  document.querySelectorAll(".cellStat").forEach((cell) => {
    cell.innerText = "00";
  });
}

// ============================================================
// AUDIO
// ============================================================
function playDartSounds() {
  const sound = new Audio("sounds/dart.mp3");
  sound.play().catch((err) => console.error("Erreur lecture audio :", err));
}
