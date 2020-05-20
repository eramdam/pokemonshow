#!/bin/sh

#
# Transform image files pixel per pixel into cow files.
#

for fullfilename in ./images/*.png
do
    filename=$(basename "$fullfilename")
    extension="${filename##*.}"
    filename="${filename%.*}"
    echo "converting $filename"
    img2xterm "$fullfilename" "xterms/$filename"
done