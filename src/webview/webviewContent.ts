export function getWebviewContent(): string {
  const scriptContent = `
    function highlightCell(row, col) {
        const table = document.getElementById('csv-table');
        if (!table) return;

        // 既存のハイライトをリセット
        Array.from(table.getElementsByTagName('td')).forEach(cell => {
            cell.classList.remove('highlight');
        });

        const rows = table.getElementsByTagName('tr');

        for (let r = 0; r < rows.length; r++) {
            const cells = rows[r].getElementsByTagName('td');
            for (let c = 0; c < cells.length; c++) {
                if (r === row && c === col) {
                    const targetCell = cells[c];

                    // ハイライトを適用
                    targetCell.classList.add('highlight');

                    // **該当セルを画面中央にスクロール**
                    targetCell.scrollIntoView({
                        block: "center", // **垂直方向: 画面中央に配置**
                        inline: "center", // **水平方向: 画面中央に配置**
                        behavior: "smooth" // **スムーズにスクロール**
                    });

                    return; // ハイライトしたら即終了（ネストされたループを抜ける）
                }
            }
        }
    }

    // 日付判定関数
    function isValidDate(dateString) {
        const date = new Date(dateString);
        return !isNaN(date) && /^\\d{4}-\\d{2}-\\d{2}$/.test(dateString);
    }

    // WebView からのメッセージを受信
    window.addEventListener('message', event => {
        const message = event.data;

        if (message.type === 'update') {
            // テーブルの更新処理
            const csvTitleRow = document.getElementById('csv-title-row');
            const csvBody = document.getElementById('csv-body');

            csvTitleRow.innerHTML = '';
            message.title.split(',').forEach(cell => {
                const th = document.createElement('th');
                th.textContent = cell.trim();
                csvTitleRow.appendChild(th);
            });

            csvBody.innerHTML = '';
            message.rows.forEach(row => {
                const tr = document.createElement('tr');
                const parsedRow = row;
                parsedRow.forEach(cell => {
                    const td = document.createElement('td');
                    const trimmedCell = cell.trim();

                    // セルごとにスタイルを適用
                    if (!isNaN(trimmedCell) && trimmedCell !== '') {
                        td.classList.add('number'); // 数値の場合
                    } else if (isValidDate(trimmedCell)) {
                        td.classList.add('date'); // 日付の場合
                    }

                    td.textContent = trimmedCell;
                    tr.appendChild(td);
                });
                csvBody.appendChild(tr);
            });
        }
        if (message.type === 'highlight') {
            highlightCell(message.row, message.col);
        }
    });

  `;

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
        thead {
          position: sticky;
          top: 0;
          background-color: #0078d4; /* 濃い青色 */
          color: white; /* 文字色を白に */
          z-index: 1;
          text-align: center;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
        }
        th {
          text-align: left;
        }
        td.number {
          color: lemonchiffon;
          text-align: right; /* 数値は右寄せ */
        }
        td.date {
          color: lightcyan;
          text-align: center; /* 日付は中央揃え */
        }
        #table-container {
          overflow-y: auto;
          height: 100%;
        }
        .highlight {
          background-color: yellow;
          color: black !important;
          font-weight: bold;  
        }
      </style>
    </head>
    <body>
      <div id="table-container">
        <table id="csv-table">
          <thead>
            <tr id="csv-title-row"></tr>
          </thead>
          <tbody id="csv-body"></tbody>
        </table>
      </div>
      <script>
        ${scriptContent}
      </script>
    </body>
    </html>
  `;
}
