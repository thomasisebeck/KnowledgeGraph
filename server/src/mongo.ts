import {MongoClient} from "mongodb";
import {Task, VoteData} from "../../shared/interfaces"

const URI = "mongodb://localhost:27017/";
let client: MongoClient = new MongoClient(URI);

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

const getVoteData = async (username: string) => {
    const edgeVotes = client.db("user-actions").collection("edge-votes");
    const result = await edgeVotes.findOne({username: username});
    if (result != null) {
        console.log("found existing results, returning")
        return result;
    }

    //result is null
    //insert the name and an empty array
    const starterObject: VoteData = {username: username, upvotedEdges: [], downvotedEdges: []};
    await edgeVotes.insertOne(starterObject)

    console.log("returning newly created object")
    return starterObject;
}

const updateVoteData = async (voteData: VoteData) => {
    const edgeVotes = client.db("user-actions").collection("edge-votes");

    console.log("======== VOTE DATA ========")
    console.log(voteData)
    console.log("==================")

    return await edgeVotes.updateOne({username: voteData.username}, {
        $set: {
            upvotedEdges: voteData.upvotedEdges,
            downvotedEdges: voteData.downvotedEdges
        }
    });
}

const addTask = async (data: Task) => {
    if (!client)
        client = new MongoClient(URI);

    const database = client.db("user-actions")
    const actions = database.collection("answers")
    return await actions.insertOne(data);
}

const closeClient = async () => {
    client && await client.close();
}

export default {
    addTask,
    closeClient,
    getVoteData,
    updateVoteData
}