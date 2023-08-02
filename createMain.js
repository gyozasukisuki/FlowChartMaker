/*

目次
1.作成用UI
2.プレビュー関連
3.htmlの補正

検索をかけて移動すると便利
*/


// 1.作成用UI
const types = ["処理","判断","ループ開始","ループ終了","入力・出力","端子"];
//追加されたときに、横側にもう一つprocessRectを追加すべきtypeの配列
const addRightRectType = ["判断"];

// getInformationsOfで取得するにはここに情報の名前(クラス名)を記す必要があるので注意!
const classNames = ["processType","processText","alignX","visibility","index"];

//深さによって変える色
const alignXColor = ["rgb(250,250,250)","rgb(220,220,220)","rgb(190,190,190)","rgb(160,160,160)","rgb(130,130,130)","rgb(100,100,100)","rgb(70,70,70)","rgb(40,40,40)"];
/*

Type ->
    0 = Process
    1 = If
    2 = For
    3 = Input and Output
    4 = Start and Goal
    
*/
let processIdx = 1;
let nowSideDepth = 0;

let flow_data = [];


function createProcessRect(n, alignX, hide = false){
  //　隣にprocessRectを追加するときに必要なdiv
  let divForAddRightRect = document.createElement("div");
  divForAddRightRect.className = "processRectArea";
  divForAddRightRect.style.display = "flex";
  
  
  //processRect+addButton全体を表すdiv
  let rectAndButtonDiv = document.createElement("div");
  rectAndButtonDiv.className = "processRectAndAddButton";
  
  // 記号の情報を入力する欄
  let div = document.createElement("div");
  div.className = "processRect";
  
  
  let deleteButton = document.createElement("input");
  deleteButton.type = "button";
  deleteButton.value = "✕";
  deleteButton.style.fontSize = "10px";
  deleteButton.style.display = "block";
  //deleteButton.style.textAlign = "left";
  deleteButton.style.marginLeft = "0px";
  deleteButton.style.marginRight = "0px";
  
  deleteButton.onclick = () => deleteProcessRect(deleteButton);
  
  deleteButton.style.backgroundColor = "lightgray";
  
  deleteButton.addEventListener("mouseover",() => {
    console.log(deleteButton.style.backgroundColor);
    deleteButton.style.backgroundColor = "rgb(200,100,100)";
    deleteButton.style.color = "white";
  });
  
  deleteButton.addEventListener("mouseleave",() => {
    console.log(deleteButton.style.backgroundColor);
    deleteButton.style.backgroundColor = "lightgray";
    deleteButton.style.color = "black";
  });
  
  div.appendChild(deleteButton);
  
  let interFlowToLabel = document.createElement("label");
  interFlowToLabel.textContent = "合流地点の記号番号";
  interFlowToLabel.style.fontSize = "15px";
  let interFlowToText = document.createElement("input");
  interFlowToText.type = "number";
  interFlowToText.style.width = "30px";
  interFlowToText.style.height = "18px";
  interFlowToText.style.fontSize = "15px";
  interFlowToText.style.resize = "none";
  
  interFlowToLabel.for = interFlowToText;
  div.appendChild(interFlowToLabel);
  div.appendChild(interFlowToText);
  interFlowToLabel.style.display = "none";
  interFlowToText.style.display = "none";
  
  let depthText = document.createElement("span");
  depthText.textContent = "深さ:"+String(alignX+1);
  depthText.className = "alignX";
  depthText.style.fontSize = "16px";
  depthText.style.display = "block";
  depthText.style.textAlign = "right";
  depthText.style.marginLeft = "0px";
  depthText.style.marginTop = "0px";
  depthText.style.marginLeft = "0px";
  depthText.style.marginRight = "0px";
  div.appendChild(depthText);
  
  let span = document.createElement("span");
  span.textContent = "記号" + String(n);
  span.marginTop = "0px";
  span.className = "index";
  div.appendChild(span);
  
  // 内部インデックス(表示はしない)
  let hiddenIdx = document.createElement("span");
  hiddenIdx.style.visibility = "hidden";
  hiddenIdx.className = "hiddenIdx";
  div.appendChild(hiddenIdx);
  
  hiddenIdx.textContent = String(n);
  div.appendChild(hiddenIdx);
  
  div.appendChild(document.createElement("br"));
  
  let typeLabel = document.createElement("label");
  typeLabel.textContent = "タイプ";
  
  div.appendChild(typeLabel);
  
  let typeSelect = document.createElement("select");
  typeSelect.className = "processType";
  
  for(let i=0; i<types.length; i++){
    let op = document.createElement("option");
    op.textContent = types[i];
    
    typeSelect.appendChild(op);
  }
  
  typeSelect.addEventListener("change",(e) => {
    if(addRightRectType.includes(typeSelect.value)){
      console.log("addRightRect!")
      
      divForAddRightRect.appendChild(createProcessRect(-1,alignX+1,true));
      fixProcessRectIndexes();
      insertProcessRectAfterIdxOf(Number(hiddenIdx.textContent)+1);
      interFlowToLabel.style.display = "inline-block";
      interFlowToText.style.display = "inline-block";
      
    }else{
      if(divForAddRightRect.children.length >= 2) divForAddRightRect.children[1].remove();
      
      interFlowToLabel.style.display = "none";
      interFlowToText.style.display = "none";
      
    }
    
    fixProcessRectIndexes();
  });
  
  div.appendChild(typeSelect);
  
  let processTextLabel = document.createElement("label");
  processTextLabel.textContent = "テキスト";
  
  div.appendChild(processTextLabel);
  
  let textarea = document.createElement("textarea");
  textarea.className = "processText";
  //リサイズを垂直方向のみに制限
  textarea.style.resize = "vertical";
  div.appendChild(textarea);
  
  div.style.backgroundColor = alignXColor[(alignX%alignXColor.length)];
  div.style.marginBottom = "0px";
  
  rectAndButtonDiv.appendChild(div);
  
  let addButton = document.createElement("input");
  addButton.type = "button";
  addButton.value = "+";
  addButton.height = "35px";
  addButton.width = "35px";
  addButton.style.display = "block";
  addButton.style.marginLeft = "auto";
  addButton.style.marginRight = "auto";
  addButton.style.marginTop = "15px";
  addButton.style.marginBottom = "0px";
  addButton.style.backgroundColor = "rgb(100,210,100)";
  addButton.style.fontSize = "15px";
  
  addButton.onclick = () => insertProcessRectAfterIdxOf(Number(hiddenIdx.textContent));
  
  rectAndButtonDiv.appendChild(addButton);
  rectAndButtonDiv.style.marginBottom = "15px";
  rectAndButtonDiv.style.marginRight = "15px";
  
  
  rectAndButtonDiv.style.flexShrink = "0";
  
  // 第三引数の真偽値によって非表示にするかを決める
  if(hide) rectAndButtonDiv.style.visibility = "hidden";
  
  divForAddRightRect.appendChild(rectAndButtonDiv);
  
  return divForAddRightRect;
}

function insertProcessRect(n){
  let editBlock = document.getElementById("editBlock");
  
  editBlock.insertBefore(n,document.getElementById("addToBottomButton"));
}

function deleteProcessRect(deleteButton){
  // deleteButtonのparentNode -> processRect processRectのparentNode -> processRectAndAddButton processRectAndAddButtonのparentNode -> processRectArea 
  let removeObj = deleteButton.parentNode.parentNode.parentNode;
  
  if(removeObj.children.length >= 2){
    let x = removeObj;
    let haveChild = false;
    while(x.children.length >= 2){
      x = x.children[1];
      if(x.children[0].style.visibility !== "hidden") haveChild = true;
    }
    if(haveChild){
      // 自分より右側に記号があるなら自分を見えなくするのみ
      removeObj.children[0].style.visibility = "hidden";
      fixProcessRectIndexes();
      return;
    }
  }
  
  while(removeObj.parentNode != document.getElementById("editBlock")){
    // removeObj.parentNode.children[0]は自分より1つ左のもののprocessRectである
    console.log(removeObj.parentNode.children);
    if(removeObj.parentNode.children[0].style.visibility != "hidden") break;
    
    removeObj = removeObj.parentNode;
  }
  removeObj.remove();
  fixProcessRectIndexes();
}

function shapingProcessRects(){
  const visibilities = getInformationsOf("visibility");
  const processRects = document.getElementsByClassName("processRect");
  const alignXInfo = getInformationsOf("alignX");
  const typeNames = getInformationsOf("processType");
  const indexes = getInformationsOf("index");
  
  let interFlowPoints = [];
  
  for(let i=0; i<processRects.length; i++){
    if(!visibilities[i]) continue;
    
    if(changeTypeNameToTypeNum(typeNames[i]) === changeTypeNameToTypeNum("判断")){
      interFlowPoints.push(Number(processRects[i].children[2].value));
    }
    
    if(i === 0) continue;
    if(interFlowPoints.includes(indexes[i])) continue;
    
    let idx = i;
    if(Number(alignXInfo[i].substr(3))-1 >= 1){
      // このスコープ内のidxは今のprocessRectの左隣となるようなprocessRectのインデックスである
      const alignX = Number(alignXInfo[i].substr(3))-1;
      
      for(let j=i-1; j>=0; j--){
        if(alignXInfo[i] === alignXInfo[j] && visibilities[j]) break;
        
        if(Number(alignXInfo[j].substr(3))-1 === alignX-1){
          if(changeTypeNameToTypeNum(typeNames[j]) === changeTypeNameToTypeNum("判断")) break;
          idx = j;
        }
      }
      if(idx+1 === i) continue;
      
      let newProcessRect = createProcessRect(-1,alignX);
      
      // processTypeの更新 newProcessRect.children[0].children[0]がnewProcessRect(className="processRectArea")のprocessRect部分
      newProcessRect.children[0].children[0].children[8].value = processRects[i].children[8].value;
      
      // processTextの更新
      newProcessRect.children[0].children[0].children[10].value = processRects[i].children[10].value;
      
      
      if(changeTypeNameToTypeNum(typeNames[i]) === changeTypeNameToTypeNum("判断")){
        // interFlowToLabel.style.display = "inline-block";と同じことをする
        newProcessRect.children[0].children[0].children[1].style.display = "inline-block";
        // interFlowToText.style.display = "inline-block";と同じことをする
        newProcessRect.children[0].children[0].children[2].style.display = "inline-block";
        newProcessRect.children[0].children[0].children[2].value = processRects[i].children[2].value;
      }
      
      
      deleteProcessRect(processRects[i].children[0]);
      
      processRects[idx].parentNode.parentNode.appendChild(newProcessRect);
      
      
    }else{
      // このスコープ内のidxは今のprocessRectが入る場所にあるprocessRectのインデックスである
      for(let j=i-1; j>=0; j--){
        // 上に自分と同じalignXの可視の記号がある場合(頭打ち)
        if(visibilities[j] && alignXInfo[j] === alignXInfo[i]) break;
        // 入れるスペースが見つかった場合
        if(!visibilities[j] && alignXInfo[j] === alignXInfo[i]) idx = j;
      }
      if(idx === i) continue;
      
      // processTypeの更新
      processRects[idx].children[8].value = processRects[i].children[8].value;
      
      // processTextの更新
      processRects[idx].children[10].value = processRects[i].children[10].value;  
      
      if(changeTypeNameToTypeNum(typeNames[i]) === changeTypeNameToTypeNum("判断")){
        // interFlowToLabel.style.display = "inline-block";と同じことをする
        processRects[idx].children[1].style.display = "inline-block";
        // interFlowToText.style.display = "inline-block";と同じことをする
        processRects[idx].children[2].style.display = "inline-block";
        processRects[idx].children[2].value = processRects[i].children[2].value;
      }
      
      // children[0]はdeleteButton
      deleteProcessRect(processRects[i].children[0]);
      processRects[idx].parentNode.style.visibility = "visible";
      
    }
    
    fixProcessRectIndexes();
    
    break;
  }
  
}

function fixProcessRectIndexes(){
  const visibilities = getInformationsOf("visibility");
  
  const indexes = document.getElementsByClassName("index");
  const hiddenIndexes = document.getElementsByClassName("hiddenIdx");
  let idxCnt = 1;
  for(let i=0; i<indexes.length; i++){
    if(visibilities[i]){
      indexes[i].textContent = "記号"+String(idxCnt);
      idxCnt++;
    }
    hiddenIndexes[i].textContent = String(i+1);
  }
  //次に追加されるProcessRectsのIndexはindexesの長さ+1と等しい
  processIdx = idxCnt;
}



function addProcessRect(to){
  if(to === "rightBottom"){
    nowSideDepth++;
  }else if(to === "leftBottom"){
    if(nowSideDepth === 0){
      alert("これ以上浅くできません");
      return;
    }
    nowSideDepth--;
  }else if(to != "bottom"){
    console.error("未定義な追加先です。");
    return;
  }
  const processRect = createProcessRect(processIdx,nowSideDepth);
  
  insertProcessRect(processRect);
  processIdx++;
}

// インデックスがprocessRectIdxのprocessRectの直後に新たなprocessRectを挿入+記号番号(インデックス)の整理を行う
// ここでのprocessRectIdxは1-indexedであり、また内部インデックスであることに注意
function insertProcessRectAfterIdxOf(processRectIdx){
  console.log(processRectIdx);
  const processRectAreas = document.getElementsByClassName("processRectArea");
  
  const alignXInfo = getInformationsOf("alignX");
  // console.log(alignXInfo);
  // console.log(alignXInfo[processRectIdx-1]);
  const parentAlignX = Number(alignXInfo[processRectIdx-1].substr(3))-1;
  
  const newProcessRect = createProcessRect(-1,parentAlignX);
  
  // xはprocessRectIdxの含まれる行の一番左にあるprocessRectを指す
  let leaderProcessRect = processRectAreas[processRectIdx-1];
  
  while(leaderProcessRect.parentNode != document.getElementById("editBlock")){
    leaderProcessRect = leaderProcessRect.parentNode;
  }
  
  console.log(leaderProcessRect.nextElementSibling);
  
  if(parentAlignX > 0){
    // 空白の調整が必要な場合
    // processRectのvisibilityをhiddenにする
    
    let addRects = [];
    for(let i=0; i<parentAlignX; i++){
      addRects.push(createProcessRect(-1,i,true));
    }
    addRects.push(newProcessRect);
    for(let i=addRects.length-1; i>=1; i--){
      addRects[i-1].append(addRects[i]);
    }
    leaderProcessRect.after(addRects[0]);
    
  }else processRectAreas[processRectIdx-1].after(newProcessRect);
  
  fixProcessRectIndexes();
  
}

// processRects関係の情報を配列で取得
// 使用可能なclassName -> "processType", "processText","alignX","visibility","index"
function getInformationsOf(className){
  if(!classNames.includes(className)){
    console.error(String(className)+"というclassNameは存在しません");
    return;
  }
  if(className === "visibility"){
    // hiddenならfalse それ以外ならtrue
    const processRectAndAddButtons = document.getElementsByClassName("processRectAndAddButton");
    let res = [];
    for(let i=0; i<processRectAndAddButtons.length; i++){
      res.push((processRectAndAddButtons[i].style.visibility != "hidden"));
    }
    return res;
  }else if(className === "index"){
    const indexTexts = document.getElementsByClassName("index");
    let res = [];
    for(let i=0; i<indexTexts.length; i++) res.push(Number(indexTexts[i].textContent.substr(2)));
    return res;
  }
  const info = document.getElementsByClassName(className);
  
  let res = [];
  res.length = info.length;
  for(let i=0; i<info.length; i++){
    if(className === "alignX") res[i] = info[i].textContent;
    else res[i] = info[i].value;
  }
  return res;
}

// それぞれに対応する番号を返す(整数型)
function changeTypeNameToTypeNum(typeName){
  switch(typeName){
    case "処理":
      return 0;
    case "判断":
      return 1;
    case "ループ開始":
      return 2;
    case "ループ終了":
      return 3;
    case "入力・出力":
      return 4;
    case "端子":
      return 5;
    default:
      console.error("定義されていない名前のTypeNameが引数として渡されました。")
      break;
  }
}


function updateFlowData(data){
  const processRects = document.getElementsByClassName("processRect");
  
  const indexes = getInformationsOf("index");
  const typeNames = getInformationsOf("processType");
  const texts = getInformationsOf("processText");
  const alignXInfo = getInformationsOf("alignX");
  const visibilities = getInformationsOf("visibility");
  //console.log(processRects);
  console.log(typeNames);
  console.log(texts);
  console.log(alignXInfo);
  console.log(indexes);
  
  let maxAlignX = -1;
  for(let i=0; i<alignXInfo.length; i++) maxAlignX = Math.max(maxAlignX,Number(alignXInfo[i].substr(3)));
  
  // 各AlignXの合流地点のインデックスを表す
  // interFlowPoints[その要素のAlignX]でその要素のAlignXがどこで1つ左と合流するかが取得可能(1-indexed)
  let interFlowPoints = [];
  interFlowPoints.length = maxAlignX;
  interFlowPoints[0] = -100; // alignXが0のものから左に行くことは存在しないのでありえない値に設定しておく
  
  // dataは一度すべて削除される
  // dataは作られたprocessRectsの数にリサイズ
  //console.log(flow_data.length);
  
  // 空にする
  data.length = 0;
  
  // 深さを上(インデックス順)から決め打つために用いる変数
  let deepnessCnt = 0;
  let deepnessArr = [];
  deepnessArr.length = maxAlignX;
  deepnessArr[0] = 0;
  
  for(let i=0; i<processRects.length; i++){
    
    if(!visibilities[i]) continue;
    
    // 各processRectの内容をdataにプッシュしていく
    // dataの形式
    // sequence -> flow_data = [(data1),(data2), ...] (dataN) = [(int)Type,[(int)To1,(int)To2, ...],(String)text,(int)align-x,(int)deepness,(auto)Other];
    // ただし、align-x,deepnessは0-indexed
    const typeNum = changeTypeNameToTypeNum(typeNames[i]);
    
    // alignXInfo[i]の形式は"深さ:x"(xは0-indexedの整数)なので、実際にalign-xとして使うときは
    // Number(alignXInfo[i].substr(3))-1として取得する(3は"深さ:"の直後のindex、-1は0-indexedにするため)
    const alignX = Number(alignXInfo[i].substr(3))-1;
    
    const to = [];
    const text = texts[i];
    // 縦方向の深さはあとから更新する必要があるため可変
    let deepness = i;
    
    // toの更新
    if(i != processRects.length-1){
      if(typeNum === changeTypeNameToTypeNum("判断")){
        //"判断"のときの横への線についてのデータを作成する
          
        // ProcessRectのchildrenの順番が変わる可能性があるので注意
        // 現在children[2] はどこで合流するかを表すinputにつながっている
        // 合流地点が不正な値になっていないかの確認などを行う最終チェック的な関数がほしい
        interFlowPoints[alignX+1] = Number(processRects[i].children[2].value);
        console.log(interFlowPoints[alignX]);
        
        let idx = i;
        // ifの分岐先が削除されていた場合のことを考えてエラー処理を付け加える必要がある
        while(!visibilities[idx] || ( alignXInfo[idx].substr(3)-1 != alignX+1 && idx < indexes.length)){
          idx++;
        }
        
        to.push(indexes[idx]-1);
        // console.log("idx",idx);
        
      }
      let nextIdx = i+1;

      
      
      // 自分と同じalignXのやつがくるまでwhileでみていってそことつなぐ
      // もし、見つかる前にinterFlowPoints[alignX]のやつがやってきたらそことつなぐ。
      let nextAlignX = Number(alignXInfo[nextIdx].substr(3))-1;
      console.log("interFlows",interFlowPoints);
      while((!visibilities[nextIdx] || alignXInfo[nextIdx] != alignXInfo[i]) && indexes[nextIdx] != interFlowPoints[alignX]){
        nextIdx++;
        console.log("nextIdx",nextIdx,"i:",i,"inter:",interFlowPoints[alignX]);
        nextAlignX = Number(alignXInfo[nextIdx].substr(3))-1;
      }

      to.push(indexes[nextIdx]-1);

    
    }else to.push(-1);
    
    // deepness
    deepness = deepnessArr[alignX];
    console.log("deepness",deepness);
    if(typeNum === changeTypeNameToTypeNum("判断")) deepnessArr[alignX+1] = deepnessArr[alignX]+1;
    
    deepnessArr[alignX]++;
    
    if(alignX >= 1){
      // (エディタ上で)自分と同じ高さの"自分より左側"の記号の中に空白のものがあったらそこのalignXのdeepnessArr更新
      for(let j = 1; j<=alignX; j++){
        if(visibilities[i-j]) break;
        deepnessArr[alignX-j]++;
      }
    }
    
    console.log(alignX);
    console.log(alignXInfo[i]);

    data.push([typeNum,to,text,alignX,deepness]);
  }
  
  //console.log(processRects);
  console.log(data);
  console.log("deepnessArr",deepnessArr);
}

// 2.プレビュー関連

function updatePreview(){
  for(let i=0; i<document.getElementsByClassName("processRect").length; i++) shapingProcessRects();
  
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
    5 = Start and Goal
    
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

window.onbeforeunload = (e) => {
    e.returnValue = "本当にページを離れますか?";
}
