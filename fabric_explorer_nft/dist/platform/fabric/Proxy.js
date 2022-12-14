"use strict";
/*
 * SPDX-License-Identifier: Apache-2.0
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Proxy = void 0;
const helper_1 = require("../../common/helper");
const NetworkService_1 = require("./service/NetworkService");
const ExplorerError_1 = require("../../common/ExplorerError");
const ExplorerMessage_1 = require("../../common/ExplorerMessage");
const FabricConst = __importStar(require("./utils/FabricConst"));
const fabric_const = FabricConst.fabric.const;
const logger = helper_1.helper.getLogger('Proxy');
/**
 *
 *
 * @class Proxy
 */
class Proxy {
    /**
     * Creates an instance of Proxy.
     * @param {*} platform
     * @memberof Proxy
     */
    constructor(platform, userService) {
        this.platform = platform;
        this.persistence = platform.getPersistence();
        this.broadcaster = platform.getBroadcaster();
        this.userService = userService;
    }
    /**
     *
     *
     * @param {*} user
     * @returns
     * @memberof Proxy
     */
    authenticate(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.userService.authenticate(user);
            logger.debug('result of authentication >> %j', response);
            return response;
        });
    }
    /**
     *
     *
     * @returns
     * @memberof Proxy
     */
    networkList() {
        return __awaiter(this, void 0, void 0, function* () {
            const networkService = new NetworkService_1.NetworkService(this.platform);
            let response = yield networkService.networkList();
            if (!response) {
                response = [
                    {
                        status: false,
                        message: 'Failed to get network list '
                    }
                ];
            }
            logger.debug('networkList >> %s', response);
            return response;
        });
    }
    /**
     *
     *
     * @returns
     * @memberof Proxy
     */
    getCurrentChannel(network_id) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug('getCurrentChannel: network_id', network_id);
            const client = yield this.platform.getClient(network_id);
            const channel_name = Object.keys(client.fabricGateway.config.channels)[0];
            const channel_genesis_hash = client.getChannelGenHash(channel_name);
            let respose;
            if (channel_genesis_hash) {
                respose = {
                    currentChannel: channel_genesis_hash
                };
            }
            else {
                respose = {
                    status: 1,
                    message: 'Channel not found in the Context ',
                    currentChannel: ''
                };
            }
            logger.debug('getCurrentChannel >> %j', respose);
            return respose;
        });
    }
    /**
     *
     *
     * @param {*} channel_genesis_hash
     * @returns
     * @memberof Proxy
     */
    getPeersStatus(network_id, channel_genesis_hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.platform.getClient(network_id);
            const channel_name = client.getChannelNameByHash(channel_genesis_hash);
            const nodes = yield this.persistence
                .getMetricService()
                .getPeerList(network_id, channel_genesis_hash);
            let discover_results;
            if (client.status) {
                try {
                    discover_results = yield client.initializeChannelFromDiscover(channel_name);
                }
                catch (e) {
                    logger.debug('getPeersStatus >> ', e);
                }
            }
            const peers = [];
            for (const node of nodes) {
                if (node.peer_type === 'PEER') {
                    node.status = 'DOWN';
                    if (discover_results && discover_results.peers_by_org) {
                        const org = discover_results.peers_by_org[node.mspid];
                        if (org === undefined) {
                            continue;
                        }
                        for (const peer of org.peers) {
                            if (peer.endpoint === node.requests) {
                                node.ledger_height_low = peer.ledgerHeight.low;
                                node.ledger_height_high = peer.ledgerHeight.high;
                                node.ledger_height_unsigned = peer.ledgerHeight.unsigned;
                            }
                        }
                    }
                    else {
                        // Sometime 'peers_by_org' property is not included in discover result
                        node.ledger_height_low = '-';
                        node.ledger_height_high = '-';
                        node.ledger_height_unsigned = '-';
                    }
                    peers.push(node);
                }
                else if (node.peer_type === 'ORDERER') {
                    node.status = 'DOWN';
                    node.ledger_height_low = '-';
                    node.ledger_height_high = '-';
                    node.ledger_height_unsigned = '-';
                    peers.push(node);
                }
            }
            logger.debug('getPeersStatus >> %j', peers.length);
            return peers;
        });
    }
    /**
     *
     *
     * @param {*} channel_genesis_hash
     * @returns
     * @memberof Proxy
     */
    changeChannel(network_id, channel_genesis_hash) {
        return __awaiter(this, void 0, void 0, function* () {
            return channel_genesis_hash;
        });
    }
    /**
     *
     *
     * @returns
     * @memberof Proxy
     */
    getChannelsInfo(network_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.platform.getClient(network_id);
            const channels = yield this.persistence
                .getCrudService()
                .getChannelsInfo(network_id);
            const currentchannels = [];
            for (const channel of channels) {
                const channel_genesis_hash = client.getChannelGenHash(channel.channelname);
                if (channel_genesis_hash &&
                    channel_genesis_hash === channel.channel_genesis_hash) {
                    currentchannels.push(channel);
                }
            }
            logger.debug('getChannelsInfo >> %j', currentchannels);
            return currentchannels;
        });
    }
    /**
     *
     *
     * @param {*} channel_genesis_hash
     * @returns
     * @memberof Proxy
     */
    getTxByOrgs(network_id, channel_genesis_hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield this.persistence
                .getMetricService()
                .getTxByOrgs(network_id, channel_genesis_hash);
            const organizations = yield this.persistence
                .getMetricService()
                .getOrgsData(network_id, channel_genesis_hash);
            for (const organization of rows) {
                const index = organizations.indexOf(organization.creator_msp_id);
                if (index > -1) {
                    organizations.splice(index, 1);
                }
            }
            for (const org_id of organizations) {
                rows.push({
                    count: '0',
                    creator_msp_id: org_id
                });
            }
            return rows;
        });
    }
    /**
     *
     *
     * @param {*} channel_genesis_hash
     * @param {*} number
     * @returns
     * @memberof Proxy
     */
    getBlockByNumber(network_id, channel_genesis_hash, number) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.platform.getClient(network_id);
            const channelName = client.getChannelNameByHash(channel_genesis_hash);
            let block;
            try {
                block = yield client.fabricGateway.queryBlock(channelName, parseInt(number));
            }
            catch (e) {
                logger.debug('queryBlock >> ', e);
            }
            if (block) {
                return block;
            }
            logger.error('response_payloads is null');
            return 'response_payloads is null';
        });
    }
    /**
     *
     *
     * @returns
     * @memberof Proxy
     */
    getClientStatus() {
        const client = this.platform.getClient();
        return client.getStatus();
    }
    /**
     *
     *
     * @returns
     * @memberof Proxy
     */
    getChannels(network_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.platform.getClient(network_id);
            const client_channels = client.getChannelNames();
            const channels = yield this.persistence
                .getCrudService()
                .getChannelsInfo(network_id);
            const respose = [];
            for (let i = 0; i < channels.length; i++) {
                const index = client_channels.indexOf(channels[i].channelname);
                if (index <= -1) {
                    yield client.initializeNewChannel(channels[i].channelname);
                }
                respose.push(channels[i].channelname);
            }
            logger.debug('getChannels >> %j', respose);
            return respose;
        });
    }
    /**
     *
     *
     * @param {*} reqUser
     * @returns
     * @memberof Proxy
     */
    register(reqUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.userService.register(reqUser);
            logger.debug('register >> %s', response);
            return response;
        });
    }
    /**
     *
     *
     * @param {*} reqUser
     * @returns
     * @memberof Proxy
     */
    unregister(reqUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.userService.unregister(reqUser);
            logger.debug('unregister >> %s', response);
            return response;
        });
    }
    /**
     *
     *
     * @returns
     * @memberof Proxy
     */
    userlist(reqUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.userService.userlist(reqUser);
            logger.debug('userlist >> %s', response);
            return response;
        });
    }
    /**
     *
     *
     * @param {*} msg
     * @memberof Proxy
     */
    processSyncMessage(msg) {
        // Get message from child process
        logger.debug('Message from child %j', msg);
        if (fabric_const.NOTITY_TYPE_NEWCHANNEL === msg.notify_type) {
            // Initialize new channel instance in parent
            if (msg.network_id) {
                const client = this.platform.getClient(msg.network_id);
                if (msg.channel_name) {
                    client.initializeNewChannel(msg.channel_name);
                }
                else {
                    logger.error('Channel name should pass to process the notification from child process');
                }
            }
            else {
                logger.error('Network name and client name should pass to process the notification from child process');
            }
        }
        else if (fabric_const.NOTITY_TYPE_UPDATECHANNEL === msg.notify_type ||
            fabric_const.NOTITY_TYPE_CHAINCODE === msg.notify_type) {
            // Update channel details in parent
            if (msg.network_id) {
                const client = this.platform.getClient(msg.network_id);
                if (msg.channel_name) {
                    client.initializeChannelFromDiscover(msg.channel_name);
                }
                else {
                    logger.error('Channel name should pass to process the notification from child process');
                }
            }
            else {
                logger.error('Network name and client name should pass to process the notification from child process');
            }
        }
        else if (fabric_const.NOTITY_TYPE_BLOCK === msg.notify_type) {
            // Broad cast new block message to client
            const notify = {
                title: msg.title,
                type: msg.type,
                message: msg.message,
                time: msg.time,
                txcount: msg.txcount,
                datahash: msg.datahash
            };
            this.broadcaster.broadcast(notify);
        }
        else if (fabric_const.NOTITY_TYPE_EXISTCHANNEL === msg.notify_type) {
            throw new ExplorerError_1.ExplorerError(ExplorerMessage_1.explorerError.ERROR_2009, msg.channel_name);
        }
        else if (msg.error) {
            throw new ExplorerError_1.ExplorerError(ExplorerMessage_1.explorerError.ERROR_2010, msg.error);
        }
        else {
            logger.error('Child process notify is not implemented for this type %s ', msg.notify_type);
        }
    }
}
exports.Proxy = Proxy;
//# sourceMappingURL=Proxy.js.map