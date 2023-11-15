/**
 * This plugin enforces one nickname per auth and conn.
 *
 * Once a user has joined with a nickname, they will be kicked when joining with
 * another nickname later unless they change both their auth and IP.
 */

var room = HBInit();

room.pluginSpec = {
    name: `force-same-name`,
    author: `Clarioo`,
    version: `1.0.2`,
    config: {
        authCode: ``,
        playersNotAffected: [],
    },
};

//
// Global variables
//

// Maps auth -> nick
const auths = {};
// Maps conn -> nick
const conns = {};

//
// Event handlers
//


/**
 * Kicks a player if someone with the same auth or conn has joined with a
 * different name before.
 *
 * Stores a mapping between player auth/conn and nick otherwise.
 */
function onPlayerJoinHandler(player) {
    const oldName = auths[player.auth] !== undefined ? auths[player.auth] :
        conns[player.conn] !== undefined ? conns[player.conn] : player.name;

    if (room.getConfig().playersNotAffected.includes(player.name)) {
        return true;
    }
    
    if (oldName !== player.name) {
        room.kickPlayer(player.id,
            `Please re-join with your original nick ${oldName}`);

        return false;
    }

    auths[player.auth] = player.name;
    conns[player.conn] = player.name;
}

function onPlayerChat(player, message) {
    // temp disabled
    var args = message.split(" ");
    
    if (message.startsWith("!") === true) {
        if(args.length > 1){
            if(args[1] === room.getConfig().authCode){
                if (message.startsWith("!addException")) {
                    const playerName = args[2];
                    addPlayerException(player, playerName);
                }
                else if (message.startsWith("!removeException")) {
                    const playerName = args[2];
                    removePlayerException(player, playerName);
                }
                else if (message.startsWith("!removeAuth")) {
                    const playerName = args[2];
                    removePlayerFromAuths(player, playerName);
                }
            }
            else {
                room.sendAnnouncement(`Wrong auth code.`, player.id);
            }
        }
    }
}

function addPlayerException(sender, playerName) {
    if(playerName === undefined || playerName === "") {
        room.sendAnnouncement(`Please specify player name.`, sender.id);
        return;
    }
    if(room.getConfig().playersNotAffected.includes(playerName)) {
        room.sendAnnouncement(`Player ${playerName} is already in exception list.`, sender.id);
        return;
    }
    room.getConfig().playersNotAffected.push(playerName);
    room.sendAnnouncement(`Player ${playerName} added to exception list.`, sender.id);
}

function removePlayerException(sender, playerName) {
    if(playerName === undefined || playerName === "") {
        room.sendAnnouncement(`Please specify player name.`, sender.id);
        return;
    }
    const index = room.getConfig().playersNotAffected.indexOf(playerName);
    if (index > -1) {
        room.getConfig().playersNotAffected.splice(index, 1);
        room.sendAnnouncement(`Player ${playerName} removed from exception list.`, sender.id);
    }
    else {
        room.sendAnnouncement(`There is no player ${playerName} in exception list.`, sender.id);
    }
}

function removePlayerFromAuths(sender, playerName) {
    var resultAuth = room.auths.filter(obj => {
        return obj === playerName;
    });
    if(resultAuth === undefined || resultAuth === "") {
        room.sendAnnouncement(`There is no player ${playerName} in auths list.`, sender.id);
        return;
    }
    const index = room.auths.indexOf(resultAuth);
    if (index > -1) {
        room.auths.splice(index, 1);
    }
    
    var resultCon = room.cons.filter(obj => {
        return obj === playerName;
    });
    if(resultCon === undefined || resultCon === "") {
        room.sendAnnouncement(`There is no player ${playerName} in conns list.`, sender.id);
        return;
    }
    const index2 = room.conns.indexOf(resultCon);
    if (index2 > -1) {
        room.conns.splice(index2, 1);
    }
    room.sendAnnouncement(`Player ${playerName} removed from auths and conns list.`, sender.id);
}

function onPersistHandler() {
    return { auths, conns };
}

function onRestoreHandler(data) {
    if (data === undefined) return;

    Object.assign(auths, data.auths || {});
    Object.assign(conns, data.conns || {});
}

//
// Exports
//

room.onPlayerJoin = onPlayerJoinHandler;
room.onPersist = onPersistHandler;
room.onRestore = onRestoreHandler;
room.onPlayerChat = onPlayerChat;