// sélecteur data
const zones = document.querySelectorAll(".zone");
const inputPlayerName = document.querySelector("#playerName");

//sélecteurs algo
const arrayPlayers = [];
const arrayCurrentVolley = [];
let currentPlayerName = '';
let currentPlayerIndex = 0;

//sélecteur display
const displayInfoContainer = document.querySelector(".info");
const divPlayersContainer = document.createElement("div");
displayInfoContainer.appendChild(divPlayersContainer);


class Player {
  constructor(name) {
    this.name = name;
    this.score = 301;
    this.lastScores = [];
    this.isCurrentPlayer = false;
  }
}

// écouteur d'event sur le formulaire pour ajouter un joueur
let playerForm = document.querySelector("#formAddPlayer");
// on annule le comportement par défault du form pour créer un nouveau joueur
playerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createNewPlayer();
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
      // Affiche le nom du joueur
      console.log(`Nouveau joueur : ${newPlayer.name}`);
      //Ajoute chaques joueurs au tableau des joueurs
      arrayPlayers.push(newPlayer);
      //Vide le champs du formulaire
      inputPlayerName.value = "";
      //Affiche le tableau des joueurs dans la console
      console.log(arrayPlayers);
      displayLastPlayer();
    }
    if (arrayPlayers.length === 1) {
      createStartBtn();
    }
  } catch (error) {
    alert(error.message);
  }
}


function displayLastPlayer() {
  const player = arrayPlayers[arrayPlayers.length - 1];
  const divPlayerStats = document.createElement("div");
  // On ajoute un ID unique basé sur l'index du joueur pour actualiser l'affichage du bon joueur
  divPlayerStats.id = `player-container-${arrayPlayers.length - 1}`;
  divPlayersContainer.appendChild(divPlayerStats);

  const divNameStat = document.createElement("div");
  divNameStat.classList.add("nameStat");
  divNameStat.innerText = player.name;
  divPlayerStats.appendChild(divNameStat);

  const divScoreStat = document.createElement("div");
  divScoreStat.classList.add("scoreStat");
  // On lui donne une classe spécifique ou on la retrouve via le parent
  divScoreStat.innerText = player.score;
  divPlayerStats.appendChild(divScoreStat);
}

function updateDisplay() {
  // On cible le conteneur spécifique du joueur qui vient de jouer
  const playerDiv = document.querySelector(`#player-container-${currentPlayerIndex}`);
  if (playerDiv) {
    const scoreDiv = playerDiv.querySelector(".scoreStat");
    scoreDiv.innerText = arrayPlayers[currentPlayerIndex].score;
  }
}

function defineNextPlayer() {
  // 1. On retire le statut de joueur actuel
  arrayPlayers[currentPlayerIndex].isCurrentPlayer = false;

  // 2. On vérifie si on est à la fin de la liste
  if (currentPlayerIndex === arrayPlayers.length - 1) {
    currentPlayerIndex = 0; // On revient au début
    console.log('Retour au premier joueur');
    console.log(arrayPlayers);
    
  } else {
    currentPlayerIndex++; // On passe au suivant (équivalent à currentPlayerIndex += 1)
    console.log('Joueur suivant');
    console.log(arrayPlayers);
  }

  // 3. On définit le nouveau joueur actuel
  arrayPlayers[currentPlayerIndex].isCurrentPlayer = true;
  
  // 4. On relance la gestion du score
  handleVolleyScore();
}

//Créer un bouton pour commencer la partie une fois qu'au moins un joueur a été ajouté et le supprime quand la partie est lancée
function createStartBtn() {
  //Récupère la div dans laquelle apparaitra le bouton Start
  const divInfo = document.querySelector(".info");
  //Créer le bouton
  const startBtn = document.createElement("button");
  //Créer le texte du bonton
  const startBtnText = document.createTextNode("Start");
  //ajoute une class au btn
  startBtn.classList.add("startBtn");
  //Ajoute le texte dans le bouton
  startBtn.appendChild(startBtnText);
  //Ajoute  le bouton dans la div d'affichage des infos
  divInfo.appendChild(startBtn);
  //Créer un event listener pour lancer une fonction quand on clic sur le bouton
  startBtn.addEventListener("click", () => {
    define1stPlayer()
    console.log('partie lancée');
    
    //Partie lancée donc on retire le bouton Start
    startBtn.remove();
  });
}

function define1stPlayer() {
  arrayPlayers[currentPlayerIndex].isCurrentPlayer = true
  handleDartScore()
}


function handleDartScore() {
  //on utilise une promesse car on attend le clic du user pour continuer le script
  return new Promise((resolve) => {
    //initialise la fonction qui va gérer la data en fonction du click user
    const onClick = (event) => {
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
      zones.forEach(z => z.removeEventListener("click", onClick));

      //ajoute le résultat de la flèchette au tableau de la volée en cours
      arrayCurrentVolley.push(score);
      console.log(arrayCurrentVolley);
      console.log("Score ajouté :", score);
      //retourne la promesse score
      resolve(score);
      handleVolleyScore()
    };
    //
    zones.forEach((zone) => {
      zone.addEventListener("click", onClick);
    });
  });
}

//gère le résultat de la vollée des 3 fléchettes, enregistre l'historique de chaques dart et le total de chaques volée, par joueur
function handleVolleyScore() {
  //on s'assure que seulement 3 fléchettes seront comptabilisée
  if (arrayCurrentVolley.length < 3) {
    handleDartScore()
    console.log(arrayCurrentVolley);
  } else {
    //une fois les 3 darts lancées, 
    //on remplis l'objet lastScores avec le résultat de chaque dart (pour conserver un historique des lancés)
    //et le total de points de la vollée
    let volleySum = arrayCurrentVolley.reduce((acc, value) => acc + value, 0)
    let currentPlayerVolley = {
      dart1:arrayCurrentVolley[0],
      dart2:arrayCurrentVolley[1],
      dart3:arrayCurrentVolley[2],
      total: volleySum
    }
    //sauvegarde de l'historique des vollées
    arrayPlayers[currentPlayerIndex].lastScores.push(currentPlayerVolley)

    //update du score restant par joueur
    arrayPlayers[currentPlayerIndex].score -= volleySum
    //on vide le tableau arrayCurrentVolley
    arrayCurrentVolley.length = 0

    //TODO Fonction pour valider ou non la vollée actuelle

    alert('Valider la vollée ?')
    //met à jour l'affichage du score du joueur
    updateDisplay()
    //change le joueur en cours
    defineNextPlayer()
  }
}

