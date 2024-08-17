export interface Task {
    question: string;
    answer: string;
    providedAnswer: string | null;
    totalTime: number;
    expandedNodesPerClick: number[];
}

export const taskList: Task[] = [
    //Essence is the fundamental nature of a thing, its irreducible core that defines its identity.
    //Classification: Existence - relates to -> identity - defines -> core nature - associated with -
    //Title: What is the essence of being
    {
        question: "What does essence define?",
        answer: "Essence defines the irreducible core nature of a thing.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
    },

    // Info: Morality pertains to principles concerning the distinction between right and wrong or good and bad
    // behavior. Categorization: Ethics - relates to -> behavior - evaluates -> right or wrong - associated with -
    // Title: What is the foundation of morality?
    {
        question: "How does morality relate to behavior?",
        answer: "Morality pertains to principles concerning the distinction between right and wrong behavior.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
    },

    // Info: Consciousness is the state of being aware of and responsive to one's surroundings.
    // Categorization: Mind - is a component of -> being - involves -> awareness -> encompasses -> surroundings ->
    // produces -> subjective experience Title: What is consciousness?
    {
        question: "What is the definition of consciousness?",
        answer: "Consciousness is the state of being aware of and responsive to one's surroundings.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
    },

    // Info: Collectivity refers to a group of individuals considered as a whole.
    // Categorization: Society -> is comprised of -> groups - relates to - shared characteristics - exhibit
    // Title: What is a collectivity?
    {
        question: "How is a collectivity formed?",
        answer: "A collectivity is a group of individuals considered as a whole.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
    },

    // Info: Communication is the imparting or exchanging of information by speaking, writing, or signaling.
    // Categorization: Language -> is a tool for -> information - enables -> exchange -> fosters -> connection - relies on
    // -> mind Title: What is communication?
    {
        question: "How is information exchanged?",
        answer: "Communication is the imparting or exchanging of information by speaking, writing, or signaling.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
    },

    //Info: Cognition is the mental process of acquiring knowledge and understanding through thought, experience,
    // and the senses. Categorization: Mind -> engages in -> thought -> leads to -> cognition Title: What is
    // cognition?
    {
        question: "How is knowledge acquired according to cognition?",
        answer: "Cognition is the mental process of acquiring knowledge and understanding through thought, experience, and the senses.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
    },

    // Info: An economy is a system of production and exchange of goods and services.
    // Categorization: Society -> requires -> system -> based on -> production/exchange -> supports -> needs
    // Title: What is an economy?
    {
        question: "How are goods and services exchanged in an economy?",
        answer: "An economy is a system of production and exchange of goods and services.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
    },

    // Info: A pattern is a recurring characteristic or event.
    // Categorization: Observation -> reveals -> demonstrates -> recurrence -> aids -> prediction
    // Title: What is a pattern?
    {
        question:
            "How is a pattern defined in terms of characteristics or events?",
        answer: "A pattern is a recurring characteristic or event.",
        providedAnswer: null,
        totalTime: 0,
        expandedNodesPerClick: [],
    },
];
