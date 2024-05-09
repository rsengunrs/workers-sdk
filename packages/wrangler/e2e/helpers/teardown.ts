import assert from "node:assert";
import { afterEach } from "vitest";

const teardownCallbacks: (() => unknown | Promise<unknown>)[] = [];
export function teardown(callback: () => unknown | Promise<unknown>) {
	teardownCallbacks.push(callback);
}

function getErrorStack(e: unknown): string {
	if (
		typeof e === "object" &&
		e !== null &&
		"stack" in e &&
		typeof e.stack === "string"
	) {
		return e.stack;
	} else {
		return String(e);
	}
}

afterEach(async () => {
	const errors: unknown[] = [];
	while (teardownCallbacks.length > 0) {
		const callback = teardownCallbacks.pop();
		assert(callback);
		try {
			await callback();
		} catch (error) {
			errors.push(error);
		}
	}

	if (errors.length > 0)
		throw new AggregateError(
			errors,
			["Unable to teardown:", ...errors.map(getErrorStack)].join("\n")
		);
});
