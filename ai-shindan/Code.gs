const ANSWER_SHEET = 'AI診断回答';
const QUESTIONS = [
  {id:'q1', title:'AIをどのくらいの頻度で使っていますか？', weight:5, options:[
    ['ほとんど使っていない',0],['月に数回、試す程度',1],['週に1〜2回使う',2],['ほぼ毎日使う',3],['毎日、複数の業務で使い分けている',4]]},
  {id:'q2', title:'AIをどのような用途で使っていますか？', weight:5, options:[
    ['使ったことがない',0],['質問・検索・相談が中心',1],['文章作成や要約など、1〜2用途で使う',2],['企画・分析・資料・画像など複数用途で使う',3],['業務の目的に応じて用途やAIを体系的に使い分けている',4]]},
  {id:'q3', title:'AIに対して、どの程度具体的な指示を出せますか？', weight:10, options:[
    ['思いついたことを短く入力する程度',0],['目的や質問を伝えられる',1],['背景・条件・希望する形式を伝えられる',2],['役割・制約・評価基準・出力形式を整理して指示できる',3],['試行結果を評価し、指示を改善して安定した成果を引き出せる',4]]},
  {id:'q4', title:'AIを使って、仕事で使える成果物を作っていますか？', weight:10, options:[
    ['仕事では使っていない',0],['試しに文章などを作ったことがある',1],['メール・文章・議事録などを自分で作成できる',2],['提案書・企画書・画像・コードなどを実務で継続利用している',3],['品質基準を設け、修正・検証を含めて成果物を安定運用している',4]]},
  {id:'q5', title:'AIによって、業務時間やコストを削減できていますか？', weight:10, options:[
    ['効果を感じていない／測っていない',0],['一部の作業で少し便利になった',1],['特定業務の時間短縮を実感している',2],['削減時間や工数を把握し、複数業務で活用している',3],['業務プロセスを再設計し、効果を継続的に測定・改善している',4]]},
  {id:'q6', title:'AIをデータ分析や意思決定に活用していますか？', weight:10, options:[
    ['活用していない',0],['一般的な意見やアイデアを聞く',1],['手元のデータを整理・要約させる',2],['データの傾向・比較・仮説を分析し、判断材料にしている',3],['分析方法や根拠を検証し、意思決定プロセスに組み込んでいる',4]]},
  {id:'q7', title:'複数のAIツールを、目的に応じて使い分けていますか？', weight:8, options:[
    ['1つも使っていない',0],['複数知っているが、ほぼ使い分けていない',1],['用途に応じて2種類程度を使い分ける',2],['複数のAIを工程ごとに使い分けている',3],['各AIの得意不得意を踏まえ、最適な役割分担を設計している',4]]},
  {id:'q8', title:'AIと外部サービス（スプレッドシート、フォーム、CRM等）を連携していますか？', weight:10, options:[
    ['連携していない',0],['連携機能を知っている／試したことがある',1],['既存の連携機能やノーコード連携を使っている',2],['複数サービス間でデータを自動連携している',3],['業務要件に合わせて連携フローを設計・保守している',4]]},
  {id:'q9', title:'AIエージェントに複数工程の仕事を任せていますか？', weight:12, options:[
    ['使ったことがない',0],['単発の自動実行を試したことがある',1],['決まった作業を1工程、自動実行している',2],['調査・整理・作成など複数工程を連続実行させている',3],['権限・確認ポイント・失敗時の処理を設計し、継続運用している',4]]},
  {id:'q10', title:'AIを使ってWebサイト・アプリ・業務システムを開発していますか？', weight:8, options:[
    ['開発していない',0],['AIにコードを書かせたことがある',1],['既存コードの修正や簡単なページを作れる',2],['Webアプリや業務ツールを自分で構築・公開している',3],['要件定義・テスト・改善・運用まで一貫して行っている',4]]},
  {id:'q11', title:'API・Python・データベースなどの技術をAIと組み合わせて使えますか？', weight:6, options:[
    ['使ったことがない',0],['用語や仕組みを知っている',1],['サンプルを参考にAPIやコードを動かせる',2],['API・コード・DBを組み合わせて実装できる',3],['認証・例外処理・ログ・セキュリティも考慮して設計できる',4]]},
  {id:'q12', title:'AIの仕組み・出力検証・セキュリティについて、どの程度扱えますか？', weight:6, options:[
    ['意識したことがない',0],['AIの限界や誤回答があることを知っている',1],['出典確認や個人情報への配慮を行っている',2],['評価方法・情報管理・脆弱性などを具体的に検証している',3],['モデルやシステムの評価・安全性検証を設計し、改善に活かしている',4]]}
];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('AI EVOLUTION｜AI活用レベル診断')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function setupDiagnosisSheet() {
  // Run this from the spreadsheet-bound Apps Script project. Store the ID in
  // script properties so deployments never depend on a repository-specific ID.
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('対象のスプレッドシートに紐づいた Apps Script から実行してください。');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  initializeDiagnosisSheet_(ss);
  return '回答保存シートの準備ができました。';
}

function initializeDiagnosisSheet_(ss) {
  let sh = ss.getSheetByName(ANSWER_SHEET);
  if (!sh) sh = ss.insertSheet(ANSWER_SHEET);
  if (sh.getLastRow() === 0) {
    const headers = ['回答日時','回答者名','職業','業種','役職','企業規模','年代','合計点','レベル','タイプ',
      '基礎力(20)','ビジネス実装力(30)','自動化・エージェント力(30)','技術・先端活用力(20)',
      ...QUESTIONS.map(q => q.id.toUpperCase())];
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    sh.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#e8eef5');
    sh.autoResizeColumns(1, headers.length);
  }
}

function submitDiagnosis(payload) {
  if (!payload || !payload.answers) throw new Error('回答データがありません。');
  const answers = payload.answers;
  QUESTIONS.forEach(q => {
    const n = Number(answers[q.id]);
    if (!Number.isInteger(n) || n < 0 || n > 4) throw new Error(q.title + 'に回答してください。');
  });

  const score = QUESTIONS.reduce((sum,q) => sum + Number(answers[q.id]) * q.weight / 4, 0);
  const basic = (answers.q1*1.25 + answers.q2*1.25 + answers.q3*2.5);
  const business = (answers.q4*2.5 + answers.q5*2.5 + answers.q6*2.5);
  const workflow = (answers.q7*2 + answers.q8*2.5 + answers.q9*3);
  const tech = (answers.q10*2 + answers.q11*1.5 + answers.q12*1.5);

  let level = 0;
  if (score >= 10) level = 1;
  if (score >= 20) level = 2;
  if (score >= 35) level = 3;
  if (score >= 50) level = 4;
  if (score >= 65) level = 5;
  if (score >= 78) level = 6;
  if (score >= 90) level = 7;

  // 上位レベルは合計点に加えて実践条件を満たす必要がある
  if (level >= 7 && answers.q12 < 3) level = 6;
  if (level >= 6 && (answers.q10 < 3 || answers.q11 < 2)) level = 5;
  if (level >= 5 && answers.q9 < 3) level = 4;
  if (level >= 4 && (answers.q7 < 2 || answers.q8 < 2)) level = 3;

  const levelNames = ['AI未活用者','AIビギナー','AIユーザー','AIクリエイター','AIアーキテクト','AIエージェントマスター','AIシステムエンジニア','AIイノベーター'];
  const typeScores = [
    ['AIコンパニオン', answers.q1 + answers.q3],
    ['AIオペレーター', answers.q4 + answers.q5],
    ['AIクリエイター', answers.q2 + answers.q4],
    ['AIストラテジスト', answers.q3 + answers.q6],
    ['AIアーキテクト', answers.q7 + answers.q8],
    ['AIエージェント指揮官', answers.q8 + answers.q9],
    ['AIエンジニア', answers.q10 + answers.q11],
    ['AIパイオニア', answers.q10 + answers.q12]
  ];
  const maxType = Math.max(...typeScores.map(x => x[1]));
  const types = typeScores.filter(x => x[1] === maxType).map(x => x[0]);
  const typeName = types.slice(0,2).join(' × ');

  const result = {
    score: Math.round(score*10)/10, level, levelName:levelNames[level], type:typeName,
    domains: {basic:Math.round(basic*10)/10,business:Math.round(business*10)/10,workflow:Math.round(workflow*10)/10,tech:Math.round(tech*10)/10}
  };

  const ss = getDiagnosisSpreadsheet_();
  let sh = ss.getSheetByName(ANSWER_SHEET);
  if (!sh) { initializeDiagnosisSheet_(ss); sh = ss.getSheetByName(ANSWER_SHEET); }
  const row = [
    new Date(), safeCell(payload.name), safeCell(payload.job), safeCell(payload.industry),
    safeCell(payload.position), safeCell(payload.companySize), safeCell(payload.ageBand),
    result.score, 'LEVEL '+level+' '+result.levelName, result.type,
    result.domains.basic, result.domains.business, result.domains.workflow, result.domains.tech,
    ...QUESTIONS.map(q => Number(answers[q.id]))
  ];
  sh.appendRow(row);
  return result;
}

function safeCell(value) {
  const s = String(value || '').trim().slice(0,200);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function getDiagnosisSpreadsheet_() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) {
    throw new Error('保存先が未設定です。スプレッドシートに紐づいた Apps Script で setupDiagnosisSheet を実行してください。');
  }
  return SpreadsheetApp.openById(spreadsheetId);
}
