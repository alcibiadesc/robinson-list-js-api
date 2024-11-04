import { config } from "dotenv";
import { sendListaRobinsonRequest } from "robinson-list-js-api";

// Load environment variables
config();

const accessKey = process.env.ACCESS_KEY || "";
const secretKey = process.env.SECRET_KEY || "";
const region = "eu-west-1";
const service = "execute-api";
const endpoint = "https://api.listarobinson.es/v1/api/user";

// Example data for different channels
const testData = [
  {
    channel: "DNI_NIF_NIE",
    data: ["12345678Z"],
  },
  {
    channel: "PhoneSimple",
    data: ["612345678"],
  },
  {
    channel: "Email",
    data: ["ejemplo.prueba@example.com"],
  },
];

(async () => {
  try {
    for (const test of testData) {
      const response = await sendListaRobinsonRequest({
        accessKey,
        secretKey,
        region,
        service,
        endpoint,
        channel: test.channel,
        data: test.data,
      });
      console.log(`API Response for channel ${test.channel}:`, response);
    }
  } catch (error) {
    console.error("Error:", error);
  }
})();
