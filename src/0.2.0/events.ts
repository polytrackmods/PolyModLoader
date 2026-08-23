export class EventDispatcher<T extends { [K in keyof T]: { type: K } }> {
    _listeners: { [type: string]: Function[] } | undefined;

    /**
     * Adds the given event listener to the given event type.
     *
     * @param {string} type - The type of event to listen to.
     * @param {Function} listener - The function that gets called when the event is fired.
     */
    addEventListener<K extends keyof T & string>(
        type: K,
        listener: (event: T[K]) => void,
    ): void {
        if (this._listeners === undefined) this._listeners = {};
        const listeners = this._listeners;
        if (listeners[type] === undefined) {
            listeners[type] = [];
        }
        if (listeners[type].indexOf(listener) === -1) {
            listeners[type].push(listener);
        }
    }
    /**
     * Returns `true` if the given event listener has been added to the given event type.
     *
     * @param {string} type - The type of event.
     * @param {Function} listener - The listener to check.
     * @return {boolean} Whether the given event listener has been added to the given event type.
     */
    hasEventListener<K extends keyof T & string>(
        type: K,
        listener: (event: T[K]) => void,
    ): boolean {
        const listeners = this._listeners;
        if (listeners === undefined) return false;
        return (
            listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1
        );
    }

    /**
     * Removes the given event listener from the given event type.
     *
     * @param {string} type - The type of event.
     * @param {Function} listener - The listener to remove.
     */
    removeEventListener<K extends keyof T & string>(
        type: K,
        listener: (event: T[K]) => void,
    ): void {
        const listeners = this._listeners;
        if (listeners === undefined) return;
        const listenerArray = listeners[type];
        if (listenerArray !== undefined) {
            const index = listenerArray.indexOf(listener);
            if (index !== -1) {
                listenerArray.splice(index, 1);
            }
        }
    }
    /**
     * Dispatches an event object.
     *
     * @param {Object} event - The event that gets fired.
     */
    dispatchEvent<K extends keyof T & string>(event: T[K]): void {
        const listeners = this._listeners;

        if (listeners === undefined) return;
        const listenerArray = listeners[event.type];

        if (listenerArray !== undefined) {
            // Make a copy, in case listeners are removed while iterating.
            const array = listenerArray.slice(0);
            for (let i = 0, l = array.length; i < l; i++) {
                array[i].call(this, event);
            }
        }
    }
}

export type PMLEvent =
    | {
        type: "newsimworker";
        isRealtime: boolean;
        isMainSim: boolean;
        worker: Worker;
    }
    | {
        type: "onmessagein";
        isRealtime: boolean;
        isMainSim: boolean;
        event: MessageEvent;
    } | {
        type: "soundclassattached"
    } | {
        type: "exitedtrack"
    } | {
        type: "enteredtrack",
        name: string,
        author: string,
        lastModified: Date,
        isMultiplayer: boolean
    } | {
        type: "enterededitor",
        state: any,
    } | { type: "exiteditor" } | 
    {
        type: "onmessageout";
        isRealtime: boolean;
        isMainSim: boolean;
        payload: any;
    };