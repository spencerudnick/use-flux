import { ITodoState, ITodoItem } from './todo';
import { Reducer } from 'use-flux';
import { cacheState } from './todo.actions';

let _uuid = 0;

export const CREATE: Reducer<ITodoState> = (state: ITodoState, payload: { value: string }) => {
	const { todos } = state;

	return {
		...state,
		todos: [...todos, {
			id: _uuid++,
			value: payload.value,
			checked: false
		}],
		dispatchQueue: [cacheState()]
	}
};

export const DELETE: Reducer<ITodoState> = (state: ITodoState, payload: { id: number }) => {
	const { todos } = state;

	return {
		...state,
		todos: todos.filter((todo: ITodoItem) => todo.id !== payload.id),
		dispatchQueue: [cacheState()]
	}
};

export const CHECK: Reducer<ITodoState> = (state: ITodoState, payload: { id: number }) => {
	const { todos } = state;

	for (let i = 0; i < todos.length; i++) {
		if (todos[i].id === payload.id) {
			todos[i] = {
				...todos[i],
				checked: true
			};
		}
	}

	return {
		...state,
		todos: [...todos],
		dispatchQueue: [cacheState()]
	}
};

export const UNCHECK: Reducer<ITodoState> = (state: ITodoState, payload: { id: number }) => {
	const { todos } = state;

	for (let i = 0; i < todos.length; i++) {
		if (todos[i].id === payload.id) {
			todos[i] = {
				...todos[i],
				checked: false
			};
		}
	}

	return {
		...state,
		todos: [...todos],
		dispatchQueue: [cacheState()]
	}
};

export const EDIT: Reducer<ITodoState> = (state: ITodoState, payload: { id: number, newValue: string }) => {
	const todos = [...state.todos];

	for (let i = 0; i < todos.length; i++) {
		if (todos[i].id === payload.id) {
			todos[i] = {
				...todos[i],
				value: payload.newValue
			};
		}
	}

	return {
		...state,
		todos,
		dispatchQueue: [cacheState()]
	}
};

export const UNDO: Reducer<ITodoState> = (state: ITodoState) => {
	let { todos, stateStackIndex, stateStack } = state;
	if (stateStackIndex === 0) {
		return state;
	}

	if (stateStackIndex + 1 === stateStack.length && stateStack.length > 0) {
		if (JSON.stringify(todos) !== JSON.stringify(stateStack[stateStack.length - 1])) {
			stateStack = [...stateStack, [...todos]];
		}
	}

	todos = [...state.stateStack[--stateStackIndex]];
	return {
		todos,
		stateStackIndex,
		stateStack,
		dispatchQueue: stateStackIndex + 1 === stateStack.length && stateStack.length > 0
			? [cacheState()]
			: undefined
	};
};

export const REDO: Reducer<ITodoState> = (state: ITodoState) => {
	const stateStackIndex = Math.min(state.stateStackIndex + 1, state.stateStack.length - 1);
	const todos = [...state.stateStack[stateStackIndex]];
	return {
		...state,
		stateStackIndex,
		todos
	};
};

export const CACHE: Reducer<ITodoState> = (state: ITodoState) => {
	let { todos, stateStack, stateStackIndex } = state;

	if (stateStackIndex + 1 < stateStack.length) {
		stateStack = [...stateStack.slice(0, stateStackIndex + 1)];
	}

	stateStack = [...stateStack, [...todos]];
	stateStackIndex = stateStack.length - 1;

	return {
		...state,
		stateStack,
		stateStackIndex
	};
};
