const { ListTablesCommand } = require("@aws-sdk/client-dynamodb")
const { PutCommand, DynamoDBDocument } = require("@aws-sdk/lib-dynamodb")

function formatTime(s) {
    return new Date(s).toISOString()
}

function sonoffConnection() {
    const connection = new ewelink({
        email: '',
        password: '',
        region: 'us',
    })

    return connection
}

module.exports = class PowerService {
    constructor(dynamoDB) {
        this.dynamoDB = dynamoDB
        this.docClient = DynamoDBDocument.from(dynamoDB)
    }

    async powerOn() {
        // activate sonoff
    }

    async schedulePoweroff() {
        const command = new PutCommand({
            TableName: "PowerCommands",
            Item: {
                Device: "nas-agent",
                Timestamp: Date.now(),
                Action: 'poweroff'
            }
        })

        await this.docClient.send(command)
    }

}


