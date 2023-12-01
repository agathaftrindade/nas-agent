import { createApp } from 'https://unpkg.com/petite-vue?module'

const MAX_INSERT_AGE_SECONDS = 20

createApp({

    booted: false,

    agentStatus: { status: 'loading' },

    async mounted() {
        feather.replace()

        this.agentStatus = await this.fetchStatus()
        this.booted = true

        setInterval(async () => {
            this.agentStatus = await this.fetchStatus()
        }, 30 * 1000)
    },

    async fetchStatus() {

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

    get powerButtonClass() {

        const { status } = this.agentStatus

        if(status == 'loading')
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
                return {text: `Sem atualizações desde ${lastActiveS}`}
            return {text: `Sem atualizações`}
        }

        return {}
    }

}).mount()
