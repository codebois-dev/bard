const { useQueue, useMainPlayer } = require("discord-player");
const colors = require('colors');

module.exports = function (app, client, __dirname, db, lib, lang, oauth) {

    app.get("/api/sse/queue-changes", async (req, res) => {
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Connection', 'keep-alive');
        if (await oauth.checkLoggedIn(req) || req.session.guild_id != null) {
            oauth.getUser(req.session.access_token).then(user => {
                res.flushHeaders();

                let queue = useQueue(req.session.guild_id);

                var lastQueue;

                if (queue==null) {
                    lastQueue = [];
                } else {
                    lastQueue = queue.tracks.toArray();
                }

                let player = useMainPlayer();

                player.events.on('audioTrackAdd', (queue, track) => {
                    let desiredQueue = useQueue(req.session.guild_id);
                    if (desiredQueue == null && queue === desiredQueue) {
                        console.log("addedTrack");
                        res.write(`event: songAdded\ndata: ${JSON.stringify({ status: "success", track: track })}\n\n`);
                    }
                });

                player.events.on('audioTrackRemove', (queue, track) => {
                    let desiredQueue = useQueue(req.session.guild_id);
                    if (desiredQueue == null) return 0;
                    if (queue === desiredQueue) {
                        console.log("removedTrack");

                        res.write(`event: songRemoved\ndata: ${JSON.stringify({ status: "success", track: track })}\n\n`);
                    }
                });
                

                // let intervalID = null;

                // let startTimer = (duration, display) => {
                //     if (intervalID) clearInterval(intervalID);

                //     intervalID = setInterval(() => {
                //         const queue = useQueue(req.session.guild_id);
                //         if (queue == null) {
                //             res.write(`event: queueDataFetchError\ndata: ${JSON.stringify({ status: "queueNoExist" })}\n\n`);
                //         } else {
                //             if (lib.dash.checkUserInChannel(user.id, queue.channel)) {
                //                 if (queue == null || queue.tracks.length === 0) {
                //                     res.write(`event: queueDataFetchError\ndata: ${JSON.stringify({ status: "queueEmpty" })}\n\n`);
                //                 } else {
                //                     let tracks = queue.tracks.toArray();

                //                     if (tracks != lastQueue) {
                //                         let newTracks = tracks.filter(x => !lastQueue.includes(x)); // aktualne zawiera cos czego nie zawiera poprzednie
                //                         let oodTracks = lastQueue.filter(x => !tracks.includes(x));
                //                         lastQueue = tracks;

                //                         if (newTracks.length > 0) {
                //                             // Track has been added
                //                             console.log("added");

                                            
                //                         }
                //                         if (oodTracks > 0) {
                //                             // Track has been removed
                                            
                //                         }

                //                     }

                //                 }
                //             } else {
                //                 res.write(`event: queueDataFetchError\ndata: ${JSON.stringify({ status: "userNotInBotChannel" })}\n\n`);
                //             }
                //         }
                //     }, 1000);
                // }
                // startTimer();

                res.on('close', () => {
                    player.events.off("audioTrackAdd");
                    player.events.off("audioTrackRemove");
                    res.end();
                });
            })
            // .catch(err => {
            //     res.write(`event: queueDataFetchError\ndata: ${JSON.stringify({ status: "userNotInBotChannel" })}\n\n`);
            //     console.log(`${"[DASHBOARD]".cyan} Error occured when responding to queue fetch:\n${err}`);
            // });
            res.end();
        } else {
            res.send({ status: "authorisationError" });
            res.end();
        }
    });
}