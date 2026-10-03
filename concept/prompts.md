# 概念圖提示詞（Gemini）

> 注意：這是事後看著 `front.png`、`side.png`、`back.png` 反推的版本，**不是當初實際輸入的原句**（原句當時沒有記錄）。用來重現風格一致的概念圖。

## 正面圖（主提示詞）

```
A cute chubby cartoon owl mascot named "Xiao Guang", 3D Pixar-style character render, soft clay-like matte material. Round egg-shaped body, warm caramel-brown plumage with a cream-white belly covered in subtle scalloped feather texture. Small ear tufts, large glossy dark-brown eyes with orange rims and white highlights inside a soft peach facial disc, small orange beak with a friendly smile. Both wings spread wide open in a symmetrical A-pose, feather tips fading to dark chocolate brown. Orange feet with small dark claws. Wearing a thin dark-brown leather strap with a vintage rangefinder camera (silver top, brown leather body) hanging on the chest. Front view, full body, centered, pure white background, soft studio lighting, soft ground shadow, 1:1 square, high detail, 3D game character concept art.
```

中文對照：一隻可愛圓滾滾的卡通貓頭鷹吉祥物，名叫「小光」，3D 皮克斯風格角色渲染，質感像柔軟的黏土、霧面。身體是圓潤的蛋形，羽毛是溫暖的焦糖棕色，肚子是奶油白色，帶有細緻的鱗片狀羽毛紋理。頭上有小小的耳羽，眼睛大而有光澤，深棕色、外圈橘色、有白色反光，位於柔和的蜜桃色臉盤中，橘色小尖嘴，帶著友善的微笑。雙翅向兩側完全張開，左右對稱的 A-pose，羽毛尖端漸層成深巧克力棕色。橘色的腳，帶深色小爪子。胸前掛著深棕色細皮革背帶，下面是復古旁軸相機（銀色機頂、棕色皮革機身）。正面視角，全身，置中，純白背景，柔和攝影棚燈光，柔和地面陰影，1:1 正方形，高細節，3D 遊戲角色概念圖。

## 側面／背面圖

先上傳正面圖作為參考，再輸入：

```
Same character, same design and colors as the reference image. Show a [side view / back view] full body, wings kept in the same spread A-pose, pure white background, same lighting and render style.
```

中文對照：與參考圖相同的角色，設計和顏色完全一致。顯示【側面／背面】視角，全身，翅膀維持同樣張開的 A-pose，純白背景，燈光和渲染風格相同。

背面圖可再加：`visible tail feathers, camera strap crossing the back`（可看到尾羽，背帶橫過背部）。

## 重點

- `A-pose`、`pure white background`、`full body` 是為了圖生 3D，背景乾淨、姿勢展開，TRELLIS 比較容易生成。
- 背面要明確生成，不要讓 3D 工具自己猜，才能減少背面凹痕與貼圖問題（見 `handoff-log.md` 第 5 筆）。
