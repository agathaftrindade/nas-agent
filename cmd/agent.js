const child_process = require('child_process')
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const HealthService = require('../service/health-service')

async function publishHealth (healthService) {
    await healthService.publish()
    console.log('published health update')
}

// child_process.exec('/usr/sbin/poweroff', function (msg) { console.log(msg) })

async function run() {

    const dynamoDB = new DynamoDBClient()

    const healthService = new HealthService(dynamoDB)

    const healthInterval = setInterval(() => {
        publishHealth(healthService)
    }, 30 * 1000)

    publishHealth(healthService)
}


module.exports = {
    run
}
