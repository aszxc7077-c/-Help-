CREATE TABLE `providerCustomFields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`providerId` int NOT NULL,
	`fieldLabel` varchar(120) NOT NULL,
	`fieldValue` text NOT NULL,
	`visibility` enum('platform','public') NOT NULL DEFAULT 'platform',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `providerCustomFields_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serviceRatings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`providerId` int NOT NULL,
	`clientId` int NOT NULL,
	`score` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `serviceRatings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `serviceProviders` ADD `commercialRegistrationNumber` varchar(80);--> statement-breakpoint
ALTER TABLE `serviceProviders` ADD `operatingCardNumber` varchar(80);--> statement-breakpoint
ALTER TABLE `serviceProviders` ADD `verificationStatus` enum('unverified','pending','verified','rejected') DEFAULT 'unverified' NOT NULL;--> statement-breakpoint
ALTER TABLE `serviceProviders` ADD `experiencePoints` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `serviceProviders` ADD `priorityPoints` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `serviceProviders` ADD `ratingCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `providerCustomFields` ADD CONSTRAINT `providerCustomFields_providerId_serviceProviders_id_fk` FOREIGN KEY (`providerId`) REFERENCES `serviceProviders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `serviceRatings` ADD CONSTRAINT `serviceRatings_requestId_serviceRequests_id_fk` FOREIGN KEY (`requestId`) REFERENCES `serviceRequests`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `serviceRatings` ADD CONSTRAINT `serviceRatings_providerId_serviceProviders_id_fk` FOREIGN KEY (`providerId`) REFERENCES `serviceProviders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `serviceRatings` ADD CONSTRAINT `serviceRatings_clientId_users_id_fk` FOREIGN KEY (`clientId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `providerCustomFields_provider_idx` ON `providerCustomFields` (`providerId`);--> statement-breakpoint
CREATE INDEX `serviceRatings_provider_idx` ON `serviceRatings` (`providerId`);--> statement-breakpoint
CREATE INDEX `serviceRatings_request_idx` ON `serviceRatings` (`requestId`);