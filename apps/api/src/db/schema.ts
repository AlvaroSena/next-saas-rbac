import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const tokenTypeEnum = pgEnum("token_type", ["PASSWORD_RECOVER"]);

export const accountProviderEnum = pgEnum("account_provider", ["GITHUB"]);

export const roleEnum = pgEnum("role", ["ADMIN", "MEMBER", "BILLING"]);

/* =======================
   Users
======================= */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* =======================
   Tokens
======================= */

export const tokens = pgTable("tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: tokenTypeEnum("type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

/* =======================
   Accounts
======================= */

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: accountProviderEnum("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull().unique(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => ({
    providerUserUnique: uniqueIndex("accounts_provider_user_unique").on(
      table.provider,
      table.userId
    ),
  })
);

/* =======================
   Organizations
======================= */

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  domain: text("domain").unique(),
  shouldAttachUsersByDomain: boolean("should_attach_users_by_domain")
    .default(false)
    .notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
});

/* =======================
   Invites
======================= */

export const invites = pgTable(
  "invites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    role: roleEnum("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    userId: uuid("user_id").references(() => users.id),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
      }),
  },
  (table) => ({
    emailOrgUnique: uniqueIndex("invites_email_organization_unique").on(
      table.email,
      table.organizationId
    ),
    emailIndex: index("invites_email_index").on(table.email),
  })
);

/* =======================
   Members
======================= */

export const members = pgTable(
  "members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    role: roleEnum("role").default("MEMBER").notNull(),

    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
      }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
  },
  (table) => ({
    orgUserUnique: uniqueIndex("members_organization_user_unique").on(
      table.organizationId,
      table.userId
    ),
  })
);

/* =======================
   Projects
======================= */

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  slug: text("slug").notNull().unique(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, {
      onDelete: "cascade",
    }),

  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
});
