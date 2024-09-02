import s from "../App.module.scss";
import {HoverImage} from "./HoverImage/HoverImage";
import React from "react";

export function upvoteDownvoteButtons(
    selectedEdgeId: string,
    upvoteEdge: (edgeId: string, mustUpvote: boolean) => Promise<void>,
    upvotedEdges: string[],
    downVotedEdges: string[]
) {
    return (
        <div className={s.upvoteDownvoteContainer}>

            <div>

                {
                    upvotedEdges.indexOf(selectedEdgeId) == -1 &&
                    <HoverImage
                        message={"upvote edge"}
                        normalImage={"buttons/upvote.svg"}
                        hoverImage={"buttons/upvote-hover.svg"}
                        onclick={async () => {
                            //upvote the edge
                            await upvoteEdge(selectedEdgeId, true);
                        }}
                    />
                }

            </div>
            <div>

                {
                    downVotedEdges.indexOf(selectedEdgeId) == -1 &&
                    <HoverImage
                        message={"downvote edge"}
                        normalImage={"buttons/downvote.svg"}
                        hoverImage={"buttons/downvote-hover.svg"}
                        onclick={async () => {
                            //downvote the edge
                            await upvoteEdge(selectedEdgeId, false);
                        }}
                    />
                }
            </div>
        </div>
    );
}
