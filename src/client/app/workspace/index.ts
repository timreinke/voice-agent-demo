import { tool } from "@openai/agents";
import { z } from "zod";
import { Store } from "../utils/store";

export namespace Workspace {
  const state = Store.create({
    document: "",
    inputs: [],
  });

  export function use() {
    return Store.use(state);
  }

  export function getDocument() {
    return state.get().document;
  }

  export function setDocument(document: string) {
    state.set({
      ...state.get(),
      document,
    });
  }

  export const Tools = [
    tool({
      name: "set_document",
      description: "Set the document HTML",
      parameters: z.object({
        document: z.string(),
      }),
      async execute(input) {
        state.set({
          ...state.get(),
          document: input.document,
        });
      },
    }),
  ];
}
