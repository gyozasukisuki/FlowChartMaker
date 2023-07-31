
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

const canvas = document.getElementById("canvas");
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

//max test index is 4
let data = test3_flow; // change this to  change test data

let a_x = calcAlignX(data);

drawToCanvas(data,a_x);


