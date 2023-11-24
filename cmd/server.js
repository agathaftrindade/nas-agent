const express = require('express')

const HealthService = require('../service/health-service')

async function run() {
    const app = express()
    const port = 3000

    app.get('/', (req, res) => {
        res.send({
            mode: 'server',
            ok: true
        })
    })

    app.get('/health', (req, res) => {
        res
            .status(200)
            .send({
                status: 'ok'
            })
    })

    app.post('/poweron', (req, res) => {
        res
            .status(202)
            .send({
                status: 'ok'
            })

    })

    app.post('/poweroff', (req, res) => {
        res
            .status(202)
            .send({
                status: 'ok'
            })
    })

    app.listen(port, () => {
        console.log(`Server app listening on port ${port}`)
    })
}


module.exports = {
    run
}
