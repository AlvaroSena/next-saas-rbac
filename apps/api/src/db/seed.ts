import "dotenv/config";

import { faker } from "@faker-js/faker";
import { hash } from "bcryptjs";
import { db } from "./";
import { users, organizations, projects, members } from "./schema";

async function main() {
  const passwordHash = await hash("123456", 1);

  const [user] = await db
    .insert(users)
    .values({
      name: "John Doe",
      email: "john@acme.com",
      avatarUrl: "https://github.com/alvarosena.png",
      passwordHash,
    })
    .returning();

  const [anotherUser] = await db
    .insert(users)
    .values({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatarUrl: faker.image.avatarGitHub(),
      passwordHash,
    })
    .returning();

  const [anotherUser2] = await db
    .insert(users)
    .values({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatarUrl: faker.image.avatarGitHub(),
      passwordHash,
    })
    .returning();

  const owners = [user.id, anotherUser.id, anotherUser2.id];

  /* =====================
     Organização: Admin
  ===================== */

  const [orgAdmin] = await db
    .insert(organizations)
    .values({
      name: "Acme Inc (Admin)",
      domain: "acme.com",
      slug: "acme-admin",
      avatarUrl: faker.image.avatarGitHub(),
      shouldAttachUsersByDomain: true,
      ownerId: user.id,
    })
    .returning();

  await db.insert(projects).values(
    Array.from({ length: 3 }).map(() => ({
      name: faker.lorem.words(5),
      slug: faker.lorem.slug(5),
      description: faker.lorem.paragraph(),
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: faker.helpers.arrayElement(owners),
      organizationId: orgAdmin.id,
    }))
  );

  await db.insert(members).values([
    {
      userId: user.id,
      organizationId: orgAdmin.id,
      role: "ADMIN",
    },
    {
      userId: anotherUser.id,
      organizationId: orgAdmin.id,
      role: "MEMBER",
    },
    {
      userId: anotherUser2.id,
      organizationId: orgAdmin.id,
      role: "MEMBER",
    },
  ]);

  /* =====================
     Organização: Member
  ===================== */

  const [orgMember] = await db
    .insert(organizations)
    .values({
      name: "Acme Inc (Member)",
      slug: "acme-member",
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: user.id,
    })
    .returning();

  await db.insert(projects).values(
    Array.from({ length: 3 }).map(() => ({
      name: faker.lorem.words(5),
      slug: faker.lorem.slug(5),
      description: faker.lorem.paragraph(),
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: faker.helpers.arrayElement(owners),
      organizationId: orgMember.id,
    }))
  );

  await db.insert(members).values([
    {
      userId: user.id,
      organizationId: orgMember.id,
      role: "MEMBER",
    },
    {
      userId: anotherUser.id,
      organizationId: orgMember.id,
      role: "ADMIN",
    },
    {
      userId: anotherUser2.id,
      organizationId: orgMember.id,
      role: "MEMBER",
    },
  ]);

  /* =====================
     Organização: Billing
  ===================== */

  const [orgBilling] = await db
    .insert(organizations)
    .values({
      name: "Acme Inc (Billing)",
      slug: "acme-billing",
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: user.id,
    })
    .returning();

  await db.insert(projects).values(
    Array.from({ length: 3 }).map(() => ({
      name: faker.lorem.words(5),
      slug: faker.lorem.slug(5),
      description: faker.lorem.paragraph(),
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: faker.helpers.arrayElement(owners),
      organizationId: orgBilling.id,
    }))
  );

  await db.insert(members).values([
    {
      userId: user.id,
      organizationId: orgBilling.id,
      role: "BILLING",
    },
    {
      userId: anotherUser.id,
      organizationId: orgBilling.id,
      role: "ADMIN",
    },
    {
      userId: anotherUser2.id,
      organizationId: orgBilling.id,
      role: "MEMBER",
    },
  ]);

  console.log("Seed finished");
}

main();
