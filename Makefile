
include config

ifeq ($(DEBUG), yes)
	DOC_DIR=$(PREFIX)/debug/d
	CGI_BIN=$(PREFIX)/debug/cgi-bin
else
	DOC_DIR=$(PREFIX)/d
	CGI_BIN=$(PREFIX)/cgi-bin
endif

PKGS = CGI DBI XML::LibXML

all:
	@echo CGI_BIN=$(CGI_BIN)
	@echo DOC_DIR=$(DOC_DIR)

install:
	@echo
	@printf "Checking perl interpreter .. "; \
	if test "$$(perl -e 'print "helloperl";' 2> /dev/null)" = helloperl; then \
		echo ok ; \
	else \
		echo fail ; \
		echo; \
		echo "error: Perl interpreter is absent."; \
		echo "       You need to install perl language."; \
		echo; \
		exit 1 ; \
	fi
	@for cpkg in $(PKGS); \
	do \
		printf "Checking perl package '%s' .. " "$$cpkg"; \
		if perl -M$$cpkg -e '' 2> /dev/null; then \
			echo ok; \
		else \
			echo fail; \
			echo; \
			echo "error: Package '$$cpkg' is absent."; \
			echo "       You need to install '$$cpkg' perl package."; \
			echo; \
			exit 1; \
		fi \
	done
	
	./avgp-compile.pl avgproject.template.main.html $(CGI_BIN)/avgproject.template.main.html
	cp -vfu index.pl $(CGI_BIN)
	cp -vfu toolkit.css toolkit.js tree_items.js $(DOC_DIR)

