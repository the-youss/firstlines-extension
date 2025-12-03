import { StartExtractionProps } from "@/models/StartExtractionProps";
import ky, { ResponsePromise, isHTTPError, isKyError } from 'ky';

type Result<T> = {
  "result": {
    "data": T
  }
}

const fetch = ky.create({
  prefixUrl: 'http://localhost:3000/api/trpc',
})



async function catchError<T = unknown>(fn: () => ResponsePromise<Result<T>>) {
  try {
    const res = await fn();
    return res.json();
  } catch (error) {
    if (isHTTPError(error)) {
      const json = await error.response.json() as { error?: { message: string } };
      throw new Error(json.error?.message ?? 'Something went wrong');
    }
    throw error;
  }
}

export const api = {
  createPayload: async (obj: StartExtractionProps) => {
    const res = await catchError<{
      "identifier": string
    }>(() => fetch('extension.createPayload', {
      method: 'POST',
      json: obj,
    }))
    return res
  }
}

