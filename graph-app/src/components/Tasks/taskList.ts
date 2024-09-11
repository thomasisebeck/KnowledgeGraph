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

    //The two normal states of awareness are consciousness and unconsciousness. Higher states of consciousness are often associated with spiritual or mystical experiences. It involves an elevated state of awareness where people are able to gain a greater sense of themselves, their role, and the world. Examples of this include transcendence, meditation, mindfulness, a "runner's high," lucid dreaming, and flow states.
    //classification: existence <- relates to -> awareness <- synonyms -> consciousness - gives rise to -> states of awareness and sense of self
    {
        question: "What is a benefit of achieving a higher state of consciousness?",
        answer: "Gaining a greater sense of oneself, one's role, and the world.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "fe61af91-79b9-4263-917e-2a86a1410745",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },

    //Intuition plays a crucial role in decision-making by drawing on subconscious knowledge and experiences. It provides immediate, often unspoken guidance that helps individuals make choices without extensive deliberation, relying on patterns and instincts developed over time.
    {
        question: "What is the role of intuition in decision-making?",
        answer: "It allows us to draw on subconscious knowledge and past experiences",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "TO FILL OUT",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },

    //Language is not just a tool for communication but also a structuring force for thought. The vocabulary and grammatical frameworks of a language influence how we conceptualize and understand ideas, thus shaping our cognitive processes and the way we perceive the world.
    {
        question: "How does language shape thought processes?",
        answer: "It forces us to structure our thoughts and conceptualise and understand our ideas",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "TO FILL OUT",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },

    //Ambiguity introduces the possibility of multiple interpretations and perspectives. This open-endedness can enrich understanding by allowing various viewpoints and meanings to emerge, though it also requires careful analysis to ensure accurate comprehension.
    {
        question: "What is the significance of ambiguity in interpretation?",
        answer: "Ambiguity allows for multiple interpretations and perspectives",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "TO FILL OUT",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },

    //Existentialism explores the meaning of life through the lens of individual freedom and responsibility. It asserts that meaning is not given but created through personal choices and authentic living, emphasizing that each person must find their own path and purpose.
    {
        question: "How does existentialism address the meaning of life?",
        answer: "It explores the meaning of life through the lens of individual freedom and responsibility. Each person must find their own path and purpose.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "TO FILL OUT",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },

    //Uncertainty is a driving force in scientific inquiry as it highlights the limits of current knowledge and stimulates further research. The recognition of uncertainty encourages scientists to test hypotheses, gather data, and refine theories to expand understanding.
    {
        question: "Why is uncertainty useful in scientific research",
        answer: "It encourages scientists to test hypotheses, gather data and expand understanding",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "TO FILL OUT",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },

    //Justice and equality are interrelated concepts in societal contexts. Justice seeks to ensure fair distribution of resources and opportunities, while equality focuses on treating individuals the same. Together, they address how societies can balance fairness with equal treatment.
    {
        question: "Why is equality considered in tandem when considering equity?",
        answer: "They must be considered together when addressing fairness and equal treatment",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "TO FILL OUT",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },

    //Free will and determinism represent opposing views on human agency. Free will suggests that individuals can make independent choices, while determinism posits that all events are predetermined by prior causes. The intersection of these ideas raises questions about the nature of autonomy and causality
    {
        question: "How does the concept of free will intersect with determinism?",
        answer: "They are opposing view on human agency",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "TO FILL OUT",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },

    //Our aesthetic experiences can evoke emotional responses, inspire creativity, and reflect cultural values, thus deeply impacting our interactions with the world. Aesthetics plays a significant role in shaping human experience by influencing how we perceive and appreciate beauty and art.
    {
        question: "In what way does aesthetics influence human experience?",
        answer: "It influences how we perceive and communicate beauty and art",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "TO FILL OUT",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },
];
