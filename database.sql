
DROP DATABASE IF EXISTS `avgproject`;

CREATE DATABASE `avgproject`;

USE `avgproject`;

CREATE TABLE `tasks` (
	`id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
	`parent_id` INT UNSIGNED NOT NULL DEFAULT '0',
	`type` INT UNSIGNED NOT NULL DEFAULT '0',
	`title` VARCHAR(60),
	`description` TEXT,
	`dtm_created` DATETIME,
	PRIMARY KEY (`id`)
) CHARSET = utf8;

CREATE TABLE `task_type` (
	`id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
	`name` VARCHAR(15),
	PRIMARY KEY (`id`)
) CHARSET = utf8;

INSERT INTO `task_type` (id, name)
VALUES
( 1, "project" ),
( 2, "task" )
;
