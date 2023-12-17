import { SQSRecord } from "aws-lambda";
import { handler } from "../resources/catalogBatchProcess";
import { Product } from "../types";
import {
  PublishBatchCommand,
  PublishBatchCommandInput,
} from "@aws-sdk/client-sns";

import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";

jest.mock<typeof import("@aws-sdk/client-dynamodb")>(
  "@aws-sdk/client-dynamodb",
  () => {
    const original = jest.requireActual<
      typeof import("@aws-sdk/client-dynamodb")
    >("@aws-sdk/client-dynamodb");
    return {
      ...original,
      DynamoDBClient: jest.fn(),
    };
  }
);

jest.mock("@aws-sdk/lib-dynamodb", () => {
  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: jest.fn(),
      })),
    },
    TransactWriteCommand: jest.fn(),
  };
});

jest.mock("@aws-sdk/client-sns", () => {
  return {
    SNSClient: jest.fn(() => ({
      send: jest.fn(),
    })),
    PublishBatchCommand: jest.fn(),
  };
});

const MOCKED_PRODUCT: Product = {
  title: "Product",
  description: "some desription",
  price: 12,
  count: 3,
};

const mockedRecord: (product: Partial<Product>) => SQSRecord = (product) => ({
  messageId: "string",
  receiptHandle: "string",
  body: JSON.stringify(product),
  attributes: {
    ApproximateReceiveCount: "string",
    SentTimestamp: "string",
    SenderId: "string",
    ApproximateFirstReceiveTimestamp: "string",
  },
  messageAttributes: {},
  md5OfBody: "string",
  eventSource: "string",
  eventSourceARN: "string",
  awsRegion: "string",
});

const expectedPublishCommand: PublishBatchCommandInput = {
  TopicArn: undefined,
  PublishBatchRequestEntries: [
    {
      Id: mockedRecord(MOCKED_PRODUCT).messageId,
      Message: `Record has been added successfully:\n${JSON.stringify(
        MOCKED_PRODUCT,
        null,
        4
      )}`,
      MessageAttributes: {
        count: {
          DataType: "Number",
          StringValue: MOCKED_PRODUCT.count.toString(),
        },
        price: {
          DataType: "Number",
          StringValue: MOCKED_PRODUCT.price.toString(),
        },
      },
    },
  ],
};

describe("Without errors", () => {
  beforeEach(async () => {
    await handler({ Records: [mockedRecord(MOCKED_PRODUCT)] });
  });
  it("Should call command write to DB", async () => {
    expect(TransactWriteCommand).toHaveBeenCalled();
  });

  it("Should call command publish to Topic", () => {
    expect(PublishBatchCommand).toHaveBeenCalled();
    expect(PublishBatchCommand).toHaveBeenCalledWith(expectedPublishCommand);
  });
});

describe("With error", () => {
  it("Should throw error with wrong product", () => {
    expect(
      handler({ Records: [mockedRecord({ title: "test title only" })] })
    ).rejects.toThrow("Wrong data format");
  });
});
