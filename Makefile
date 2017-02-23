
include config

AVGP_COMP_ENABLE = yes

ifeq ($(DEBUG), yes)
  AVGP_COMP_FLAGS  = -d
  PREFIX_D         = /debug
endif

PREFIX_DEBUG = $(PREFIX)$(PREFIX_D)
DOC_DIR      = $(PREFIX_DEBUG)/d
CGI_BIN      = $(PREFIX_DEBUG)/cgi-bin

PKGS = CGI DBI XML::LibXML

all:
	@echo CGI_BIN=$(CGI_BIN)
	@echo DOC_DIR=$(DOC_DIR)

install:
ifeq ($(DEBUG), yes)
	@echo Installing DEBUG version of AVG Project.
else
	@echo Installing RELEASE version of AVG Project.
endif
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
ifeq ($(AVGP_COMP_ENABLE), yes)
	./avgp-compile.pl $(AVGP_COMP_FLAGS) avgproject.template.main.html $(CGI_BIN)/avgproject.template.main.html
else
	sed s@%SITE_DOC_DIR%@d/@g avgproject.template.main.html > $(CGI_BIN)/avgproject.template.main.html
endif
	cp -vfu index.pl $(CGI_BIN)
	cp -vfu avgproject.css avgproject.js toolkit.css toolkit.js tree_items.js $(DOC_DIR)

