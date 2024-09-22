.SUFFIXES: .md .html

PREFIX	 = /var/www/vhosts/kristaps.bsd.lv/htdocs/devsecflops
sinclude Makefile.local
SBLG 	 = ../sblg/sblg
HTMLS	!= ls sources/*.md | sed 's!\.md$$!.html!'

all: index.js index.html index.css

install: all
	mkdir -p $(PREFIX)
	install -m 0444 index.js index.html index.css $(PREFIX)

data.json: $(HTMLS)
	$(SBLG) -o- -j $(HTMLS) | jq '.' >$@

index.js: data.json data.js
index.js: subsystems.json subsystems-sizes.json systems.json
index.js: casestudy.json casestudy-sizes.json
index.js:
	( \
		printf "const data =" ; \
		cat data.json ; \
		printf "const subsystemSizes =" ; \
		cat subsystems-sizes.json ; \
		printf "const subsystems =" ; \
		cat subsystems.json ; \
		printf "const systems = " ; \
		cat systems.json ; \
		printf "const casestudy =" ; \
		cat casestudy.json ; \
		printf "const casestudySizes =" ; \
		cat casestudy-sizes.json ; \
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
	rm -f $(HTMLS) data.json index.js index.html index.css

subsystems-sizes.json: querySizes.sh subsystems.json
	sh ./querySizes.sh >$@

casestudy-sizes.json: queryCasestudy.sh casestudy.json
	sh ./queryCasestudy.sh > $@

index.html: html/index.xml
	xmllint --pedantic --quiet --noout html/index.xml
	cp -f html/index.xml $@

index.css: css/index.css
	npx stylelint css/index.css
	cp -f css/index.css $@
