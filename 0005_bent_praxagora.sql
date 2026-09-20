CREATE TABLE `platformTermsAcceptances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`termsVersion` varchar(24) NOT NULL,
	`agreementType` enum('platform_conduct','privacy','provider_payout') NOT NULL,
	`acceptedAt` timestamp NOT NULL DEFAULT (now()),
	`userAgent` varchar(255),
	CONSTRAINT `platformTermsAcceptances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `termsAcceptedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `termsVersion` varchar(24);--> statement-breakpoint
ALTER TABLE `platformTermsAcceptances` ADD CONSTRAINT `platformTermsAcceptances_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `platformTermsAcceptances_user_idx` ON `platformTermsAcceptances` (`userId`);