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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FabricConfig = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const helper_1 = require("../../common/helper");
const ExplorerMessage_1 = require("../../common/ExplorerMessage");
const ExplorerError_1 = require("../../common/ExplorerError");
const logger = helper_1.helper.getLogger('FabricConfig');
/**
 *
 *
 * @class FabricConfig
 */
class FabricConfig {
    /**
     * Creates an instance of FabricConfig.
     * @memberof FabricConfig
     */
    /*eslint-disable */
    constructor() { }
    /* eslint-enable */
    /**
     *
     *
     * @param {*} configPath
     * @memberof FabricConfig
     */
    initialize(network_id, network_config) {
        this.network_id = network_id;
        const profile_path = path.resolve(__dirname, network_config.profile);
        const configJson = fs.readFileSync(profile_path, 'utf8');
        this.config = JSON.parse(configJson);
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    getConfig() {
        return this.config;
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    isFabricCaEnabled() {
        if (this.config.certificateAuthorities === undefined) {
            return false;
        }
        const org = this.getOrganization();
        const caArray = this.config.organizations[org].certificateAuthorities;
        if (caArray === undefined) {
            return false;
        }
        const caName = caArray[0];
        if (this.config.certificateAuthorities[caName] === undefined) {
            return false;
        }
        logger.info('Fabric CA: Enabled');
        return true;
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    getOrganization() {
        return this.config.client.organization;
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    getTls() {
        logger.info('config.client.tlsEnable ', this.config.client.tlsEnable);
        return this.config.client.tlsEnable;
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    getEnableAuthentication() {
        return this.config.client.enableAuthentication;
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    getClientTlsIdentity() {
        return this.config.client.clientTlsIdentity;
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    getAdminUser() {
        if (!this.config.client ||
            !this.config.client.adminCredential ||
            !this.config.client.adminCredential.id) {
            logger.error('client.adminCredential.id is undefined');
            return null;
        }
        return this.config.client.adminCredential.id;
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    getAdminPassword() {
        if (!this.config.client ||
            !this.config.client.adminCredential ||
            !this.config.client.adminCredential.password) {
            logger.error('client.adminCredential.password is undefined');
            return null;
        }
        return this.config.client.adminCredential.password;
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    getAdminAffiliation() {
        return this.config.client.adminCredential.affiliation;
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    getCaAdminUser() {
        return this.config.client.caCredential.id;
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    getCaAdminPassword() {
        return this.config.client.caCredential.password;
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    getNetworkId() {
        return this.network_id;
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    getDefaultChannel() {
        let defChannel;
        for (const x in this.config.channels) {
            // Getting default channel
            logger.info('FabricConfig, this.config.channels ', x);
            if (x) {
                defChannel = x;
            }
        }
        return defChannel;
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    getPeersConfig() {
        const peers = [];
        for (const x in this.config.peers) {
            // TODO may need to handle multiple fabric-ca server ??
            if (this.config.peers[x].url) {
                const peer = {
                    name: x,
                    url: this.config.peers[x].url,
                    tlsCACerts: this.config.peers[x].tlsCACerts,
                    eventUrl: this.config.peers[x].eventUrl,
                    grpcOptions: this.config.peers[x].grpcOptions
                };
                peers.push(peer);
            }
        }
        return peers;
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    getOrgSignedCertPem() {
        const organization = this.config.organizations[this.getOrganization()];
        if (organization.signedCert === undefined ||
            (organization.signedCert.path === undefined &&
                organization.signedCert.pem === undefined)) {
            logger.error('Not found signedCert configuration');
            throw new ExplorerError_1.ExplorerError(ExplorerMessage_1.explorerError.ERROR_2015);
        }
        if (organization.signedCert.path !== undefined) {
            return fs.readFileSync(path.resolve(__dirname, '../../..', organization.signedCert.path), 'utf8');
        }
        return organization.signedCert.pem;
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    getOrgAdminPrivateKeyPem() {
        const organization = this.config.organizations[this.getOrganization()];
        if (organization.adminPrivateKey === undefined ||
            (organization.adminPrivateKey.path === undefined &&
                organization.adminPrivateKey.pem === undefined)) {
            logger.error('Not found adminPrivateKey configuration');
            throw new ExplorerError_1.ExplorerError(ExplorerMessage_1.explorerError.ERROR_2015);
        }
        if (organization.adminPrivateKey.path !== undefined) {
            return fs.readFileSync(path.resolve(__dirname, '../../..', organization.adminPrivateKey.path), 'utf8');
        }
        return organization.adminPrivateKey.pem;
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    getPeerTlsCACertsPem(peer) {
        const tlsCACerts = this.config.peers[peer].tlsCACerts;
        if (tlsCACerts === undefined ||
            (tlsCACerts.path === undefined && tlsCACerts.pem === undefined)) {
            logger.error(`Not found tlsCACerts configuration: ${peer.url}`);
            return '';
        }
        if (tlsCACerts.path !== undefined) {
            return fs.readFileSync(path.resolve(__dirname, '../../..', tlsCACerts.path), 'utf8');
        }
        return tlsCACerts.pem;
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    getMspId() {
        const organization = this.config.organizations[this.getOrganization()];
        return organization.mspid;
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    getTlsCACertsPem(certificateAuthority) {
        const tlsCACerts = this.config.certificateAuthorities[certificateAuthority]
            .tlsCACerts;
        if (tlsCACerts === undefined ||
            (tlsCACerts.path === undefined && tlsCACerts.pem === undefined)) {
            logger.error(`Not found tlsCACerts configuration: ${certificateAuthority.url}`);
            return '';
        }
        if (tlsCACerts.path !== undefined) {
            return fs.readFileSync(path.resolve(__dirname, '../../..', tlsCACerts.path), 'utf8');
        }
        return tlsCACerts.pem;
    }
    /**
     *
     *
     * @returns
     * @memberof FabricConfig
     */
    getPeers() {
        const peers = [];
        for (const x in this.config.peers) {
            if (this.config.peers[x].url) {
                const peer = {
                    name: x,
                    url: this.config.peers[x].url,
                    tlsCACerts: this.config.peers[x].tlsCACerts,
                    eventUrl: this.config.peers[x].eventUrl,
                    grpcOptions: this.config.peers[x].grpcOptions
                };
                peers.push(peer);
            }
        }
        return peers;
    }
    getRWSetEncoding() {
        return this.config.client.rwSetEncoding || 'utf8';
    }
}
exports.FabricConfig = FabricConfig;
//# sourceMappingURL=FabricConfig.js.map