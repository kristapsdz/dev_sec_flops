#! /bin/sh

if [ -z $GITHUB_TOKEN ]
then
	echo "GITHUB_TOKEN needs to be defined" 1>&2
	exit 1
fi

echo "{"
echo "  \"fetched\": \"`date +%s`\","
echo "  \"results\": {"
FIRST_OUTER=TRUE
cat json/casestudy.json | \
	jq '.[]' | \
	sed -e 's!^[ ]*"!!' -e 's!"[ ]*$!!' -e 's!",[ ]*$!!' | \
	sort -u | \
	while read ln ; do \
		[ -z "$FIRST_OUTER" ] && echo "," ; \
		FIRST_OUTER="" ; \
		echo "    \"$ln\": {" ; \
		echo "Fetching $ln..." 1>&2 ; \
		lines=`curl -s -o- "$ln" | wc -l` ; \
		echo "       \"lines\": $lines," ; \
		echo "Fetching history of $ln..." 1>&2 ; \
		echo "       \"history\": [" ; \
		file=`basename $ln` ; \
		FIRST_INNER=TRUE ; \
		curl --url-query "path=/$file" \
	     	     -L \
	             -H "Accept: application/vnd.github+json" \
		     -H "Authorization: Bearer ${GITHUB_TOKEN}" \
		     -H "X-GitHub-Api-Version: 2022-11-28" \
		     https://api.github.com/repos/openssh/openssh-portable/commits | \
		     jq '.[].commit.author.date' | \
		        sort | \
		     	while read date ; do \
				[ -z "$FIRST_INNER" ] && echo "," ; \
				printf "           $date" ; \
				FIRST_INNER="" ; \
			done ; \
		echo "" ; \
		echo "       ]" ; \
		printf "    }" ; \
	done ; \
	echo ""
echo "  }"
echo "}"
