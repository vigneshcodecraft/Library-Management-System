CREATE TABLE `books` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(100) NOT NULL,
	`author` varchar(150) NOT NULL,
	`publisher` varchar(50),
	`genre` varchar(31) NOT NULL,
	`isbnNo` varchar(31) NOT NULL,
	`pages` int NOT NULL,
	`totalCopies` int NOT NULL,
	`availableCopies` int NOT NULL,
	CONSTRAINT `books_id` PRIMARY KEY(`id`),
	CONSTRAINT `books_isbnNo_unique` UNIQUE(`isbnNo`)
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`firstName` varchar(50) NOT NULL,
	`lastName` varchar(50) NOT NULL,
	`phone` bigint NOT NULL,
	`address` varchar(100) NOT NULL,
	`password` varchar(100) NOT NULL,
	`email` varchar(100) NOT NULL,
	`refreshToken` varchar(100),
	CONSTRAINT `members_id` PRIMARY KEY(`id`),
	CONSTRAINT `members_phone_unique` UNIQUE(`phone`),
	CONSTRAINT `members_email_unique` UNIQUE(`email`),
	CONSTRAINT `members_refreshToken_unique` UNIQUE(`refreshToken`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`memberId` int NOT NULL,
	`borrowDate` varchar(10) NOT NULL,
	`dueDate` varchar(15) NOT NULL,
	`status` varchar(15) NOT NULL,
	`returnDate` varchar(10),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(100) NOT NULL,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_bookId_books_id_fk` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE cascade;