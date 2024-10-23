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
        question: "How does recognising uncertainty aid scientists?",
        answer: "Uncertainty is a driving force in scientific inquiry as it highlights the limits of current knowledge and stimulates further research. The recognition of uncertainty encourages scientists to test hypotheses, gather data, and refine theories to expand understanding.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "81b9bdf5-7db1-428e-87ce-695b45cc1296",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },
    {
        question: "What can aesthetics do for people who wish to appreciate art?",
        answer: "Our aesthetic experiences can evoke emotional responses, inspire creativity, and reflect cultural values, thus deeply impacting our interactions with the world. Aesthetics plays a significant role in shaping human experience by influencing how we perceive and appreciate beauty and art.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "a86fd1c7-8fc2-4896-88a7-df8860793606",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },

    {
        question: "What paradox comments on the limitations of formal logic?",
        answer: "The liar paradox is a classic logical puzzle that states: 'This sentence is false.' If the sentence is true, then it is false, and if it is false, then it is true. It highlights the complexities of self-reference and the limitations of formal logic.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "fa66a744-3540-4204-8db5-860f3d4ddc93",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },

    {
        question: "What theory suggests that the earth has interconnected natural systems to create stability?",
        answer: "The Earth is a self-regulating system, with its biosphere acting to maintain conditions suitable for life. This is called the Gaia hypothesis. This concept suggests that the planet's various systems, such as the atmosphere, oceans, and land, are interconnected and work together to create a stable environment.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "8eadc805-c0c7-4042-80bf-b4429b9237fd",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },

    {
        question: "What concept speaks of the loss of habitats as a result of human interference?",
        answer: "Another major environmental crisis is on the rise. The loss of species and ecosystems is a result of human activities such as habitat destruction, pollution, and overexploitation. This is called Biodiversity loss.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "26f3a8ed-8402-4967-9bdf-18a4d91c2c6e",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },



];


export const newTasks: Task[] = [
    {
        question: "What are two different types of infinity?",
        answer: "The concept of infinity is a mind-boggling one in mathematics. It refers to something that is limitless or endless, defying our finite understanding of the world. There are different types of infinity, such as countable infinity and uncountable infinity, each with its own properties.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "4d18c59d-27c2-4522-b882-b41c001e469a",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },
    {
        question: "What are two opposing views on the nature of reality?",
        answer: "The nature of reality is a fundamental question that has puzzled philosophers for centuries. Some believe that reality is objective and independent of our perception, while others argue that it is subjective and shaped by our minds.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "b6c392c8-5825-4bfb-91e6-0186248dc18d",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },
    {
        question: "What moral dilemma weighs up sacrificing one person to save many others?",
        answer: "The trolley problem is a thought experiment that presents a moral dilemma. It asks whether it is morally acceptable to sacrifice one person to save many others. It highlights the complexities of ethical decision-making and the tension between individual rights and the greater good.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "7c6e4e24-77da-4c28-a338-eb44b9ca2f7b",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },
    {
        question: "What philosophy suggests that one cannot prove the existence of anything outside of ones own mind?",
        answer: "Solipsism is the philosophical idea that only one's mind is sure to exist. As an epistemological position, solipsism holds that knowledge outside one's own mind is unsure; the external world and other minds cannot be known and might not exist outside the mind.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "1eba857c-388f-4e88-8923-2362354acfc8",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },
    {
        question: "What is it called when one experiences the discomfort caused by having conflicting internal beliefs?",
        answer: "The psychological discomfort that arises when people hold conflicting beliefs or attitudes is known as cognitive dissonance. Individuals may engage in various strategies to reduce this discomfort, such as rationalization or denial.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "41dc1083-a8ac-4c27-b450-8c59d7e2ba40",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },
]
