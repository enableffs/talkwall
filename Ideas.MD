Articles and ideas which we can incorporate into our project:
https://hackernoon.com/building-conclave-a-decentralized-real-time-collaborative-text-editor-a6ab438fe79f

Some years ago - Full-stack framework for writing modern web applications.
Realtime collaboration, example on their site.
http://derbyjs.com/

ShareDB is a realtime database backend based on Operational Transformation (OT) of JSON documents. It is the realtime backend for the DerbyJS web application framework.
https://www.npmjs.com/package/sharedb

Google Operational transforms
https://developers.google.com/google-apps/realtime/overview


http://swellrt.org/
SwellRT is an backend-as-a-service providing real-time and collaborative services to new or existing applications.
Engage users with real-time collaborative features!
Documents, pads, polls,  chats, workflows, canvases, and more…

P2P framework
https://github.com/y-js/yjs

Necessary to modify the architecture?
- MongoDB takes care of atomic operations thus making sure the data stored is persistent and non corrupted.
- What we can do is to reduce the amount of request or delay them.
- In the current state of the project, nothing works if there is no MongoDB available, include fallbacks?
    - Temporarly store data in-memory and when the server is up, push the updates to it.
- Everything from server relies on the mongoose schema
TODO: 
- Mimic the structure of mongoose schemas and store the information of users in them in-memory.
    - Whenever a request comes in, we could use the data from memory.
        - Issues which could potentially follow with this approach
            - Consistency, Race conditions etc.
        - Some solutions we could test out are Operational Transformation, CRDT.
- Is it worth it though?
    - With such a huge modifications on the project, would bit be better to start from scratch?
    - Everything works as it should be, further optimilizations are probably possible without making big changes to the structure.
- Goals?
    - Do we want a realtime collborative feature?
    - With the current state, we will only update the users on a specific time(need verification).
    - Can we expand the project to react on change and update the users instantly or almost in real time?


    Article about scaling in NodeJS.
    http://adrianmejia.com/blog/2016/03/23/how-to-scale-a-nodejs-app-based-on-number-of-users/