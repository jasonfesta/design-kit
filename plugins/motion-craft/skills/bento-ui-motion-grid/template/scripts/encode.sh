#!/usr/bin/env bash
# 120 fps master + 60 fps X/social cut from the same frames. Usage: bash scripts/encode.sh [frames_dir] [out_dir]
set -e; F=${1:-frames}; O=${2:-out}; mkdir -p "$O"
ffmpeg -v error -y -framerate 120 -i "$F/%05d.png" -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p -profile:v high -level 5.2 -movflags +faststart -an "$O/grid_120.mp4"
ffmpeg -v error -y -framerate 60 -i "$F/%05d.png" -vf "select='not(mod(n\,2))',setpts=N/60/TB" -r 60 -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p -profile:v high -level 4.2 -movflags +faststart -an "$O/grid_60.mp4"
for f in "$O/grid_120.mp4" "$O/grid_60.mp4"; do ffprobe -v error -count_frames -show_entries stream=width,height,r_frame_rate,nb_read_frames,pix_fmt:format=duration -of compact "$f"; done
