
PKGS = CGI DBI XML::LibXML

all:

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
	
	./avgp-compile.pl avgproject.template.main.html /usr/lib/cgi-bin/avgproject.template.main.html
	cp -vfu avgproject.pl /usr/lib/cgi-bin
	cp -vfu toolkit.css toolkit.js tree_items.js /var/www/html
