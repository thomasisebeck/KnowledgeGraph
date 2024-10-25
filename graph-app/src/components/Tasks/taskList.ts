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
        question: "Which principle comments on the state of the universe being exactly right for humans to evolve?",
        answer: "If the universe were different in any significant way—such as having different physical constants or initial conditions—it would be unlikely that intelligent life could have evolved. The Anthropic Principle posits that the universe's observed properties are precisely those that allow for the existence of intelligent life.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "9dd4d88a-f944-4478-9bf4-ff01e772cf15",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },
    {
        question: "What framework sees our conciousness as something that exists outside of our minds?",
        answer: "Panpsychism is a philosophical belief that consciousness or mind exists throughout the universe, not just in living beings. This means that even inanimate objects, such as rocks or atoms, may possess some form of consciousness or awareness. Panpsychism challenges the traditional view that consciousness is a unique property of living organisms and suggests that it may be a fundamental aspect of reality.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "8117fa9e-b02a-48d5-88f2-8e964512a9ba",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },
   {
        question: "What theory comments on the question as to whether the identity of an object remains the same after all it's parts have been replaced?",
        answer: "The Ship of Theseus is a philosophical paradox that explores the nature of identity and change. It asks whether a ship that has had all of its parts replaced over time remains the same ship. It raises questions about the relationship between identity and continuity.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
        targetNodeId: "e3a35d47-862b-4a46-bacb-5f888da903a7",
        clicksTillInNeighborhood: 0,
        totalClicks: 0,
        username: "",
        linkLabels: false
    },
]

//done, for zander
// export const taskList: Task[] = [
//     {
//         question: "What phenomenon proves the existence of dark matter?",
//         answer: "Gravitational lensing is a phenomenon where massive objects, like galaxies and galaxy clusters, bend the path of light passing through them. This bending occurs due to the warping of spacetime caused by the object's immense gravity. By studying the distortion of light from distant galaxies, astronomers can infer the presence of invisible mass, such as dark matter.",
//         providedAnswer: null,
//         totalTime: 0,
//         expandedNodesPerClick: [],
//         targetNodeId: "",
//         clicksTillInNeighborhood: 0,
//         totalClicks: 0,
//         username: "",
//         linkLabels: false
//     },
//     {
//         question: "What values does Immanuel Kant emphasize, which he believes would drive humanity forward?",
//         answer: "Immanuel Kant's categorical imperative is a moral principle that states that one should act only in accordance with rules that could be universalized. It emphasizes the importance of duty, reason, and respect for humanity.",
//         providedAnswer: null,
//         totalTime: 0,
//         expandedNodesPerClick: [],
//         targetNodeId: "",
//         clicksTillInNeighborhood: 0,
//         totalClicks: 0,
//         username: "",
//         linkLabels: false
//     },
//     {
//         question: "Which principle comments on the state of the universe being exactly right for humans to evolve?",
//         answer: "If the universe were different in any significant way—such as having different physical constants or initial conditions—it would be unlikely that intelligent life could have evolved. The Anthropic Principle posits that the universe's observed properties are precisely those that allow for the existence of intelligent life.",
//         providedAnswer: null,
//         totalTime: 0,
//         expandedNodesPerClick: [],
//         targetNodeId: "",
//         clicksTillInNeighborhood: 0,
//         totalClicks: 0,
//         username: "",
//         linkLabels: false
//     },
//     {
//         question: "Why does the scarcity principle work?",
//         answer: "The scarcity principle is a psychological technique that suggests that people are more attracted to things that are perceived as scarce or limited in availability. When something is rare or difficult to obtain, it can increase its perceived value and desirability. This principle is often used in marketing and sales to create a sense of urgency or exclusivity. The scarcity principle works because it taps into our fear of missing out. When we believe that something is in short supply, we may be more likely to act quickly to acquire it before it's gone.",
//         providedAnswer: null,
//         totalTime: 0,
//         expandedNodesPerClick: [],
//         targetNodeId: "",
//         clicksTillInNeighborhood: 0,
//         totalClicks: 0,
//         username: "",
//         linkLabels: false
//     },
//     {
//         question: "What framework sees our conciousness",
//         answer: "Panpsychism is a philosophical belief that consciousness or mind exists throughout the universe, not just in living beings. This means that even inanimate objects, such as rocks or atoms, may possess some form of consciousness or awareness. Panpsychism challenges the traditional view that consciousness is a unique property of living organisms and suggests that it may be a fundamental aspect of reality.",
//         providedAnswer: null,
//         totalTime: 0,
//         expandedNodesPerClick: [],
//         targetNodeId: "",
//         clicksTillInNeighborhood: 0,
//         totalClicks: 0,
//         username: "",
//         linkLabels: false
//     },
//     {
//         question: "What is it called when many people share an innacurate memory?",
//         answer: "There is a phenomenon where a large group of people seem to have a shared false memory of a particular event or fact. It's often attributed to mass hysteria or misremembering. It's called the Mandela Effect.",
//         providedAnswer: null,
//         totalTime: 0,
//         expandedNodesPerClick: [],
//         targetNodeId: "",
//         clicksTillInNeighborhood: 0,
//         totalClicks: 0,
//         username: "",
//         linkLabels: false
//     },
//
// ]