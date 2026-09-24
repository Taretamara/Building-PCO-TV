#!/bin/sh
# $0 <input.mp4> <output-id>
# ffmpeg → HLS (3 renditions) + poster thumbnail. Requires: brew install ffmpeg
# Upload the resulting hls/<id>/ tree to R2/Supabase Storage (see pipeline.ts).
set -eu
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found. Install with: brew install ffmpeg" >&2
  exit 2
fi
IN="${1:?usage: transcode.sh <input.mp4> <output-id>}"
ID="${2:?usage: transcode.sh <input.mp4> <output-id>}"
OUT="hls/$ID"
mkdir -p "$OUT"
ffmpeg -hide_banner -loglevel error -y -i "$IN" \
  -filter_complex "[0:v]split=3[v1][v2][v3];[v1]scale=640:360[v1o];[v2]scale=1280:720[v2o];[v3]scale=1920:1080[v3o]" \
  -map "[v1o]" -map a:0 -map "[v2o]" -map a:0 -map "[v3o]" -map a:0 \
  -c:v h264 -c:a aac -ar 48000 \
  -var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2" \
  -master_pl_name master.m3u8 -hls_time 6 -hls_playlist_type vod \
  "$OUT/v%v.m3u8"
ffmpeg -hide_banner -loglevel error -y -ss 5 -i "$IN" -frames:v 1 "$OUT/poster.jpg"
echo "Wrote $OUT/master.m3u8 + poster.jpg — upload hls/$ID/ to CDN, wire captions <id>.vtt"
