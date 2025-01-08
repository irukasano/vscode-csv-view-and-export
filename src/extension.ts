// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "csv-view-and-export" is now active!',
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "csv-view-and-export.showSpreadSheet",
      () => {
        const panel = vscode.window.createWebviewPanel(
          "spreadsheetView",
          "Spreadsheet",
          vscode.ViewColumn.One,
          {
            enableScripts: true, // スクリプトを有効にする
          },
        );

        // Webview の HTML コンテンツを設定
        panel.webview.html = getWebviewContent();
      },
    ),
  );
}

function getWebviewContent(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Spreadsheet</title>
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
        }
        th {
          background-color: #f4f4f4;
        }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <th>Column 1</th>
          <th>Column 2</th>
          <th>Column 3</th>
        </tr>
        <tr>
          <td>Row 1</td>
          <td>Data 1</td>
          <td>Data 2</td>
        </tr>
        <tr>
          <td>Row 2</td>
          <td>Data 3</td>
          <td>Data 4</td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// This method is called when your extension is deactivated
export function deactivate() {}
