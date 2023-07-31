/*

目次
1.和文による生成
2.プレビュー関連
3.htmlの補正

検索をかけて移動すると便利
*/

let flow_data = [];
// getInformationsOfで取得するにはここに情報の名前(クラス名)を記す必要があるので注意!
const classNames = ["htmlText"];

const flowStartMatch = new RegExp('フローチャートを開始。');
const flowEndMatch = new RegExp('フローチャートを終了。');
const inputMatch = new RegExp('を入力。$');
const outputMatch = new RegExp('を出力。$');
const displayMatch = new RegExp('を表示。$');
const forMatch = new RegExp('回繰り返す。$');
const whileMatch = new RegExp('まで繰り返す。$');
const ifMatchLeft = new RegExp('^もし、');
const ifMatchRight = new RegExp('ならば、$');
const elseMatch = new RegExp('そうでないならば、');


// 1.和文による生成

function createNewLineElement(){
  let newLine = document.createElement("pre");
  newLine.className = "editorLine";
  newLine.contentEditable = true;
  return newLine;
}

function getInformationsOf(className){
  if(!classNames.includes(className)){
    console.error(String(className)+"というclassNameは存在しません");
    return;
  }
  let res = [];
  if(className === "htmlText"){
    const texts = document.getElementsByClassName("editorLine");
    
    for(let i=0; i<texts.length; i++) res.push(texts[i].innerHTML);
    
  }
  
  return res;
}

/*
Type ->
    0 = Process
    1 = If
    2 = ForStart
    3 = ForEnd
    4 = Input and Output
    5 = Start and Goal
    
*/

// 対応している種類は上記
function getTypeOf(lineText){
  if(lineText.match(flowStartMatch) || lineText.match(flowEndMatch)){
    //端子
    return 5;
  }else if(lineText.match(inputMatch) || lineText.match(outputMatch)){
    // input and output
    return 4;
  }else if(lineText.match(displayMatch)){
    // display
    console.error("undefined about displayMatch");
    return -2;
  }else if(lineText.match(forMatch) || lineText.match(whileMatch)){
    // loop
    return 2;
  }else if(lineText.match(ifMatchLeft) && lineText.match(ifMatchRight)){
    // if
    return 1;
  }else if(!lineText.match(elseMatch)){
    // Process
    return 0;
  }else return -1;
}

// その行が、どのインデントのifに属しているか(ifに属していない場合は-1、ifに関してはそれ自身のインデントを入れる)
  // ここでif in else のインデント整理とかもしたらいいかも
function getArrayOfIndentationsOfIfWhichEachBelongs(typeNums,indentations){
  let res = [];
  
  for(let i=0; i<typeNums; i++){
    if(typeNums[i] === 1) res.push(indentations[i]);
    else if(indentations[i] >= 1) res.push(indentations[i]-1);
    else res.push(-1);
  }
  return res;
}

function updateFlowData(data){
  const htmlTexts = getInformationsOf("htmlText");
  let indentations = [];
  
  // \tをすべて抜いた文字列(最後の\tも)
  let lineTexts = [];
  
  console.log(htmlTexts);
  
  // indentationsとlineTextsのデータを入れる
  for(let i=0; i<htmlTexts.length; i++){
    let tabOnly = true;
    let indentLevel = 0;
    for(let j=0; j<htmlTexts[i].length; j++){
      if(htmlTexts[i][j] !== "\t" && htmlTexts[i][j] !== '\b' && htmlTexts[i][j] !== '&nbsp;'){
        tabOnly = false;
        lineTexts.push(htmlTexts[i].trim());
        break;
      }else indentLevel++;
    }
    
    if(!tabOnly) indentations.push(indentLevel);
  }
  
  // 空に
  data.length = 0;
  
  // ""(空文字)の部分は取り除く
  for(let i=0; i<lineTexts.length; i++){
    if(lineTexts[i] == ""){
      indentations.splice(i,1);
      lineTexts.splice(i,1);
    }
  }
  
  //ここらへんで多重ifの調整(alignX)も終わらせておいてほしい
  
  console.log("indentations",indentations);
  console.log("lineTexts",lineTexts);
  
  let maxIndentationLevel = 0;
  indentations.forEach((level) => maxIndentationLevel = Math.max(level,maxIndentationLevel));
  
  // ifIdx[i] := 直前のindentがiのifのインデックス
  let elseNextIdx = [];
  elseNextIdx.length = maxIndentationLevel+1;
  elseNextIdx.fill(-1);
  
  // インデントレベルiのelseのスコープに入っているならば isInElse[i] = true
  let isInElse = [];
  isInElse.length = maxIndentationLevel+1;
  
  // else の数
  let elseNum = 0;
  
  let typeNums = [];
  for(let i=0; i<lineTexts.length; i++){
    let typeNum = getTypeOf(lineTexts[i]);
    
    if(typeNum === -1){
      //記号が定められていないもの
      if(lineTexts[i].match(elseMatch)){
        //そうでなければ
        typeNum = -100;
        elseNum++;
      }
    }
    typeNums.push(typeNum);
  }
  
  let idxAsInData = [];
  idxAsInData.length = typeNums.length;
  
  {
    let cnt = 0;
    for(let i=0; i<idxAsInData.length; i++){
      if(typeNums[i] !== -100){
        idxAsInData[i] = cnt;
        cnt++;
      }else idxAsInData[i] = -1;
    }
  }
  
  
  let ifIndentationAt =[];
  
  for(let i=0; i<typeNums.length; i++){
    if(typeNums[i] === 1) ifIndentationAt.push(indentations[i]);
    else if(indentations[i] >= 1) ifIndentationAt.push(indentations[i]-1);
    else ifIndentationAt.push(-1);
  }
  
  console.log("IFINDENTATION",ifIndentationAt);
  
  for(let i=0; i<lineTexts.length; i++){
    // dataの形式
    // sequence -> flow_data = [(data1),(data2), ...] (dataN) = [(int)Type,[(int)To1,(int)To2, ...],(String)text,(int)align-x,(int)deepness,(auto)Other];
    // ただし、align-x,deepnessは0-indexed
    let typeNum = typeNums[i];
    if(typeNum === -100){
      isInElse[indentations[i]] = true;
      continue;
    }
    
    if(elseNextIdx[indentations[i]] != i && typeNum != -100){
      elseNextIdx[indentations[i]] = -1;
      isInElse[indentations[i]] = false;
    }
    if(typeNum === 1) elseNextIdx[ifIndentationAt[i]] = idxAsInData[i];
    
    let to = [];
    let text = lineTexts[i];
    const alignX = indentations[i]-(ifIndentationAt[i] >= 0 && isInElse[ifIndentationAt[i]] ? 1:0);
    let deepness = idxAsInData[i];
    
    // toの更新
    if(i === lineTexts.length-1) to.push(-1);
    else{
      if(indentations[i] === indentations[i+1]) to.push(i+1);
      else{
        if(ifIndentationAt[i] >= 0 && isInElse[ifIndentationAt[i]] && !data[elseNextIdx[ifIndentationAt[i]]][1].includes(idxAsInData[i])){
          data[elseNextIdx[ifIndentationAt[i]]][1].push(idxAsInData[i]);
          elseNextIdx[ifIndentationAt[i]] = idxAsInData[i];
        }
        // typeNumにおいてif = 1
        if(typeNum === 1) to.push(i+1);
        else{
          let nex = i+1;
          // else内なら、表示時に合わせるためにalignXを1引いてしまっているのでその分足してあげる
          let x = alignX+(ifIndentationAt[i] >= 0 && isInElse[ifIndentationAt[i]] ? 1:0);
          // 自分より左(インデントレベルが低い)の「そうでないならば、」ではないものとつなぐ
          while(nex < lineTexts.length){
            if(typeNums[nex] === -100){
              x = indentations[nex];
              nex++;
              while(nex < lineTexts.length){
                if(typeNums[nex] === -100){
                  x = indentations[nex];
                  nex++;
                  continue; 
                }
                if(indentations[nex] <= x) break;
                nex++;
              }
              break;
            }
            if(indentations[nex] < x) break;
            nex++;
          }
          
          if(nex >= lineTexts.length) console.error("自分より左の記号と結ぶときに最後まで該当するものが見つかりませんでした。");
          
          to.push(idxAsInData[nex]);
          
          if(isInElse[ifIndentationAt[i]]){
            isInElse[ifIndentationAt[i]] = false;
            elseNextIdx[ifIndentationAt[i]] = -1;
          }
        }
      }
    }
    
    
    
    data.push([typeNum,to,text,alignX,deepness]);
    
  }
  
  console.log("updated data",data);
  console.log("updateFlowData");
}

document.addEventListener("keydown",(e) =>{
  if(document.activeElement.className !== "editorLine") return;
  
  if(e.key === "Enter"){
    e.preventDefault();
    console.log("Enter is input!!");
    
    // ↓Enterキーが入力されたときにカーソルがのっていた要素
    //console.log(document.activeElement);
    const newLine = createNewLineElement();
    document.activeElement.after(newLine);
    newLine.focus();
  }
  if(e.key === "ArrowUp"){
    if(document.activeElement.previousElementSibling != null) document.activeElement.previousElementSibling.focus();
  }
  if(e.key === "ArrowDown"){
    if(document.activeElement.nextElementSibling != null) document.activeElement.nextElementSibling.focus();
  } 
  if(e.key === "Tab"){
    e.preventDefault();
    
    //&#009はタブ文字である
    document.activeElement.innerHTML = "&#009"+document.activeElement.innerHTML;
    
  }
  if(e.key === "Delete"){
    let nowObj = document.activeElement;
    if(nowObj.innerHTML === '' && nowObj.nextElementSibling != null){
      e.preventDefault();
      nowObj.nextElementSibling.focus();
      nowObj.remove();
    }
  }
  if(e.key === "Backspace"){
    let nowObj = document.activeElement;
    if(nowObj.innerHTML === '' && nowObj.previousElementSibling != null){
      e.preventDefault();
      nowObj.previousElementSibling.focus();
      nowObj.remove();
    }
  }
  
  console.log(e.key,"is entered");
});

// 2.プレビュー関連

function updatePreview(){
  updateFlowData(flow_data);
  const dataAlignX = calcAlignX(flow_data);
  drawToCanvas(flow_data,dataAlignX);
}

//以下、script.jsのコピー

// sequence -> flow_data = [(data1),(data2), ...] (dataN) = [(int)Type,[(int)To1,(int)To2, ...],(String)text,(int)align-x,(int)deepness,(auto)Other];
// ただし、align-x,deepnessは0-indexed
/*

Type ->
    0 = Process
    1 = If
    2 = ForStart
    3 = ForEnd
    4 = Input and Output
    4 = Start and Goal
    
*/

/*
    memo: How to make image by canvas

    Use canvas.toDataURl() !!
    example -> https://www.pazru.net/html5/Canvas/150.html

*/

// test data

const test1_flow = [
  [4,[1],"店に入る",0,0],
  [0,[2],"商品を選ぶ",0,1],
  [0,[3],"会計をする",0,2],
  [4,[-1],"店を出る",0,3]
];

const test2_flow = [
  [4,[1],"データを受け取る",0,0],
  [0,[2],"データをDataに代入",0,1],
  [1,[3,4],"Dataのサイズは2",0,2],
  [0,[5],"サイズは2と出力",0,3],
  [0,[5],"サイズは2以外と出力",1,3],
  [4,[-1],"プログラムの終了",0,4]
];

const test3_flow = [
  [4,[1],"プログラムの開始",0,0],
  [3,[2],"整数を受け取る",0,1],
  [1,[3,4],"整数%2は0である",0,2],
  [3,[5],"奇数と出力",0,3],
  [3,[5],"偶数と出力",1,3],
  [4,[-1],"プログラムの終了",0,4]
];

const test4_flow = [
  [2,[1],"ForStart",0,0],
  [3,[2],"print(\"hello world\")",0,1],
  [5,[-1],"ForEnd",0,2],
];

const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 1000;

const rectW = 172;
const rectH = 86;
const padding = 120;

// canvasの情報
// let info = {
//   canvas:document.getElementById("canvas")
// }


// 横方向にどれくらい分割するか

function calcAlignX(flow_data){
  let max_align_level = -1;
  for(let i=0; i<flow_data.length; i++){
    if(max_align_level < flow_data[i][3]) max_align_level = flow_data[i][3];
  }

  return canvas.width / (max_align_level+2);
}

function ctxInit(ctx){
  ctx.textAlign = "center";
  ctx.font = "16px serif";
}

function canvasInit(ctx,beforeCtxFillStyle){
  ctx.fillStyle = "white";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = beforeCtxFillStyle;
}


//draw系関数についての補足
/*
alignX*(flow_data[i][3]+1)-rectW/2
という値が多く用いられているが、これはProcessShapeの長方形(縦:rectH,横:rectW)を描画したときの
左上の頂点にあたる座標である。

*/
function drawProcessShape(flow_data,i,alignX,ctx){
  ctx.rect(alignX*(flow_data[i][3]+1)-rectW/2,20+padding*flow_data[i][4],rectW,rectH);
  ctx.stroke();
}

function drawForStartShape(flow_data,i,alignX,ctx){
  //へこむ長さ
  const dent = Math.round(rectW*0.1);
  ctx.moveTo(alignX*(flow_data[i][3]+1)-rectW/2+dent,20+padding*flow_data[i][4]);
  ctx.lineTo(alignX*(flow_data[i][3]+1)-rectW/2,20+padding*flow_data[i][4]+dent);
  ctx.lineTo(alignX*(flow_data[i][3]+1)-rectW/2,20+padding*flow_data[i][4]+rectH);
  ctx.lineTo(alignX*(flow_data[i][3]+1)-rectW/2+rectW,20+padding*flow_data[i][4]+rectH);
  ctx.lineTo(alignX*(flow_data[i][3]+1)-rectW/2+rectW,20+padding*flow_data[i][4]+dent);
  ctx.lineTo(alignX*(flow_data[i][3]+1)-rectW/2+rectW-dent,20+padding*flow_data[i][4]);
  ctx.lineTo(alignX*(flow_data[i][3]+1)-rectW/2+dent,20+padding*flow_data[i][4]);
  ctx.stroke();
}

// ForStartShapeの上下反転版
function drawForEndShape(flow_data,i,alignX,ctx){
  //へこむ長さ
  const dent = Math.round(rectW*0.1);
  ctx.moveTo(alignX*(flow_data[i][3]+1)-rectW/2,20+padding*flow_data[i][4]);
  ctx.lineTo(alignX*(flow_data[i][3]+1)-rectW/2,20+padding*flow_data[i][4]+rectH-dent);
  ctx.lineTo(alignX*(flow_data[i][3]+1)-rectW/2+dent,20+padding*flow_data[i][4]+rectH);
  ctx.lineTo(alignX*(flow_data[i][3]+1)-rectW/2+rectW-dent,20+padding*flow_data[i][4]+rectH);
  ctx.lineTo(alignX*(flow_data[i][3]+1)-rectW/2+rectW,20+padding*flow_data[i][4]+rectH-dent);
  ctx.lineTo(alignX*(flow_data[i][3]+1)-rectW/2+rectW,20+padding*flow_data[i][4]);
  ctx.lineTo(alignX*(flow_data[i][3]+1)-rectW/2,20+padding*flow_data[i][4]);
}

function drawInputAndOutputShape(flow_data,i,alignX,ctx){
  //はみ出す長さ
  const stickOut = Math.round(rectW*0.07);
  ctx.moveTo(alignX*(flow_data[i][3]+1)-rectW/2+stickOut,20+padding*flow_data[i][4]);
  ctx.lineTo(alignX*(flow_data[i][3]+1)-rectW/2-stickOut,20+padding*flow_data[i][4]+rectH);
  ctx.lineTo(alignX*(flow_data[i][3]+1)-rectW/2-stickOut+rectW,20+padding*flow_data[i][4]+rectH);
  ctx.lineTo(alignX*(flow_data[i][3]+1)-rectW/2+stickOut+rectW,20+padding*flow_data[i][4]);
  ctx.lineTo(alignX*(flow_data[i][3]+1)-rectW/2+stickOut,20+padding*flow_data[i][4]);
  ctx.stroke();
}

function drawStartGoalShape(flow_data,i,alignX,ctx){
  ctx.moveTo(alignX*(flow_data[i][3]+1)-rectW/2+rectH/2,20+padding*flow_data[i][4]);
  ctx.lineTo(alignX*(flow_data[i][3]+1)+rectW/2-rectH/2,20+padding*flow_data[i][4]);
  ctx.moveTo(alignX*(flow_data[i][3]+1)-rectW/2+rectH/2,20+padding*flow_data[i][4]+rectH);
  ctx.lineTo(alignX*(flow_data[i][3]+1)+rectW/2-rectH/2,20+padding*flow_data[i][4]+rectH);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(alignX*(flow_data[i][3]+1)-rectW/2+rectH/2,20+padding*flow_data[i][4]+rectH/2,rectH/2,-Math.PI/2,Math.PI*2/4,true);

  ctx.stroke();
  ctx.beginPath();
  ctx.arc(alignX*(flow_data[i][3]+1)+rectW/2-rectH/2,20+padding*flow_data[i][4]+rectH/2,rectH/2,-Math.PI/2,Math.PI*2/4,false);
  ctx.stroke();
}

function drawIfShape(flow_data,i,alignX,ctx){
  
  ctx.moveTo(alignX*(flow_data[i][3]+1),20+padding*flow_data[i][4]);
  ctx.lineTo(alignX*(flow_data[i][3]+1)-rectW/2,20+padding*flow_data[i][4]+rectH/2);
  ctx.lineTo(alignX*(flow_data[i][3]+1),20+padding*flow_data[i][4]+rectH);
  ctx.lineTo(alignX*(flow_data[i][3]+1)+rectW/2,20+padding*flow_data[i][4]+rectH/2);
  ctx.lineTo(alignX*(flow_data[i][3]+1),20+padding*flow_data[i][4]);
  ctx.stroke(); 
}

function drawTextToShape(flow_data,i,alignX,ctx){
  ctx.fillText(flow_data[i][2], alignX*(flow_data[i][3]+1),20+padding*flow_data[i][4]+rectH/2+6);
  ctx.stroke();
}

function drawToCanvas(flow_data, alignX){
  ctxInit(ctx);
  canvasInit(ctx,ctx.fillStyle);
  for(let i=0; i<flow_data.length; i++){
    ctx.beginPath();
    console.log(flow_data[i]);
    
    switch(flow_data[i][0]){
      case 0:
        // process
        drawProcessShape(flow_data,i,alignX,ctx);
        break;
      case 1:
        // if
        drawIfShape(flow_data,i,alignX,ctx);
        ctx.fillText("Yes", alignX*(flow_data[i][3]+1)+rectW/2+30,20+padding*flow_data[i][4]+rectH/2-10);
        ctx.fillText("No", alignX*(flow_data[i][3]+1)+30,20+padding*flow_data[i][4]+rectH+10);
        ctx.stroke();
        break;
      case 2:
        // forStart
        drawForStartShape(flow_data,i,alignX,ctx);
        break;
      case 3:
        // forEnd
        
        drawForEndShape(flow_data,i,alignX,ctx);
        
        break;
      case 4:
        // input or output
        
        drawInputAndOutputShape(flow_data,i,alignX,ctx);
        break;
      case 5:
        // start or end
        drawStartGoalShape(flow_data,i,alignX,ctx);
        break;
    }


    drawTextToShape(flow_data,i,alignX,ctx);

    // draw arrow

    for(let nex=0; nex<flow_data[i][1].length; nex++){
      ctx.beginPath();
      let nexI = flow_data[i][1][nex];

      // no arrow
      if(nexI == -1) break;


      // same x
      console.log("Ok idx",i);
      console.log("Ok nextIdx",nexI);
      
      if(flow_data[i][3] == flow_data[nexI][3]){
        ctx.moveTo(alignX*(flow_data[i][3]+1),20+padding*flow_data[i][4]+rectH);
        ctx.lineTo(alignX*(flow_data[nexI][3]+1),20+padding*flow_data[nexI][4]);
        ctx.stroke();
      }else{
        // In different alignX cases
        let diffX;
        let diffD;

        diffX = flow_data[nexI][3] - flow_data[i][3];
        diffD = flow_data[nexI][4] - flow_data[i][4];

        if(diffX < 0){
          console.log("diffX < 0");
          if(diffD == 0){
            console.log("diffD == 0");
            ctx.moveTo(alignX*(flow_data[i][3]+1)-rectW/2,20+padding*flow_data[i][4]+rectH/2);
            ctx.lineTo(alignX*(flow_data[nexI][3]+1)+rectW/2,20+padding*flow_data[nexI][4]+rectH/2);
          }else{
            console.log("diffD != 0");
            // ctx.moveTo(alignX*(flow_data[i][3]+1),20+padding*flow_data[i][4]+rectH);
            // ctx.lineTo(alignX*(flow_data[i][3]+1),20+padding*flow_data[nexI][4]+rectH/2);
            // ctx.lineTo(alignX*(flow_data[nexI][3]+1)+rectW/2,20+padding*flow_data[nexI][4]+rectH/2);
            
            // ここの-15はさじ加減である
            // 左に向かって合流するときに、合流直後の記号よりどれくらい上の高さで合流するかがこのパラメータで変わる
            ctx.moveTo(alignX*(flow_data[i][3]+1),20+padding*flow_data[i][4]+rectH);
            ctx.lineTo(alignX*(flow_data[i][3]+1),20+padding*flow_data[nexI][4]-15);
            ctx.lineTo(alignX*(flow_data[nexI][3]+1),20+padding*flow_data[nexI][4]-15);
          }
        }else{
          console.log("diffX >= 0");
          if(diffD == 0){
            console.log("diffD == 0");
            ctx.moveTo(alignX*(flow_data[i][3]+1)+rectW/2,20+padding*flow_data[i][4]+rectH/2);
            ctx.lineTo(alignX*(flow_data[nexI][3]+1)-rectW/2,20+padding*flow_data[nexI][4]+rectH/2);
          }else{
            console.log("diffD != 0");
            ctx.moveTo(alignX*(flow_data[i][3]+1)+rectW/2,20+padding*flow_data[i][4]+rectH/2);
            ctx.lineTo(alignX*(flow_data[nexI][3]+1),20+padding*flow_data[i][4]+rectH/2);
            ctx.lineTo(alignX*(flow_data[nexI][3]+1),20+padding*flow_data[nexI][4]);
          }
        }
        ctx.stroke();

      }
    }
    ctx.closePath();

  }
    
}

// max test index is 4
// let data = test3_flow; // change this to  change test data

// let a_x = calcAlignX(data);

// drawToCanvas(data,a_x);

// 3.htmlの補正
//縦方向のスクロールでは動かず、横方向のスクロールで動くように
const divideLineElement = document.getElementById("divideLine");
const titlesDiv = document.getElementById("titles");

window.addEventListener('scroll', () => {
  divideLineElement.style.left = -window.pageXOffset + 'px';
  titlesDiv.style.left = -window.pageXOffset + 'px';
})