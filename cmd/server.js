const express = require('express')
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const HealthService = require('../service/health-service')
const PowerService = require('../service/power-service')

function setupRoutes(app, healthService, powerService) {

    app.use(express.static('static'))

    app.get('/health', async (req, res) => {
        const lastPing = await healthService.fetchAll()
        res
            .status(200)
            .send({
                data: lastPing
            })
    })

    app.post('/poweron', async (req, res) => {
        await powerService.powerOn()
        res
            .status(200)
            .send()
    })

    app.post('/poweroff', async (req, res) => {
        await powerService.schedulePoweroff()
        res
            .status(202)
            .send()
    })
}

async function run() {
    const app = express()
    const port = 3000

    const dynamoDB = new DynamoDBClient()
    const healthService = new HealthService(dynamoDB)
    const powerService = new PowerService(dynamoDB)

    setupRoutes(app, healthService, powerService)

    app.listen(port, () => {
        console.log(`Server app listening on port ${port}`)
    })
}

module.exports = {
    run
}
