const { program } = require('commander');

const server = require('./cmd/server')
const agent = require('./cmd/agent')


program
    .name('nas-manager')
    .description('Server and agent to manage NAS')
    .version('0.0.1');

program
    .argument('<mode>', 'server or agent')
    .action(async (mode, options, command) => {
        switch(mode) {
        case 'server':
            await server.run()
            break
        case 'agent':
            await agent.run()
            break
        default:
        }
    })

program.parse()
