import * as vscode from "vscode";
import { getWebviewContent } from "../webview/webviewContent";

export async function showSpreadsheet(): Promise<void> {
  console.log("Command execution started");

  const editor = vscode.window.activeTextEditor;
  if (!editor || !editor.document.fileName.endsWith(".csv")) {
    vscode.window.showErrorMessage("Please open a CSV file to preview.");
    return;
  }

  console.log("CSV file detected");

  const useTitleRow = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: "Do you want to use the first row as the title?",
  });

  console.log("User selected title row option:", useTitleRow);

  if (!useTitleRow) {
    console.log("No selection made, exiting command");
    return;
  }

  const useTitle = useTitleRow === "Yes";

  const panel = vscode.window.createWebviewPanel(
    "spreadsheetView",
    "Spreadsheet",
    vscode.ViewColumn.Beside,
    { enableScripts: true },
  );

  panel.webview.html = getWebviewContent();

  console.log("Webview created");

  let titleRow = useTitle ? editor.document.lineAt(0).text : "";

  const updatePreview = async () => {
    console.log("Updating preview");
    const visibleRange = editor.visibleRanges[0];
    const startLine = useTitle
      ? Math.max(visibleRange.start.line, 1)
      : visibleRange.start.line;
    const endLine = visibleRange.end.line;

    const visibleLines = [];
    for (let i = startLine; i <= endLine; i++) {
      visibleLines.push(editor.document.lineAt(i).text);
    }

    panel.webview.postMessage({
      type: "update",
      title: titleRow,
      rows: visibleLines,
    });

    console.log("Preview updated:", { startLine, endLine });
  };

  await updatePreview();

  // WebView が非アクティブになるイベントを監視
  panel.onDidChangeViewState((e) => {
    if (e.webviewPanel.active) {
      console.log("WebView is no longer active, refocusing editor");
      vscode.commands.executeCommand("workbench.action.focusPreviousGroup");
    }
  });

  // 編集イベント
  vscode.workspace.onDidChangeTextDocument((event) => {
    if (event.document === editor.document) {
      titleRow = useTitle ? editor.document.lineAt(0).text : "";
      updatePreview();
    }
  });

  // スクロールイベント
  vscode.window.onDidChangeTextEditorVisibleRanges((event) => {
    if (event.textEditor === editor) {
      updatePreview();
    }
  });
}
