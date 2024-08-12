CREATE TABLE `books` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(100) NOT NULL,
	`author` varchar(150) NOT NULL,
	`publisher` varchar(100) NOT NULL,
	`genre` varchar(31) NOT NULL,
	`isbnNo` varchar(13) NOT NULL,
	`pages` int NOT NULL,
	`totalCopies` int NOT NULL,
	`availableCopies` int NOT NULL,
	CONSTRAINT `books_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `book`;