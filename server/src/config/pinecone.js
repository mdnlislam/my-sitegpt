import { Pinecone } from "@pinecone-database/pinecone";
import { embed } from "../services/embed.js";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const INDEX_NAME = process.env.PINECONE_INDEX || "sitegpt";

export let index;

export async function connectPinecone() {
  const [sample] = await embed(["hello"]);
  const dimension = sample.length;

  await pc.indexes.create({
    name: INDEX_NAME,
    schema: {
      fields: {
        _values: {
          type: "dense_vector",
          dimension: dimension,
          metric: "cosine",
        },
      },
    },
    deployment: {
      deploymentType: "managed",
      cloud: "aws",
      region: "us-east-1",
    },
    waitUntilReady: true,
    suppressConflicts: true,
  });

  const info = await pc.indexes.describe(INDEX_NAME);
  const indexDimension =
    info.schema?.fields?._values?.dimension ?? info.dimension;
  if (indexDimension && indexDimension !== dimension) {
    throw new Error(
      `ইনডেক্সের মাপ ${indexDimension}, কিন্তু embedding মডেল দিচ্ছে ${dimension}। ` +
        `Pinecone থেকে "${INDEX_NAME}" ইনডেক্স মুছে দিন, অথবা .env-এ নতুন PINECONE_INDEX নাম দিন।`,
    );
  }

  index = pc.index({ name: INDEX_NAME, namespace: "main" });
  console.log(`✅ Pinecone ready: ${INDEX_NAME} (${dimension} dimensions)`);
}
