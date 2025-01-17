// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as readline from "readline";

export function activate(context: vscode.ExtensionContext): void {
  console.log(
    'Congratulations, your extension "csv-view-and-export" is now active!',
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "csv-view-and-export.showSpreadSheet",
      () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showErrorMessage("No active editor.");
          return;
        }

        const filePath = editor.document.fileName;
        if (path.extname(filePath).toLowerCase() !== ".csv") {
          vscode.window.showErrorMessage("Active file is not a CSV file.");
          return;
        }

        const panel = vscode.window.createWebviewPanel(
          "spreadsheetView",
          "Spreadsheet",
          vscode.ViewColumn.Beside,
          { enableScripts: true },
        );

        panel.webview.html = getInitialWebviewContent();

        // 初期表示のロード
        loadAndSendCSVContent(filePath, panel);

        // ファイルの変更を監視
        context.subscriptions.push(
          vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document.fileName === filePath) {
              loadAndSendCSVContent(filePath, panel);
            }
          }),
        );

        // エディタのスクロールを監視
        const editorScrollDisposable =
          vscode.window.onDidChangeTextEditorVisibleRanges((event) => {
            if (event.textEditor.document.fileName === filePath) {
              const firstVisibleLine =
                event.textEditor.visibleRanges[0].start.line;
              panel.webview.postMessage({
                type: "scroll",
                firstVisibleLine,
              });
            }
          });
        context.subscriptions.push(editorScrollDisposable);
      },
    ),
  );
}

function loadAndSendCSVContent(filePath: string, panel: vscode.WebviewPanel) {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  let chunk: string[] = [];
  const chunkSize = 50;

  rl.on("line", (line) => {
    chunk.push(line);
    if (chunk.length >= chunkSize) {
      panel.webview.postMessage({ type: "update", rows: chunk });
      chunk = [];
    }
  });

  rl.on("close", () => {
    if (chunk.length > 0) {
      panel.webview.postMessage({ type: "update", rows: chunk });
    }
    panel.webview.postMessage({ type: "done" });
  });
}

function getInitialWebviewContent(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CSV Viewer</title>
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f4f4f4;
        }
        #table-container {
          overflow-y: auto;
          height: 100%;
        }
      </style>
    </head>
    <body>
      <div id="table-container"></div>
      <script>
        const tableContainer = document.getElementById('table-container');

        window.addEventListener('message', event => {
          const message = event.data;

          if (message.type === 'update') {
            const table = document.createElement('table');
            message.rows.forEach(row => {
              const tr = document.createElement('tr');
              row.split(',').forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell.trim();
                tr.appendChild(td);
              });
              table.appendChild(tr);
            });
            tableContainer.innerHTML = '';
            tableContainer.appendChild(table);
          } else if (message.type === 'scroll') {
            const firstVisibleLine = message.firstVisibleLine;
            const rows = tableContainer.getElementsByTagName('tr');
            if (rows[firstVisibleLine]) {
              rows[firstVisibleLine].scrollIntoView({ behavior: 'smooth' });
            }
          } else if (message.type === 'done') {
            console.log('All rows loaded');
          }
        });
      </script>
    </body>
    </html>
  `;
}

// This method is called when your extension is deactivated
export function deactivate(): void {}
