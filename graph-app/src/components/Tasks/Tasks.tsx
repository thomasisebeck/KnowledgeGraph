import React, {useState} from "react";
import {taskList} from "./taskList";
import s from "./tasks.module.scss";
import {HOST} from "../../../../shared/variables";
import {Task} from "../../../../shared/interfaces";

interface TasksProps {
    resetGraph: () => void,
    statObject: Task,
    setStatObject: (newObject: Task) => void,
    setErrorMessage: (value: string) => void,
    getData: (username: string) => void
}

enum TaskState {
    ENTER_NAME,
    WAITING_TO_START,
    STARTED
}

function Tasks({
                   resetGraph,
                   statObject,
                   setStatObject,
                   setErrorMessage,
                   getData
               }: TasksProps) {

    const [startTime, setStartTime] = useState<number | null>(null);
    const [taskNumber, setTaskNumber] = useState<number | null>(null);
    const [text, setText] = useState("");
    const [currQuestion, setCurrQuestion] = useState<string | null>("");
    const [username, setUsername] = useState("")
    const [taskState, setTaskState] = useState<TaskState>(TaskState.WAITING_TO_START)

    const postTaskToServer = async (time: number) => {
        const toPost = {...statObject, totalTime: time, username: username};

        await fetch(`${HOST}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(toPost)
        }).then(async (res) => {
            setText("")
            resetGraph();

            const result = await res.json();
            if (!result.ok) {
                setErrorMessage(result.message);
            }
        });
    };

    //reset the state to start finding information
    const startTasks = async () => {
        setTaskNumber(0);
        setStartTime(Date.now());
        setCurrQuestion(taskList[0].question)
        setStatObject({...taskList[0], username: username})
        getData(username);
        setTaskState(TaskState.STARTED)
    };

    const nextTask = async () => {
        //calculate the end time
        const totalTime = Date.now() - startTime!;

        //don't await posting, just move on
        await postTaskToServer(totalTime);

        //set the start time for the next task
        setStartTime(Date.now());

        let newTaskNumber = taskNumber! + 1;

        setTaskNumber(newTaskNumber);
        setStatObject({...taskList[newTaskNumber]})
        setCurrQuestion(taskList[newTaskNumber].question)
    };

    //state 1 -> still to enter name
    //state 2 -> entered name, but tasks not started
    //state 3 -> tasks started

    return (
        <div className={s.container}>
            {/*All tasks are complete*/}
            {
                taskState == TaskState.WAITING_TO_START &&
                <div>
                    <div className={s.waitingContainer}>Explore the graph and get a feel for the app!</div>
                    <div className={s.waitingContainer}>When you're ready to start, press the button...</div>
                    <button onClick={() => setTaskState(TaskState.ENTER_NAME)}>Start Tasks</button>
                </div>
            }

            {/*haven't fetched data, waiting to enter name*/}
            {
            taskState == TaskState.ENTER_NAME &&
                <div className={s.stack}>
                    <input type={"text"}
                           placeholder={"name"}
                           onChange={(e) => {
                               setUsername(e.target.value)
                           }}
                           value={username}
                    ></input>
                    <button onClick={startTasks}>Next</button>
                </div>
            }

            {/*started tasks (done exploring initial graph), show text box*/}
            {
                //only show this when they've entered their name
                taskState == TaskState.STARTED &&
                <React.Fragment>
                    {
                        taskNumber && taskNumber > taskList.length - 1
                            ?
                            // got to the last task in the list
                            <div>Tasks complete</div>
                            :
                            // working on a task
                            <React.Fragment>
                                <div>
                                    <p>{currQuestion}</p>
                                    <input
                                        type={"text"}
                                        placeholder={"answer"}
                                        onChange={(e) => {
                                            setStatObject({...statObject, providedAnswer: e.target.value})
                                            setText(e.target.value);
                                        }}
                                        value={text}
                                    />
                                </div>

                                {
                                    text == "" ? <button disabled>Submit</button> :
                                        <button onClick={nextTask}>Submit</button>
                                }

                            </React.Fragment>
                    }
                </React.Fragment>
            }

        </div>
    );
}

export default Tasks;
