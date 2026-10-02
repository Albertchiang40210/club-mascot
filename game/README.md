# 小光 · 吉祥物小遊戲（Three.js）

圖 → 3D → Blender → 遊戲 的最後一站：用 `public/mascot.glb`（綁骨、idle / walk / jump）做的網頁小遊戲。

## 執行

```bash
npm install
npm run dev      # 開發
npm run build    # 打包到 dist/
```

## 玩法

60 秒內收集 15 個底片（金色底片 +3）。紅蟲會追著你，被撞到扣 1 顆心（共 3 顆），體力歸零或時間到就失敗。

| 操作 | 按鍵 | 動畫 |
|---|---|---|
| 移動 | WASD／方向鍵 | walk |
| 衝刺 | Shift | walk |
| 跳 | 空白鍵 | jump |
| 二段跳 | 空中再按空白鍵 | flap（拍翅膀） |
| 拍照 | F | photo（閃光擊退前方 7 m 內的紅蟲，+1 分，冷卻 1.2 秒） |
| 重玩 | R 或點一下結束畫面 | |

手機：左下搖桿、右下「跳」「拍」按鈕。

## 模型流程

概念圖 → TRELLIS（單張正面圖，Hugging Face）→ Blender 5.2（Blender MCP 清理：高 1.0 m、原點在腳底、約 1 萬面）→ 手動 7 根骨頭＋手動權重 → 匯出 GLB。
