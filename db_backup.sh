#!/bin/bash

filename="avgproject_dump_$(date +"%F_%H-%M-%S").sql"

if test -f "${filename}"; then
	printf "error! file exists\n" >&1
	exit 1
fi

mysqldump avgproject > "${filename}"

