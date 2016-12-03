#!/usr/bin/env perl

use strict;
use utf8;

use CGI;
use Config::Simple;
use DBI;




sub action_default;
sub action_get_task_list;
sub action_task_add;
sub action_task_edit;
sub dbi_connect($);
sub main;
sub template_end;
sub template_set;
sub template_start;




my $cgi;
my %esc = (
	"\n" => '\n',
	"\r" => '\r',
	"\t" => '\t',
	"\f" => '\f',
	"\b" => '\b',
	"\"" => '\"',
	"\\" => '\\\\',
	"\'" => '\\\'',
);
my $result_html;




sub action_default {
	my $object = shift ;

	template_start "avgproject.template.main.html" ;
	template_end ;
}

sub action_get_task_list {
	my $object = shift;

	print "Content-type: text/html; charset=UTF-8\n\n";

	my $sth = $object->{dbh}->prepare (
		"SELECT\n" .
		"  tasks.id,\n" .
		"  tasks.parent_id,\n" .
		"  tasks.type,\n" .
		"  task_type.name,\n" .
		"  tasks.title,\n" .
		"  tasks.description,\n" .
		"  tasks.dtm_created\n" .
		"FROM tasks LEFT JOIN task_type ON tasks.type = task_type.id;\n"
	) or die "prepare(): $!";

	my $rv = $sth->execute or die $sth->errstr;
	my $num_rows = $sth->rows;

	while ((my $id, my $parent_id, my $type, my $type_name, my $title, my $description, my $dtm_created) = $sth->fetchrow_array) {
		printf "{ id: %d, parent_id: %d, title: \"%s\", type: %d, dtm_created: '%s' },\n",
			$id, $parent_id, string_to_js($title), $type, $dtm_created;
	}
}

sub action_task_add {
	my $object = shift;

	my $parent_id = $cgi->param("parent_id");
	my $title = $cgi->param("title");
	my $type = $cgi->param("type");

	printf	"Content-type: text/html; charset=UTF-8\n\n";

	my $sth = $object->{dbh}->prepare(
			"INSERT INTO `tasks` (parent_id, title, type, dtm_created) VALUES (?,?,?,NOW());")
			or die "prepare(): $!\n";
	my $rv = $sth->execute($parent_id, $title, $type) or die $sth->errstr;

	$sth = $object->{dbh}->prepare("SELECT LAST_INSERT_ID();")
			or die "prepare(): $!\n";
	$rv = $sth->execute() or die $sth->errstr;

	(my $id) = $sth->fetchrow_array;

	$sth = $object->{dbh}->prepare("SELECT dtm_created FROM tasks WHERE id = ?;")
			or die "prepare(): $!\n";
	$rv = $sth->execute($id) or die $sth->errstr;

	(my $dtm_created) = $sth->fetchrow_array;

	printf "{ id: %d, dtm_created: \"%s\" }", $id, $dtm_created;
}

sub action_task_edit {
	my $object = shift;

	my $id    = $cgi->param("id");
	my $title = $cgi->param("title");

	my $sth = $object->{dbh}->prepare(
			"UPDATE `tasks` SET title = ? WHERE id = ?;")
			or die "prepare(): $!\n";
	my $rv = $sth->execute($title, $id) or die $sth->errstr;

	print "Content-type: text/html; charset=UTF-8\n\n";

	printf	"'%s'\n" .
		"'%s'\n",
		$id, $title;
}

sub dbi_connect($) {
	my $par = shift;

	$par->{dbh} = DBI->connect(
			"dbi:mysql:" . $par->{mysql_db_name},
			$par->{mysql_user},
			$par->{mysql_password},
			{ mysql_enable_utf8 => 1} )
			or die "connect(): $!\n";
}

sub load_config {
        my $hash = shift;

        my $cfg = new Config::Simple("avgproject.conf");

        my @vars_to_load = qw(mysql_db_name mysql_user mysql_password);

        for my $var_name ( @vars_to_load )
        {
                $hash->{$var_name} = $cfg->param($var_name);
        }
}

sub main {
	my %hash = ();

	load_config \%hash;

	my $action = $cgi->param("action");

	$action = "default" unless defined $action;

	my %parameters = (
		"default"  => \&action_default,
		1          => \&action_get_task_list,
		2          => \&action_task_add,
		3          => \&action_task_edit,
	);

	my $handler = $parameters{$action};

	if (not defined $handler) {

		printf	"Content-type: text/html; charset=UTF-8\n\n" .
			"error: Unknown action: '%s'.\n",
			$action
		;

	}

	dbi_connect \%hash;

	&{$handler} ( \%hash );
}

sub string_to_js {
	my ($arg) = @_;

	$arg =~ s/([\x22\x5c\n\r\t\f\b])/$esc{$1}/g;
	$arg =~ s/\//\\\//g;
	$arg =~ s/([\x00-\x08\x0b\x0e-\x1f\x7f-\x7f])/'\\\\x' . unpack('H2', $1)/eg;

	return $arg;
}

sub template_end {
	print $result_html;
}

sub template_set {
	(my $name, my $val) = @_;

	$result_html =~ s/<\? *$name *\?>/$val/g;
}

sub template_start {
	my $filename = shift;

	open my $fd, "<:encoding(UTF-8)", $filename or
		die "не получается открыть файл шаблона '$filename'. $!.\n";

	$result_html = "Content-type: text/html; charset=UTF-8\n\n";

	while (my $line = <$fd>) {
		$result_html .= $line;
	}

	close $fd;
}




$cgi = CGI->new;

main;
