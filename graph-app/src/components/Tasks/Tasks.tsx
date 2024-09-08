import React, { useState } from "react";
import { taskList } from "./taskList";
import s from "./tasks.module.scss";
import { HOST } from "../../../../shared/variables";
import { Task } from "../../../../shared/interfaces";

interface TasksProps {
    resetGraph: () => void,
    statObject: Task,
    setStatObject: (newObject: Task) => void,
    setErrorMessage: (value: string) => void,
    getData: (username: string) => void
}

enum TaskState {
    ENTER_NAME,
    ADDING_KNOWLEDGE,
    BEGUN
}

interface ConditionallyDisabledButtonProps {
    onClick: () => Promise<void>;
    username: string,
    message: string,
}

function ConditionallyDisabledButton({ onClick, message, username }: ConditionallyDisabledButtonProps) {
    return <button disabled={username == "" || username == null}
                   onClick={onClick}>{message}
    </button>;
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
    const [username, setUsername] = useState("");
    const [taskState, setTaskState] = useState<TaskState>(TaskState.ENTER_NAME);

    const postTaskToServer = async (time: number) => {

        const toPost = { ...statObject, totalTime: time, username: username };

        await fetch(`${HOST}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(toPost)
        }).then(async (res) => {
            setText("");
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
        setTaskState(TaskState.BEGUN);
        setCurrQuestion(taskList[0].question);
        setStatObject({ ...taskList[0], username: username });

        //get data here and on load data, because they can skip straight here...
        getData(username);
    };

    const nextTask = async () => {
        //calculate the end time
        const totalTime = Date.now() - startTime!;

        await postTaskToServer(totalTime);

        //set the start time for the next task
        setStartTime(Date.now());

        let newTaskNumber = taskNumber! + 1;

        setTaskNumber(newTaskNumber);
        setStatObject({ ...taskList[newTaskNumber] });
        setCurrQuestion(taskList[newTaskNumber].question);
    };

    //get the data and let them now add knowledge to the graph
    const loadData = async () => {
        getData(username);
        setTaskState(TaskState.ADDING_KNOWLEDGE);
    };


    return (
        <div className={s.container}>

            {/*Name needs to be entered to log all vote data*/}
            {
                taskState == TaskState.ENTER_NAME &&
                <div className={s.stack}>
                    <input type={"text"}
                           placeholder={"name"}
                           onChange={(e) => {
                               setUsername(e.target.value);
                               setStatObject({...statObject, username: e.target.value});
                           }}
                           value={username}
                    ></input>

                    <ConditionallyDisabledButton onClick={loadData} username={username} message={"Explore the graph"}/>
                    <ConditionallyDisabledButton onClick={startTasks} username={username} message={"Begin timed tasks"}/>
                </div>

            }

            {/*While exploring */}
            {
                taskState == TaskState.ADDING_KNOWLEDGE &&
                <div className={s.stack}>
                    <p className={s.fade}>Time to add some knowledge to the graph!</p>
                    <p className={s.fade}>Do you remember what you need to do?</p>
                    <ConditionallyDisabledButton onClick={startTasks} username={username} message={"Begin timed tasks"}/>
                </div>
            }

            {/*Begun can either be in the middle of a task or complete*/}
            {
                taskState == TaskState.BEGUN &&
                <React.Fragment>
                    {
                        // display complete when the end of the list is reached
                        taskNumber && taskNumber > taskList.length - 1
                            ?
                            <div>Tasks complete</div>
                            :
                            //show the current question if not complete
                            <React.Fragment>
                                <div>
                                    <p>{currQuestion}</p>
                                    <input
                                        type={"text"}
                                        placeholder={"answer"}
                                        onChange={(e) => {
                                            setStatObject({ ...statObject, providedAnswer: e.target.value });
                                            setText(e.target.value);
                                        }}
                                        value={text}
                                    />
                                </div>
                                {
                                    //disable the submit button if there is not text in the box
                                    text == "" ?
                                        <button disabled>Submit</button>
                                        :
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
