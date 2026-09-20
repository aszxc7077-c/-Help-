CREATE TABLE `contactAgreements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`contractId` int,
	`clientId` int,
	`providerUserId` int,
	`clientApprovedAt` timestamp,
	`providerApprovedAt` timestamp,
	`unlockedAt` timestamp,
	`status` enum('pending','agreed','revoked') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contactAgreements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int,
	`providerId` int,
	`clientId` int,
	`term` enum('short','long') NOT NULL,
	`durationLabel` varchar(160) NOT NULL,
	`coverageLabel` varchar(180) NOT NULL,
	`estimatedMinHalalas` int NOT NULL,
	`estimatedMaxHalalas` int NOT NULL,
	`platformCommissionBps` int NOT NULL,
	`status` enum('draft','pending_approval','active','completed','cancelled') NOT NULL DEFAULT 'draft',
	`termsText` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`senderId` int NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paymentHolds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`contractId` int,
	`payerId` int,
	`providerId` int,
	`amountHalalas` int NOT NULL,
	`platformFeeBps` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'SAR',
	`status` enum('pending','held','released','refunded','failed') NOT NULL DEFAULT 'pending',
	`heldAt` timestamp,
	`releasedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentHolds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serviceProviders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int,
	`businessName` varchar(180) NOT NULL,
	`serviceType` varchar(64) NOT NULL,
	`description` text,
	`phone` varchar(32),
	`coverageArea` varchar(180),
	`rating` decimal(3,2) NOT NULL DEFAULT '0.00',
	`status` enum('pending','approved','paused') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `serviceProviders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serviceRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requesterId` int,
	`providerId` int,
	`serviceType` varchar(64) NOT NULL,
	`status` enum('searching','offered','accepted','in_progress','completed','cancelled') NOT NULL DEFAULT 'searching',
	`areaLabel` varchar(180) NOT NULL,
	`approximateLatitude` decimal(10,7),
	`approximateLongitude` decimal(10,7),
	`exactLocation` text,
	`budgetMinHalalas` int,
	`budgetMaxHalalas` int,
	`contactLocked` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `serviceRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `contactAgreements` ADD CONSTRAINT `contactAgreements_requestId_serviceRequests_id_fk` FOREIGN KEY (`requestId`) REFERENCES `serviceRequests`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contactAgreements` ADD CONSTRAINT `contactAgreements_contractId_contracts_id_fk` FOREIGN KEY (`contractId`) REFERENCES `contracts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contactAgreements` ADD CONSTRAINT `contactAgreements_clientId_users_id_fk` FOREIGN KEY (`clientId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contactAgreements` ADD CONSTRAINT `contactAgreements_providerUserId_users_id_fk` FOREIGN KEY (`providerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_requestId_serviceRequests_id_fk` FOREIGN KEY (`requestId`) REFERENCES `serviceRequests`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_providerId_serviceProviders_id_fk` FOREIGN KEY (`providerId`) REFERENCES `serviceProviders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_clientId_users_id_fk` FOREIGN KEY (`clientId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_requestId_serviceRequests_id_fk` FOREIGN KEY (`requestId`) REFERENCES `serviceRequests`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_senderId_users_id_fk` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `paymentHolds` ADD CONSTRAINT `paymentHolds_requestId_serviceRequests_id_fk` FOREIGN KEY (`requestId`) REFERENCES `serviceRequests`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `paymentHolds` ADD CONSTRAINT `paymentHolds_contractId_contracts_id_fk` FOREIGN KEY (`contractId`) REFERENCES `contracts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `paymentHolds` ADD CONSTRAINT `paymentHolds_payerId_users_id_fk` FOREIGN KEY (`payerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `paymentHolds` ADD CONSTRAINT `paymentHolds_providerId_serviceProviders_id_fk` FOREIGN KEY (`providerId`) REFERENCES `serviceProviders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `serviceProviders` ADD CONSTRAINT `serviceProviders_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `serviceRequests` ADD CONSTRAINT `serviceRequests_requesterId_users_id_fk` FOREIGN KEY (`requesterId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `serviceRequests` ADD CONSTRAINT `serviceRequests_providerId_serviceProviders_id_fk` FOREIGN KEY (`providerId`) REFERENCES `serviceProviders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `contactAgreements_request_idx` ON `contactAgreements` (`requestId`);--> statement-breakpoint
CREATE INDEX `contracts_request_idx` ON `contracts` (`requestId`);--> statement-breakpoint
CREATE INDEX `contracts_status_idx` ON `contracts` (`status`);--> statement-breakpoint
CREATE INDEX `messages_request_idx` ON `messages` (`requestId`);--> statement-breakpoint
CREATE INDEX `paymentHolds_request_idx` ON `paymentHolds` (`requestId`);--> statement-breakpoint
CREATE INDEX `paymentHolds_status_idx` ON `paymentHolds` (`status`);--> statement-breakpoint
CREATE INDEX `serviceProviders_serviceType_idx` ON `serviceProviders` (`serviceType`);--> statement-breakpoint
CREATE INDEX `serviceProviders_status_idx` ON `serviceProviders` (`status`);--> statement-breakpoint
CREATE INDEX `serviceRequests_requester_idx` ON `serviceRequests` (`requesterId`);--> statement-breakpoint
CREATE INDEX `serviceRequests_status_idx` ON `serviceRequests` (`status`);