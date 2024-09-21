#! /bin/sh

echo "{"
echo "  \"fetched\": \"`date +%s`\","
echo "  \"results\": {"
FIRST=TRUE
cat subsystems.json | \
	jq '.[].sources' | grep 'http' | \
	sed -e 's!^[ ]*"!!' -e 's!"[ ]*$!!' -e 's!",[ ]*$!!' | \
	sort -u | \
	while read ln ; do \
		echo "Fetching $ln..." 1>&2 ; \
		lines=`links -dump "$ln" | wc -c` ; \
		[ -z "$FIRST" ] && echo "," ; \
		printf "    \"$ln\": $lines" ; \
		FIRST="" ; \
	done ; \
	echo ""
echo "  }"
echo "}"
