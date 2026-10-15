import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	getPageRange,
	getTotalPages,
} from "../../assets/js/modules/pagination.js";

const E = "ellipsis";

describe("getPageRange", () => {
	it("returns nothing without pages", () => {
		assert.deepEqual(getPageRange(1, 0), []);
		assert.deepEqual(getPageRange(1, Number.NaN), []);
	});

	it("shows every page when they all fit", () => {
		assert.deepEqual(getPageRange(1, 1), [1]);
		assert.deepEqual(getPageRange(2, 3), [1, 2, 3]);
	});

	it("keeps a window of three around the current page", () => {
		assert.deepEqual(getPageRange(1, 11), [1, 2, 3, E, 11]);
		assert.deepEqual(getPageRange(2, 11), [1, 2, 3, E, 11]);
		assert.deepEqual(getPageRange(3, 11), [1, 2, 3, 4, E, 11]);
		assert.deepEqual(getPageRange(4, 11), [1, E, 3, 4, 5, E, 11]);
		assert.deepEqual(getPageRange(9, 11), [1, E, 8, 9, 10, 11]);
		assert.deepEqual(getPageRange(10, 11), [1, E, 9, 10, 11]);
		assert.deepEqual(getPageRange(11, 11), [1, E, 9, 10, 11]);
	});

	it("does not insert an ellipsis next to the first or last page", () => {
		assert.deepEqual(getPageRange(3, 5), [1, 2, 3, 4, 5]);
		assert.deepEqual(getPageRange(1, 4), [1, 2, 3, 4]);
	});

	it("clamps out-of-range pages", () => {
		assert.deepEqual(getPageRange(0, 5), [1, 2, 3, E, 5]);
		assert.deepEqual(getPageRange(99, 5), [1, E, 3, 4, 5]);
	});

	it("supports a custom window size", () => {
		assert.deepEqual(getPageRange(6, 11, 5), [1, E, 4, 5, 6, 7, 8, E, 11]);
	});
});

describe("getTotalPages", () => {
	it("rounds up and never returns zero", () => {
		assert.equal(getTotalPages(0, 20), 1);
		assert.equal(getTotalPages(20, 20), 1);
		assert.equal(getTotalPages(45, 20), 3);
	});
});
