const { ListTablesCommand } = require("@aws-sdk/client-dynamodb")
const { DynamoDBDocument, PutCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb")
const ewelink = require('ewelink-api')

const config = require('../config.json')

const TABLE_NAME = 'PowerCommands'
const DEVICE = 'nas-agent'
const SONOFF_1CH_ID = config.ewelink.device_id

function sonoffConnection() {

    const connection = new ewelink({
        email: config.ewelink.email,
        password: config.ewelink.password,
        region: config.ewelink.region,
        APP_ID: config.ewelink.app_id,
        APP_SECRET: config.ewelink.app_secret
    })

    return connection
}

module.exports = class PowerService {
    constructor(dynamoDB) {
        this.dynamoDB = dynamoDB
        this.docClient = DynamoDBDocument.from(dynamoDB)
        this.sonoff = sonoffConnection()
    }

    async fetchCommand() {
        console.log('fetching commands')
        const response = await this.docClient.query({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'Device = :deviceValue',
            ExpressionAttributeValues: {
                ':deviceValue': DEVICE
            },
            Limit: 1
        })

        if(!response.Items.length)
            return {}

        return {
            device: DEVICE,
            timestamp: response.Items[0].Timestamp,
            action: response.Items[0].Action,
        }
    }

    async ackCommand(device, timestamp) {
        console.log(`Acking command ${device}:${timestamp}`)

        const command = new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                'Device': device,
                'Timestamp': timestamp
            }
        })

        await this.docClient.send(command)
    }

    async powerOn() {

        await Promise.all([
            this.sonoff.setDevicePowerState(SONOFF_1CH_ID, 'on'),
            new Promise(resolve => setTimeout(resolve, 500))
        ])

    	// await this.sonoff.setDevicePowerState(SONOFF_1CH_ID, 'off', '1')
    }

    async powerOff() {
        console.log('shutting down')
        process.exit()
    }

    async schedulePoweroff() {
        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                Device: DEVICE,
                Timestamp: Date.now(),
                Action: 'poweroff'
            }
        })

        await this.docClient.send(command)
    }

}


