import neo4j, {Driver} from "neo4j-driver";

async function connect(uri: string, user: string, password: string) {
    let driver;

    try {
        driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
        return driver;
    } catch (err : any) {
        console.log(`Connection error\n${err}\nCause: ${err.cause}`)
        await driver?.close()
        return null;
    }
}

async function disconnect(driver: Driver) {
    await driver?.close();
}

export default {
    connect,
    disconnect
}