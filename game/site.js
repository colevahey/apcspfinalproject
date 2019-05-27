// Set constants and globals
const board = document.querySelector("#internal")
const flagButton = document.querySelector("#flag")
const boardSideLength = 13
const totalSpaces = boardSideLength ** 2

// Flag mode switch which is either true or false
let flagMode = false
const switchFlag = _ => {
  if (flagMode) {
    flagMode = false
    flagButton.style.background = "#fff"
  } else {
    flagMode = true
    flagButton.style.background = "#f00"
  }
}

// Catch if the letter f is pressed
document.body.onkeypress = e => {
  if (e.keyCode === 102) {
    switchFlag()
  }
}

// Check if the flag button is clicked
flagButton.onclick = e => {
  switchFlag()
}

// Opening prompt for instructions and difficulty
const difficulty = prompt("How to play:\n - When you click a space, it shows its number\n - The number corresponds to the number of mines around it\n - When you think you have found a mine, place a flag on it\n - To go to flag mode, either click the flag button or press f\n - Map all the mines and open spaces, and you win\n\nPlease select your difficulty level\n1 - Easy\n2 - Medium\n3 - Hard\n4 - Impossible")

// Ternary function to make sure difficulty is acceptable
const numMines = (difficulty === '1' || difficulty === '2' || difficulty === '3' || difficulty === '4') ? Math.floor(totalSpaces / (9 - (2 * difficulty))) : undefined 
if (!numMines) {
  alert("Please pick a number between 1 and 4")
  location.reload()
}

// SETUP
// Populate row function which takes a specific row and
// fills it with spaces with specific methods and attributes
const populateRow = rowNumber => {
  for (let i = 0; i < boardSideLength; i++){
    let newSpace = document.createElement("td")
    newSpace.className = "location"
    newSpace.spaceNumber = i
    newSpace.rowNumber = rowNumber
    newSpace.neighbors = []
    newSpace.neighborMines = 0
    newSpace.open = false
    newSpace.flagged = false
    newSpace.style = "border: 2px solid white;height: 35px; width: 35px; text-shadow: 3px 3px 7px black;"
    newSpace.onclick = e => {
      gameplay(e.target)
    }
    document.querySelectorAll(".row")[rowNumber].appendChild(newSpace)
  }
}

// Add rows to the table formatted for the game
for (let i = 0; i < boardSideLength; i++) {
  let newRow = document.createElement("tr")
  newRow.className = "row"
  board.appendChild(newRow)
  populateRow(i)
}

// Now that the board has been created, collect all
// of the spaces in an array
const locations = document.querySelectorAll(".location")

// Based on the difficulty, choose a number of random
// spaces from the board to place mines on
for (let i = 0; i < numMines; i++) {
  let newMine = locations[Math.floor(Math.random()*(totalSpaces))]
  newMine.isMine = true
}

// Math.floor can cause some issues, so double check the
// real number of mines
let realMines = 0
for (let i = 0; i < totalSpaces; i++) {
  if (locations[i].isMine) {
    realMines++
  }
} 
// Set the flag total to the number of mines on the board
document.querySelector("#flags").innerHTML = "Flags: " + realMines

// Set up each of the spaces to know how many mines are
// around them
for (let i = 0; i < totalSpaces; i++) {
  let space = locations[i]
  let neighbors = space.neighbors
  let neighborMines = 0

  // Check if the space is on a border and add correct
  // neighbors
  if (space.rowNumber > 0) {
    neighbors.push(locations[i-boardSideLength])
  }
  if (space.rowNumber < boardSideLength - 1) {
    neighbors.push(locations[i+boardSideLength])
  }
  if (space.spaceNumber > 0) {
    neighbors.push(locations[i-1])
    if (space.rowNumber > 0) {
      neighbors.push(locations[i-boardSideLength-1])
    }
    if (space.rowNumber < boardSideLength - 1) {
      neighbors.push(locations[i+boardSideLength-1])
    }
  }
  if (space.spaceNumber < boardSideLength - 1) {
    neighbors.push(locations[i+1])
    if (space.rowNumber > 0) {
      neighbors.push(locations[i-boardSideLength+1])
    }
    if (space.rowNumber < boardSideLength - 1) {
      neighbors.push(locations[i+boardSideLength+1])
    }
  }

  // Count the number of mines in each space's neighbors
  for (let i = 0; i < neighbors.length; i++) {
    if (neighbors[i].isMine) {
      neighborMines++
    }
  }
  // Set the space's neighborMines attribute to its number
  // of neighbor mines
  space.neighborMines = neighborMines

  // Give each space a color based on the number of neighbor
  // mines
  if (!space.isMine) {
    let c = "black"
    if (space.neighborMines === 1) {
      c = "#00f"
    } else if (space.neighborMines === 2) {
      c = "#0b0"
    } else if (space.neighborMines === 3) {
      c = "#800"
    } else if (space.neighborMines === 4) {
      c = "orange"
    } else if (space.neighborMines === 5) {
      c = "violet"
    } else if (space.neighborMines === 6) {
      c = "cyan"
    } else if (space.neighborMines === 7) {
      c = "#555"
    } else {
      c = "#bbb"
    }
    space.newColor = c
  }
}

// Function to see if player has won the game
const checkWin = _ => {
  let correct = 0
  for (let i = 0; i < totalSpaces; i++) {
    if ((locations[i].isMine && locations[i].flagged) || locations[i].open) {
      correct++
    }
  }
  // Return boolean of true if user has won, otherwise false
  return (locations.length - correct === 0)
}

// Actual gameplay function takes the parameter of whichever
// space has been clicked
const gameplay = space => {
  // Check if flag mode is on and if space clicked is open
  if (flagMode && !space.open) {
    // If the space is already flagged, un-flag it
    if (space.flagged) { 
      space.flagged = false
      space.style.background = "#333"
      space.innerHTML = ""
    } else {
      space.flagged = true
      space.style.background = "#f00"
      space.innerHTML = "F"
    }
  } else {
    // If the space is a mine and it is not flagged
    if (space.isMine && !space.flagged) {
      // Player loses 
      // For each space that is a mine, show the mine image
      for (let i = 0; i < totalSpaces; i++) {
        if (locations[i].isMine) {
          if (locations[i].flagged) {
            locations[i].style.border = "2px solid #f00"
          }
          locations[i].style.background = "white"
          locations[i].innerHTML = ""
          let mine = document.createElement("img")
          mine.src = "assets/mine.jpg"
          locations[i].appendChild(mine)
        }
      }
      // Prompt that the user has lost after the images load
      setTimeout(_ => {
        alert("Game Over!\n Press ok to start over")
        location.reload()
      },50)
    } else if (!space.open && !space.flagged) {
      // Space has been opened up
      space.open = true
      if (space.neighborMines > 0) {
        space.style.background = space.newColor
        // Set space's inner number to be its number of
        // neighbor mines
        space.innerHTML = space.neighborMines
      } else {
        // If space has no neighbor mines, open up all neighbors
        space.style.background = space.newColor
        for (let i = 0; i < space.neighbors.length; i++) {
          gameplay(space.neighbors[i])
        }
      }
    }
  }

  let flags = 0
  for (let i = 0; i < totalSpaces; i++) {
    if (locations[i].flagged) {
      flags++
    }
  }
  // Set the flag number to the number of total flags minus
  // flags placed
  document.querySelector("#flags").innerHTML = "Flags: " + (realMines - flags)

  if (checkWin()) {
    // Player has won; show winner alert
    setTimeout(_ => {
      alert("You won the game!\nPress ok to start over")
      location.reload()
    },50)
  }
}

