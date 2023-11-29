var room = HBInit();

room.pluginSpec = {
    name: `chat-extensions`,
    author: `Clarioo`,
    version: `1.0.0`,
    config: {
        authCode: ``,
        adminColor: `#0000FF`,
        donatorColor: `#00FFF0`,
    },
};

// Nicks
const mutedPlayers = [];
// Maps nick -> prefix
const donators = {};
// Maps nick -> prefix
const admins = {};

function onPlayerChat(player, message) {
    var args = message.split(" ");
    // commands
    if (message.startsWith("!") === true) {
        // prefix commands
        if(message.startsWith("!prefix") === true) {
            if(args.length > 1){
                addPrefix(player.name, args[1], player);
            }
            else {
                room.sendAnnouncement(`Please specify prefix.`, player.id);
            }
            return false;
        }
        // admin commands
        else {
            executeCommand(player, args);
            return false;
        }
    }
    // normal chat
    else {
        if(isPlayerMuted(player.id)) {
            room.sendAnnouncement(`You are muted`, player.id);
            return false;
        }
        if(player.name in donators){
            room.sendChat(
                `${donators[player.name]} ${player.name}: ${message}`,
                undefined,
                room.getConfig().donatorColor,
                "bold"
            );
            return false;
        }
        if(player.name in admins){
            room.sendChat(
                `${admins[player.name]} ${player.name}: ${message}`,
                undefined,
                room.getConfig().adminColor,
                "bold"
            );
            return false;
        }
    }
}

function executeCommand(player, args) {
    if(args.length > 1){
        if(args[1] === room.getConfig().authCode){
            var playerName = "";
            args.slice(2);
            playerName = args.join(' ');

            if (message.startsWith("!mute")) {
                mutePlayer(playerName, player);
            }
            else if (message.startsWith("!unmute")) {
                unmutePlayer(playerName, player);
            }
            else if (message.startsWith("!add-donator")) {
                addDonator(playerName, player);
            }
            else if (message.startsWith("!remove-donator")) {
                removeDonator(playerName, player);
            }
            else if (message.startsWith("!add-admin")) {
                addAdmin(playerName, player);
            }
            else if (message.startsWith("!remove-admin")) {
                removeAdmin(playerName, player);
            }
        }
        else {
            room.sendAnnouncement(`Wrong auth code.`, player.id);
        }
    }
}

function mutePlayer(playerName, sender){
    if(playerName === undefined || playerName === "") {
        room.sendAnnouncement(`Please specify player name.`, sender.id);
        return;
    }
    
    for(var key in mutedPlayers) {
        if(key === playerName) {
            room.sendAnnouncement(`Player ${playerName} is already muted`, sender.id);
            break;
        }
    }
    mutedPlayers.push(playerName);
}

function unmutePlayer(playerName, sender){
    if(playerName === undefined || playerName === "") {
        room.sendAnnouncement(`Please specify player name.`, sender.id);
        return;
    }
    
    for(var key in mutedPlayers) {
        if(key === playerName) {
            room.sendAnnouncement(`Player ${playerName} unmuted`, sender.id);
            break;
        }
    }
}

function addDonator(playerName, sender){
    if(playerName === undefined || playerName === "") {
        room.sendAnnouncement(`Please specify player name.`, sender.id);
        return;
    }
    
    for(var key in donators) {
        if(key === playerName) {
            room.sendAnnouncement(`Player ${playerName} is already donator`, sender.id);
            return;
        }
    }
    donators.set(playerName, 'Donator');
}

function removeDonator(playerName, sender){
    if(playerName === undefined || playerName === "") {
        room.sendAnnouncement(`Please specify player name.`, sender.id);
        return;
    }
    
    for(var key in donators) {
        if(key === playerName) {
            delete donators[playerName];
            room.sendAnnouncement(`Player ${playerName} removed from donators`, sender.id);
            return;
        }
    }
}

function addAdmin(playerName, sender){
    if(playerName === undefined || playerName === "") {
        room.sendAnnouncement(`Please specify player name.`, sender.id);
        return;
    }
    
    for(var key in admins) {
        if(key === playerName) {
            room.sendAnnouncement(`Player ${playerName} is already admin`, sender.id);
            return;
        }
    }
    admins.set(playerName, 'Admin');
}

function removeAdmin(playerName, sender){
    if(playerName === undefined || playerName === "") {
        room.sendAnnouncement(`Please specify player name.`, sender.id);
        return;
    }
        
    for(var key in admins) {
        if(key === playerName) {
            delete admins[playerName];
            room.sendAnnouncement(`Player ${playerName} is deleted from admins`, sender.id);
            return;
        }
    }
}
            

function addPrefix(playerName, prefix, sender){
    if(playerName === undefined || playerName === "") {
        room.sendAnnouncement(`Please specify player name.`, sender.id);
        return;
    }
    
    if(prefix === undefined || prefix === "") {
        room.sendAnnouncement(`Please specify prefix.`, sender.id);
        return;
    }
    
    for(var key in donators) {
        if(key === playerName) {
            donators[playerName] = prefix;
            room.sendAnnouncement(`Prefix set to ${prefix}`, sender.id);
            return;
        }
    }
    
    for(var key in admins) {
        if(key === playerName) {
            admins[playerName] = prefix;
            room.sendAnnouncement(`Prefix set to ${prefix}`, sender.id);
            return;
        }
    }
    
    room.sendAnnouncement(`You have no permission to add prefix`, sender.id);
}

function isPlayerMuted(playerName){
    for(var key in mutedPlayers) {
        if(key === playerName) {
            return true;
        }
    }
    return false;
}

function onPersistHandler() {
    return { 
        mutedPlayers,
        donators,
        admins
    };
}

function onRestoreHandler(data) {
    if (data === undefined) return;

    Object.assign(mutedPlayers, data.mutedPlayers || []);
    Object.assign(donators, data.donators || {});
    Object.assign(admins, data.admins || {});
}

//
// Exports
//

room.onPersist = onPersistHandler;
room.onRestore = onRestoreHandler;
room.onPlayerChat = onPlayerChat;