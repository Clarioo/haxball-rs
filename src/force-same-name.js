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
        auths[player.auth] = player.name;
        conns[player.conn] = player.name;
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
                var playerName = "";
                args.slice(2);
                playerName = args.join(' ');
                if (message.startsWith("!addException")) {
                    addPlayerException(player, playerName);
                }
                else if (message.startsWith("!removeException")) {
                    removePlayerException(player, playerName);
                }
                else if (message.startsWith("!removeAuth")) {
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
    for(var key in auths) {
        if(auths[key] === playerName) {
            delete auths[key];
            room.sendAnnouncement(`Player ${playerName} removed from auths list.`, sender.id);
        }
    }
    for(var key in conns) {
        if(conns[key] === playerName) {
            delete conns[key];
            room.sendAnnouncement(`Player ${playerName} removed from conns list.`, sender.id);
        }
    }
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