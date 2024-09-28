.SUFFIXES: .md .html

PREFIX	 = /var/www/vhosts/kristaps.bsd.lv/htdocs/devsecflops
sinclude Makefile.local
SBLG 	 = ../sblg/sblg
HTMLS	!= ls sources/*.md | sed 's!\.md$$!.html!'

all: index.js index.html index.css

node_modules: package.json
	npm install
	touch node_modules

install: all
	mkdir -p $(PREFIX)
	install -m 0444 index.js index.html index.css $(PREFIX)

build/data.json: $(HTMLS)
	mkdir -p build
	$(SBLG) -o- -j $(HTMLS) | jq '.' >$@

index.js: build/data.json
index.js: json/subsystems.json json/subsystems-sizes.json json/systems.json
index.js: json/casestudy.json json/casestudy-sizes.json
index.js: build/index.js
	@echo "build/index.js -> $@"
	@( \
		printf "const data =" ; \
		cat build/data.json ; \
		printf "const subsystemSizes =" ; \
		cat json/subsystems-sizes.json ; \
		printf "const subsystems =" ; \
		cat json/subsystems.json ; \
		printf "const systems = " ; \
		cat json/systems.json ; \
		printf "const casestudy =" ; \
		cat json/casestudy.json ; \
		printf "const casestudySizes =" ; \
		cat json/casestudy-sizes.json ; \
		sed -n '3,$$p' build/index.js ; \
	) >$@

.md.html:
	@echo "$< -> $@"
	@( \
	  set +e ; \
	  github=`lowdown -X githubAttestations $< 2>/dev/null` ; \
	  obsd=`lowdown -X openbsdAttestations $< 2>/dev/null` ; \
	  fbsd=`lowdown -X freebsdAttestations $< 2>/dev/null` ; \
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
	  [ -n "$$obsd" ] && echo " data-sblg-set-openbsdAttestations=\"$$obsd\"" ; \
	  [ -n "$$fbsd" ] && echo " data-sblg-set-freebsdAttestations=\"$$fbsd\"" ; \
	  [ -n "$$notes" ] && echo " data-sblg-set-notes=\"$$notes\"" ; \
	  [ -n "$$syslink" ] && echo " data-sblg-set-system-link=\"$$syslink\"" ; \
	  echo " data-sblg-set-lines=\"`sed -n '/\`\`\`/,$$p' $< | wc -l | awk '{print $$1}'`\"" ; \
	  echo " data-sblg-set-bytes=\"`sed -n '/\`\`\`/,$$p' $< | wc -c | awk '{print $$1}'`\">" ; \
	  lowdown $< ; \
	  echo "</article>"; \
	) >$@

clean:
	rm -f $(HTMLS) index.js index.html index.css
	rm -rf build

distclean: clean
	rm -rf node_modules

json/subsystems-sizes.json: querySizes.sh json/subsystems.json
	sh ./querySizes.sh >$@

json/casestudy-sizes.json: queryCasestudy.sh json/casestudy.json
	sh ./queryCasestudy.sh > $@

index.html: html/index.xml
	@echo "html/index.xml -> $@"
	@xmllint --pedantic --quiet --noout html/index.xml
	@cp -f html/index.xml $@

build/index.js: typescript/index.ts tsconfig.json
	@echo "typescript/index.ts -> $@"
	@npx tsc

index.css: css/index.css
	@echo "css/index.css -> $@"
	@npx stylelint css/index.css
	@cp -f css/index.css $@
