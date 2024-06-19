function redirectToDashPlayer() {
  if (window.location.href.indexOf("app") != -1) {
    //Redirect to the player
    window.location.href = "/app/dash/dashLive.html";
  } else {
    window.location.href = "/dash/dashLive.html";
  }
}

function redirectToShakaPlayer() {
  if (window.location.href.indexOf("app") != -1) {
    window.location.href = "/app/shaka/shakaLive.html";
  }
  else {
    window.location.href = "/shaka/shakaLive.html";
  }
}

function redirectToHlsPlayer() {
  if (window.location.href.indexOf("app") != -1) {
    window.location.href = "/app/hls/hlsVOD.html";
  }
  else {
    window.location.href = "/hls/hlsVOD.html";
  }
}

function redirectToHlsLivePlayer() {
  if (window.location.href.indexOf("app") != -1) {
    window.location.href = "/app/hls/hlsLive.html";
  }
  else {
    window.location.href = "/hls/hlsLive.html";
  }
}

function redirectToDashVODPlayer() {
  if (window.location.href.indexOf("app") != -1) {
    window.location.href = "/app/dash/dashVOD.html";
  }
  else {
    window.location.href = "/dash/dashVOD.html";
  }
}

function redirectToShakaVODPlayer() {
  if (window.location.href.indexOf("app") != -1) {
    window.location.href = "/app/shaka/shakaVOD.html";
  }
  else {
    window.location.href = "/shaka/shakaVOD.html";
  }
}

function redirectToDashABRPlayer() {
  if (window.location.href.indexOf("app") != -1) {
    window.location.href = "/app/dash/dashABR.html";
  }
  else {
    window.location.href = "/dash/dashABR.html";
  }
}

function redirectToShakaABRPlayer() {
  if (window.location.href.indexOf("app") != -1) {
    window.location.href = "/app/shaka/shakaABR.html";
  }
  else {
    window.location.href = "/shaka/shakaABR.html";
  }
}

function redirectToShakaDemoPlayer() {
  if (window.location.href.indexOf("app") != -1) {
    window.location.href = "/app/shaka/shakaDemo.html";
  }
  else {
    window.location.href = "/shaka/shakaDemo.html";
  }
}

function redirectToShakaDRMPlayer() {
  if (window.location.href.indexOf("app") != -1) {
    window.location.href = "/app/shaka/shakaDRM.html";
  }
  else {
    window.location.href = "/shaka/shakaDRM.html";
  }
}

let videoElem = document.getElementById('video');

// Script to add arrow key focus
document.addEventListener("DOMContentLoaded", function () {
  const rows = document.querySelectorAll(".container");
  const buttons = document.querySelectorAll("button");

  let focusedIndex = 0;

  // Apply focus to the first button initially
  if (buttons.length > 0) {
    buttons[focusedIndex].classList.add("focused");
    buttons[focusedIndex].focus();
  }

  // Add event listener for keydown event
  document.addEventListener("keydown", function (event) {
    console.log("Key Code:", event.keyCode);
    const key = event.key;

    if (key === "ArrowLeft" || key === "ArrowRight" || key === "Enter" || key === "ArrowUp" || key === "ArrowDown") {
      event.preventDefault(); // Prevent default browser behavior

      // Remove focus class from all buttons
      buttons.forEach((button) => button.classList.remove("focused"));

      // Move focus based on arrow keys
      if (key === "ArrowLeft") {
        focusedIndex = (focusedIndex - 1 + buttons.length) % buttons.length;
      } else if (key === "ArrowRight") {
        focusedIndex = (focusedIndex + 1) % buttons.length;
      } else if (key === "ArrowUp") {
        moveFocusUp();
      } else if (key === "ArrowDown") {
        moveFocusDown();
      }

      // Apply focus to the button
      buttons[focusedIndex].classList.add("focused");
      buttons[focusedIndex].focus();

      // Add console logging to debug
      console.log("Focused Index:", focusedIndex);

      // Activate button on Enter
      if (key === "Enter") {
        buttons[focusedIndex].click();
      }
    }

    if (key === "Backspace" && window.location.pathname !== "/app/index.html") {
      window.location.href = "/app/index.html";
    }

    switch (event.keyCode) {
      case 85: // Android Play/Pause
      case 415: // Samsung Play
      case 19: // LG Pause and Samsung Pause
      case 179: // LG Play
      case 80: // LG Play/Pause toggle
      case "p":
        pausePlay()
        break;
    }

    switch (event.keyCode) {
      case 177: // MediaTrackPrevious button on remote
      case 219: // The "[" key on the keyboard
      case "[":
        skipBackward()
        break;
    }

    switch (event.keyCode) {
      case 176: // MediaTrackNext button on remote
      case 221: // The "]" key on the keyboard
      case "]":
        skipForward()
        break;
    }
  });

  function moveFocusUp() {
    let currentButton = buttons[focusedIndex];
    let currentRow = currentButton.closest('.container');
    let currentRowIndex = Array.from(rows).indexOf(currentRow);
    let currentButtonIndexInRow = Array.from(currentRow.querySelectorAll('button')).indexOf(currentButton);

    if (currentRowIndex > 0) {
      let previousRow = rows[currentRowIndex - 1];
      let buttonsInPreviousRow = previousRow.querySelectorAll('button');
      focusedIndex = Array.from(buttons).indexOf(buttonsInPreviousRow[Math.min(currentButtonIndexInRow, buttonsInPreviousRow.length - 1)]);
    }
  }

  function moveFocusDown() {
    let currentButton = buttons[focusedIndex];
    let currentRow = currentButton.closest('.container');
    let currentRowIndex = Array.from(rows).indexOf(currentRow);
    let currentButtonIndexInRow = Array.from(currentRow.querySelectorAll('button')).indexOf(currentButton);

    if (currentRowIndex < rows.length - 1) {
      let nextRow = rows[currentRowIndex + 1];
      let buttonsInNextRow = nextRow.querySelectorAll('button');
      focusedIndex = Array.from(buttons).indexOf(buttonsInNextRow[Math.min(currentButtonIndexInRow, buttonsInNextRow.length - 1)]);
    }
  }
  
});

function pausePlay() {
  if (videoElem.paused) {
      videoElem.play();
  } else {
      videoElem.pause();
  }
}

function skipBackward() {
  videoElem.currentTime -= 5;
}

function skipForward() {
  videoElem.currentTime += 5;
}