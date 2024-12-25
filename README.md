# Data Replication
This repository focuses on how database replication effects the performance of queries.
## Steps to perform database replication
1. Kill all mongo-db process using Task Manager or from bash using this command
`tasklist | findstr mongod`
2. Start mongo-db instances on your system using the following commands in seperate terminal or cmd instances
`mongod --replSet rs0 --port 27017 --dbpath /data/rs0 --bind_ip localhost`
`mongod --replSet rs0 --port 27018 --dbpath /data/rs1 --bind_ip localhost`
`mongod --replSet rs0 --port 27019 --dbpath /data/rs2 --bind_ip localhost`
3. Connect to a one instance using
`mongo --port 27017`
4. Create a replica-set and add the above instances to that set using
`rs.initiate({
    _id: "rs0",
    members: [
        { _id: 0, host: "localhost:27017" },
        { _id: 1, host: "localhost:27018" },
        { _id: 2, host: "localhost:27019" }
    ]
});`
5. Verify the status using
`rs.status();`
6. Now query the database to read from any collection using `read_from_replica.js`
7. Disconnect/Shutdown one instance using
`mongod --port 27017 --shutdown`
8. Perform operation 6. The operation should be performed successfully even if one of the replica instance has been closed/shutdown.

This is an example of failure tolerance, load distribution and performance optimization.