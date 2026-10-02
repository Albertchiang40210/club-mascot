# 小光 · 社團吉祥物（3D 角色與網頁小遊戲）

小光是為社團設計的吉祥物，一隻抱著相機的貓頭鷹。本專案從一張概念圖開始，經過 AI 圖生 3D、Blender 整理與綁骨，最後放進校園小場景，做成可在瀏覽器用鍵盤操控的 Three.js 小遊戲。

<p align="center">
  <img src="demo/demo.gif" width="90%" alt="Demo">
</p>

## 快速開始

需要 [Node.js](https://nodejs.org/)。

Windows 可直接雙擊 `start-game.bat`，第一次執行會自動安裝套件並開啟瀏覽器。也可以手動執行：

```bash
cd game
npm install
npm run dev      # 開發
npm run build    # 打包到 game/dist/
```

## 玩法

在校園場景裡，60 秒內收集 15 個底片（金色底片 +3）。紅蟲會追著玩家，被撞到扣 1 顆心（共 3 顆），體力歸零或時間到即失敗。

| 操作 | 按鍵 |
|---|---|
| 移動 | WASD／方向鍵 |
| 衝刺 | Shift |
| 跳／二段跳 | 空白鍵（空中再按一次） |
| 拍照（閃光擊退 7 m 內的紅蟲） | F |
| 重玩 | R 或點一下結束畫面 |

手機：左下搖桿、右下「跳」「拍」按鈕。

## 製作流程

1. 概念圖：正面、側面、背面。
2. 圖生 3D：以正面圖輸入 [TRELLIS](https://huggingface.co/spaces/trellis-community/TRELLIS)，取得原始模型。
3. Blender 整理（透過 Blender MCP 操作 Blender 5.2）：高 1.0 m、原點在腳底中央、約 1 萬面。
4. 綁骨與動畫：7 根骨頭、手動分配權重，製作 idle、walk、jump、flap（二段跳）、photo（拍照）5 個動畫。
5. 遊戲：匯出 GLB，以 Three.js 實作，並用 Playwright 自動試玩驗證。

各步驟的交付規格與驗收狀態見 [PIPELINE.md](PIPELINE.md)，過程中遇到的問題與解法見 [handoff-log.md](handoff-log.md)。

## 專案結構

| 路徑 | 內容 |
|---|---|
| `concept/` | 概念圖（正／側／背） |
| `assets/` | 各階段 GLB：`mascot_raw`（原始）→ `mascot_clean`（整理）→ `mascot_rigged`（綁骨）→ `mascot`（遊戲用） |
| `blender-scripts/` | Blender MCP 外掛 |
| `game/` | Three.js + Vite 小遊戲 |
| `renders/` | 各階段驗收截圖 |
| `demo/` | Demo 影片與 GIF |

## 為什麼無法完全靠 MCP 完成

- **圖生 3D 沒有可用的免費 MCP**：Blender MCP 內建的 Rodin 免費額度用完（API_INSUFFICIENT_FUNDS），Tripo 免費帳號不能匯出，重試還會計費。最後的 TRELLIS 是 Hugging Face 網頁，只能手動上傳、手動下載 GLB。**解決方式**：不重試付費 API，改用 TRELLIS 網頁版（只傳單張正面圖），產出的 GLB 再交給 Blender MCP。
- **自動綁骨失敗**：Blender 自動權重（Bone Heat）對非人形的貓頭鷹找不到解，Mixamo 也不適用，**解決方式**：用 Blender MCP 手動建 7 根骨頭、依位置漸層分配權重，自製 idle／walk／jump／flap／photo 5 個動畫。
- **需要人工判斷與驗收**：挑選概念圖、確認背面品質、決定要不要重畫貼圖，**解決方式**：每個階段都渲染截圖並對照 PIPELINE.md 驗收，背面問題列為已知問題並保留備份。
- **遊戲端沒有對應的 MCP**：Three.js 遊戲是 Claude Code 直接寫程式，再以 Playwright 試玩，**解決方式**：以 GLB 當共通格式，由 Claude Code 寫遊戲、Playwright 自動試玩驗證。

因此實際是「Blender 段由 Agent 透過 MCP 操作，其餘段落以 GLB 檔案手動接力」。

## 已知問題

- 模型背面由 AI 推測生成，有些微凹痕與貼圖瑕疵（備份：`assets/mascot_clean_v1_backpatch.glb`）。
- 手機載入速度尚未實測。

## 授權說明

- 圖生 3D 使用 Hugging Face 上的 TRELLIS Space，底層為 [microsoft/TRELLIS](https://github.com/microsoft/TRELLIS)，其程式與模型採 MIT License（允許商用）。該專案內含的部分第三方元件（如 diffoctreerast、Flexicubes）另有各自授權。
- 此 Space 頁面本身未查到獨立的授權標示；若要商用或上架，請再自行確認。
- 本專案的概念圖與 Blender 整理後的模型為本專案自製，原始模型來自上述 AI 生成。

## 使用技術

Three.js、Vite、Blender 5.2、Blender MCP、Claude Code、Playwright
