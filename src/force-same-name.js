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
    version: `1.0.0`,
    config: {
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
    const roles = room.getPlugin('sav/roles');
    // console.log(roles);
    // if(roles.getPlayerRoles(player.id).includes("host") === false) {
    //     room.sendAnnouncement(`You are not host.`);
    //     return;
    // }
    // if (message.startsWith("!addException")) {
    //     const playerName = message.split(" ")[1];
    //     addPlayerException(playerName);
    // }
    // else if (message.startsWith("!removeException")) {
    //     const playerName = message.split(" ")[1];
    //     removePlayerException(playerName);
    // }
}

function addPlayerException(playerName) {
    if(playerName === undefined || playerName === "") {
        room.sendAnnouncement(`Please specify player name.`);
        return;
    }
    if(room.getConfig().playersNotAffected.includes(playerName)) {
        room.sendAnnouncement(`Player ${playerName} is already in exception list.`);
        return;
    }
    room.getConfig().playersNotAffected.push(playerName);
    room.sendAnnouncement(`Player ${playerName} added to exception list.`);
}

function removePlayerException(playerName) {
    if(playerName === undefined || playerName === "") {
        room.sendAnnouncement(`Please specify player name.`);
        return;
    }
    const index = room.getConfig().playersNotAffected.indexOf(playerName);
    if (index > -1) {
        room.getConfig().playersNotAffected.splice(index, 1);
        room.sendAnnouncement(`Player ${playerName} removed from exception list.`);
    }
    else {
        room.sendAnnouncement(`There is no player ${playerName} in exception list.`);
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