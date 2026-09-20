CREATE TABLE `payoutRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`walletAccountId` int NOT NULL,
	`bankAccountId` int NOT NULL,
	`amountHalalas` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'SAR',
	`status` enum('pending','processing','paid','failed','cancelled') NOT NULL DEFAULT 'pending',
	`externalReference` varchar(180),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payoutRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `walletTopUps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`paymentMethodId` int,
	`amountHalalas` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'SAR',
	`status` enum('pending','paid','failed','cancelled') NOT NULL DEFAULT 'pending',
	`externalReference` varchar(180),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `walletTopUps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `payoutRequests` ADD CONSTRAINT `payoutRequests_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payoutRequests` ADD CONSTRAINT `payoutRequests_walletAccountId_walletAccounts_id_fk` FOREIGN KEY (`walletAccountId`) REFERENCES `walletAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payoutRequests` ADD CONSTRAINT `payoutRequests_bankAccountId_payoutBankAccounts_id_fk` FOREIGN KEY (`bankAccountId`) REFERENCES `payoutBankAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `walletTopUps` ADD CONSTRAINT `walletTopUps_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `walletTopUps` ADD CONSTRAINT `walletTopUps_paymentMethodId_paymentMethods_id_fk` FOREIGN KEY (`paymentMethodId`) REFERENCES `paymentMethods`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `payoutRequests_user_idx` ON `payoutRequests` (`userId`);--> statement-breakpoint
CREATE INDEX `payoutRequests_status_idx` ON `payoutRequests` (`status`);--> statement-breakpoint
CREATE INDEX `walletTopUps_user_idx` ON `walletTopUps` (`userId`);