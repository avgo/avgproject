#!/usr/bin/env perl

use strict;
use utf8;

use CGI;
use Config::Simple;
use Data::Dumper;
use DBI;




use constant {
	INS_UPD_INSERT => 1,
	INS_UPD_UPDATE => 0,

	INS_UPD_COMMENT  => 0,
	INS_UPD_LOG_WORK => 1,

	FIELD_NAME  => 0,
	FIELD_VALUE => 1,
	FIELD_RULE  => 2,
};




sub action_comments_ins_upd;
sub action_comments_insert;
sub action_comments_select;
sub action_default;
sub action_get_task_list;
sub action_ins_upd;
sub action_ins_upd_cgi;
sub action_task_add;
sub action_task_edit;
sub comments_get_rules;
sub dbi_connect($);
sub main;
sub query_exec;
sub query_exec_cgi_val_subst;
sub query_last_insert_id;
sub query_print_data_set;
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




sub action_comments_ins_upd {
	( my $hash, my $is_insert, my $table, my $comment_type ) = @_ ;

	# Нужно проверять, определены ли уже эти поля!

	my $fields = [
		[ "modified", 0 ],
		[ "type", $comment_type ],
	];

	push ( @{$fields}, [ "created", 0 ] ) if $is_insert ;

=pod
         КАВЫЧКИ                 [X]
                                 [ ]

  `id`        int(10) unsigned   [ ]
  `task_id`   int(10) unsigned   [ ]
  `type`      int(10) unsigned   [ ]
  `comment`   varchar(200)       [X]
  `start`     datetime           [X]
  `min`       int(10) unsigned   [ ]
  `created`   datetime           [X]
  `modified`  datetime           [X]

=cut

	my $keys = [ ];

	action_ins_upd_cgi($hash, $is_insert, $table,
			$fields, $keys, comments_get_rules);
}

sub action_comments_insert {
	( my $hash ) = @_ ;

	query_exec_cgi_val_subst
		$hash,
		"INSERT INTO `comments` (\n" .
		"  `modified`,\n" .
		"  `type`,\n" .
		"  `created`,\n" .
		"  `min`,\n" .
		"  `comment`,\n" .
		"  `start_d`,\n" .
		"  `start_t`,\n" .
		"  `task_id`)\n" .
		"VALUES (NOW(),?,NOW(),?,?,NOW(),NOW(),?);\n",
		"type", "min", "comment", "task_id"
	;

	my $sth = query_last_insert_id $hash->{dbh};

	( my $liid ) = $sth->fetchrow_array;

	$sth = query_exec $hash->{dbh}, "SELECT * FROM `comments` WHERE id = ?;", $liid;

	query_print_data_set $sth, 1;
}

sub action_comments_select {
	( my $hash ) = @_ ;

	my $sth = query_exec_cgi_val_subst
		$hash,
		"SELECT * FROM `comments` WHERE `task_id` = ?;\n",
		"task_id"
	;

	query_print_data_set $sth, 1;
}

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
		"  tasks.dtm_created,\n" .
		"  tasks.priority\n" .
		"FROM tasks LEFT JOIN task_type ON tasks.type = task_type.id;\n"
	) or die "prepare(): $!";

	my $rv = $sth->execute or die $sth->errstr;
	my $num_rows = $sth->rows;

	while ((
		my $id,
		my $parent_id,
		my $type,
		my $type_name,
		my $title,
		my $description,
		my $dtm_created,
		my $priority
		) = $sth->fetchrow_array )
	{
		printf "{ " .
			"id: %d, " .
			"parent_id: %d, " .
			"title: \"%s\", " .
			"type: %d, " .
			"dtm_created: '%s', " .
			"description: '%s', " .
			"priority: '%s' " .
			"},\n",
			$id,
			$parent_id,
			string_to_js($title),
			$type,
			$dtm_created,
			string_to_js($description),
			$priority;
	}
}

sub action_ins_upd {
	( my $hash, my $is_insert, my $table, my $fields,
			my $keys, my $fields_rules ) = @_ ;

	my $query;

	my $comma = "";

	my @parameters;

	my @keys_fields = ( @{$keys}, @{$fields} );

	if ( $is_insert )
	{
		$query = "INSERT INTO `$table` (" ;

		my $val_str = "";

		for my $f ( @keys_fields )
		{
			my $f_name = $f->[FIELD_NAME];

			my $proc = $fields_rules->{$f_name}->{proc};

			my $val1; my $val2;

			if ( $proc )
			{
				$val1 = &{$proc} ( $f->[FIELD_VALUE] );

				next if not defined $val1;

				( $val1, $val2 ) = @{$val1};
			}
			else
			{
				$val1 = "?";
				$val2 = $f->[FIELD_VALUE];
			}

			$query .= sprintf "%s\n  `%s`", $comma, $f_name;
			$val_str .= sprintf "%s%s", $comma, $val1;
			$comma = ",";

			push (@parameters, $val2) if defined $val2;
		}

		$query .= ")\nVALUES (" . $val_str . ");";
	}
	else
	{
		$query = "UPDATE `$table` SET";

		for my $f ( @{$fields} )
		{
			my $f_name = $f->[FIELD_NAME];

			my $proc = $fields_rules->{$f_name}->{proc};

			my $val1; my $val2;

			if ( $proc )
			{
				$val1 = &{$proc} ( $f->[FIELD_VALUE] );

				next if not defined $val1;

				($val1, $val2) = @{$val1};
			}
			else
			{
				$val1 = "?";
				$val2 = $f->[FIELD_VALUE];
			}

			$query .= sprintf "%s\n  `%s` = %s", $comma, $f_name, $val1;
			$comma = ",";

			push (@parameters, $val2) if defined $val2;
		}

		$query .= "\nWHERE";
		$comma = "";

		for my $k ( @{$keys} )
		{
			$query .= sprintf "%s\n  `%s` = ?;", $comma, $k->[FIELD_NAME];
			$comma = ",";

			push @parameters, $k->[FIELD_VALUE];
		}

		$query .= "\n;";
	}

	my $sth; my $rv;

	$sth = $hash->{dbh}->prepare($query);

	if ( not $sth )
	{
		print	"Content-type: text/html; charset=UTF-8\n\n" .
			"{ err: 'app error!' }\n"
		;

		die "$!\n";
	}

	$rv = $sth->execute(@parameters);

	if ( not $rv )
	{
		print	"Content-type: text/html; charset=UTF-8\n\n" .
			"{ err: 'database error!' }\n"
		;

		die $sth->errstr . "\n";
	}

	if ( $is_insert )
	{
		$sth = $hash->{dbh}->prepare("SELECT LAST_INSERT_ID();")
				or die "prepare(): $!\n";

		$rv = $sth->execute() or die $sth->errstr;

		(my $id) = $sth->fetchrow_array;

		$query = "SELECT";
		$comma = "";

		for my $f ( @keys_fields )
		{
			my $f_name = $f->[FIELD_NAME];

			$query .= sprintf "%s\n  %s", $comma, $f_name;
			$comma = ",";
		}

		$query .=
			"\nFROM `" . $table . "`\n" .
			"WHERE `" . $keys->[0]->[FIELD_NAME] . "` = ?;"
		;

		$sth = $hash->{dbh}->prepare($query)
				or die "prepare(): $!\n";

		$rv = $sth->execute($id) or die $sth->errstr;

		my $fields_arr = $sth->{NAME};

		my @resp_arr = $sth->fetchrow_array;

		my $resp = "{ info: { }, result: [ {\n";

		for ( my $f_idx = 0; $f_idx <= $#{$fields_arr}; ++$f_idx)
		{
			my $f_name = $fields_arr->[$f_idx];

			my $val = $resp_arr[$f_idx];

			if ($fields_rules->{$f_name}->{quot})
			{
				$val = "\"" . string_to_js($val) . "\"";
			}

			$resp .= sprintf "  %s: %s,\n", $f_name, $val;
		}

		$resp .= "} ] }";

		printf	"Content-type: text/html; charset=UTF-8\n\n" .
			"%s\n",
			$resp
		;
	}
	else
	{
		printf	"Content-type: text/html; charset=UTF-8\n\n" .
			"{ }\n"
		;
	}
}

sub action_ins_upd_cgi {
	(my $hash, my $is_insert, my $table,
			my $fields, my $keys, my $fields_rules) = @_ ;

	my $param_h = $hash->{parameters_h};

	for my $key ( $hash->{parameters} )
	{
		my $key_n = $key;

		if ( $key =~ /^f/ )
		{
			$key_n =~ s/^f//;
			push @{$fields}, [ $key_n, $param_h->{$key} ] ;
		}
		elsif ( $key =~ /^k/ )
		{
			$key_n =~ s/^k//;
			push @{$keys}, [ $key_n, $param_h->{$key} ] ;
		}
	}

	action_ins_upd($hash, $is_insert, $table, $fields,
			$keys, $fields_rules);
}

sub action_task_add {
	my $object = shift;

	my $parent_id = $cgi->param("parent_id");
	my $title = $cgi->param("title");
	my $description = $cgi->param("description");
	my $type = $cgi->param("type");

	printf	"Content-type: text/html; charset=UTF-8\n\n";

	my $sth = $object->{dbh}->prepare(
			"INSERT INTO `tasks` (parent_id, title, description, type, dtm_created) VALUES (?,?,?,?,NOW());")
			or die "prepare(): $!\n";
	my $rv = $sth->execute($parent_id, $title, $description, $type) or die $sth->errstr;

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

	print "Content-type: text/html; charset=UTF-8\n\n";

	my $id = $cgi->param("id");

	if (not defined $id)
	{
		print "{ msg: \"error 1!\" }\n";
		return;
	}

	my $query_str; my @query_arr; my $comma;

	for my $variable ( qw(title description) )
	{
		if (my $param = $cgi->param($variable))
		{
			$query_str .= sprintf "%s%s = ?", $comma, $variable;

			push @query_arr, $param;

			$comma = ", ";
		}
	}

	if ($#query_arr == -1)
	{
		print "{ msg: \"error 2!\" }\n";
		return;
	}

	my $sth = $object->{dbh}->prepare(
			"UPDATE `tasks` SET $query_str WHERE id = ?;")
			or die "prepare(): $!\n";
	my $rv = $sth->execute(@query_arr, $id) or die $sth->errstr;
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

sub error_response {
	my $msg = shift;

	print	"Content-type: text/html; charset=UTF-8\n\n" .
		"{ err: 'app error!' }\n"
	;

	die $msg . "\n";
}

sub query_exec {
	( my $dbh, my $query ) = splice @_, 0, 2 ;

	my $sth = $dbh->prepare($query);

	error_response $! if not $sth ;

	my $rv = $sth->execute( @_ );

	error_response $sth->errstr if not $rv ;

	return $sth;
}

sub query_exec_cgi_val_subst {
	( my $hash, my $query ) = splice @_, 0, 2 ;

	my @parameters;

	my $param_h = $hash->{parameters_h};

	for my $i ( @_ )
	{
		my $cur_val = $param_h->{$i};

		error_response "query_exec_cgi_val_subst() error: no value for '$i' parameter in HTTP request."
			if not defined $cur_val;

		push @parameters, $cur_val;
	}

	return query_exec $hash->{dbh}, $query, @parameters;
}

sub query_last_insert_id {
	( my $dbh ) = @_ ;

	return query_exec $dbh, "SELECT LAST_INSERT_ID();";
}

sub query_print_data_set {
	( my $sth, my $body_hashes ) = @_ ;

	print	"Content-type: text/html; charset=UTF-8\n\n",
		"{ data_set: { header: ["
	;

	my $fields = $sth->{NAME};

	my $comma;

	for my $fn ( @{$fields} )
	{
		print $comma, " \"", string_to_js($fn), "\""; $comma = ",";
	}

	print	" ], fields: {"; $comma = ""; my $f_count = scalar @{$fields};

	for ( my $f_idx = 0; $f_idx < $f_count; ++$f_idx )
	{
		print	$comma,
			" ", string_to_js($fields->[$f_idx]),
			": ", $f_idx;
		$comma = ",";
	}

	print	" }, body: ["; $comma = "";

	if ( $body_hashes )
	{
		while ( my @row = $sth->fetchrow_array )
		{
			print $comma, " {"; $comma = "";
			for ( my $c_idx = 0; $c_idx < $f_count; ++$c_idx)
			{
				my $fn = $fields->[$c_idx];
				my $cell = $row[$c_idx];
				print $comma, " ", $fn, ": \"", string_to_js($cell), "\"";
				$comma = ",";
			}
			print " }";
		}
	}
	else
	{
		while ( my @row = $sth->fetchrow_array )
		{
			print $comma, " ["; $comma = "";
			for my $r ( @row )
			{
				print $comma, " \"", string_to_js($r), "\"";
				$comma = ",";
			}
			print " ]";
		}
	}

	print " ] } }";
}

sub comments_get_rules {
	return {
		"comment"  => {
			quot => 1
		},

		"created"  => {
			proc => sub { return [ "NOW()", undef ]; },
			quot => 1
		},

		"id" => {
			proc => sub
			{
				my $val = shift;
				return if $val eq "ai" ;
				return [ "?", $val ] ;
			},
		},

		"modified" => {
			proc => sub { return [ "NOW()", undef ]; },
			quot => 1
		},

		"start_d"    => {
			proc => sub
			{
				my $val = shift;
				return $val eq "now"
					? [ "NOW()", undef ]
					: [ "?",     $val  ]
				;
			},
			quot => 1
		},

		"start_t"    => {
			proc => sub
			{
				my $val = shift;
				if ( $val eq "now" )
				{
					return [ "NOW()", undef ];
				}
				elsif ( $val eq "null" )
				{
					return [ "NULL",  undef ];
				}
				return [ "?",     $val  ];
			},
			quot => 1
		},
	};
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

	load_config (\%hash);

	my @parameters = $cgi->param;

	my %parameters_h = map { $_ => $cgi->param($_) } @parameters ;

	my $action = delete $parameters_h{action};

	$action = "default" unless defined $action;

	my %parameters = (
		"default"  => \&action_default,
		1          => \&action_get_task_list,
		2          => \&action_task_add,
		3          => \&action_task_edit,
		5          => \&action_comments_insert,
		6          => \&action_comments_select,
		7          => [
				\&action_comments_ins_upd,
				INS_UPD_UPDATE,
				"comments",
				INS_UPD_LOG_WORK
		],
	);

	my $handler = $parameters{$action};

	if (not defined $handler)
	{
		printf	"Content-type: text/html; charset=UTF-8\n\n" .
			"error: Unknown action: '%s'.\n",
			$action
		;

	}

	my $args;

	if ( ref($handler) eq "ARRAY" )
	{
		$args = $handler;

		$handler = shift @{$args};
	}
	else
	{
		$args = [ ];
	}

	dbi_connect \%hash;

	$hash{action} = $action;

	$hash{parameters} = \@parameters;

	$hash{parameters_h} = \%parameters_h;

	&{$handler} ( \%hash, @{$args} );
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
