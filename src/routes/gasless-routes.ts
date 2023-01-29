import HttpStatusCodes from '@src/declarations/major/HttpStatusCodes';
import {
    WebHookAttributesType,
    BuildExecTransactionType,
} from '@mohammadshahin/zero-wallet-dashboard-sdk';

import { DeployWebHookAttributesType } from '@src/types/zerowallet';
import { IReq, IRes } from './shared/types';

import projectManager, { getReadyGasTankApiKey } from '../projectManager';
import { NextFunction } from 'express';

// **** Variables **** //

// Paths
const paths = {
    basePath: '/tx',
    send: '/:apiKey/send',
    build: '/:apiKey/build',
    deploy: '/:apiKey/deploy',
} as const;

// **** Types **** //

interface IBuildReq {
    zeroWalletAddress: string;
    data: string;
    webHookAttributes: WebHookAttributesType;
    chainId: string;
}

interface ISendReq {
    execTransactionBody: BuildExecTransactionType;
    zeroWalletAddress: string;
    signature: string;
    webHookAttributes: WebHookAttributesType;
    chainId: string;
}

interface IDeployReq {
    zeroWalletAddress: string;
    chainId: string;
    webHookAttributes: DeployWebHookAttributesType;
}


// **** Validators **** //

async function isAllowedOriginGasless(
    req: IReq,
    res: IRes,
    next: NextFunction,
) {

    const origin = req.get('origin');

    if(!origin) {
        return res.status(HttpStatusCodes.NOT_FOUND).json(
            { error: 'Origin not found' },
        );
    }

    const projectApiKey = req.params.apiKey;

    const project = await projectManager.getProjectByApiKey(projectApiKey);
    await project.readyPromise;

    if (project?.allowedOrigins){
        if(!(project.allowedOrigins.includes(origin))){
            return res.status(HttpStatusCodes.NOT_FOUND).json(
                { error: `Origin: ${origin} not found` },
            );
        }
    }

    next();
}




// **** Functions **** //

/**
 * Build the gasless transaction
 */
async function build(req: IReq<IBuildReq>, res: IRes) {

    const projectApiKey = req.params.apiKey;
    const { zeroWalletAddress, data, webHookAttributes, chainId } = req.body;
    
    const gasTank = await getReadyGasTankApiKey(projectApiKey, chainId);

    if (!gasTank) {
        return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .json({ error: `Gas tank '${chainId}' not found` });
    }

    const { safeTXBody, scwAddress } = await gasTank.buildTransaction({
        zeroWalletAddress,
        populatedTx: data,
        webHookAttributes,
        targetContractAddress: webHookAttributes.to,
    });

    return res.status(HttpStatusCodes.OK).json({ safeTXBody, scwAddress });
}

/**
 * Send gasless transaction.
 */
async function send(req: IReq<ISendReq>, res: IRes) {

    const projectApiKey = req.params.apiKey;
    const {
        execTransactionBody,
        zeroWalletAddress,
        signature,
        webHookAttributes,
        chainId,
    } = req.body;
    
    const gasTank = await getReadyGasTankApiKey(projectApiKey, chainId);
    
    if (!gasTank) {
        return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .json({ error: `Gas tank '${chainId}' not found` });
    }

    const { walletAddress: scwAddress } = await gasTank.doesProxyWalletExist(
        zeroWalletAddress,
    );

    const txHash = await gasTank.sendGaslessTransaction({
        safeTXBody: execTransactionBody,
        zeroWalletAddress,
        scwAddress,
        signature,
        webHookAttributes,
    });

    return res.status(HttpStatusCodes.CREATED).json({ txHash });
}

/**
 * Deploy the smart contract wallet
 */
async function deploy(req: IReq<IDeployReq>, res: IRes) {

    const { zeroWalletAddress, chainId, webHookAttributes } = req.body;
    const projectApiKey = req.params.apiKey;
    
    const gasTank = await getReadyGasTankApiKey(projectApiKey, chainId);

    if (!gasTank) {
        return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .json({ error: `Gas tank '${chainId}' not found` });
    }

    const scwAddress = await gasTank.deployProxyWallet({
        zeroWalletAddress,
        webHookAttributes,
    });

    return res.status(HttpStatusCodes.CREATED).json({ scwAddress });
}

// **** Export default **** //

export default {
    paths,
    isAllowedOriginGasless,
    build,
    send,
    deploy,
} as const;
