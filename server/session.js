import neo4j from "neo4j-driver";

async function connect(uri, user, password) {
    let driver;

    try {
        driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
        const serverInfo = await driver.getServerInfo()
        return driver;
    } catch (err) {
        console.log(`Connection error\n${err}\nCause: ${err.cause}`)
        await driver?.close()
        return null;
    }
}

async function disconnect(driver) {
    await driver?.close();
}

export default {
    connect,
    disconnect
}