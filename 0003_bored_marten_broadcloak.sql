CREATE TABLE `paymentMethods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` enum('apple_pay','mada','stc_pay','card','bank_transfer') NOT NULL,
	`label` varchar(120) NOT NULL,
	`last4` varchar(4),
	`externalCustomerRef` varchar(180),
	`isDefault` int NOT NULL DEFAULT 0,
	`status` enum('pending','verified','disabled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentMethods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payoutBankAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bankName` varchar(120) NOT NULL,
	`accountHolderName` varchar(180) NOT NULL,
	`ibanLast4` varchar(4) NOT NULL,
	`externalAccountRef` varchar(180),
	`isDefault` int NOT NULL DEFAULT 0,
	`verificationStatus` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payoutBankAccounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `paymentMethods` ADD CONSTRAINT `paymentMethods_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payoutBankAccounts` ADD CONSTRAINT `payoutBankAccounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `paymentMethods_user_idx` ON `paymentMethods` (`userId`);--> statement-breakpoint
CREATE INDEX `payoutBankAccounts_user_idx` ON `payoutBankAccounts` (`userId`);