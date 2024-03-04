import { retry } from ".";
import { delay } from "../util/delay";

describe("retry", () => {
  test("retry three times", async () => {
    const retryFn = jest.fn((times) => {
      if (times === 3) {
        expect(retryFn).toHaveBeenCalledTimes(3);
        return;
      } else {
        return Promise.reject(new Error("Retry again"));
      }
    });

    await retry(retryFn);
  });

  test("retry three times with a delay of one second each time", async () => {
    const retryFn = jest.fn(async (times) => {
      if (times === 3) {
        return;
      } else {
        await delay(1000);
        return Promise.reject(new Error("Retry again"));
      }
    });

    await retry(retryFn);
    expect(retryFn).toHaveBeenCalledTimes(3);
  });

  test("retry handler is a sync function", async () => {
    const retryFn = jest.fn((times) => {
      if (times === 3) {
        return;
      } else {
        throw new Error("Retry again");
      }
    });

    await retry(retryFn);
    expect(retryFn).toHaveBeenCalledTimes(3);
  });
});
