CREATE TABLE `nutrition` (
	`product_id` text PRIMARY KEY NOT NULL,
	`calories` real,
	`fat` real,
	`saturated` real,
	`carbs` real,
	`sugars` real,
	`added_sugars` real,
	`fibre` real,
	`protein` real,
	`sodium` real,
	`source` text NOT NULL,
	`verified_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "nutrition_calories_range" CHECK("nutrition"."calories" IS NULL OR "nutrition"."calories" BETWEEN 0 AND 1000),
	CONSTRAINT "nutrition_sodium_range" CHECK("nutrition"."sodium" IS NULL OR "nutrition"."sodium" BETWEEN 0 AND 100000),
	CONSTRAINT "nutrition_grams_range" CHECK(("nutrition"."fat" IS NULL OR "nutrition"."fat" BETWEEN 0 AND 100) AND ("nutrition"."saturated" IS NULL OR "nutrition"."saturated" BETWEEN 0 AND 100) AND ("nutrition"."carbs" IS NULL OR "nutrition"."carbs" BETWEEN 0 AND 100) AND ("nutrition"."sugars" IS NULL OR "nutrition"."sugars" BETWEEN 0 AND 100) AND ("nutrition"."added_sugars" IS NULL OR "nutrition"."added_sugars" BETWEEN 0 AND 100) AND ("nutrition"."fibre" IS NULL OR "nutrition"."fibre" BETWEEN 0 AND 100) AND ("nutrition"."protein" IS NULL OR "nutrition"."protein" BETWEEN 0 AND 100)),
	CONSTRAINT "nutrition_sugar_subset" CHECK("nutrition"."sugars" IS NULL OR "nutrition"."carbs" IS NULL OR "nutrition"."sugars" <= "nutrition"."carbs"),
	CONSTRAINT "nutrition_fat_subset" CHECK("nutrition"."saturated" IS NULL OR "nutrition"."fat" IS NULL OR "nutrition"."saturated" <= "nutrition"."fat"),
	CONSTRAINT "nutrition_added_sugar_subset" CHECK("nutrition"."added_sugars" IS NULL OR "nutrition"."sugars" IS NULL OR "nutrition"."added_sugars" <= "nutrition"."sugars")
);
--> statement-breakpoint
CREATE TABLE `price_observations` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`price_cents` integer NOT NULL,
	`package_grams` real NOT NULL,
	`currency` text DEFAULT 'CAD' NOT NULL,
	`retailer` text,
	`source` text NOT NULL,
	`observed_at` text NOT NULL,
	`verified_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "prices_amount_check" CHECK("price_observations"."price_cents" >= 0),
	CONSTRAINT "prices_weight_check" CHECK("price_observations"."package_grams" > 0)
);
--> statement-breakpoint
CREATE INDEX `prices_product_observed_idx` ON `price_observations` (`product_id`,`observed_at`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`barcode` text,
	`brand` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`market` text DEFAULT 'CA' NOT NULL,
	`ingredients` text,
	`allergens` text,
	`artwork` text NOT NULL,
	`source` text NOT NULL,
	`verified_at` text,
	`is_demo` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	CONSTRAINT "products_category_check" CHECK("products"."category" IN ('flakes', 'granola'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_market_barcode_unique` ON `products` (`market`,`barcode`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category`);