import mongoose, { ClientSession } from "mongoose";

/**
 * Executes a callback within a MongoDB transaction if supported by the deployment.
 * If transactions are unsupported (e.g. standalone MongoDB deployment without replica sets),
 * it seamlessly falls back to sequential execution with automatic error cleanup to prevent orphaned records.
 */
export const executeWithTransactionFallback = async <T>(
  action: (session?: ClientSession) => Promise<T>,
  cleanupOnError?: (error: unknown) => Promise<void>
): Promise<T> => {
  let session: ClientSession | null = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const result = await action(session);
    await session.commitTransaction();
    return result;
  } catch (error: any) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch {
        // ignore abort failure
      }
    }

    const isTransactionUnsupported =
      error?.code === 20 ||
      error?.codeName === "IllegalOperation" ||
      error?.message?.includes("Transaction numbers are only allowed") ||
      error?.message?.includes("replica set") ||
      error?.message?.includes("retryable writes") ||
      error?.originalError?.code === 20 ||
      error?.originalError?.message?.includes("replica set") ||
      error?.originalError?.message?.includes("Transaction numbers");

    if (isTransactionUnsupported) {
      try {
        // Fallback for standalone MongoDB deployment without replica set
        return await action(undefined);
      } catch (fallbackError) {
        if (cleanupOnError) {
          try {
            await cleanupOnError(fallbackError);
          } catch (cleanupErr) {
            console.error("Cleanup error after failed standalone operation:", cleanupErr);
          }
        }
        throw fallbackError;
      }
    }

    if (cleanupOnError) {
      try {
        await cleanupOnError(error);
      } catch (cleanupErr) {
        console.error("Cleanup error after failed transaction operation:", cleanupErr);
      }
    }

    throw error;
  } finally {
    if (session) {
      try {
        session.endSession();
      } catch {
        // ignore endSession error
      }
    }
  }
};
