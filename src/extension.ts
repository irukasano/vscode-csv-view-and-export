// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import * as path from "path";
// import * as fs from "fs";
// import * as readline from "readline";
import * as vscode from "vscode";
import { registerCommands } from "./commands/registerCommands";

export function activate(context: vscode.ExtensionContext): void {
  console.log("CSV Preview extension is now active!");
  registerCommands(context);
}

export function deactivate(): void {}

// TODO 以下は１ファイルで実装しているときのソース
//
// export function activate(context: vscode.ExtensionContext): void {
//   console.log("CSV Preview extension is now active!");

//   context.subscriptions.push(
//     vscode.commands.registerCommand(
//       "csv-view-and-export.showSpreadSheet",
//       async () => {
//         console.log("Command execution started");

//         const editor = vscode.window.activeTextEditor;
//         if (!editor || !editor.document.fileName.endsWith(".csv")) {
//           vscode.window.showErrorMessage("Please open a CSV file to preview.");
//           return;
//         }

//         console.log("CSV file detected");

//         const useTitleRow = await vscode.window.showQuickPick(["Yes", "No"], {
//           placeHolder: "Do you want to use the first row as the title?",
//         });

//         console.log("User selected title row option:", useTitleRow);

//         if (!useTitleRow) {
//           console.log("No selection made, exiting command");
//           return;
//         }

//         const useTitle = useTitleRow === "Yes";

//         const panel = vscode.window.createWebviewPanel(
//           "spreadsheetView",
//           "Spreadsheet",
//           vscode.ViewColumn.Beside,
//           { enableScripts: true },
//         );

//         panel.webview.html = getInitialWebviewContent();

//         console.log("Webview created");

//         let titleRow = useTitle ? editor.document.lineAt(0).text : "";

//         const updatePreview = async () => {
//           console.log("Updating preview");
//           const visibleRange = editor.visibleRanges[0];
//           const startLine = useTitle
//             ? Math.max(visibleRange.start.line, 1)
//             : visibleRange.start.line;
//           const endLine = visibleRange.end.line;

//           const visibleLines = [];
//           for (let i = startLine; i <= endLine; i++) {
//             visibleLines.push(editor.document.lineAt(i).text);
//           }

//           panel.webview.postMessage({
//             type: "update",
//             title: titleRow,
//             rows: visibleLines,
//           });

//           console.log("Preview updated:", { startLine, endLine });
//         };

//         await updatePreview();

//         // WebView が非アクティブになるイベントを監視
//         panel.onDidChangeViewState((e) => {
//           if (e.webviewPanel.active) {
//             console.log("WebView is no longer active, refocusing editor");
//             vscode.commands.executeCommand(
//               "workbench.action.focusPreviousGroup",
//             );
//           }
//         });

//         // 編集イベント
//         vscode.workspace.onDidChangeTextDocument((event) => {
//           if (event.document === editor.document) {
//             titleRow = useTitle ? editor.document.lineAt(0).text : "";
//             updatePreview();
//           }
//         });

//         // スクロールイベント
//         vscode.window.onDidChangeTextEditorVisibleRanges((event) => {
//           if (event.textEditor === editor) {
//             updatePreview();
//           }
//         });
//       },
//     ),
//   );
// }

// function getInitialWebviewContent(): string {
//   return `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>CSV Viewer</title>
//       <style>
//         table {
//           width: 100%;
//           border-collapse: collapse;
//         }
//         thead {
//           position: sticky;
//           top: 0;
//           background-color: #0078d4; /* 濃い青色 */
//           color: white; /* 文字色を白に */
//           z-index: 1;
//           text-align: center;
//         }
//         th, td {
//           border: 1px solid #ddd;
//           padding: 8px;
//         }
//         th {
//           text-align: left;
//         }
//         td.number {
//           color: lemonchiffon;
//           text-align: right; /* 数値は右寄せ */
//         }
//         td.date {
//           color: lightcyan;
//           text-align: center; /* 日付は中央揃え */
//         }
//         #table-container {
//           overflow-y: auto;
//           height: 100%;
//         }
//       </style>
//     </head>
//     <body>
//       <div id="table-container">
//         <table id="csv-table">
//           <thead>
//             <tr id="csv-title-row"></tr>
//           </thead>
//           <tbody id="csv-body"></tbody>
//         </table>
//       </div>
//       <script>
//         const csvTable = document.getElementById('csv-table');

//         // 日付判定関数
//         function isValidDate(dateString) {
//           const date = new Date(dateString);
//           return !isNaN(date) && /^\\d{4}-\\d{2}-\\d{2}$/.test(dateString);
//         }

//         // WebView からのメッセージを受信
//         window.addEventListener('message', event => {
//           const message = event.data;

//           if (message.type === 'update') {
//             // テーブルの更新処理
//             const csvTitleRow = document.getElementById('csv-title-row');
//             const csvBody = document.getElementById('csv-body');

//             csvTitleRow.innerHTML = '';
//             message.title.split(',').forEach(cell => {
//               const th = document.createElement('th');
//               th.textContent = cell.trim();
//               csvTitleRow.appendChild(th);
//             });

//             csvBody.innerHTML = '';
//             message.rows.forEach(row => {
//               const tr = document.createElement('tr');
//               row.split(',').forEach(cell => {
//                 const td = document.createElement('td');
//                 const trimmedCell = cell.trim();

//                 // セルごとにスタイルを適用
//                 if (!isNaN(trimmedCell) && trimmedCell !== '') {
//                   td.classList.add('number'); // 数値の場合
//                 } else if (isValidDate(trimmedCell)) {
//                   td.classList.add('date'); // 日付の場合
//                 }

//                 td.textContent = trimmedCell;
//                 tr.appendChild(td);
//               });
//               csvBody.appendChild(tr);
//             });

//           } else if (message.type === 'blur') {
//             // WebView のフォーカスを解除
//             // window.blur();
//           }
//         });
//       </script>
//     </body>
//     </html>
//   `;
// }

// // This method is called when your extension is deactivated
// export function deactivate(): void {}
