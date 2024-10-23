import {Task} from "../../../../shared/interfaces"

/*

PROCEDURE:
1. Number the posts
2. Split into n groups
3. Divide classification tasks among groups
4. Classify, keeping track of who classified what
5. Crowdsource: everyone gets to add their opinion
6. Run info finding tasks on posts not classified

person:                    |     p1    |     p2    |     p3    |     p4    |
post group to classify:    |     1     |     2     |     3     |     4     |
*** everyone crowdsources ******
post group to find:        | all but 1 | all but 2 | all but 3 | all but 4 |

PHASE 0: TUTORIAL
let people learn on a different data set
have them explore the graph for some time
have them put information on the graph
have them upvote and down vote connections
have them connect 2 nodes
have them add a category between two nodes

PHASE 1:
classify 10% of posts in realm 1

---------------------------
crowdsource
---------------------------

PHASE 2:
find 45% of posts not in realm 1

PHASE 3:
find 45% of posts not in realm 1

*/

export const taskList: Task[] = [

    {
        question: "Into what Parts did Plato decide to divide the soul?",
        answer: "Plato believed that the soul is immortal and exists independently of the body. He divided the soul into three parts: the rational part, the spirited part, and the appetitive part. A well-balanced soul, with the rational part in control, is essential for a virtuous life.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "3422f038-2b9b-4125-8af6-e68a9dbb5a48",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },

    {
        question: "What physical law of nature can act as an explanation for time moving only in one direction?",
        answer: "Why does time flow in one direction, from past to future? This phenomenon is closely related to the second law of thermodynamics, which states that entropy (a measure of disorder) always increases over time.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "eb007c64-5de9-490c-ad0f-c79e37e73266",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },

    {
        question: "Which theory argues that any action is intrinsically right or wrong, regardless of the consequences?",
        answer: "Deontology is another ethical theory that emphasizes duty and obligation. It argues that certain actions are inherently right or wrong, regardless of their consequences.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "03aea7c9-40d9-425c-96e6-024deddd786f",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },

    {
        question: "What phenomenon occurs when a person feels the effect of a treatment based on the belief that it is working, rather than the physical results?",
        answer: "The placebo effect is a fascinating phenomenon in which a person's belief in a treatment can influence its effectiveness, even if the treatment is ineffective. It demonstrates the powerful role of the mind in shaping our physical and psychological experiences.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "6e556c08-b78f-4cfe-99a0-16a21b17cd09",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },

    //Existentialism explores the meaning of life through the lens of individual freedom and responsibility. It asserts that meaning is not given but created through personal choices and authentic living, emphasizing that each person must find their own path and purpose.,
    {
        question: "What effect does language have on the way we think?",
        answer: "Language is not just a tool for communication but also a structuring force for thought. The vocabulary and grammatical frameworks of a language influence how we conceptualize and understand ideas, thus shaping our cognitive processes and the way we perceive the world.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "0768798-3540-478c-9f12-e346f028679e",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },

];
