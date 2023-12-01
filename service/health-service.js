const { ListTablesCommand } = require("@aws-sdk/client-dynamodb")
const { PutCommand, DynamoDBDocument } = require("@aws-sdk/lib-dynamodb")

const TABLE_NAME = 'HealthUpdates'
const DEVICE = 'nas-agent'

module.exports = class HealthService {
    constructor(dynamoDB) {
        this.dynamoDB = dynamoDB
        this.docClient = DynamoDBDocument.from(dynamoDB)
    }

    async publishRunning() {
        return this.publish('on')
    }

    async publishPoweringOff() {
        return this.publish('off')
    }

    async publish(state) {
        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                Device: DEVICE,
                Timestamp: Date.now(),
                State: state
            }
        })

        await this.docClient.send(command)
    }

    async fetchStatus() {
        const response = await this.docClient.get({
            TableName: TABLE_NAME,
            Key: {
                Device: DEVICE
            },
        })

        if(!response.Item)
            return {
                device: DEVICE,
                lastState: 'unknown'
            }

        return {
            device: DEVICE,
            lastActive: new Date(response.Item.Timestamp).toISOString(),
            lastState: response.Item.State
        }
    }
}


