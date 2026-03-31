/** Thrown by service methods when a record doesn't exist.
 *  tRPC routers catch this and convert to TRPCError NOT_FOUND. */
export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}
