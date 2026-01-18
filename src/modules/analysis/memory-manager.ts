import { Scope } from "./scopes/scope-manager.js";
import { Logger } from "../../shared/logger/index.js";

export const MemoryPlacement = {
    Stack: "Stack",
    Heap: "Heap",
    Hybrid: "Hybrid"
} as const;

export type MemoryPlacement = typeof MemoryPlacement[keyof typeof MemoryPlacement];

export interface MemoryMetadata {

    placement: MemoryPlacement;

    lifeForce: { current: number };

    isShadow: boolean;

    isMirror: boolean;

    isMut: boolean;

    isConst: boolean;

    type: string;

    associatedState?: string;

}



export class MemoryManager {

    private currentScope: Scope<MemoryMetadata> = new Scope();



    enterScope() {

        this.currentScope = this.currentScope.enterChild();

    }



    exitScope() {

        if (this.currentScope.parent) {

            this.currentScope = this.currentScope.parent;

        }

    }



    analyzePlacement(varName: string, type: string, size: number, isLongLived: boolean, isMut: boolean = false, isConst: boolean = false): MemoryPlacement {

        let placement: MemoryPlacement;

        if (size <= 64 && !isLongLived) {

            placement = MemoryPlacement.Stack;

        } else if (size > 1024) {

            placement = MemoryPlacement.Heap;

        } else {

            placement = MemoryPlacement.Hybrid;

        }



        this.currentScope.define(varName, {

            placement,

            lifeForce: { current: 1.0 },

            isShadow: false,

            isMirror: false,

            isMut,

            isConst,

            type,

            associatedState: "Initial"

        });



        return placement;

    }



    decay(varName: string, type: "read" | "write" | "heavy" = "read") {

        const meta = this.currentScope.lookup(varName);

        if (meta && !meta.isConst) {

            const rates = { read: 0.02, write: 0.08, heavy: 0.15 };

            meta.lifeForce.current -= rates[type];

            if (meta.lifeForce.current < 0) meta.lifeForce.current = 0;

        }

    }





    boost(varName: string, amount: number = 0.1) {

        const meta = this.currentScope.lookup(varName);

        if (meta) {

            meta.lifeForce.current = Math.min(1.0, meta.lifeForce.current + amount);

            Logger.debug(`${varName} life-force boosted by ${amount}`, "Rule 2");

        }

    }



    updateState(varName: string, newState: string) {

        const meta = this.currentScope.lookup(varName);

        if (meta) {

            meta.associatedState = newState;

        }

    }



        createShadow(sourceVar: string, shadowVar: string) {



            const sourceMeta = this.currentScope.lookup(sourceVar);



            if (sourceMeta) {



                this.currentScope.define(shadowVar, {



                    ...sourceMeta,



                    isShadow: true,



                    isMirror: false,



                    isMut: false // Shadow is a read-only view



                });



                Logger.debug(`Shadow created: ${shadowVar} -> ${sourceVar}`, "Rule 1");



            }



        }



    



    getMetadata(varName: string) { return this.currentScope.lookup(varName); }

}



    