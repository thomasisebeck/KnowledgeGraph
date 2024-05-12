const logResults = (result) => {
    console.log(
        `>> The query ${result.summary.query.text} ` +
        `returned ${result.records.length} records ` +
        `in ${result.summary.resultAvailableAfter} ms.`
    )
}

const createClassificationNode = async (label, driver, database) => {
    let result = await driver.executeQuery(
        'MERGE (c:ClassificationNode {label: $label})',
        {
            label: label
        },
        {
            database: database
        }
    )
    logResults(result);
}

const createInformationNode = async (label, driver, database, snippet) => {
    let result = await driver.executeQuery(
        `MERGE (i:InformationNode {label: $label, snippet: $snippet})`,
        {
            label: label,
            snippet: snippet
        },
        {database: database}
    )
    logResults(result);
}

export default {
    createInformationNode,
    createClassificationNode
}