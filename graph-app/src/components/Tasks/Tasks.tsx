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

    return (
        <div className={s.container}>
            {/*All tasks are complete*/}
            {taskNumber && taskNumber > taskList.length - 1 ? <div>Tasks complete</div>
                :
                // working on a task
                <React.Fragment>
                    {
                        currQuestion == "" ?
                            <div className={s.stack}>
                                <input type={"text"}
                                       placeholder={"name"}
                                       onChange={(e) => {
                                           setUsername(e.target.value)
                                       }}
                                       value={username}
                                ></input>
                                <button onClick={startTasks}>Begin Tasks</button>
                            </div>
                            :
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
