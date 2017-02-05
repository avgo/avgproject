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
	(my $i_html_filename, my $o_html_filename) = @_;

	my $html_file;

	open my $i_html_fd, "<", $i_html_filename or die "error: $!\n";

	while (my $line = <$i_html_fd>)
	{
		$html_file .= $line;
	}

	close $i_html_fd;

	my $repl_html = repl;

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
	my $doc = XML::LibXML::Document->new();

	my $div = $doc->createElement("div");

	$div->setAttribute("style", "color: #5469FF; font-size: 9pt; text-align: center;");

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

		$div->appendChild($doc->createTextNode($title . ": "));

		$div->appendChild(span($doc, $value));

		$div->appendChild($doc->createTextNode(" "));
	}

	return $div->toString();
}

sub span {
	(my $doc, my $text) = @_;

	my $span = $doc->createElement("span");

	$span->setAttribute("style", "color: #FC7C7C;");

	$span->appendChild($doc->createTextNode($text));

	return $span;
}




if ( $#ARGV != 1 )
{
	print "error!\n";
	exit 1;
}

main @ARGV;
