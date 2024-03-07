const socket = io();

const bgopt = document.getElementById('chooseBg');
const body = document.querySelector('body');
const container = document.getElementsByClassName('container');

const bg = [];
bg.push('/img_pokemon/arena.jpg');
bg.push('/img_pokemon/canyon.jpg');
bg.push('/img_pokemon/cave.jpg');
bg.push('/img_pokemon/city.jpg');
bg.push('/img_pokemon/coast.jpg');
bg.push('/img_pokemon/forest.jpg');
bg.push('/img_pokemon/glacier.jpg');
bg.push('/img_pokemon/volcano.jpg');

for (let b in bg) {
  const option = document.createElement('img');
  option.src = bg[b];
  option.setAttribute('class', 'bgOpt');
  option.setAttribute('id', 'bgImg');
  if (bgopt) bgopt.appendChild(option);
  option.addEventListener('click', () => {
    body.style.backgroundImage = `url(${bg[b]})`;
    for (c in container) {
      container[c].style.backgroundImage = `url(${bg[b]})`;
    }
  });
}

const flikerImg = document.getElementsByClassName('fliker_img');
const pokemons = [];
pokemons.push('/img_pokemon/pokemon/snake.png');
pokemons.push('/img_pokemon/pokemon/water.png');
pokemons.push('/img_pokemon/pokemon/gun.png');
var flag = true;
var optionToSet;
let i = 0;
function doIteration() {
  if (flag == false) {
    flikerImg[0].src = pokemons[optionToSet];
    return;
  }
  i++;
  flikerImg[0].src = pokemons[i % pokemons.length];
  setTimeout(doIteration, 100);
}
doIteration();

let j = 0;
var flagR = true;
var optionToSetR;
function doIteration2() {
  j++;
  if (flagR == false) {
    flikerImg[1].src = pokemons[optionToSetR];
    return;
  }
  flikerImg[1].src = pokemons[(j + 1) % pokemons.length];
  setTimeout(doIteration2, 100);
}
doIteration2();

const option1 = document.getElementsByClassName('option1')[0];
const option2 = document.getElementsByClassName('option2')[0];
const option3 = document.getElementsByClassName('option3')[0];

let choiceFlag = true;
option1.addEventListener('click', () => {
  flag = false;
  optionToSet = 0;
  if (choiceFlag == true) myChoice('snake');
});
option2.addEventListener('click', () => {
  flag = false;
  optionToSet = 1;
  if (choiceFlag == true) myChoice('water');
});
option3.addEventListener('click', () => {
  flag = false;
  optionToSet = 2;
  if (choiceFlag == true) myChoice('gun');
});

function myChoice(choice) {
  let value = {
    choice: choice,
    room: roomIJoined
  };
  socket.emit('myChoice', choice);
  choiceFlag = false;
}

socket.on('wonResult', (result) => {
  console.log(result);
  flagR = false;
  if (result.oppChoice == 'snake') {
    optionToSetR = 0;
  } else if (result.oppChoice == 'water') {
    optionToSetR = 1;
  } else {
    optionToSetR = 2;
  }
  document.getElementById('resultgameScreenWin').style.display = 'flex';
  document
    .getElementById('resultgameScreenWin')
    .addEventListener('click', () => {
      document.getElementById('resultgameScreenWin').style.display = 'none';
      flag = true;
      flagR = true;
      choiceFlag = true;
      doIteration();
      doIteration2();
    });
});

socket.on('loseResult', (result) => {
  console.log(result);
  flagR = false;
  if (result.oppChoice == 'snake') {
    optionToSetR = 0;
  } else if (result.oppChoice == 'water') {
    optionToSetR = 1;
  } else {
    optionToSetR = 2;
  }
  document.getElementById('resultgameScreenLose').style.display = 'flex';
  document
    .getElementById('resultgameScreenLose')
    .addEventListener('click', () => {
      document.getElementById('resultgameScreenLose').style.display = 'none';
      flag = true;
      flagR = true;
      choiceFlag = true;
      doIteration();
      doIteration2();
    });
});
socket.on('tieResult', (result) => {
  console.log(result);
  flagR = false;
  if (result.oppChoice == 'snake') {
    optionToSetR = 0;
  } else if (result.oppChoice == 'water') {
    optionToSetR = 1;
  } else {
    optionToSetR = 2;
  }
  document.getElementById('resultgameScreenTie').style.display = 'flex';
  document
    .getElementById('resultgameScreenTie')
    .addEventListener('click', () => {
      document.getElementById('resultgameScreenTie').style.display = 'none';
      flag = true;
      flagR = true;
      choiceFlag = true;
      doIteration();
      doIteration2();
    });
});

socket.on('userDisconnected', (userDisc) => {
  console.log('user disconnected ' + userDisc);
  document.getElementById('gameScreenContainer').style.display = 'none';
  document.getElementById('loadingScreen').style.display = 'flex';
  document.getElementById('loading_text').innerText = 'user Disconnected';
  setTimeout(() => {
    document.getElementById('container').style.display = 'flex';
    document.getElementById('loadingScreen').style.display = 'none';
  }, 1000);
  document.getElementById('resultgameScreenLose').style.display = 'none';
  flag = true;
  flagR = true;
  choiceFlag = true;
  doIteration();
  doIteration2();
});
var roomIJoined = '';

const btnPlayF = document.getElementById('btnPlayF');
const btnPlayS = document.getElementById('btnPlayS');

btnPlayF.addEventListener('click', () => {
  document.getElementById('container').style.display = 'none';
  document.getElementById('loadingScreen').style.display = 'flex';
  document.getElementById('shareKeyScreen').style.display = 'flex';
  document.getElementById('createKeyBtn').style.display = 'block';
  document.getElementById('pasteKeyBtn').style.display = 'block';
  document.getElementById(
    'text_after_creatKey'
  ).innerText = ` Click create key button to create a private key and share it with your
  friend to play together.
  or 
  If you have one already then click paste button`;
});
document.getElementById('createKeyBtn').addEventListener('click', () => {
  socket.emit('playWithFriend', () => {});
  socket.on('youCreatedPrivateRoom', (room) => {
    console.log(
      'you created a private room share this id to your friend ' + room
    );
    roomIJoined = room;
    window.navigator.clipboard.writeText(room);
    document.getElementById('createKeyBtn').style.display = 'none';
    document.getElementById('pasteKeyBtn').style.display = 'none';
    document.getElementById('text_after_creatKey').innerText =
      'Key copied to your clipboard, share this to your friend and ask him to paste.';
  });
});

document.getElementById('pasteKeyBtn').addEventListener('click', () => {
  navigator.clipboard.readText().then((text) => {
    var privateKey = '';
    privateKey = text;
    console.log(text + ' copied text');
    if (privateKey != '') {
      socket.emit('joinPrivateRoom', privateKey);
    } else {
      alert('Copy the private key first');
    }
  });
});
socket.on('privateRoomJoined', (room) => {
  roomIJoined = room;
  console.log('You joined Private Room ' + room);
  document.getElementById('loading_text').innerText = 'Joined';
  setTimeout(() => {
    document.getElementById('gameScreenContainer').style.display = 'flex';
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('shareKeyScreen').style.display = 'none';
  }, 500);
});
btnPlayS.addEventListener('click', () => {
  document.getElementById('container').style.display = 'none';
  document.getElementById('loadingScreen').style.display = 'flex';
  socket.emit('playWithStrainger', () => {});
  socket.on('publicRoomJoined', (room) => {
    roomIJoined = room;
    console.log('You joined Public Room ' + room);
    document.getElementById('loading_text').innerText = 'Matched';
    setTimeout(() => {
      document.getElementById('gameScreenContainer').style.display = 'flex';
      document.getElementById('loadingScreen').style.display = 'none';
    }, 500);
  });

  socket.on('youCreatedPublicRoom', (room) => {
    roomIJoined = room;
    console.log('You created Public Room ' + room);
    document.getElementById('loading_text').innerText =
      'Waiting for Strainger to connect.';
  });
});

const backbtn = document.getElementById('backbtn');
backbtn.addEventListener('click', () => {
  socket.emit('leave', {});
  document.getElementById('gameScreenContainer').style.display = 'none';
  document.getElementById('loadingScreen').style.display = 'flex';
  document.getElementById('loading_text').innerText = 'You Disconnected...';
  setTimeout(() => {
    document.getElementById('container').style.display = 'flex';
    document.getElementById('loadingScreen').style.display = 'none';
  }, 1000);
  document.getElementById('resultgameScreenLose').style.display = 'none';
  flag = true;
  flagR = true;
  choiceFlag = true;
  doIteration();
  doIteration2();
});

socket.on('allTurnsCompleted', () => {
  alert('All turns completed');
});
