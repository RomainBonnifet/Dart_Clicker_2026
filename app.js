// sélecteur data
const inputPlayerName = document.querySelector("#playerName");
let baseScore = 301;

//sélecteurs algo
const arrayPlayers = [];
const arrayCurrentVolley = [];
let currentPlayerName = "";
let currentPlayerIndex = 0;
let gameIsStarted = false;

//sélecteur display
const displayInfoContainer = document.querySelector(".info");
const divPlayersContainer = document.createElement("div");
displayInfoContainer.appendChild(divPlayersContainer);

class Player {
  constructor(name) {
    this.name = name;
    this.score = baseScore;
    this.lastScores = [];
    this.isCurrentPlayer = false;
  }
}

// écouteur d'event sur le formulaire pour ajouter un joueur
let playerForm = document.querySelector("#formAddPlayer");
// on annule le comportement par défault du form pour créer un nouveau joueur
playerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  //on s'assure que la partie n'est pas lancée pour pouvoir continuer à ajouter des joueurs
  if (!gameIsStarted) {
    createNewPlayer();
  }
});

function createNewPlayer() {
  try {
    // Vérification du champs
    if (inputPlayerName.value.trim() === "") {
      throw new Error("Le nom du joueur ne peut être vide.");
    }
    if (inputPlayerName !== "") {
      //Créer un nouveau joueur grace au nom renseigné par l'utilisateur
      let newPlayer = new Player(inputPlayerName.value);
      //Ajoute chaques joueurs au tableau des joueurs
      arrayPlayers.push(newPlayer);
      //Vide le champs du formulaire
      inputPlayerName.value = "";
      //Affiche les joueurs + leurs points de départ dans le DOM
      displayLastPlayer();
    }
    //Si un joueurs est ajouté, on appel la fonction qui affiche le bouton Start dans le DOM
    if (arrayPlayers.length === 1) {
      createStartBtn();
    }
    //Gestion & affichage de l'erreur
  } catch (error) {
    alert(error.message);
  }
}

function displayLastPlayer() {
  divPlayersContainer.classList.add("divPlayersContainer");
  //Défini le joueur à afficher : la dernière entrée du tableau des joueurs
  const player = arrayPlayers[arrayPlayers.length - 1];
  //Créer une div d'affichage individuelle du joueur qui ira dans la div d'affichage globale des joueurs dans le DOM
  const divPlayerStats = document.createElement("div");
  //ajoute une class pour le css
  divPlayerStats.classList.add("playerStat");
  // On ajoute un ID unique basé sur l'index du joueur pour actualiser plus tard l'affichage du bon joueur
  divPlayerStats.id = `player-container-${arrayPlayers.length - 1}`;
  // Ajoute la div indiv du joueur dans la div d'affichage des joueurs du DOM
  divPlayersContainer.appendChild(divPlayerStats);
  //Même principe, mais pour le nom du joueur
  const divNameStat = document.createElement("div");
  divNameStat.classList.add("nameStat");
  divNameStat.innerText = player.name;
  divPlayerStats.appendChild(divNameStat);
  // pour l'historique de la dernière vollée
  const volleyStatsContainer = document.createElement("div");
  volleyStatsContainer.classList.add("volleyStatsContainer");
  divPlayerStats.appendChild(volleyStatsContainer);
  for (let i = 0; i < 3; i++) {
    const volleyStatsCell = document.createElement("div");
    volleyStatsCell.classList.add("cellStat");
    volleyStatsCell.innerText = "00";
    volleyStatsContainer.appendChild(volleyStatsCell);
  }
  // & le score de base du joueur
  const divScoreStat = document.createElement("div");
  divScoreStat.classList.add("scoreStat");
  divScoreStat.innerText = player.score;
  divPlayerStats.appendChild(divScoreStat);
}

function updateDisplay() {
  // On cible le conteneur spécifique du joueur qui vient de jouer
  const playerDiv = document.querySelector(
    `#player-container-${currentPlayerIndex}`,
  );
  if (playerDiv) {
    //update de l'affichage du score total  du joueur
    const scoreDiv = playerDiv.querySelector(".scoreStat");
    scoreDiv.innerText = arrayPlayers[currentPlayerIndex].score;
    //update de l'affichage des cellules qui correspondent à chaques fléchettes de chaques derniers lancés du joueur
    const lastVolley =
      arrayPlayers[currentPlayerIndex].lastScores[
        arrayPlayers[currentPlayerIndex].lastScores.length - 1
      ];
    console.log(lastVolley);
    console.log(playerDiv);

    const darts = ["dart1", "dart2", "dart3"];
    const cells = playerDiv.querySelectorAll(".cellStat");

    darts.forEach((dart, index) => {
      if (cells[index]) {
        if (lastVolley[dart] <= 9) {
          cells[index].textContent = "0" + lastVolley[dart];
        } else {
          cells[index].textContent = lastVolley[dart];
        }
      }
    });
  }
}

//Créer un bouton pour commencer la partie une fois qu'au moins un joueur a été ajouté et le supprime quand la partie est lancée
function createStartBtn() {
  let missedBtn = document.querySelector(".missedBtn");
  if (missedBtn) {
    missedBtn.remove();
  }
  let infoGame = document.querySelector(".infoGame");
  if (infoGame) {
    infoGame.remove();
  }
  //Créer le bouton
  const startBtn = document.createElement("button");
  //Créer le texte du bonton
  const startBtnText = document.createTextNode("Start");
  //ajoute une class au btn
  startBtn.classList.add("startBtn");
  //Ajoute le texte dans le bouton
  startBtn.appendChild(startBtnText);
  //Ajoute  le bouton dans la div d'affichage des infos
  displayInfoContainer.prepend(startBtn);
  //Créer un event listener pour lancer une fonction quand on clic sur le bouton
  startBtn.addEventListener("click", () => {
    //partie lancée donc l'ajout de joueur sera bloqué et missedBtn sera activé
    gameIsStarted = true;
    //on définie le premier joueur en currentPlayer
    arrayPlayers[currentPlayerIndex].isCurrentPlayer = true;
    //ajoute le bouton Raté à la place
    addMissedBtn();

    //on lance le event listener sur la cible
    handleDartScore();
    //Partie lancée donc on retire le bouton Start
    startBtn.remove();
  });
}

function defineNextPlayer() {
  // retire le statut de joueur actuel
  arrayPlayers[currentPlayerIndex].isCurrentPlayer = false;
  //  vérifie si on est à la fin de la liste
  if (currentPlayerIndex === arrayPlayers.length - 1) {
    currentPlayerIndex = 0; // On revient au début
  } else {
    currentPlayerIndex++;
  }
  //définit le nouveau joueur actuel
  arrayPlayers[currentPlayerIndex].isCurrentPlayer = true;
  //relance la gestion du score
  handleVolleyScore();
}

function handleDartScore() {
  //on utilise une promesse car on attend le clic du user pour continuer le script
  return new Promise((resolve) => {
    //initialise la fonction qui va gérer la data en fonction du click user
    const onClick = (event) => {
      playDartSounds();
      //setup l'event click sur chaques zones
      const zone = event.currentTarget;
      //récupère le type de zone (simple ou double) de l'attribut data-type dans le HTML
      const type = zone.dataset.type;
      //idem pour data-value
      const value = Number(zone.dataset.value);
      //applique le multiple en fonction de la zone cliquée
      let score = value;
      if (type === "double") score *= 2;
      if (type === "triple") score *= 3;
      //retire l'event click pour s'assurer un seul score par appel
      zones.forEach((z) => z.removeEventListener("click", onClick));
      //ajoute le résultat de la flèchette au tableau de la volée en cours
      arrayCurrentVolley.push(score);
      //retourne la promesse score
      resolve(score);
      handleVolleyScore();
    };
    const zones = document.querySelectorAll(".zone");
    zones.forEach((zone) => {
      zone.addEventListener("click", onClick);
    });
  });
}

function addMissedBtn() {
  if (!gameIsStarted) return;
  let missedBtn = document.createElement("button");
  missedBtn.classList.add("missedBtn");
  missedBtn.classList.add("zone");
  missedBtn.innerText = "Raté: +0";
  missedBtn.setAttribute("data-value", "00");
  displayInfoContainer.prepend(missedBtn);
  return missedBtn;
}

//gère le résultat de la vollée des 3 fléchettes, enregistre l'historique de chaques dart et le score total de chaques volée, par joueur
function handleVolleyScore() {
  //on s'assure que seulement 3 fléchettes seront comptabilisée
  if (arrayCurrentVolley.length < 3) {
    handleDartScore();
  } else {
    //une fois les 3 darts lancées,
    //on remplis l'objet lastScores avec le résultat de chaque dart (pour conserver un historique des lancés)
    //et le total de points de la vollée
    let volleySum = arrayCurrentVolley.reduce((acc, value) => acc + value, 0);
    let currentPlayerVolley = {
      dart1: arrayCurrentVolley[0],
      dart2: arrayCurrentVolley[1],
      dart3: arrayCurrentVolley[2],
      total: volleySum,
    };
    //sauvegarde de l'historique des vollées
    arrayPlayers[currentPlayerIndex].lastScores.push(currentPlayerVolley);
    //update du score restant du joueur en cours
    arrayPlayers[currentPlayerIndex].score -= volleySum;
    //on vide le tableau arrayCurrentVolley
    arrayCurrentVolley.length = 0;
    // TODO Fonction pour valider ou non la vollée actuelle
    // alert("Valider la vollée ?");
    //on vérifie si un joueur a gagné à chaques décrémentation du score total
    checkScore(volleySum);
  }
}

//vérifie si le joueur à atteint 0 : Fin de la partie
// si score négatif, on annule la dernière vollée
function checkScore(volleySum) {
  const player = arrayPlayers[currentPlayerIndex];
  if (player.score === 0) {
    alert(player.name + " a gagné !");
    resetGameLoop();
    return;
  }
  if (player.score < 0) {
    alert("Vous devez finir par un score exact !");
    // on annule la volée précédente
    player.score += volleySum;
  }
  updateDisplay();

  defineNextPlayer();
}

// pour enfin re-afficher le bouton Start qui va relancer une boucle de jeu.
function resetGameLoop() {
  //On va boucler sur chaques joueurs de arrayPlayers pour remettre score à la valeur d'origine,
  // vider le tableau d'historiques du joueurs lastScores,
  // et remettre à false isCurrentPlayer
  arrayPlayers.forEach((player) => {
    player.score = 301;
    player.lastScores = [];
    player.isCurrentPlayer = false;
    resetScoresDisplay();
  });
  //on remet la possibilité de rajouter un joueur avant de relancer une autre partie
  gameIsStarted = false;
  //remet l'index du joueur actuel à zéro
  currentPlayerIndex = 0;
  //retire le bouton Raté
  createStartBtn();
}

function resetScoresDisplay() {
  const scoresDivs = document.querySelectorAll(".scoreStat");
  scoresDivs.forEach((scoreDiv) => {
    scoreDiv.innerText = baseScore;
  });
  const cells = document.querySelectorAll(".cellStat");
  cells.forEach((cell) => {
    cell.innerText = "00";
  });
}

function playDartSounds() {
  const sound = new Audio("sounds/dart.mp3");
  sound.play().catch((err) => {
    console.error("Erreur lecture audio :", err);
  });
}

function sumArray(arr) {
  return arr.reduce((acc, value) => acc + value, 0);
}

