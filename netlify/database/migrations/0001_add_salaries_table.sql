CREATE TABLE IF NOT EXISTS "salaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"month" text NOT NULL,
	"base_salary_cents" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "salaries_month_unique" UNIQUE("month")
);
