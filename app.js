// sélecteur des zones de la cible
const zones = document.querySelectorAll(".zone");
const inputPlayerName = document.querySelector("#playerName");
const arrayPlayers = [];
let gameStarted = false;
const arrayCurrentVolley = [];

class Player {
  constructor(name) {
    this.name = name;
    this.score = 301;
    this.volley = 3;
    this.lastScores = [0];
    this.currentPlayer = false;
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
    }
    if (arrayPlayers.length === 1) {
      createStartBtn();
    }
  } catch (error) {
    alert(error.message);
  }
}

function returnScore(callback) {
  zones.forEach((zone) => {
    zone.addEventListener("click", () => {
      const type = zone.dataset.type;
      const value = Number(zone.dataset.value);

      let score = value;
      if (type === "double") score *= 2;
      if (type === "triple") score *= 3;

      callback(score);
    });
  });
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
    startGame();
    //Partie lancée donc on retire le bouton Start
    startBtn.remove();
  });
}

function startGame() {

  gameStarted = true;

  returnScore((score) => {
    handleGame()
    if (!gameStarted) return;
    arrayCurrentVolley.push(score);
    console.log(arrayCurrentVolley);
  });
}

function handleGame() {
  if (arrayCurrentVolley.length === 3) {
    gameStarted = false;
    alert("Tableau lancé rempli")
  }
}