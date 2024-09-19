#! /bin/sh

echo "{"
jq '.[].sources' < subsystems.json | grep 'http' | sed -e 's!^[ ]*"!!' -e 's!"[ ]*$!!' -e 's!",[ ]*$!!' |
	sort -u | \
	while read ln ; do \
		echo "Fetching $ln..." 1>&2 ; \
		lines=`links -dump "$ln" | wc -c` ; \
		echo "  \"$ln\": $lines," ; \
	done
echo "}"
