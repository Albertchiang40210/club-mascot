# 小光吉祥物專案

貓頭鷹吉祥物「小光」：概念圖 → TRELLIS 圖生 3D → Blender 整理綁骨 → Three.js 網頁小遊戲。完整說明見 README.md、PIPELINE.md、handoff-log.md。

## 常用指令
- 跑遊戲：`./start-game.sh`（Mac/Linux）或 `start-game.bat`（Windows），或 `cd game && npm install && npm run dev`
- 打包：`cd game && npm run build`

## 結構
- `game/`：Three.js + Vite 遊戲，模型在 `game/public/mascot.glb`
- `assets/`：各階段 GLB，遊戲用的是 `mascot.glb`，其餘是備份或驗證用，不要覆蓋
- `tools/`：MCP server（`trellis_mcp.py`、`gemini_image_mcp.py`）與 `trellis_hf.py`
- `blender-scripts/blender_mcp_addon.py`：Blender 外掛

## 在新電腦上設定
- `.mcp.json` 是各人本機設定，已被 .gitignore。從 `.mcp.example.mac.json` 或 `.mcp.example.windows.json` 複製，不要提交。
- Mac 上 Python 用 `python3`，依賴：`pip3 install mcp gradio_client google-genai`
- 金鑰用環境變數 `HF_TOKEN`、`GEMINI_API_KEY`，絕對不要寫進檔案或 commit。
- Blender MCP 需要 Blender 與 uv（`brew install uv`），外掛要在 Blender 裡手動安裝。

## 注意
- `*.sh` 一律 LF 換行（見 .gitattributes）。
- 已知問題：模型背面有些微瑕疵，備份在 `assets/mascot_clean_v1_backpatch.glb`。
- 圖生 3D 與概念圖有部分是手動操作，原因見 README「為什麼無法完全靠 MCP 完成」。
