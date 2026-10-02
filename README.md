# 小光 · 社團吉祥物（圖 → 3D → Blender → 遊戲）

小光是我們攝影社的吉祥物，一隻抱著相機的圓滾滾貓頭鷹。
這個專案是我把它從一張圖做成可以在瀏覽器玩的 3D 小遊戲的過程。

<p align="center">
  <img src="demo/demo.gif" width="90%" alt="Demo">
</p>

## 怎麼做出來的

1. 先設定好角色，畫出正面、側面、背面的概念圖。
2. 把正面那張丟給 [TRELLIS](https://huggingface.co/spaces/trellis-community/TRELLIS)（Hugging Face 上免費的圖生 3D），得到原始模型。
3. 用 Claude Code 透過 Blender MCP 操作 Blender 5.2 整理模型：縮到 1 公尺高、原點移到腳底、面數約 1 萬。
4. Blender 自動算權重失敗，只好自己做 7 根骨頭、手動分配權重，再做 idle、walk、jump 等動畫。
5. 匯出 GLB，用 Three.js 寫成遊戲，最後用 Playwright 自動試玩確認能正常跑。

每一步交出去的檔案規格和驗收結果寫在 [PIPELINE.md](PIPELINE.md)，中間踩到的坑和解法記在 [handoff-log.md](handoff-log.md)。

## 快速開始

需要 [Node.js](https://nodejs.org/)。

**Windows：** 直接雙擊 `start-game.bat`（第一次會自動安裝套件並開啟瀏覽器）。

**或手動執行：**

```bash
cd game
npm install
npm run dev      # 開發
npm run build    # 打包到 game/dist/
```

## 玩法

60 秒內收集 15 個底片（金色底片 +3）。紅蟲會追著你，被撞到扣 1 顆心（共 3 顆），體力歸零或時間到就失敗。

| 操作 | 按鍵 |
|---|---|
| 移動 | WASD／方向鍵 |
| 衝刺 | Shift |
| 跳／二段跳 | 空白鍵（空中再按一次） |
| 拍照（閃光擊退 7 m 內的紅蟲） | F |
| 重玩 | R 或點一下結束畫面 |

手機：左下搖桿、右下「跳」「拍」按鈕。

## 專案結構

| 路徑 | 內容 |
|---|---|
| `concept/` | 概念圖（正／側／背） |
| `assets/` | 各階段 GLB：`mascot_raw`（原始）→ `mascot_clean`（清理）→ `mascot_rigged`（綁骨）→ `mascot`（遊戲用） |
| `blender-scripts/` | Blender MCP 外掛 |
| `game/` | Three.js + Vite 小遊戲 |
| `renders/` | 各階段驗收截圖 |
| `PIPELINE.md` | 交接物規格與驗收清單 |
| `handoff-log.md` | 每個交接處的問題與解法 |

## 已知問題

- 背面是 AI 推測生成的，有些微凹痕與貼圖瑕疵（備份：`assets/mascot_clean_v1_backpatch.glb`）
- 手機載入速度尚未實測

## 技術

Three.js · Vite · Blender 5.2 · Blender MCP · Claude Code · Playwright
