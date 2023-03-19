var canvas = document.getElementById('myCanvas');

// returns a drawing context on the canvas,
// or null if the context identifier is not supported,
// or the canvas has already been set to a different context mode.
var context = canvas.getContext('2d');

/* -------------------------------------------
  Example : 두더지 잡기 게임
 -------------------------------------------*/

// 캔버스 배경 이미지
var backgroundImage = new Image();
backgroundImage.src = 'images/background.png';

// 두더지 구멍 이미지
var holeImage = new Image();
holeImage.src = 'images/hole.png';

// 두더지 이미지
var moleImage = new Image();
moleImage.src = 'images/mole.png';

// 망치 이미지 (스프라이트)
var hammerImage = new Image();
hammerImage.src = 'images/hammer.png';

// 두더지 타격 사운드
var hitSound = new Audio('sounds/hit.mp3');

// 두더지 구멍 표시 위치 정의
var molesX = [100, 100, 200, 200, 300, 300];
var molesY = [100, 250, 100, 250, 100, 250];

// 게임 상태 관리
var randomNumber; // 랜덤 난수 0 ~ 5
var molePosition = {}; // 두더지 위치
var mousePosition = {}; // 마우스 커서 위치
var isMoleHit = false; // 두더지 맞았는지 여부
// var acDelta = 0; // 타격으로부터 지나간 프레임 수 기록 (??)
// var millisecondsPerFrame = 50; // 타격으로부터 몇 프레임 후에 마우스 커서를 원상복귀 시킬 것인지
var score = 0; // 게임 시작 후 타격 횟수
var times = 0; // 게임 시작 후 경과 시간
var timesMax = 100; // 게임 총 진행 시간

// 캔버스 배경 이미지 로드에 성공하면
backgroundImage.onload = function () {
  drawBackgroundImage();
};

// 두더지 구멍 이미지 로드에 성공하면 캔버스에 두더지 구멍 이미지를 그립니다.
holeImage.onload = function () {
  drawHoleImages();
};

// 두더지 이미지 로드에 성공하면 캔버스에 두더지 이미지를 그립니다.
moleImage.onload = function () {
  drawMoleImage();
};

// 마우스 이동 시 현재 커서 위치 상태를 업데이트 합니다.
document.addEventListener('mousemove', function (event) {
  mousePosition = getMousePosition(event);
});

// 마우스 클릭 시 현재 커서 상태를 클릭 상태로 변경합니다.
document.addEventListener('mousedown', function (event) {

  // 마우스가 두더지 이미지 영역 내에 있고, 두더지를 치지 않은 상태일 때 실행합니다.
  if (isHit(mousePosition.x, mousePosition.y) && !isMoleHit) {
    isMoleHit = true;
    reset();
    render();
    hitSound.play(); // 타격 사운드를 재생합니다.
    score++; // 점수를 1점 추가합니다.
  }
});

// 마우스 클릭을 해제하면 커서 모양을 원상 복구시킵니다.
document.addEventListener('mouseup', function (event) {
  isMoleHit = false;
});

// 게임 시작 화면에서 Play 버튼을 클릭하면 실행합니다.
document.getElementById('buttonStart').onclick = function () {
  // fixme: 게임 시작 화면은 숨기고, 게임 화면을 보여줍니다.
  $('div#splashScreen').css('display', 'none');
  $('canvas#myCanvas').css('display', 'block');

  // 게임을 시작합니다.
  reset();
  main();

  // 숨겨 두었던 배경음악 토글버튼 관련 요소들을 다시 보이게 합니다.
  $('#bgmToggle').css('display', 'block');
  $('#bgmAudio').css('display', 'block');
};

// fixme: BGM 토글 버튼 클릭 시 배경음악 재생 여부를 토글시킵니다.
document.getElementById('bgmToggle').onclick = function () {
  var $this = $(this);

  // 사운드 재생 중이면 중지하고, 중지 상태면 재생합니다.
  if ($this.hasClass('sound-on')) {
    $this.removeClass('sound-on').addClass('sound-off');
    $('#bgmAudio').trigger('pause');
  } else {
    $this.removeClass('sound-off').addClass('sound-on');
    $('#bgmAudio').trigger('play');
  }
};

// 게임을 시작합니다.
reset();
main();

/**
 * 게임 프레임을 업데이트 해나갑니다.
 */
function main() {
  render();
  requestAnimationFrame(main); //
}

/**
 * 두더지 위치를 랜덤하게 재배치합니다.
 */
function reset() {
  randomNumber = Math.floor(6*Math.random()); // 0 ~ 5 사이의 랜덤 정수
  molePosition.x = molesX[randomNumber];
  molePosition.y = molesY[randomNumber];
}

/**
 * 1 프레임마다 게임 상황을 업데이트하고 다시 그립니다.
 */
function render() {
  drawBackgroundImage();
  drawHoleImages();
  drawMoleImage();
  drawHammerCursor();
  drawScore();
  drawTimes();
  times++; // 게임 진행 후 경과된 시간을 1 추가합니다.
}

/**
 * 캔버스에 배경 이미지를 그립니다.
 */
function drawBackgroundImage() {
  context.drawImage(backgroundImage, 0, 0); // image, dx, dy
}

/**
 * 캔버스 내에 두더지 구멍 표시 위치 좌표마다 두더지 구멍 이미지를 그립니다.
 */
function drawHoleImages() {
  // 캔버스 내에서 그려야 할 모든 위치들마다
  for (let i = 0 ; i < molesX.length ; i++) {
    context.drawImage(holeImage, molesX[i], molesY[i]); // image, dx, dy
  }
}

/**
 * 캔버스에 두더지 이미지를 그립니다.
 */
function drawMoleImage() {

  // 두더지를 타격했을 경우, 이미지를 안 보이게 만든다.
  if (isMoleHit) context.globalAlpha = 0;

  // 두더지 이미지를 그린다.
  context.drawImage(moleImage, molePosition.x, molePosition.y); // image, dx, dy

  // 두더지를 안 보이기 위해 설정했던 값을 원상복구 시킨다.
  context.globalAlpha = 1;
}

/**
 * 현재 타격 횟수를 캔버스에 그립니다.
 */
function drawScore() {
  context.fillStyle = 'rgb(250, 250, 250)';
  context.font = 'bold 24px Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'top';
  context.fillText(`SCORE : ${score}`, 0.5*canvas.width, 10); // string, x, y
  context.strokeText(`SCORE : ${score}`, 0.5*canvas.width, 10); // string, x, y
}

/**
 * 게임 진행률을 캔버스에 그립니다.
 */
function drawTimes() {
  context.fillStyle = 'black';
  context.textAlign = 'right';
  context.fillText(
    `TIME : ${Math.round(times / timesMax)}`, // string
    canvas.width - 10, // x
    10); // y
}

/**
 * 망치 이미지를 현재 마우스 커서 위치에 그립니다.
 */
function drawHammerCursor() {
  context.drawImage(hammerImage,
    isMoleHit ? 60 : 0,
    0,
    60,
    60,
    mousePosition.x - 30,
    mousePosition.y - 30,
    60,
    60);

  // // 커서 모양을 원상복귀 시켜야 하는 프레임 수를 지났으면 다음 프레임 때 커서 상태를 리셋
  // if (acDelta > millisecondsPerFrame) {
  //   acDelta = 0;
  //   isMoleHit = false;
  // } else {
  //   acDelta++;
  // }
}

/**
 * 현재 두더지 이미지 위치에 마우스 커서가 있는지 여부를 체크합니다.
 * @param x 마우스 커서의 X 좌표
 * @param y 마우스 커서의 Y 좌표
 * @return {boolean}
 */
function isHit(x, y) {
  return molePosition.x <= x && x <= molePosition.x + 60
    && molePosition.y <= y && y <= molePosition.y + 60;
}

/**
 * 마우스 이벤트 객체를 전달하면 현재 캔버스 기준 마우스 위치 좌표값을 반환합니다.
 * @param event {MouseEvent}
 * @return {{x: number, y: number}}
 */
function getMousePosition(event) {
  const { clientX, clientY } = event;
  const { offsetLeft, offsetTop } = context.canvas;
  return {
    x: clientX - offsetLeft,
    y: clientY - offsetTop
  };
}
