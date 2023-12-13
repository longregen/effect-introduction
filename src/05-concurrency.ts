/** WIP */

import { pipe } from "effect/Function";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";

/**
 * BOUNDED VS UNBOUNDED
 */

// unbounded
const userIds = Array.from({ length: 100000 }, (_, idx) => idx);

function fetchUser(id: number): Promise<any> {
  return Promise.resolve().then(() => ({ name: `User ${id}` }));
}

function retrieveAllUsers() {
  return Promise.all(userIds.map((id) => fetchUser(id)));
}

// bounded
pipe(
  userIds,
  Effect.forEach((id) => Effect.promise(() => fetchUser(id)), {
    concurrency: 30,
  })
);

/**
 * RESOURCE MANAGEMENT
 */

function quickRunningPromise() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function longRunningPromise() {
  return new Promise((resolve) => {
    setTimeout(resolve, 5000);
  });
}

// Promise.race([quickRunningPromise(), longRunningPromise()]);

const quickRunningEffect = pipe(Effect.delay(Duration.seconds(1))(Effect.unit));

const longRunningEffect = pipe(
  Effect.delay(Duration.seconds(5))(Effect.unit),
  Effect.onInterrupt(() => {
    console.log("interrupted!");
    return Effect.unit;
  })
);

Effect.runCallback(Effect.race(quickRunningEffect, longRunningEffect), () => {
  console.log("done");
});
