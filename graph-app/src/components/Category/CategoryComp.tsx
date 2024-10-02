import React, { SetStateAction } from "react";
import { UpdateType } from "../AddStackDialogue/DialogueUtils";
import { Direction, FrontendBaseCateogries, RequestBodyConnection } from "../../../../shared/interfaces";
import s from "../AddStackDialogue/AddStackDialogue.module.scss";
import Node from "../Node/Node";
import Toggle from "./Toggle";
import t from "./Toggle.module.scss";
import SuggestiveInput from "../SuggestiveInput/SuggestiveInput";
import { infoHover } from "../../InfoHover";

interface Props {
    index: number,
    c: RequestBodyConnection,
    isBaseCategory: boolean,
    categories: RequestBodyConnection[],
    setCategories: React.Dispatch<
        React.SetStateAction<RequestBodyConnection[]>
    >,
    baseCategory: RequestBodyConnection,
    dropDownBaseCategories?: FrontendBaseCateogries[],
    setBaseCategory: (value: SetStateAction<RequestBodyConnection>) => void,
    showCancel: boolean,
    updateCategory: (
        index: number,
        updateType: UpdateType,
        value: string | Direction
    ) => void,
    setErrorMessage: (value: (((prevState: (string | null)) => (string | null)) | string | null)) => void
}

const BASE_CATEGORY_INDEX = -1;

export default function CategoryComp({
                                         c,
                                         dropDownBaseCategories,
                                         categories,
                                         setCategories,
                                         setBaseCategory,
                                         baseCategory,
                                         index,
                                         showCancel,
                                         updateCategory,
                                         setErrorMessage
                                     }: Props) {
    const onChangeBaseCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (dropDownBaseCategories && setBaseCategory && baseCategory) {
            const index = dropDownBaseCategories.findIndex(
                (el) => el.nodeId == e.target.value
            );

            //selected the empty category, so it won't be found
            if (index == BASE_CATEGORY_INDEX) {
                //clear the base category if no option is selected
                setBaseCategory({ ...baseCategory, nodeId: "", nodeName: "" });
            }
            //just set the name and nodeId when selecting the base category
            else
                setBaseCategory({
                    ...baseCategory,
                    nodeId: dropDownBaseCategories[index].nodeId,
                    nodeName: dropDownBaseCategories[index].label
                });
        }
    };

    const onCancelClick = () => {
        setCategories((old) => old.filter((c, ind) => ind != index));
    };

    return (
        <div className={s.category}>
            {
                //base category, show the dropdown
                index == BASE_CATEGORY_INDEX && baseCategory && (
                    <React.Fragment>
                        {/*Node showing base category*/}
                        {infoHover(110, 27, "Fill out all the connections in the chain. This top one is the root node / category. Categories are represented as orange circles here, as they will create nodes on the graph.", 350)}
                        {infoHover(65, 80, "Name the connections here. Change their direction by pressing on the button next to the input box. Examples are 'influences', 'gives rise to', 'associated with', 'relates to', 'causes', 'depends on', 'contains', 'implies', 'is similar to'", 300)}
                        <Node>
                            <select
                                name={"base-category"}
                                onChange={onChangeBaseCategory}
                            >
                                <option value={""} key={""}></option>

                                {/*the id's are the root node id's*/}
                                {dropDownBaseCategories &&
                                    dropDownBaseCategories.map((c) => {
                                        return (
                                            <option
                                                value={c.nodeId}
                                                key={c.nodeId}
                                            >
                                                {c.label}
                                            </option>
                                        );
                                    })}
                            </select>
                        </Node>

                        {/*arrow*/}
                        {/*update using base category index*/}
                        <Toggle
                            category={baseCategory!}
                            index={BASE_CATEGORY_INDEX}
                            categories={categories}
                            setCategories={setCategories}
                            baseCategory={baseCategory}
                            setBaseCategory={setBaseCategory}
                        >
                            <input
                                type={"text"}
                                placeholder={"connection label"}
                                onClick={() =>
                                    updateCategory(
                                        BASE_CATEGORY_INDEX,
                                        UpdateType.CONNECTION_NAME,
                                        ""
                                    )
                                }
                                onBlur={(e) =>
                                    updateCategory(
                                        BASE_CATEGORY_INDEX,
                                        UpdateType.CONNECTION_NAME,
                                        e.target.value
                                    )
                                }
                            />
                        </Toggle>
                    </React.Fragment>
                )
            }

            {
                //not base category, show the text box
                !(index == BASE_CATEGORY_INDEX) && (
                    <React.Fragment>

                        <div className={s.category}>
                            {showCancel && (
                                <img
                                    alt={"cancel"}
                                    src={"buttons/cancel.svg"}
                                    className={[t.img, t.cancel].join(" ")}
                                    onClick={onCancelClick}
                                />
                            )}

                            <Node>
                                <SuggestiveInput
                                    onBlur={(val: string) => {
                                        updateCategory(
                                            index,
                                            UpdateType.NODE_NAME,
                                            val
                                        );
                                    }}
                                    placeholder={"new category name"}
                                    setErrorMessage={setErrorMessage}
                                />
                            </Node>

                            {/*arrows*/}
                            {/*extract the toggle, but keep the input in the parent state*/}
                            {/*update using required index*/}
                            <Toggle
                                index={index}
                                category={c}
                                categories={categories}
                                setCategories={setCategories}
                                baseCategory={baseCategory}
                                setBaseCategory={setBaseCategory}
                            >
                                <input
                                    type={"text"}
                                    placeholder={"connection label"}
                                    onClick={() =>
                                        updateCategory(
                                            index,
                                            UpdateType.CONNECTION_NAME,
                                            ""
                                        )
                                    }
                                    onBlur={(e) =>
                                        updateCategory(
                                            index,
                                            UpdateType.CONNECTION_NAME,
                                            e.target.value
                                        )
                                    }
                                />
                            </Toggle>
                        </div>
                    </React.Fragment>
                )
            }
        </div>
    );
}
