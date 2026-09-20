CREATE TABLE `walletAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`availableHalalas` int NOT NULL DEFAULT 0,
	`heldHalalas` int NOT NULL DEFAULT 0,
	`currency` varchar(3) NOT NULL DEFAULT 'SAR',
	`status` enum('active','frozen') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `walletAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `walletAccounts_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `walletLedger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletAccountId` int NOT NULL,
	`requestId` int,
	`paymentHoldId` int,
	`type` enum('top_up','escrow_hold','provider_release','platform_fee','refund') NOT NULL,
	`direction` enum('credit','debit') NOT NULL,
	`amountHalalas` int NOT NULL,
	`description` varchar(255) NOT NULL,
	`externalReference` varchar(180),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `walletLedger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `walletAccounts` ADD CONSTRAINT `walletAccounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `walletLedger` ADD CONSTRAINT `walletLedger_walletAccountId_walletAccounts_id_fk` FOREIGN KEY (`walletAccountId`) REFERENCES `walletAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `walletLedger` ADD CONSTRAINT `walletLedger_requestId_serviceRequests_id_fk` FOREIGN KEY (`requestId`) REFERENCES `serviceRequests`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `walletLedger` ADD CONSTRAINT `walletLedger_paymentHoldId_paymentHolds_id_fk` FOREIGN KEY (`paymentHoldId`) REFERENCES `paymentHolds`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `walletLedger_wallet_idx` ON `walletLedger` (`walletAccountId`);--> statement-breakpoint
CREATE INDEX `walletLedger_request_idx` ON `walletLedger` (`requestId`);