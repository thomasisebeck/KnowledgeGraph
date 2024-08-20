import {
    Direction,
    RequestBodyConnection,
} from "../../../../shared/interfaces";
import React from "react";

const getNewCategory = (dir: Direction) => {
    switch (dir) {
        case Direction.NEUTRAL:
            return Direction.TOWARDS;
        case Direction.TOWARDS:
            return Direction.AWAY;
        default:
            return Direction.NEUTRAL;
    }
};

export const toggleCategory = (
    index: number,
    categories: RequestBodyConnection[],
    setCategories: React.Dispatch<
        React.SetStateAction<RequestBodyConnection[]>
    >,
) => {
    console.log("toggling...");
    categories[index].direction = getNewCategory(categories[index].direction);
    setCategories([...categories]);
};
