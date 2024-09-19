.SUFFIXES: .md .html

PREFIX	= /var/www/htdocs
SBLG 	= ../sblg/sblg
HTMLS	= sources/capsicum-c.html \
	  sources/capsicum-python.html \
	  sources/sandbox-c.html \
	  sources/landlock-c.html \
	  sources/java.html \
	  sources/seccomp-c.html \
	  sources/pledge-c.html \
	  sources/pledge-perl.html

all: index.js index.html

install: all
	mkdir -p /var/www/htdocs/leaderboard
	install -m 0444 index.js index.html index.css /var/www/htdocs/leaderboard

data.json: $(HTMLS)
	$(SBLG) -o$@ -j $(HTMLS)

index.js: data.json data.js subsystems.json subsystems-sizes.json
	( \
		printf "const data = " ; \
		cat data.json ; \
		echo ; \
		printf "const subsystemSizes = " ; \
		cat subsystems-sizes.json ; \
		echo ; \
		printf "const subsystems = " ; \
		cat subsystems.json ; \
		echo ; \
		cat data.js ; \
	) >$@

.md.html:
	( \
	  set +e ; \
	  github=`lowdown -X githubAttestations $< 2>/dev/null` ; \
	  subsys=`lowdown -X subsystem $< 2>/dev/null` ; \
	  sys=`lowdown -X system $< 2>/dev/null` ; \
	  syslink=`lowdown -X system-link $< 2>/dev/null` ; \
	  notes=`lowdown -X notes $< 2>/dev/null` ; \
	  lang=`lowdown -X lang $< 2>/dev/null` ; \
	  set -e ; \
	  echo "<article data-sblg-article=\"1\"" ; \
	  [ -n "$$lang" ] && echo " data-sblg-set-lang=\"$$lang\"" ; \
	  [ -n "$$sys" ] && echo " data-sblg-set-system=\"$$sys\"" ; \
	  [ -n "$$subsys" ] && echo " data-sblg-set-subsystem=\"$$subsys\"" ; \
	  [ -n "$$github" ] && echo " data-sblg-set-githubAttestations=\"$$github\"" ; \
	  [ -n "$$notes" ] && echo " data-sblg-set-notes=\"$$notes\"" ; \
	  [ -n "$$syslink" ] && echo " data-sblg-set-system-link=\"$$syslink\"" ; \
	  echo " data-sblg-set-lines=\"`sed -n '/\`\`\`/,$$p' $< | wc -l | awk '{print $$1}'`\"" ; \
	  echo " data-sblg-set-bytes=\"`sed -n '/\`\`\`/,$$p' $< | wc -c | awk '{print $$1}'`\">" ; \
	  lowdown $< ; \
	  echo "</article>"; \
	) >$@

clean:
	rm -f $(HTMLS) data.json index.js

querySizes:
	sh ./querySizes.sh >subsystems-sizes.json
