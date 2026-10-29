// ==========================================
// 專題名稱：臺灣特有種動物大冒險（含聲音與視覺圖形）
// 使用技術：p5.js、p5.sound / Web Audio API、RWD 響應式排版
// ==========================================

let screen = "start"; // "start", "quiz", "result"
let currentQ = 0;     // 目前題號
let score = 0;        // 總得分
let selectedOption = null; 
let feedbackTimer = 0;     
let osc;              // 聲音合成振盪器
let isPlayingSound = false; // 是否正在播放聲音

// 題目資料（包含外觀繪圖與聲音類型）
const QUESTIONS = [
  {
    id: "Q1", type: "anim", goal: 1,
    q: "臺灣黑熊胸前有一個非常明顯的標誌，請問是什麼形狀？",
    options: ["金色的「V」字形", "白色的「X」字形", "紅色的「O」字形", "黑色的「I」字形"],
    answer: "金色的「V」字形",
    explain: "臺灣黑熊胸前有獨特的 V 字形（或半月形）黃白色斑紋，這是牠們最大的特徵！",
    drawType: "bear"
  },
  {
    id: "Q2", type: "sound", goal: 2,
    q: "聽到這種低沉且帶有警覺性的森林環境音與叫聲，最可能是哪種大型動物在活動？",
    options: ["臺灣黑熊", "臺灣獼猴", "山羌", "穿山甲"],
    answer: "臺灣黑熊",
    explain: "臺灣黑熊是臺灣唯一的原生熊類，主要棲息在中高海拔的原始森林中。",
    drawType: "bearSound",
    soundFreq: 150
  },
  {
    id: "Q3", type: "anim", goal: 1,
    q: "石虎外觀長得很像家貓，但牠們耳背有什麼明顯的特徵？",
    options: ["黑底白斑（虎斑圓點）", "長長的流蘇毛", "完全沒有耳朵", "會發光的螢光毛"],
    answer: "黑底白斑（虎斑圓點）",
    explain: "石虎耳背為黑褐色，且中央有一個明顯的白色斑塊（俗稱「眼斑」），這是分辨石虎與家貓的重要特徵。",
    drawType: "leopardCat"
  },
  {
    id: "Q4", type: "sound", goal: 2,
    q: "聽到這種高頻而急促的鳥鳴聲，常成群結隊在林間穿梭，是哪一種美麗的特有亞種鳥類？",
    options: ["臺灣藍鵲", "夜鷺", "麻雀", "白頭翁"],
    answer: "臺灣藍鵲",
    explain: "臺灣藍鵲擁有長長的藍色尾羽與鮮紅的嘴喙，叫聲嘹亮且常全家總動員一起行動。",
    drawType: "magpieSound",
    soundFreq: 1200
  },
  {
    id: "Q5", type: "anim", goal: 3,
    q: "如果在野外或山區道路旁發現石虎出沒的熱點，我們應該注意什麼來保護牠們？",
    options: ["開車減速慢行，避免「路殺」", "捕捉牠們回家當寵物", "放鞭炮驅趕牠們", "餵食人類的零食"],
    answer: "開車減速慢行，避免「路殺」",
    explain: "「路殺」（道路車禍身亡）是石虎面臨的最大危機之一，經過石虎棲息熱點時務必減速慢行。",
    drawType: "roadkill"
  },
  {
    id: "Q6", type: "sound", goal: 2,
    q: "聽到這種短促而清脆的草叢摩擦與鳴叫聲，常在夜間尋找螞蟻吃的是誰？",
    options: ["臺灣穿山甲", "梅花鹿", "臺灣野豬", "水鹿"],
    answer: "臺灣穿山甲",
    explain: "穿山甲全身覆蓋堅硬的鱗甲，主要以白蟻和螞蟻為食，依靠敏銳的嗅覺與長舌頭覓食。",
    drawType: "pangolinSound",
    soundFreq: 400
  },
  {
    id: "Q7", type: "anim", goal: 1,
    q: "臺灣特有種「櫻花鉤吻鮭」主要生活在哪裡的溪流中？",
    options: ["高海拔清澈且水溫低的水域（如大甲溪上游）", "平地混濁的泥巴水池", "海邊的鹹水海灣", "人工的游泳池"],
    answer: "高海拔清澈且水溫低的水域（如大甲溪上游）",
    explain: "櫻花鉤吻鮭是冰河時期遺留下來的「活化石」魚類，對水質與水溫的要求極高，只能存活在清涼的高山溪流。",
    drawType: "salmon"
  },
  {
    id: "Q8", type: "sound", goal: 3,
    q: "保護臺灣特有種動物最重要的根本之道是什麼？",
    options: ["維護與保護牠們的天然棲地不被過度開發", "全部抓到動物園飼養", "把山林全部砍掉改建大樓", "不需要理會牠們"],
    answer: "維護與保護牠們的天然棲地不被過度開發",
    explain: "動物失去家園（棲地破壞）是絕種的主因，保護森林與自然環境才是永續生存之道。",
    drawType: "habitat",
    soundFreq: 800
  }
];

let records = []; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  rectMode(CORNER);
  
  // 初始化 Web Audio 聲音合成器
  osc = new p5.Oscillator('sine');
}

function draw() {
  background(244, 247, 244); 

  if (screen === "start") {
    drawStartScreen();
  } else if (screen === "quiz") {
    drawQuizScreen();
  } else if (screen === "result") {
    drawResultScreen();
  }
}

// ---------------------------------------------------------
// 1. 開始畫面
// ---------------------------------------------------------
function drawStartScreen() {
  let cardW = min(width * 0.85, 600);
  let cardH = min(height * 0.8, 500);
  let cardX = (width - cardW) / 2;
  let cardY = (height - cardH) / 2;

  fill(255);
  stroke(200, 220, 200);
  strokeWeight(2);
  rect(cardX, cardY, cardW, cardH, 16);

  noStroke();
  fill(0, 102, 51); 
  textSize(min(width * 0.04, 32));
  textStyle(BOLD);
  text("臺灣特有種動物大冒險", width / 2, cardY + cardH * 0.18);

  textStyle(NORMAL);
  fill(80);
  textSize(min(width * 0.022, 16));
  text("看得到、聽得到、玩得下去的生態多媒體測驗", width / 2, cardY + cardH * 0.28);

  let goalsY = cardY + cardH * 0.38;
  textSize(min(width * 0.02, 15));
  textAlign(LEFT, CENTER);
  text("🎯 學習目標：", cardX + 40, goalsY);
  text("1. 能辨識臺灣特有種動物的外觀與特徵", cardX + 60, goalsY + 30);
  text("2. 能透過聲音與情境判斷動物生態", cardX + 60, goalsY + 60);
  text("3. 能建立保護野生動物與棲地的正確觀念", cardX + 60, goalsY + 90);

  textAlign(CENTER, CENTER);

  let btnW = 220;
  let btnH = 50;
  let btnX = (width - btnW) / 2;
  let btnY = cardY + cardH - 80;

  if (isMouseOver(btnX, btnY, btnW, btnH)) {
    fill(0, 130, 65);
  } else {
    fill(0, 102, 51);
  }
  rect(btnX, btnY, btnW, btnH, 25);

  fill(255);
  textSize(18);
  textStyle(BOLD);
  text("開始冒險", width / 2, btnY + btnH / 2);
}

// ---------------------------------------------------------
// 2. 作答畫面（含多媒體視圖與音效）
// ---------------------------------------------------------
function drawQuizScreen() {
  let qData = QUESTIONS[currentQ];

  fill(100);
  textSize(14);
  textStyle(NORMAL);
  text(`第 ${currentQ + 1} / ${QUESTIONS.length} 題`, width / 2, 25);

  let barW = min(width * 0.7, 500);
  let barX = (width - barW) / 2;
  fill(220);
  noStroke();
  rect(barX, 40, barW, 8, 4);
  fill(0, 102, 51);
  rect(barX, 40, barW * ((currentQ + 1) / QUESTIONS.length), 8, 4);

  // 多媒體視覺化顯示區 (畫布上方)
  let mediaW = min(width * 0.85, 650);
  let mediaH = 130;
  let mediaX = (width - mediaW) / 2;
  let mediaY = 55;

  fill(235, 245, 235);
  stroke(180, 210, 180);
  rect(mediaX, mediaY, mediaW, mediaH, 10);
  
  // 繪製對應的動物圖像或動畫視覺
  drawMediaIllustration(qData.drawType, mediaX + mediaW / 2, mediaY + mediaH / 2);

  // 如果是聲音題，加上提示
  if (qData.type === "sound") {
    noStroke();
    fill(0, 102, 51);
    textSize(12);
    text("🔊 點擊上方畫面或按按鈕可重聽聲音", mediaX + mediaW / 2, mediaY + mediaH - 15);
  }

  // 題目卡片
  let boxY = mediaY + mediaH + 10;
  let boxH = 75;

  fill(255);
  stroke(210);
  strokeWeight(1);
  rect(mediaX, boxY, mediaW, boxH, 10);

  noStroke();
  fill(30);
  textSize(min(width * 0.022, 16));
  textStyle(BOLD);
  textWrap(WORD);
  textAlign(CENTER, CENTER);
  text(qData.q, mediaX + 15, boxY + boxH / 2, mediaW - 30);

  // 選項按鈕
  let optY = boxY + boxH + 10;
  let optH = 48;
  let optGap = 8;

  for (let i = 0; i < qData.options.length; i++) {
    let optText = qData.options[i];
    let isHover = isMouseOver(mediaX, optY, mediaW, optH);

    if (selectedOption !== null) {
      if (optText === qData.answer) {
        fill(46, 125, 50); 
      } else if (optText === selectedOption) {
        fill(198, 40, 40); 
      } else {
        fill(240);
      }
    } else {
      if (isHover) fill(230, 240, 230);
      else fill(255);
    }

    stroke(selectedOption !== null && optText === qData.answer ? 46 : 200);
    strokeWeight(selectedOption !== null && optText === qData.answer ? 2 : 1);
    rect(mediaX, optY, mediaW, optH, 8);

    noStroke();
    fill(selectedOption !== null && (optText === qData.answer || optText === selectedOption) ? 255 : 50);
    textSize(min(width * 0.02, 15));
    textStyle(NORMAL);
    text(optText, mediaX + 15, optY + optH / 2, mediaW - 30);

    optY += optH + optGap;
  }

  // 即時回饋與解說
  if (selectedOption !== null) {
    let feedbackY = optY + 5;
    fill(245, 248, 245);
    stroke(180, 210, 180);
    rect(mediaX, feedbackY, mediaW, 75, 8);

    noStroke();
    fill(20, 80, 40);
    textSize(13);
    textStyle(BOLD);
    let isCorrect = (selectedOption === qData.answer);
    text(isCorrect ? "🎉 答對了！" : "❌ 答錯囉！", mediaX + 15, feedbackY + 18);

    fill(60);
    textSize(12);
    textStyle(NORMAL);
    text(qData.explain, mediaX + 15, feedbackY + 45, mediaW - 30);

    if (millis() - feedbackTimer > 4000) {
      nextQuestion();
    }
  }
}

// ---------------------------------------------------------
// 3. 成績結算畫面
// ---------------------------------------------------------
function drawResultScreen() {
  let cardW = min(width * 0.85, 600);
  let cardH = min(height * 0.85, 550);
  let cardX = (width - cardW) / 2;
  let cardY = (height - cardH) / 2;

  fill(255);
  stroke(200, 220, 200);
  strokeWeight(2);
  rect(cardX, cardY, cardW, cardH, 16);

  noStroke();
  fill(0, 102, 51);
  textSize(26);
  textStyle(BOLD);
  text("冒險成果結算", width / 2, cardY + 50);

  textSize(20);
  fill(50);
  let finalScore = Math.round((score / QUESTIONS.length) * 100);
  text(`總得分：${finalScore} 分 (答對 ${score} / ${QUESTIONS.length} 題)`, width / 2, cardY + 100);

  let statsY = cardY + 140;
  textSize(15);
  textAlign(LEFT, CENTER);
  text("📊 各學習目標達成情形：", cardX + 40, statsY);

  let goals = [
    { id: 1, name: "目標 1：辨識動物外觀與特徵" },
    { id: 2, name: "目標 2：聲音與生態情境判斷" },
    { id: 3, name: "目標 3：野生動物保育與觀念" }
  ];

  let barY = statsY + 30;
  for (let g of goals) {
    let gRecords = records.filter(r => r.goal === g.id);
    let gCorrect = gRecords.filter(r => r.correct).length;
    let ratio = gRecords.length > 0 ? gCorrect / gRecords.length : 0;

    fill(80);
    textSize(13);
    text(g.name, cardX + 40, barY);

    fill(230);
    rect(cardX + 40, barY + 18, cardW - 80, 12, 6);

    if (ratio >= 0.8) fill(46, 125, 50);       
    else if (ratio >= 0.5) fill(245, 127, 23); 
    else fill(198, 40, 40);                    

    rect(cardX + 40, barY + 18, (cardW - 80) * ratio, 12, 6);
    barY += 55;
  }

  textAlign(CENTER, CENTER);

  let btnW = 180;
  let btnH = 45;
  let btnX = (width - btnW) / 2;
  let btnY = cardY + cardH - 70;

  if (isMouseOver(btnX, btnY, btnW, btnH)) {
    fill(0, 130, 65);
  } else {
    fill(0, 102, 51);
  }
  rect(btnX, btnY, btnW, btnH, 22);

  fill(255);
  textSize(16);
  textStyle(BOLD);
  text("再玩一次", width / 2, btnY + btnH / 2);
}

// ---------------------------------------------------------
// 繪製多媒體圖形與動畫視覺
// ---------------------------------------------------------
function drawMediaIllustration(type, cx, cy) {
  push();
  if (type === "bear" || type === "bearSound") {
    // 臺灣黑熊頭部與 V 字斑紋
    fill(50, 30, 10);
    ellipse(cx, cy, 70, 60); // 臉
    ellipse(cx - 30, cy - 25, 25, 25); // 左耳
    ellipse(cx + 30, cy - 25, 25, 25); // 右耳
    
    // 胸前 V 字斑紋
    fill(240, 220, 100);
    noStroke();
    triangle(cx, cy + 5, cx - 15, cy + 25, cx - 5, cy + 25);
    triangle(cx, cy + 5, cx + 15, cy + 25, cx + 5, cy + 25);
    
    // 如果是聲音題，畫出音波震動線
    if (type === "bearSound") {
      stroke(0, 102, 51);
      strokeWeight(2);
      noFill();
      let waveAnim = sin(frameCount * 0.1) * 15;
      arc(cx, cy + 10, 90 + waveAnim, 50 + waveAnim, 0, PI);
    }
  } else if (type === "leopardCat") {
    // 石虎與耳背眼斑
    fill(200, 140, 60);
    ellipse(cx, cy, 65, 55);
    fill(50);
    ellipse(cx - 25, cy - 25, 20, 20); // 耳朵黑底
    fill(255);
    ellipse(cx - 25, cy - 25, 8, 8);   // 白色眼斑
    fill(50);
    ellipse(cx + 25, cy - 25, 20, 20);
    fill(255);
    ellipse(cx + 25, cy - 25, 8, 8);
  } else if (type === "magpieSound") {
    // 臺灣藍鵲與音波
    fill(30, 80, 160);
    ellipse(cx, cy, 50, 45);
    fill(220, 50, 50);
    rect(cx + 15, cy - 5, 20, 8, 4); // 紅嘴
    
    stroke(30, 120, 60);
    strokeWeight(2);
    noFill();
    let r = (frameCount * 3) % 40;
    ellipse(cx, cy, r * 2, r * 2);
  } else if (type === "roadkill") {
    // 路殺與車輛警示
    fill(100);
    rect(cx - 40, cy - 15, 80, 30, 5);
    fill(220, 50, 50);
    textSize(24);
    text("⚠️", cx, cy);
  } else if (type === "pangolinSound") {
    // 穿山甲鱗片造型
    fill(160, 130, 90);
    arc(cx, cy + 10, 70, 50, PI, 0);
    fill(120, 90, 60);
    for (let i = -20; i <= 20; i += 10) {
      ellipse(cx + i, cy, 12, 16);
    }
  } else if (type === "salmon") {
    // 櫻花鉤吻鮭
    fill(220, 120, 120);
    ellipse(cx, cy, 80, 40);
    triangle(cx - 40, cy, cx - 60, cy - 15, cx - 60, cy + 15);
  } else if (type === "habitat") {
    // 森林棲地綠意
    fill(46, 125, 50);
    triangle(cx, cy - 30, cx - 35, cy + 20, cx + 35, cy + 20);
    fill(90, 60, 30);
    rect(cx - 6, cy + 20, 12, 20);
  }
  pop();
}

// ---------------------------------------------------------
// 滑鼠點擊互動事件（含點擊觸發聲音）
// ---------------------------------------------------------
function mousePressed() {
  userStartAudio(); // 確保瀏覽器允許播放聲音

  if (screen === "start") {
    let btnW = 220;
    let btnH = 50;
    let btnX = (width - btnW) / 2;
    let btnY = (height - min(height * 0.8, 500)) / 2 + min(height * 0.8, 500) - 80;

    if (isMouseOver(btnX, btnY, btnW, btnH)) {
      screen = "quiz";
      currentQ = 0;
      score = 0;
      records = [];
      selectedOption = null;
      playCurrentQuestionSound();
    }
  } else if (screen === "quiz") {
    let mediaW = min(width * 0.85, 650);
    let mediaX = (width - mediaW) / 2;
    let mediaY = 55;
    let mediaH = 130;

    // 如果點擊上方多媒體圖示區，可以重聽聲音
    if (isMouseOver(mediaX, mediaY, mediaW, mediaH)) {
      playCurrentQuestionSound();
      return;
    }

    if (selectedOption !== null) return; 

    let qData = QUESTIONS[currentQ];
    let boxY = mediaY + mediaH + 10;
    let boxH = 75;
    let optY = boxY + boxH + 10;
    let optH = 48;
    let optGap = 8;

    for (let i = 0; i < qData.options.length; i++) {
      if (isMouseOver(mediaX, optY, mediaW, optH)) {
        selectedOption = qData.options[i];
        let isCorrect = (selectedOption === qData.answer);
        if (isCorrect) score++;

        records.push({
          qi: currentQ,
          goal: qData.goal,
          correct: isCorrect
        });

        stopSound();
        feedbackTimer = millis(); 
        break;
      }
      optY += optH + optGap;
    }
  } else if (screen === "result") {
    let btnW = 180;
    let btnH = 45;
    let btnX = (width - btnW) / 2;
    let cardH = min(height * 0.85, 550);
    let cardY = (height - cardH) / 2;
    let btnY = cardY + cardH - 70;

    if (isMouseOver(btnX, btnY, btnW, btnH)) {
      screen = "start";
    }
  }
}

// 播放當前題目的合成音效
function playCurrentQuestionSound() {
  let qData = QUESTIONS[currentQ];
  if (qData.type === "sound" && qData.soundFreq) {
    osc.freq(qData.soundFreq);
    osc.amp(0.15, 0.1);
    osc.start();
    isPlayingSound = true;
    
    // 2秒後自動降低音量停止
    setTimeout(() => {
      stopSound();
    }, 2000);
  }
}

function stopSound() {
  if (isPlayingSound) {
    osc.amp(0, 0.2);
    setTimeout(() => {
      osc.stop();
      isPlayingSound = false;
    }, 200);
  }
}

// 進入下一題
function nextQuestion() {
  selectedOption = null;
  currentQ++;
  if (currentQ >= QUESTIONS.length) {
    screen = "result";
  } else {
    playCurrentQuestionSound();
  }
}

function isMouseOver(x, y, w, h) {
  return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}