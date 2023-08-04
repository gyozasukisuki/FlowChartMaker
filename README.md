# FlowChartMaker
和文のデータまたは、直観的な操作の結果をもとにフローチャートを生成するWebアプリです。

# 操作方法 〜直感的な操作〜
## 記号の追加
最初は「末尾に記号を追加」ボタンで新しい記号情報入力欄を作成してください。

その後は、緑背景の＋ボタンから、そのボタンの位置に新しい記号情報入力欄が作成することができます。

## 記号情報入力欄について
### タイプ
その記号が表す構造の種類(処理、分岐、反復)を指定します。

この値によって生成されるフローチャート内の記号の形が変化します。

#### 分岐時の合流地点の指定について
合流地点の指定欄には、条件に合致した場合(Yes)の分岐先の最後の記号から出た線が、どの記号の**直前**で合流をするかをインデックス(記号nのn)で指定してください。

### テキスト
記号内の文字(文章)を指定します。

この値は**そのまま**反映されます。

## プレビュー更新
「プレビュー更新」ボタンを押すことで、フローチャートを生成させることができます。

このとき、同時に記号情報入力欄の位置の調整が行われます。

分岐の合流地点の指定を忘れずに行った後にプレビューを更新してください。

# 操作方法 〜和文の入力による生成〜
左に黒線のあるところが入力欄(以下、行と呼びます)です。

ここから出てくる「インデント」(字下げ)は特に断らない場合レベル1のインデントのことを指します。

上下キーで行間の移動ができます。

また、Enterキーで現在カーソルのある行の直後に新しい行を追加することができます。

直前に新しい行を追加するときはCtrl+Enterを入力してください。

Enterキーのみを押しているのに直前に行が追加される場合は一度Ctrlのみを押して離すと治る可能性があります。(内部のフラグの影響です)

何か文字を入力した後にTabキーを入力することでカーソルのある行にレベル1のインデントを追加することができます。

「和文による作成」における文法を下記に示します。

## プレビュー更新
「プレビュー更新」ボタンを押す、またはCtrl+Alt+Enterで、フローチャートを生成させることができます。

## フローチャートの開始
「フローチャートを開始」と入力。

「開始」と端子に書かれます。

## フローチャートの終了
「フローチャートを終了」と入力。

「終了」と端子に書かれます。

## 分岐
〜という条件を記号に書きたいとき、「もし、〜ならば、」と入力。

条件に合致した場合の処理は、「もし、〜ならば、」と書いた行の直後の行からインデントをひとつ下げて記述。

条件に合致しなかった場合の処理は、「もし、〜ならば、」と書いた行と同じインデントで「そうでないならば、」と記述し、その後にインデントをひとつ下げて記述。

## (ファイルの)入出力
「〜を入力」「〜を出力」と入力。

「〜を入力」「〜を出力」が**そのまま**ファイルの入出力の記号に書かれます。

## 反復(ループ)
反復を開始するときは「〜間繰り返す」と入力。 例: 3回の間繰り返す

「〜間」が反復開始の記号に書かれます。

反復を終了するときは「ループの終了地点」と入力。

何も書かれていない反復終了の記号として表示されます。

反復終了の記号に何か書きたい場合は「記号タイプ強制指定」の機能を用いて反復終了の記号を追加してください。

## 処理
分岐の「もし、〜ならば、」などのキーワードが特に見つからない行に関しては処理としてみなされ処理の記号に行の内容がそのまま書かれます。

## 記号タイプ強制指定
「「記号タイプ」」(全角または半角スペース)〜と入力。

"記号タイプ"で指定したタイプの形の記号に〜がそのまま書かれます。

例: 「「端子」」 3秒後に開始 -> 端子の記号に「3秒後に開始」と書かれて表示されます。

指定できる記号タイプ一覧(2023/08/03現在)

- 端子
- 処理
- 判断
- 条件不一致
- ループ始端
- ループ終端
- データ

# 注意
現在はまだバグが多くあるため、想定されていない操作を行うとページがフリーズする可能性や期待した結果を得られない場合がございます。
