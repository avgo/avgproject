#!/usr/bin/env perl

use strict;
use utf8;

use IPC::Open2;
use XML::LibXML;




sub main;
sub repl;
sub span;
sub timestamp;




my $ii_filename  = "install-info.txt";
my $site_doc_dir = "d\/";




sub main {
	(my $cnf, my $i_html_filename, my $o_html_filename) = @_ ;

	my $html_file;

	open my $i_html_fd, "<", $i_html_filename or die "error: $!\n";

	while (my $line = <$i_html_fd>)
	{
		$html_file .= $line;
	}

	close $i_html_fd;

	my $repl_html = $cnf->{debug} ? repl : "" ;

	$html_file =~ s/<versioninfo>/$repl_html/;
	$html_file =~ s/%SITE_DOC_DIR%/$site_doc_dir/g;

	open my $o_html_fd, ">", $o_html_filename or die "error: \n";

	print { $o_html_fd } $html_file;

	close $o_html_fd;

	open my $ii_fd, ">", $ii_filename or die "error: \n";

	print { $ii_fd } $repl_html, "\n";

	close $ii_fd;
}

sub repl {
	my $result;

	my $doc = XML::LibXML::Document->new();

	my $div = $doc->createElement("div");

	$div->setAttribute("style", "padding: 10px 0px; color: #5469FF; font-size: 9pt;");

	my $span = $doc->createElement("span");

	$span->setAttribute("style", "padding: 0px 14px 0px 0px; color: #FC7C7C; font-size: 12pt; font-weight: bold;");

	$span->appendChild($doc->createTextNode("ВНИМАНИЕ!"));

	$div->appendChild($span);

	$div->appendChild($doc->createTextNode(
		"Это отладочная версия AVG Project, многие функции могут работать в ней " .
		"некорректно, так как версия предназначена для целей тестирования и разработки."
	));

	$result .= $div->toString();

	my $table = $doc->createElement("table");

	$table->setAttribute("style", "color: #5469FF; font-size: 9pt;");

	for my $el
	(
		[ "install",
			sub {
				(	my $now_sec,  my $now_min,  my $now_hour,
					my $now_mday, my $now_mon,  my $now_year,
					my $now_wday, my $now_yday, my $now_isdst) = localtime;

				$now_mon  += 1;
				$now_year += 1900;

				return sprintf(
					"%02u.%02u.%04u %02u:%02u:%02u",
					$now_mday, $now_mon, $now_year,
					$now_hour, $now_min, $now_sec
				);
			}
		],
		[ "git SHA-1",     "%H"  ],
		[ "author date",   "%ai" ],
		[ "commiter date", "%ci" ],
		[ "commit MSG",    "%s"  ],
	)
	{
		( my $title, my $code ) = @{$el};

		# perl -Mstrict -MIPC::Open2 -e 'open2 my $fd_out, undef, "git", "log", "-1"; while (my $l = <$fd_out>) { print $l; last; }'

		my $value;

		if ( ref($code) eq "CODE" )
		{
			$value = &{$code};
		}
		else
		{
			open2 my $fd_out, undef, "git", "log", "-1", "--pretty=format:" . $code;

			while ( my $line = <$fd_out> )
			{
				$value .= $line;
			}
		}

		my $tr = $doc->createElement("tr");

		my $td = $doc->createElement("td");

		$td->setAttribute("style", "padding: 0px 20px 0px 0px");

		$td->appendChild($doc->createTextNode($title . ":"));

		$tr->appendChild($td);

		$td = $doc->createElement("td");

		$td->setAttribute("style", "color: #FC7C7C; padding: 0px 0px 0px 0px");

		$td->appendChild($doc->createTextNode($value));

		$tr->appendChild($td);

		$table->appendChild($tr);
	}

	$result .= $table->toString();

	return $result;
}




if ( $#ARGV < 1 )
{
	print "error!\n";
	exit 1;
}

my %cnf;

if ( $ARGV[0] eq "-d" )
{
	shift @ARGV;
	$cnf{debug} = 1;
}
else
{
	$cnf{debug} = 0;
}

if ( $#ARGV != 1 )
{
	print "error!\n";
	exit 1;
}

main \%cnf, @ARGV;
