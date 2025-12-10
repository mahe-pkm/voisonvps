import { PrismaClient } from "@prisma/client"
import { compare } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "admin@example.com" }
  })
  if (!user) {
    console.log("User not found")
    return
  }
  console.log("User found:", user.email)
  const valid = await compare("changeme", user.password)
  console.log("Password valid:", valid)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
