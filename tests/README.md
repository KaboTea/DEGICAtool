# テスト

index.html を実際のブラウザ(Playwright / Chromium)で開き、内部の関数を呼んだりボタンを押したりして確かめるテストです。
アプリ本体(index.html)には影響しません。

## 実行

```bash
bash tests/run.sh          # regression/ を全部実行
bash tests/run.sh t61 t99  # 指定したものだけ
```

- `playwright` が入っている環境で実行します(`require('playwright')` が使えること)。
- 各テストは最後にページ内で起きた例外の一覧を出します。`[]` ならエラーなしです。
- 途中の出力は「目で見て確かめるための記録」で、期待値との自動比較はしていません。挙動を変えたときは出力を読んで確認します。

## 中身

| 場所 | 内容 |
|---|---|
| `head.mjs` | 共通のひな形。練習を開始した状態まで進め、`ev('式')` で内部の関数を呼べるようにする |
| `decks.json` | テスト用デッキ2つ(dA 赤ハイブリッド / dB 青ミラージュ) |
| `regression/` | 修正のたびに回している確認(効果パネル、条件判定、代償、〈ルール〉、≪継承≫、🔀 など)。`t84` は描画の速さ |
| `tools/` | 全カードを数える集計(`t79` 条件、`t96` 代償、`t121` ボタンにならない代償の一覧、`t139` 🔀 の一覧) |
| `archive/` | 過去の作業で書いた確認の記録。今も通るかは確かめていません(参考用) |

## 書き方

```js
import { page, ev, errs, browser, clickAuto } from '../head.mjs';
const v = await ev('practiceState.viewingIndex');
// 盤面を作る → 効果をキューに入れる → ボタンを押す → 状態を出力
await browser.close(); console.log(errs);
```
