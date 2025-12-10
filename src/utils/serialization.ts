
/**
 * deeply serializes an object to ensure it is a plain object 
 * and compatible with Client Components props.
 * 
 * Used primarily to convert Prisma Decimal/Date objects to strings.
 */
export function serializeInvoice<T>(data: T): T {
    return JSON.parse(JSON.stringify(data))
}
