import { composeWithDevTools } from 'remote-redux-devtools'

const devtoolsSettings = composeWithDevTools({
    realtime: true,
    name: 'Your Instance Name',
    hostname: 'localhost',
    port: 8000 // the port your remotedev server is running at
})


export default devtoolsSettings
