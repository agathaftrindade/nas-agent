const child_process = require('child_process')
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const HealthService = require('../service/health-service')
const PowerService = require('../service/power-service')

const INSERT_INTERVAL_SECONDS = 180
const FETCH_INTERVAL_SECONDS = 180

async function publishHealth (healthService) {
    await healthService.publishRunning()
    console.log('published health update')
}

async function checkCommands (healthService, powerService) {
    const command = await powerService.fetchCommand()

    if (command.device) {
        await powerService.ackCommand(command.device, command.timestamp)
    }

    if (command.action == 'poweroff'){
        await healthService.publishPoweringOff()
        await powerService.powerOff()
    }


}

async function run() {

    const dynamoDB = new DynamoDBClient()

    const healthService = new HealthService(dynamoDB)
    const powerService = new PowerService(dynamoDB)

    const healthInterval = setInterval(() => {
        publishHealth(healthService)
    }, INSERT_INTERVAL_SECONDS * 1000)

    const powerInterval = setInterval(() => {
        checkCommands(healthService, powerService)
    }, FETCH_INTERVAL_SECONDS * 1000)

    publishHealth(healthService)
    checkCommands(healthService, powerService)
}


module.exports = {
    run
}
