import { createApp } from 'https://unpkg.com/petite-vue?module'

const MAX_INSERT_AGE_SECONDS = 20
const UPDATE_INTERVAL_SECONDS = 10
const COMMAND_TIME_LIMIT_SECONDS = 10

createApp({

    booted: false,
    agentStatus: { status: 'loading' },
    lastPowerCommandTime: null,

    async mounted() {
        feather.replace()

        this.agentStatus = await this.fetchStatus()
        this.booted = true

        setInterval(async () => {
            this.agentStatus = await this.fetchStatus(true)
        }, UPDATE_INTERVAL_SECONDS * 1000)
    },

    async fetchStatus(ignoreLoading) {

        if(!ignoreLoading)
            this.agentStatus.status = 'loading'

        await new Promise(resolve => setTimeout(resolve, 1000))

        const req = await fetch('/health')
        const { data } = await req.json()


        const lastActiveD = data.lastActive && new Date(data.lastActive)
        const timeSinceUpdate = (new Date() - lastActiveD) / 1000
        const recentlyActive = data.lastState == 'on' && timeSinceUpdate < MAX_INSERT_AGE_SECONDS

        let newStatus = ''
        if (data.lastState == 'off')
            newStatus = 'inactive'
        else if(recentlyActive)
            newStatus = 'active'
        else
            newStatus = 'unknown'

        const agentStatus = {
            ...data,
            status: newStatus,
            lastActiveS: lastActiveD && lastActiveD.toLocaleString('pt-BR')
        }
        console.log(agentStatus)

        return agentStatus
    },

    async doTogglePower() {

        if(this.lastPowerCommandTime){
            const timeSinceLastCommand =  (new Date() - this.lastPowerCommandTime) / 1000
            if (timeSinceLastCommand < COMMAND_TIME_LIMIT_SECONDS) {
                console.log('ignoring')
                return
            }

        }

        this.lastPowerCommandTime = new Date()

        const { status } = this.agentStatus

        if (status == 'inactive'){
            console.log('POST /poweron')
            const req = await fetch('/poweron', {
                method: 'post'
            })
        }

        if (status == 'active'){
            console.log('POST /poweroff')
            const req = await fetch('/poweroff', {
                method: 'post'
            })
        }
    },

    get powerButtonClass() {

        const { status } = this.agentStatus

        if (status == 'loading')
            return {'is-hidden': true }

        return {
            'is-success': status == 'active',
            'is-danger': status == 'inactive'
        }
    },

    get statusMessage() {

        const { status, lastActiveS } = this.agentStatus
        if(this.booted && (status == 'inactive' || status == 'unknown')){
            if(lastActiveS)
                return {text: `Sem contato desde ${lastActiveS}`}
            return {text: `Sem contato`}
        }

        return {}
    }

}).mount()
