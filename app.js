const inputPlayerName = document.querySelector('#playerName')
const arrayPlayers = []

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
  createNewPlayer()
})

function createNewPlayer() {
    try {
        if (inputPlayerName.value.trim() === "") {
            throw new Error('Le nom du joueur ne peut être vide.');
        }
        if (inputPlayerName !== "") {
            let newPlayer = new Player(inputPlayerName.value);
            console.log(`Nouveau joueur : ${newPlayer.name}`);
            arrayPlayers.push(newPlayer);
            inputPlayerName.value = "";
            console.log(arrayPlayers);
        }
    } catch (error) {
        alert(error.message);
    }
}

// sélecteur des zones de la cible
const zones = document.querySelectorAll(".zone")

zones.forEach(zone => {
  zone.addEventListener("click", () => {
    const type = zone.dataset.type;
    const value = Number(zone.dataset.value);

    let score = value;

    if (type === "double") score *= 2;
    if (type === "triple") score *= 3;

    console.log(score);
  });
});