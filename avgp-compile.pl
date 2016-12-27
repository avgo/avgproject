#!/usr/bin/env perl

use strict;
use utf8;




sub main;




sub main {
	(my $i_html_filename, my $o_html_filename) = @_;

	my $html_file;

	open my $i_html_fd, "<", $i_html_filename or die "error: \n";

	while (my $line = <$i_html_fd>)
	{
		$html_file .= $line;
	}

	close $i_html_fd;

	(	my $now_sec,  my $now_min,  my $now_hour,
		my $now_mday, my $now_mon,  my $now_year,
		my $now_wday, my $now_yday, my $now_isdst) = localtime;

	$now_mon  += 1;
	$now_year += 1900;

	my $dtm_str = sprintf
		"%02u.%02u.%04u %02u:%02u:%02u",
		$now_mday, $now_mon, $now_year,
		$now_hour, $now_min, $now_sec
	;

	my $git_msg = `git log HEAD^..HEAD --pretty="format:git SHA-1: %H, author date: %ai, commiter date: %ci, commit MSG: %s"`;

	my $repl_html =
		"<div style=\"background-color: #FFE1E1; color: #841818; font-size: 9pt; text-align: center;\">" .
		"install: $dtm_str, $git_msg" .
		"</div>"
	;

	$html_file =~ s/<versioninfo>/$repl_html/;

	open my $o_html_fd, ">", $o_html_filename or die "error: \n";

	print { $o_html_fd } $html_file;

	close $o_html_fd;

	my $ii_filename = "install-info.txt";

	open my $ii_fd, ">", $ii_filename or die "error: \n";

	print { $ii_fd } $repl_html, "\n";

	close $ii_fd;
}




if ( $#ARGV != 1 )
{
	print "error!\n";
	exit 1;
}

main @ARGV;
