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

## Mac 使用說明

遊戲、GLB、Python 工具跨平台通用，Mac 只要處理啟動與 MCP 設定：

```bash
brew install node uv            # Blender 另外到官網安裝
git clone <repo> && cd club-mascot
./start-game.sh                 # 或 cd game && npm install && npm run dev
```

MCP（選用，要讓 Claude Code 操作 Blender／TRELLIS／Gemini／Playwright 才需要）：

```bash
cp .mcp.example.mac.json .mcp.json        # Windows 用 .mcp.example.windows.json
pip3 install mcp gradio_client google-genai
echo 'export HF_TOKEN=你的token' >> ~/.zshrc
echo 'export GEMINI_API_KEY=你的key' >> ~/.zshrc
```

`.mcp.json` 是各人本機設定，已加進 .gitignore，不會被提交。Blender 外掛 `blender-scripts/blender_mcp_addon.py` 從 Preferences → Add-ons → Install 載入。

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

1. 概念圖：以 Gemini 網頁版生成正面、側面、背面。
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
| `tools/` | MCP server：`trellis_mcp.py`（免費圖生 3D，呼叫 Hugging Face 的 TRELLIS Space）、`gemini_image_mcp.py`（Gemini 概念圖，需 `GEMINI_API_KEY`；實測免費層對圖片模型回 429 額度不足，要用得開通計費，所以本專案概念圖仍用 Gemini 網頁版手動生成）；另有 `trellis_hf.py` 命令列版 |
| `game/` | Three.js + Vite 小遊戲 |
| `renders/` | 各階段驗收截圖 |
| `demo/` | Demo 影片與 GIF |

## 為什麼無法完全靠 MCP 完成

- **概念圖與圖生 3D 都是網頁手動操作**：概念圖用 Gemini 網頁版生成，沒有透過 MCP 或 API。
- **圖生 3D 沒有可用的免費 MCP**：Blender MCP 內建的 Rodin 免費額度用完（API_INSUFFICIENT_FUNDS），Tripo 免費帳號不能匯出，重試還會計費。免費版網站也無法同時上傳正、側、背三張圖，最後只能用單張正面圖。本專案實際是在 TRELLIS 的 Hugging Face 網頁手動上傳、手動下載 GLB。**解決方式**：不重試付費 API，改用 TRELLIS（只傳單張正面圖），產出的 GLB 再交給 Blender MCP。**事後驗證：這一步也能免費自動化**，不需要顯卡（本專案用的是 AMD 顯卡，無法本機跑 CUDA 模型）。[tools/trellis_hf.py](tools/trellis_hf.py) 用 `gradio_client` 呼叫 Hugging Face 上的 TRELLIS Space，輸入圖片、輸出 GLB：`pip install gradio_client`，到 Hugging Face 建一個 Read token 並設成環境變數 `HF_TOKEN`（不設的話匿名 ZeroGPU 額度很快用完），再執行 `python tools/trellis_hf.py concept/front.png assets/out.glb`。同一邏輯也包成 MCP server（[tools/trellis_mcp.py](tools/trellis_mcp.py)，工具 `image_to_glb`），在 `.mcp.json` 加入 `{"trellis": {"command": "python", "args": ["tools/trellis_mcp.py"], "env": {"HF_TOKEN": "${HF_TOKEN:-}"}}}` 後，Claude Code 就能像呼叫 Blender MCP 一樣呼叫它（需 `pip install mcp gradio_client`）。實測產出 9,166 面、帶貼圖的貓頭鷹（`assets/mascot_trellis_test.glb`，僅供驗證，未取代遊戲用模型）。限制：要排隊、有每日額度，Space 的 API 也可能改版。
- **自動綁骨失敗**：Blender 自動權重（Bone Heat）對非人形的貓頭鷹找不到解，Mixamo 也不適用，**解決方式**：用 Blender MCP 手動建 7 根骨頭、依位置漸層分配權重，自製 idle／walk／jump／flap／photo 5 個動畫。
- **需要人工判斷與驗收**：挑選概念圖、確認背面品質、決定要不要重畫貼圖，**解決方式**：每個階段都渲染截圖並對照 PIPELINE.md 驗收，背面問題列為已知問題並保留備份。
- **遊戲端沒有對應的 MCP**：Three.js 遊戲是 Claude Code 直接寫程式，再以 Playwright 試玩，**解決方式**：以 GLB 當共通格式，由 Claude Code 寫遊戲、Playwright 自動試玩驗證。試玩這一步後來也補上官方 [Playwright MCP](https://github.com/microsoft/playwright-mcp)（免費，在 `.mcp.json` 加入 `{"playwright": {"command": "cmd", "args": ["/c", "npx", "-y", "@playwright/mcp@latest"]}}`），Claude 可直接用工具操作瀏覽器、截圖。遊戲本身仍是寫程式，沒有也不需要 MCP。

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
