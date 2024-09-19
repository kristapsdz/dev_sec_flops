#! /bin/sh

echo "{ \"fetched\": \"`date +%s`\","
echo "  \"results\": {"
jq '.[]' < casestudy.json | \
	sed -e 's!^[ ]*"!!' -e 's!"[ ]*$!!' -e 's!",[ ]*$!!' | \
	sort -u | \
	while read ln ; do \
		echo "Fetching $ln..." 1>&2 ; \
		lines=`curl -s -o- "$ln" | wc -l` ; \
		echo "    \"$ln\": $lines," ; \
	done
echo "  }"
echo "}"
