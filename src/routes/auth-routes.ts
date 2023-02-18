import HttpStatusCodes from '@src/declarations/major/HttpStatusCodes';

import { IReq, IRes } from './shared/types';

import { NextFunction } from 'express';
import projectManager, {
    getReadyGasTankApiKey,
    getGasTankApiKey
} from '../projectManager';

// **** Variables **** //

// Paths
const paths = {
    basePath: '/auth',
    authorize: '/:apiKey/authorize',
    getNonce: '/:apiKey/getNonce',
    refreshNonce: '/:apiKey/refreshNonce'
} as const;

// **** Types **** //

interface IAuthReq {
    zeroWalletAddress: string;
    chainId: string;
}

// **** Validators **** //

async function isAllowedOriginAuth(
    req: IReq<IAuthReq>,
    res: IRes,
    next: NextFunction
) {
    const origin = req.get('origin');

    if (!origin) {
        return res
            .status(HttpStatusCodes.NOT_FOUND)
            .json({ error: 'Origin not found' });
    }

    const projectApiKey = req.params.apiKey;

    const project = await projectManager.getProjectByApiKey(projectApiKey);
    await project.readyPromise;

    if (project?.allowedOrigins) {
        if (!project.allowedOrigins.includes(origin)) {
            return res
                .status(HttpStatusCodes.NOT_FOUND)
                .json({ error: `Origin: ${origin} not found` });
        }
    }

    next();
}

// **** Functions **** //

/**
 * Add an authorized user to the database
 */
async function authorize(req: IReq<IAuthReq>, res: IRes) {
    const { zeroWalletAddress, chainId } = req.body;
    const projectApiKey = req.params.apiKey;

    const gasTank = await getGasTankApiKey(projectApiKey, chainId);
 
    if (!gasTank) {
        return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .json({ error: `Gas tank '${chainId}' not found` });
    }

    await gasTank.addAuthorizedUser(zeroWalletAddress);

    return res.status(HttpStatusCodes.OK).end();
}

/**
 * Get the nonce of an authorized user
 */
async function getNonce(req: IReq<IAuthReq>, res: IRes) {
    const { zeroWalletAddress, chainId } = req.body;
    const projectApiKey = req.params.apiKey;

    const gasTank = await getGasTankApiKey(projectApiKey, chainId);

    if (!gasTank) {
        return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .json({ error: `Gas tank '${chainId}' not found` });
    }

    const nonce = await gasTank.getNonce(zeroWalletAddress);

    if (!nonce) {
        return res.status(HttpStatusCodes.OK).json({ nonce: 'Token expired' });
    }

    return res.status(HttpStatusCodes.OK).json({ nonce: nonce });
}

async function refreshNonce(req: IReq<IAuthReq>, res: IRes) {
    const { zeroWalletAddress, chainId } = req.body;
    const projectApiKey = req.params.apiKey;

    const gasTank = await getReadyGasTankApiKey(projectApiKey, chainId);

    if (!gasTank) {
        return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .json({ error: `Gas tank '${chainId}' not found` });
    }

    const nonce = await gasTank.authorizer.refreshUserAuthorization(
        zeroWalletAddress
    );

    return res.status(HttpStatusCodes.OK).json({ nonce: nonce });
}

// **** Export default **** //

export default {
    paths,
    isAllowedOriginAuth,
    authorize,
    getNonce,
    refreshNonce
} as const;
