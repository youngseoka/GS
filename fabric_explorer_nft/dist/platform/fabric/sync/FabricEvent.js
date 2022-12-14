"use strict";
/*
 * SPDX-License-Identifier: Apache-2.0
 */
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
exports.FabricEvent = void 0;
const helper_1 = require("../../../common/helper");
const logger = helper_1.helper.getLogger('FabricEvent');
/**
 *
 *
 * @class FabricEvent
 */
class FabricEvent {
    /**
     * Creates an instance of FabricEvent.
     * @param {*} client
     * @param {*} fabricServices
     * @memberof FabricEvent
     */
    constructor(client, fabricServices) {
        this.client = client;
        this.fabricServices = fabricServices;
    }
    /**
     *
     *
     * @memberof FabricEvent
     */
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            // Creating channel event hub
            const channels = this.client.getChannels();
            for (const channel_name of channels) {
                const listener = FabricEvent.channelEventHubs.get(channel_name);
                if (listener) {
                    logger.debug('initialize() - Channel event hub already exists for [%s]', channel_name);
                    continue;
                }
                yield this.createChannelEventHub(channel_name);
            }
        });
    }
    /**
     *
     *
     * @param {*} channel
     * @memberof FabricEvent
     */
    createChannelEventHub(channel_name) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create channel event hub
            try {
                const network = yield this.client.fabricGateway.gateway.getNetwork(channel_name);
                const listener = yield network.addBlockListener((event) => __awaiter(this, void 0, void 0, function* () {
                    // Skip first block, it is process by peer event hub
                    if (!(event.blockNumber.low === 0 && event.blockNumber.high === 0)) {
                        const noDiscovery = false;
                        yield this.fabricServices.processBlockEvent(this.client, event.blockData, noDiscovery);
                    }
                }), {
                    // Keep startBlock undefined because expecting to start listening from the current block.
                    type: 'full'
                });
                FabricEvent.channelEventHubs.set(channel_name, listener);
                logger.info('Successfully created channel event hub for [%s]', channel_name);
            }
            catch (error) {
                logger.error(`Failed to add block listener for ${channel_name}`);
            }
        });
    }
    /* eslint-disable */
    /**
     *
     *
     * @param {*} channel_name
     * @memberof FabricEvent
     */
    connectChannelEventHub(channel_name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.createChannelEventHub(channel_name);
            }
            catch (err) {
                logger.error('Failed to get the channel ', err);
            }
        });
    }
    /* eslint-disable */
    /**
     *
     *
     * @param {*} channel_name
     * @returns
     * @memberof FabricEvent
     */
    isChannelEventHubConnected(channel_name) {
        const listener = FabricEvent.channelEventHubs.get(channel_name);
        if (listener) {
            return true;
        }
        return false;
    }
    /**
     *
     *
     * @param {*} channel_name
     * @returns
     * @memberof FabricEvent
     */
    disconnectChannelEventHub(channel_name) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug('disconnectChannelEventHub(' + channel_name + ')');
            const listener = FabricEvent.channelEventHubs.get(channel_name);
            const network = yield this.client.fabricGateway.gateway.getNetwork(channel_name);
            network.removeBlockListener(listener);
            FabricEvent.channelEventHubs.delete(channel_name);
            return;
        });
    }
    /**
     *
     *
     * @memberof FabricEvent
     */
    disconnectEventHubs() {
        logger.debug('disconnectEventHubs()');
        // disconnect all event hubs
        for (const listenerEntry of FabricEvent.channelEventHubs) {
            const channel_name = listenerEntry[0];
            const status = this.isChannelEventHubConnected(channel_name);
            if (status) {
                this.disconnectChannelEventHub(channel_name);
            }
            else {
                logger.debug('disconnectEventHubs(), no connection found ', channel_name);
            }
        }
    }
}
exports.FabricEvent = FabricEvent;
// static class variable
FabricEvent.channelEventHubs = new Map();
//# sourceMappingURL=FabricEvent.js.map