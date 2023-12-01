const { ListTablesCommand } = require("@aws-sdk/client-dynamodb")
const { PutCommand, DynamoDBDocument } = require("@aws-sdk/lib-dynamodb")

function formatTime(s) {
    return new Date(s).toISOString()
}

module.exports = class HealthService {
    constructor(dynamoDB) {
        this.dynamoDB = dynamoDB
        this.docClient = DynamoDBDocument.from(dynamoDB)
    }

    async publish() {
        const command = new PutCommand({
            TableName: "HealthUpdates",
            Item: {
                Device: "nas-agent",
                Timestamp: Date.now(),
                State: 'on'
            }
        })

        await this.docClient.send(command)
    }

    async fetchAll() {
        const device = 'nas-agent'

        const response = await this.docClient.get({
            TableName: 'HealthUpdates',
            Key: {
                Device: device
            },
        })

        if(!response.Item)
            return {
                device,
                lastState: 'unknown'
            }

        return {
            device: device,
            lastActive: formatTime(response.Item.Timestamp),
            lastState: response.Item.State
        }
    }
}


