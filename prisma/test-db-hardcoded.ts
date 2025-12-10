
import { Client } from "pg"

const connectionString = "postgresql://postgres:supersecret@localhost:5432/invoicer"

async function main() {
    console.log("Testing connection with hardcoded URL...")
    const client = new Client({ connectionString })
    try {
        await client.connect()
        console.log("Connected successfully!")
        await client.end()
    } catch (e: any) {
        console.error("Connection failed:", e.message)
    }
}

main()
