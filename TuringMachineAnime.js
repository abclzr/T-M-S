
window.blockwidth = 50;
window.innerblockwidth = 44;
window.startline = 100;
window.interline = 100;
window.leftmost = 0;
window.rightmost = 1000;
window.stepframes = 0.05;
window.k = 2;
window.pnow = [];
window.stepnow = 0;
window.autoplaying = false;
window.playing = false;
const canvas = document.getElementById('canvas');
/* 获得 2d 上下文对象 */
const ctx = canvas.getContext('2d');


$("#canvas").height = startline + k * interline;
function TMState(str, state, pointer) {
  this.str = str;
  this.state = state;
  this.pointer = pointer;
}

function drawstate(ss) {
  var h1 = 10;
  var tmpl = (leftmost + rightmost) / 2;
  ctx.clearRect(0, 0, rightmost, startline);
  ctx.fillStyle = "#000000";
  ctx.font = "30px Consolas";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText('State: '.concat(ss).concat('   step: ').concat(stepnow.toString()), tmpl, h1);
}

function drawtape(st, str, pt) {
  var h1 = st;
  var h2 = st + blockwidth;
  var hmid = h1 + blockwidth/2;
  var tmph = h1 + (blockwidth - innerblockwidth) / 2;
  var tmpl = (leftmost + rightmost) / 2 - innerblockwidth / 2;
  ctx.fillStyle = "#EBEBEB";
  ctx.fillRect(leftmost, h1, rightmost - leftmost, blockwidth);

  var tl = tmpl - (pt - 1) * blockwidth;
  while (tl > 0) tl -= blockwidth;
  while (tl < rightmost) {
    ctx.fillStyle = "#B2DFEE";
    ctx.fillRect(tl, tmph, innerblockwidth, innerblockwidth);
    tl += blockwidth;
  }

  tl = (leftmost + rightmost) / 2 - (pt - 1) * blockwidth;
  var len = str.length; var i = 0;
  for (i = 0; i < len; ++i) {
    if (str.charAt(i) !== '*') {
      ctx.fillStyle = "#000000";
      ctx.font = "20px Consolas";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(str.charAt(i).toString(), tl, hmid);
    }
    tl = tl + blockwidth;
  }

  ctx.beginPath();
  ctx.moveTo((leftmost + rightmost) / 2, h2 - 5);
  ctx.lineTo((leftmost + rightmost) / 2 + 20, h2 + 30);
  ctx.lineTo((leftmost + rightmost) / 2 - 20, h2 + 30);
  ctx.closePath();
  ctx.fillStyle = "#000000";
  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.stroke();
}

log = ["1001",
  "*",
  "qCopy", [1, 1],
  "1001",
  "1",
  "qCopy", [2, 2],
  "1001",
  "10",
  "qCopy", [3, 3],
  "1001",
  "100",
  "qCopy", [4, 4],
  "1001",
  "1001",
  "qCopy", [5, 5],
  "1001",
  "1001",
  "qReturn", [5, 4],
  "1001",
  "1001",
  "qReturn", [5, 3],
  "1001",
  "1001",
  "qReturn", [5, 2],
  "1001",
  "1001",
  "qReturn", [5, 1],
  "1001",
  "1001",
  "qReturn", [5, 0],
  "1001",
  "1001",
  "qTest", [4, 1],
  "1001",
  "1001",
  "qTest", [3, 2],
  "1001",
  "1001",
  "qTest", [2, 3],
  "1001",
  "1001",
  "qTest", [1, 4],
  "1001",
  "1001",
  "qCorrect", [0, 5]
]

/*
log = ["1110011100",
    "*",
    "q0", [1, 1],
    "1110011100",
    "1",
    "q0", [2, 2],
    "1110011100",
    "11",
    "q0",[3, 3],
    "1110011100",
    "111",
    "q0",[4, 4],
    "1110011100",
    "1110",
    "q0",[5, 5],
    "1110011100",
    "11100",
    "q0",[6, 6],
    "1110011100",
    "111001",
    "q0",[7, 7],
    "1110011100",
    "1110011",
    "q0",[8, 8],
    "1110011100",
    "11100111",
    "q0",[9, 9],
    "1110011100",
    "111001110",
    "q0",[10, 10],
    "1110011100",
    "1110011100",
    "q1",[10, 10]
];
*/
var stateary = []; var j, str, state, pointer, totstate = 0;
for (i = 0; i < log.length; i += k + 2) {
  str = [];
  for (j = 0; j < k; ++j) str[j] = log[i + j];
  state = log[i + k];
  pointer = log[i + k + 1];
  stateary[totstate] = new TMState(str, state, pointer);
  ++totstate;
}

//init
for (i = 0; i < k; ++i) {
  drawtape(startline + interline * i, stateary[0].str[i], stateary[0].pointer[i]);
  pnow[i] = stateary[0].pointer[i];
}
drawstate(stateary[0].state);
stepnow = 0;

function settostep(kth) {
  autoplaying = false;
  $('#play').attr('onclick', 'autoplay();');
  $('#icon').attr('class', 'glyphicon glyphicon-play');
  if (kth < 0 || kth >= totstate) {
    alert("Invalid Step!");
    return;
  }
  stepnow = kth;
  for (j = 0; j < k; ++j) {
    pnow[j] = stateary[kth].pointer[j];
    drawtape(startline + j * interline, stateary[kth].str[j], pnow[j]);
  }
  setProcess(kth);
}

function endAnimation() {
}

function nextstepAnimation() {
  if (playing) return;
  var remainframe;
  function step() {
    if (remainframe - stepframes > 0) {
      remainframe -= stepframes;
      for (j = 0; j < k; ++j) {
        if (Math.abs(pnow[j] - stateary[stepnow].pointer[j]) < stepframes) pnow[j] = stateary[stepnow].pointer[j];
        else if (pnow[j] < stateary[stepnow].pointer[j]) pnow[j] += stepframes;
        else if (pnow[j] > stepframes) pnow[j] -= stepframes;
        drawtape(startline + j * interline, stateary[stepnow].str[j], pnow[j]);
      }
      requestAnimationFrame(step);
      return;
    }
    for (j = 0; j < k; ++j) {
      pnow[j] = stateary[stepnow].pointer[j];
      drawtape(startline + j * interline, stateary[stepnow].str[j], pnow[j]);
    }
    playing = false;
    if (autoplaying)
      setTimeout(function () {nextstepAnimation();}, 500);
  }
  if (stepnow >= totstate - 1) {
    endAnimation();
    return;
  }
  ++stepnow;
  drawstate(stateary[stepnow].state);
  remainframe = 1;
  playing = true;
  requestAnimationFrame(step);
  setProcess(stepnow);
}

function autoplay() {
  autoplaying = true;
  $('#play').attr('onclick', 'pauseit();');
  $('#icon').attr('class', 'glyphicon glyphicon-pause');
  nextstepAnimation();
}

function pauseit() {
  autoplaying = false;
  $('#play').attr('onclick', 'autoplay();');
  $('#icon').attr('class', 'glyphicon glyphicon-play');
}


//slider

function setProcess(kth) {
  $('.progress-bar').css("width", (kth * 100 / (totstate - 1)).toString().concat("%"));
}

/*
$(function(){
  var tag = false,ox = 0,left = 0,bgleft = 0;
  $('.progress_btn').mousedown(function(e) {
    ox = e.pageX - left;
    tag = true;
  });

  $(document).mouseup(function() {
    tag = false;
  });

  $('.progress').mousemove(function(e) {//����ƶ�
    if (tag) {
      left = e.pageX - ox;
      if (left <= 0) {
        left = 0;
      }else if (left > 300) {
        left = 300;
      }
      $('.progress_btn').css('left', left);
      $('.progress_bar').width(left);
      $('.text').html(parseInt((left/300)*100) + '%');
    }
  });

  $('.progress_bg').click(function(e) {//�����
    if (!tag) {
      bgleft = $('.progress_bg').offset().left;
      left = e.pageX - bgleft;
      if (left <= 0) {
        left = 0;
      }else if (left > 300) {
        left = 300;
      }
      $('.progress_btn').css('left', left);
      $('.progress_bar').animate({width:left},300);
      $('.text').html(parseInt((left/300)*100) + '%');
    }
  });
});
*/
