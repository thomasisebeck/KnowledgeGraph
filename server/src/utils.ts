import {Driver, Record} from "neo4j-driver";
import "dotenv/config"

const DATABASE = process.env.DATABASE;

const executeGenericQuery = async (driver: Driver, query: string, params: any) => {
    try {
        const {records, summary} = await driver.executeQuery(query, params, {
            database: DATABASE
        })
        return {records, summary};
    } catch (e) {
        console.error("ERROR");
        console.error(e);
        throw e;
    }
}


const toSnakeCase = (input: string) => {
    return input.toLowerCase().trim().replaceAll(' ', '_').replace(/[^a-zA-Z0-9_&]/g, '');
}

const clearDB = async (driver: Driver) => {
    let query = 'MATCH (n) DETACH DELETE n';
    await executeGenericQuery(driver, query, {});
}
const getField = (records: Record[], field: string) => {
    return records?.at(0)?.get(field);
}


export {
    getField,
    executeGenericQuery,
    clearDB,
    toSnakeCase
}