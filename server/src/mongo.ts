import {MongoClient} from "mongodb";
import {Task} from "../../shared/interfaces"

const URI = "mongodb://localhost:27017/";
let client: MongoClient | null = null;

/*
export interface Task {
    question: string;
    answer: string;
    providedAnswer: string | null;
    totalTime: number;
    expandedNodesPerClick: number[];
    targetNodeId: string;
    clicksTillInNeighborhood: number;
    totalClicks: number;
    username: string;
}
*/

const addTask = async (data: Task) => {
    if (!client)
        client = new MongoClient(URI);

    const database = client.db("user-actions")
    const actions = database.collection("actions")
    return await actions.insertOne(data);
}

const closeClient = async () => {
    client && await client.close();
}

export {
    addTask,
    closeClient
}