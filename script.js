// CONSTANTS

const items = {
  "(": "tool",
  "*": "gem",
  "?": "scroll",
  "/": "wand",
  "!": "potion",
  "+": "spell book",
  "=": "ring",
  "[": "armour"
};

const poems = {
  "3,23": ["aster", "aster by s.che", "/poems/aster.html", "*"],
  "31,8": ["brush", "brush by s.che", "/poems/brush.html", "?"],
  "45,34": ["buffer", "buffer by s.che", "/poems/buffer.html", "="],
  "49,3": ["iliad", "iliad by s.che", "/poems/iliad.html", "/"],
  "68,26": ["information", "information by s.che", "/poems/information.html", "+"],
  "8,16": ["intermission", "intermission by s.che", "/poems/intermission.html", "("],
  "10,4": ["kernel", "kernel by s.che", "/poems/kernel.html", "="],
  "19,11": ["philtre", "philtre by s.che", "/poems/philtre.html", "!"],
  "60,15": ["rivers", "rivers by katherine yang", "/poems/rivers.html", "*"],
};

const welcome = document.getElementById("welcome");
const log = document.getElementById("log");
const logText = document.getElementById("logText");
const space = document.getElementById("space");
const inventory = document.getElementById("inventory");
const inventoryItems = document.getElementById("inventoryItems");
const legend = document.getElementById("legend");
const viewer = document.getElementById("viewer");
const exit = document.getElementById("exit");

// VARIABLES

let mapFull, mapVisible;
let playerX = 37; // x position of the player
let playerY = 20; // y position of the player
let username; // player username
let actions = []; // array of actions to record in the log
let isInGame = false; // if the game has started
let hasFoundItem = false; // if the player is interacting with an item
let playerItems = [];

// FUNCTIONS

// (almost) everything in one variable so it can be slotted in the source code at the end
const storehouse = function() {
  
  document.addEventListener("DOMContentLoaded", init);
  
  // set everything up
  function init() {
    space.classList.add("hidden");
    document.getElementById("userInput").addEventListener("submit", handleUsernameInput);
    createInventory();
    // fill in map from text file
    fetch("./map.txt")
      .then(response => response.text())
      .then(data => {
        space.innerText = data;
        mapFull = data.split("\n");
        mapVisible = [];
        for (let i = 0; i < mapFull.length; i++) {
          mapFull[i] = mapFull[i].split("");
          let row = [];
          for (let j = 0; j < mapFull[i].length; j++) {
            row.push(" ");
          }
          mapVisible.push(row);
        }
        revealCell(playerX, playerY);
        updateMap();
        document.addEventListener("keydown", handleKeyDown);
      });
  }
  
  // fill in inventory from poems
  function createInventory() {
    let coords = Object.keys(poems);
    coords.sort(() => Math.random() - 0.5); // shuffle
    for (let coord of coords) {
      let poem = poems[coord];
      let symbol = poem[3];
      let span = document.createElement("span");
      span.classList.add("item", items[symbol].replace(" ", ""));
      span.textContent = symbol + " ";
      inventoryItems.appendChild(span);
    }
  }

  // handles submission of username
  function handleUsernameInput(event) {
    isInGame = true;
    // prevent reload
    event.preventDefault();
    // get value of input
    username = event.target[0].value;
    // {Username}.Log
    document.getElementById("usernameVal").textContent = username;
    // add first action to log
    addToLog(`You enter the storehouse.`);
    // hide form
    welcome.classList.add("invisible");
    setTimeout(() => {
      welcome.classList.add("hidden");
    }, 500);
    setTimeout(() => {
      // show intro text
      log.classList.remove("invisible");
      setTimeout(() => {
        space.classList.remove("hidden");
        setTimeout(() => {
          // show space
          space.classList.remove("invisible");
        }, 50);
        setTimeout(() => {
          // show inventory
          inventory.classList.remove("invisible");
          setTimeout(() => {
            legend.classList.remove("invisible");
          }, 200);
        }, 200);
      }, 500);
    }, 200);
  }

  // handles key presses, including arrow keys and y/n
  function handleKeyDown(event) {
    if (!isInGame) return;

    // when the user presses a key, event.key stores which key was pressed
    // this block of code switches between different possibilities
    let newX, newY, targetCell;
    let currentCell = mapFull[playerY][playerX];
    switch (event.key) {
        
      case "ArrowLeft": {
        event.preventDefault();
        newX = playerX - 1;
        // check what the target Cell is
        targetCell = mapFull[playerY][newX];
        if (newX >= 0 && // if it's not past the edge
            targetCell !== " " && // if it's not blank space
            targetCell !== "|" && // if it's not a vertical wall
            targetCell !== "-") { // if it's not a horizontal wall
          playerX = newX; // then ok to move!
          addToLog("←");
        }
        revealCell(playerX, playerY);
        // update map with new player location
        updateMap();
      }
        break;
        
      case "ArrowRight": {
        event.preventDefault();
        newX = playerX + 1;
        targetCell = mapFull[playerY][newX];
        if (newX <= mapFull[0].length - 1 &&
            targetCell !== " " &&
            targetCell !== "|" &&
            targetCell !== "-") {
          playerX = newX;
          addToLog("→");
        }
        revealCell(playerX, playerY);
        updateMap();
      }
        break;
        
      case "ArrowUp": {
        event.preventDefault();
        newY = playerY - 1;
        targetCell = mapFull[newY][playerX];
        if (newY >= 0  &&
            targetCell !== " " &&
            targetCell !== "-" &&
            targetCell !== "|") {
          playerY = newY;
          addToLog("↑");
        }
        revealCell(playerX, playerY);
        updateMap();
      }
      break;
        
      case "ArrowDown": {
        event.preventDefault();
        newY = playerY + 1;
        targetCell = mapFull[newY][playerX];
        if (newY <= mapFull.length - 1 &&
            targetCell !== " " &&
            targetCell !== "-" &&
            targetCell !== "|") {
          playerY = newY;
          addToLog("↓");
        }
        revealCell(playerX, playerY);
        updateMap();
      }
      break;
        
      case "y": {
        if (hasFoundItem) {
          event.preventDefault();
          let poem = poems[playerX + "," + playerY];
          addToLog(`You inspect ${poem[1]}.`);
          // open poem in a popup window
          let newWindow = window.open(poem[2], poem[0], "menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes,top=120,left=400,width=800,height=800");
          newWindow.focus();
          // hide viewer
          viewer.classList.add("invisible");
          hasFoundItem = false;
          
          collectItem(playerX, playerY);
        }
      }
      break;
        
      case "n": {
        if (hasFoundItem) {
          event.preventDefault();
          // hide viewer
          viewer.classList.add("invisible");
          hasFoundItem = false;
        }
      }
      break;

    }

    if (currentCell === "." && targetCell === "#") {
      // leaving a room
      leaveRoom();
    } else if (currentCell === "#" && targetCell === ".") {
      // entering a room
      enterRoom();
    } else if (targetCell && targetCell !== "." && targetCell !== "#") {
      // inspecting an item
      findItem(targetCell);
    } else if (currentCell !== "." && currentCell !== "#" && (targetCell === "." || targetCell === "#")) {
      // moving away from item
      hasFoundItem = false;
      viewer.classList.add("invisible");
    }

  }

  function leaveRoom() {
    addToLog(`You step into a hallway.`);
  }

  function enterRoom() {
    addToLog(`You enter a room.`);
  }

  function findItem(targetCell) {
    if (targetCell === ">") {
      concludeVisit();
    } else {
      let itemName = items[targetCell];
      let coords = playerX + "," + playerY;

      if (itemName) {
        let poem = poems[coords];
        let workTitle = poem[1];
        let symbol = poem[3];

        if (poem) {
          hasFoundItem = true;
          if (itemName[0] === "a") {
            addToLog(`You find an ${itemName}.`);
          } else {
            addToLog(`You find a ${itemName}.`);
          }
          viewer.querySelector("#item").innerText = itemName;
          viewer.querySelector("#work").innerText = workTitle;
          viewer.querySelectorAll(".symbol").forEach(span => span.innerText = symbol);
          viewer.classList.remove("invisible");
        }
      }
    }
  }

  function collectItem(x, y) {
    let coordStr = x + "," + y;
    if (playerItems.indexOf(coordStr) === -1) {
      playerItems.push(coordStr);
      let symbol = mapFull[y][x];
      let name = items[symbol].replace(" ", "");
      let item = inventoryItems.querySelectorAll("." + name + ":not(.item--collected)")[0];
      item.classList.add("item--collected");
      if (playerItems.length === Object.keys(poems).length) {
        revealSteps();
      }
    }
  }

  function revealSteps() {
    // exit.classList.remove("invisible");
    mapFull[20][37] = ">";
    mapVisible[20][37] = ">";
    addToLog("You find stairs going down.");
    updateMap();
  }

  function revealCell(x, y) {
    // reveal current cell
    mapVisible[y][x] = mapFull[y][x];
    // check surroundings in clockwise order, starting from the top cell
    
    // ...
    // .x.
    // ...
    
    // top
    if (y >= 1) {
      mapVisible[y - 1][x] = mapFull[y - 1][x];
    }
    // top right
    if (y >= 1 && x < mapFull[0].length - 1) {
      mapVisible[y - 1][x + 1] = mapFull[y - 1][x + 1];
    }
    // right
    if (x < mapFull[0].length - 1) {
      mapVisible[y][x + 1] = mapFull[y][x + 1];
    }
    // bottom right
    if (y < mapFull.length - 1 && x < mapFull[0].length - 1) {
      mapVisible[y + 1][x + 1] = mapFull[y + 1][x + 1];
    }
    // bottom
    if (y < mapFull.length - 1) {
      mapVisible[y + 1][x] = mapFull[y + 1][x];
    }
    // bottom left
    if (y < mapFull.length - 1 && x >= 1) {
      mapVisible[y + 1][x - 1] = mapFull[y + 1][x - 1];
    }
    // left
    if (x >= 1) {
      mapVisible[y][x - 1] = mapFull[y][x - 1];
    }
    // upper left
    if (y >= 1 && x >= 1) {
      mapVisible[y - 1][x - 1] = mapFull[y - 1][x - 1];
    }
  }

  // adds a given text to the log
  function addToLog(actionText) {
    if (actionText.length === 1) {
      let span = document.createElement("span");
      span.classList.add("arrow");
      span.textContent = actionText;
      log.children[log.children.length - 1].innerHTML += span.outerHTML + " ";
    } else {
      if (actions[actions.length - 1] !== actionText) {
        // let newAction = document.createElement("p");
        // newAction.innerText = actionText;
        // log.appendChild(newAction);
        actions.push(actionText);
        logText.innerHTML += " " + actionText + " ";
        // scroll to the bottom of the log
        log.scrollTo({
          left: 0,
          top: log.scrollHeight,
          behavior: "smooth"
        })
      }
    }
  }

  // updates map with the player's location
  function updateMap() {
    // clone map for display
    let mapText = [];
    // for (let row of mapFull) { // DEBUG
    for (let row of mapVisible) {
      let rowClone = [];
      for (let cell of row) {
        rowClone.push(cell);
      }
      mapText.push(rowClone);
    }
    // place player symbol
    mapText[playerY][playerX] = "@";
    for (let i = 0; i < mapText.length; i++) {
      mapText[i] = mapText[i].join("");
    }
    mapText = mapText.join("\n");
    // insert into page
    space.innerText = mapText;
  }
};

storehouse();

function concludeVisit() {
  let source = document.createElement("pre");
  source.id = "source";
  source.classList.add("source", "invisible");
  // print html
  source.innerText = document.body.innerHTML;
  // print javascript
  source.innerText += "\n\n" + storehouse.toString();
  document.body.appendChild(source);
  viewer.classList.add("invisible");
  // fade transition elements
  setTimeout(() => {
    log.classList.add("invisible");
    setTimeout(() => {
      inventory.classList.add("invisible");
      setTimeout(() => {
        space.classList.add("invisible");
        setTimeout(() => {
          legend.classList.add("invisible");
          setTimeout(() => {
            source.classList.remove("invisible");
          }, 500);
        }, 500);
      }, 500);
    }, 500);
  }, 500);
}