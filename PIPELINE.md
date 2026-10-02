# PIPELINE：吉祥物（圖 → 3D → Blender → 遊戲）

角色（佔位，可改）：**小光**，抱著相機的圓滾滾貓頭鷹。

```text
文字設定 → 概念圖 → 圖生3D → Blender 清理(MCP) → 綁骨+動畫 → Three.js 遊戲 → Playwright 試玩
   V1/V2     V3        V4            V5            V8/C1         C2
```

## 交接物規格

| # | 交接物 | 格式 | 規格 | 存放位置 |
|---|---|---|---|---|
| 1 | 概念圖 | PNG | 1024x1024、白底、A-pose、正面（另補側面、背面） | `concept/` |
| 2 | 原始 3D | GLB | 生成工具直接輸出，不修改 | `assets/mascot_raw.glb` |
| 3 | 清理後 3D | GLB | 高 1.0m、原點在腳底中央、面數 < 20k、無破面 | `assets/mascot_clean.glb` |
| 4 | 綁骨模型 | FBX/GLB | 動畫片段名稱：idle / walk / jump | `assets/mascot_rigged.glb` |
| 5 | 遊戲用 | GLB | Y-up、貼圖內嵌、< 10MB | `assets/mascot.glb` |

## 每一步的驗收

- [ ] 1 概念圖：人工挑選，採用與淘汰版本都留下（只留了採用的 `concept/` 正/側/背，沒有淘汰版本）
- [ ] 2 原始 3D：從正、側、背截圖，確認背面沒有壞掉（`renders/raw_*.png`；背面有凹痕和背帶貼圖，未通過，已知問題）
- [x] 3 清理後：Blender 渲染正/側/背三張圖，記錄面數與尺寸（`renders/clean_*.png`；10,651 面，高 1.0 m，原點在腳底）
- [x] 4 綁骨：播放三個動畫各一次，截圖（`renders/anim_*.png`；idle / walk / jump，7 根骨頭）
- [ ] 5 遊戲：角色站在地面、沒有躺著；手機 5 秒內載入（`game/`；Playwright 試玩通過：站在 y=0、idle/walk/jump 正確切換、無錯誤，截圖 `renders/game_*.png`；本機載入 0.25 s，總大小約 3.7 MB，**手機尚未實測**）

## 工具

| 步驟 | 工具 | 備註 |
|---|---|---|
| 概念圖 | （待定：Gemini / 其他生圖） | |
| 圖生3D | blender-mcp 內建 Hunyuan3D / Rodin，或 Tripo / Meshy | 本機為 AMD 顯卡，不跑本地模型 |
| Blender 清理 | blender-mcp（Claude Code 呼叫） | Blender 5.2 |
| 綁骨動畫 | Mixamo / Meshy / Tripo | 非人形可能失敗 |
| 遊戲 | threejs-game-skills（`/threejs-game-director`） | |
| 試玩驗證 | Playwright | |
