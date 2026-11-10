#!/bin/bash
# 回帰テストをまとめて実行する。リポジトリのどこから呼んでもよい。
#   bash tests/run.sh            … regression/ を全部
#   bash tests/run.sh t61 t99    … 指定したものだけ
# 各テストの最後の行が [] ならエラーなし(ページ内で例外が出ていない)。
cd "$(dirname "$0")/.." || exit 1
python3 -m http.server 8765 >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 1
if [ $# -gt 0 ]; then LIST="$@"; else LIST=$(ls tests/regression/*.mjs | xargs -n1 basename | sed 's/\.mjs$//' | sort -V); fi
NG=0
for t in $LIST; do
  OUT=$(timeout 180 node tests/regression/$t.mjs 2>&1); LAST=$(echo "$OUT" | tail -1)
  if [ "$t" = "t84" ]; then echo "$t (描画の速さ) $(echo "$OUT" | grep -o '[0-9.]*ms' | tail -1)"; continue; fi
  if [ "$LAST" = "[]" ]; then echo "$t OK"; else echo "$t NG: $(echo "$LAST" | cut -c1-200)"; NG=$((NG+1)); fi
done
echo "---- NG: $NG"
exit $NG
