
import { Client } from "pg"

const passwords = ["postgres", "admin", "root", "password", "123456", "Invoicer123", ""]
const user = "postgres"
const db = "invoicer"
const host = "localhost"

async function check(pass: string) {
    const client = new Client({
        user,
        host,
        database: db,
        password: pass,
        port: 5432,
    })
    try {
        await client.connect()
        console.log(`[SUCCESS] Password found: "${pass}"`)
        await client.end()
        process.exit(0)
    } catch (e) {
        // console.log(`[FAIL] "${pass}"`)
    }
}

async function main() {
    console.log("Checking passwords...")
    for (const p of passwords) {
        await check(p)
    }
    console.log("[FAIL] No password matched.")
    process.exit(1)
}

main()
