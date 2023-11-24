const { ListTablesCommand } = require("@aws-sdk/client-dynamodb")
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb")


module.exports = class HealthService {
    constructor(dynamoDB) {
        this.dynamoDB = dynamoDB
        this.docClient = DynamoDBDocumentClient.from(dynamoDB)
    }

    async publish() {
        const command = new PutCommand({
            TableName: "HealthUpdates",
            Item: {
                Device: "nas-agent",
                Timestamp: Date.now()
            }
        })

        await this.docClient.send(command)
    }

    async fetchAll() {
        console.log('reading health updates')
    }
}


