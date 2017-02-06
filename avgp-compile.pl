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
my @months = qw(
	января    февраля  марта   апреля
	мая       июня     июля    августа
	сентября  октября  ноября  декабря
);
my $site_doc_dir = "d\/";




sub main {
	(my $cnf, my $i_html_filename, my $o_html_filename) = @_ ;

	my $html_file;

	open my $i_html_fd, "<:encoding(UTF-8)", $i_html_filename or die "error: $!\n";

	while (my $line = <$i_html_fd>)
	{
		$html_file .= $line;
	}

	close $i_html_fd;

	my $repl_html = repl $cnf;

	$html_file =~ s/<versioninfo>/$repl_html/;
	$html_file =~ s/%SITE_DOC_DIR%/$site_doc_dir/g;

	open my $o_html_fd, ">:encoding(UTF-8)", $o_html_filename or die "error: \n";

	print { $o_html_fd } $html_file;

	close $o_html_fd;

	open my $ii_fd, ">:encoding(UTF-8)", $ii_filename or die "error: \n";

	print { $ii_fd } $repl_html, "\n";

	close $ii_fd;
}

sub repl {
	my $cnf = shift;

	my $result;

	my $doc = XML::LibXML::Document->new();

	my $div = $doc->createElement("div");

	$div->setAttribute("style", "padding: 10px 0px; color: #5469FF; font-size: 9pt;");

	my $top_message;

	if ( $cnf->{debug} )
	{
		my $span = $doc->createElement("span");

		$span->setAttribute("style", "padding: 0px 14px 0px 0px; color: #FC7C7C; font-size: 12pt; font-weight: bold;");

		$span->appendChild($doc->createTextNode("ВНИМАНИЕ!"));

		$div->appendChild($span);

		$top_message =
			"Это отладочная версия AVG Project, многие функции могут работать в ней " .
			"некорректно, так как версия предназначена для целей тестирования и разработки."
		;
	}
	else
	{
		$top_message = "stable version" ;
	}

	$div->appendChild($doc->createTextNode($top_message));

	$result .= $div->toString();

	my $table = $doc->createElement("table");

	$table->setAttribute("style", "color: #5469FF; font-size: 9pt;");

	my $timeformat = sub {
		my $t = shift;

		(	my $now_sec,  my $now_min,  my $now_hour,
			my $now_mday, my $now_mon,  my $now_year,
			my $now_wday, my $now_yday, my $now_isdst) =

			$t ? localtime ( $t ) : localtime ;

		$now_year += 1900;

		return sprintf(
			"%02u %s %04u %02u:%02u:%02u",
			$now_mday, $months[$now_mon], $now_year,
			$now_hour, $now_min, $now_sec
		);
	};

	for my $el
	(
		[ "install",       undef, $timeformat ],
		[ "git SHA-1",     "%H",  undef       ],
		[ "author date",   "%at", $timeformat ],
		[ "commiter date", "%ct", $timeformat ],
		[ "commit MSG",    "%s",  undef       ],
	)
	{
		( my $title, my $code, my $f ) = @{$el};

		# perl -Mstrict -MIPC::Open2 -e 'open2 my $fd_out, undef, "git", "log", "-1"; while (my $l = <$fd_out>) { print $l; last; }'

		my $value;

		if ( $code )
		{
			open2 my $fd_out, undef, "git", "log", "-1", "--pretty=format:" . $code;

			while ( my $line = <$fd_out> )
			{
				$value .= $line;
			}
		}

		$value = &{$f} ( $value ) if $f ;

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
