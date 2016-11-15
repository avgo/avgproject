
DROP DATABASE IF EXISTS `avgproject`;

CREATE DATABASE `avgproject`;

USE `avgproject`;

CREATE TABLE `tasks` (
	`id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
	`parent_id` INT UNSIGNED NOT NULL DEFAULT '0',
	`type` INT UNSIGNED NOT NULL DEFAULT '0',
	`title` VARCHAR(60),
	`description` VARCHAR(60),
	`dtm_created` DATETIME,
	PRIMARY KEY (`id`)
) CHARSET = utf8;

/*

INSERT INTO `tasks` (id, parent_id, title, type, dtm_created)
VALUES
(15, 14, "p2 задача 3", 2, NOW()),
(16, 15, "p2 задача 4", 2, NOW()),
(5, 0, "project 1", 1, NOW()),
(13, 7, "p2 task 1", 2, NOW()),
(7, 0, "project 2", 1, NOW()),
(11, 0, "project 3", 1, NOW()),
(12, 11, "p3 task 1", 2, NOW()),
(14, 7, "p2 задача 2", 2, NOW())
;

*/

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
