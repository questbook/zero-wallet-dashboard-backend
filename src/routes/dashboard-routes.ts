import HttpStatusCodes from '@src/declarations/major/HttpStatusCodes';

import { DeployWebHookAttributesType } from '@src/types/zerowallet';
import { IReq, IRes } from './shared/types';
import { ethers } from 'ethers';

import projectManager, {
    addGasTank,
    getGasTanksRaw,
    getProjectsByOwner,
    getReadyGasTankId
} from '../projectManager';

import EnvVars from '@src/declarations/major/EnvVars';
import { NextFunction } from 'express';
// eslint-disable-next-line max-len
import { SupportedChainId } from '@mohammadshahin/zero-wallet-dashboard-sdk/build/main/constants/chains';

// **** Variables **** //

// Paths
const paths = {
    basePath: '/dashboard',
    projects: '/projects',
    project: '/project',
    projectUpdate: '/project/:projectId',
    gasTanks: '/project/:projectId/gasTanks',
    gasTank: '/project/:projectId/gasTank',
    updateGasTank: '/project/:projectId/gasTank/:chainId',
    updateGasTankWhitelistAdd:
        '/project/:projectId/gasTank/:chainId/whitelist/add',
    updateGasTankWhitelistDelete:
        '/project/:projectId/gasTank/:chainId/whitelist/delete'
} as const;

// **** Types **** //

interface IBase {
    ownerScw: string;
    webHookAttributes: DeployWebHookAttributesType;
}

type IGetProjects = IBase;

interface IProject extends IBase {
    name: string;
    allowedOrigins: string[];
}

type IGetGasTanks = IBase;

interface IPostGasTank extends IBase {
    chainId: SupportedChainId;
    whitelist: string[];
}

type IUpdateGasTank = IBase;

interface IUpdateGasTankWhitelist extends IBase {
    address: string;
}

async function isValidDashboardUser(
    req: IReq<IBase>,
    res: IRes,
    next: NextFunction
) {
    const {
        webHookAttributes: { nonce, signedNonce }
    } = req.body;

    const dashboardProject = await projectManager.getProjectById(
        projectManager.nativeProject.projectId,
        false
    );

    const address = ethers.utils.verifyMessage(nonce, signedNonce);
    const gasTank = await dashboardProject.loadAndGetGasTankByChainId(
        parseInt(EnvVars.dashboardTestGasTankChainId),
        false
    );

    const isAuthorized = await gasTank.authorizer.isUserAuthorized(
        signedNonce,
        nonce,
        address
    );

    if (isAuthorized) {
        return next();
    }
    res.status(HttpStatusCodes.UNAUTHORIZED).send();
}

async function isAllowedOriginDashboard(
    req: IReq<IBase>,
    res: IRes,
    next: NextFunction
) {
    const origin = req.get('origin');

    if (!origin) {
        return res
            .status(HttpStatusCodes.NOT_FOUND)
            .json({ error: 'Origin not found' });
    }

    const projectId = projectManager.nativeProject.projectId;

    const project = await projectManager.getProjectById(projectId);
    await project.readyPromise;

    if (project?.allowedOrigins) {
        if (!project.allowedOrigins.includes(origin)) {
            return res
                .status(HttpStatusCodes.NOT_FOUND)
                .json({ error: 'Origin not found' });
        }
    }

    next();
}

async function isProjectOwner(req: IReq<IBase>, res: IRes, next: NextFunction) {
    const { projectId } = req.params;
    const { ownerScw } = req.body;
    const project = await projectManager.getProjectById(projectId);

    if (project.owner === ownerScw) {
        return next();
    }
    res.status(HttpStatusCodes.UNAUTHORIZED).send();
}

async function isScwOwner(req: IReq<IBase>, res: IRes, next: NextFunction) {
    const { ownerScw } = req.body;
    const {
        webHookAttributes: { nonce, signedNonce }
    } = req.body;
    const address = ethers.utils.verifyMessage(nonce, signedNonce);

    const contract = new ethers.Contract(
        ownerScw,
        ['function owner() view returns (address)'],
        new ethers.providers.JsonRpcProvider(
            EnvVars.dashboardTestProviderUrls[5] // @TODO: have dynamic chainId
        )
    );

    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const owner = await contract.owner();

    if (owner === address) {
        return next();
    }

    res.status(HttpStatusCodes.UNAUTHORIZED).send();
}

async function getProjects(req: IReq<IGetProjects>, res: IRes) {
    const { ownerScw } = req.body;

    const projects = await getProjectsByOwner(ownerScw);
    res.status(HttpStatusCodes.OK).json(projects);
}

async function postProject(req: IReq<IProject>, res: IRes) {
    const { name, ownerScw, allowedOrigins } = req.body;
    const project = await projectManager.addProject(
        name,
        ownerScw,
        allowedOrigins
    );
    res.status(HttpStatusCodes.OK).json({
        projectId: project.projectId
    });
}

async function updateProject(req: IReq<IProject>, res: IRes) {
    const projectId = req.params.projectId;
    const { name, allowedOrigins } = req.body;
    const project = await projectManager.getProjectById(projectId);
    await project.updateProject(name, allowedOrigins);
    res.status(HttpStatusCodes.OK).send();
}

async function getGasTanks(req: IReq<IGetGasTanks>, res: IRes) {
    const projectId = req.params.projectId;
    const gasTanks = await getGasTanksRaw(projectId);

    res.status(HttpStatusCodes.OK).json(gasTanks);
}

async function postGasTank(req: IReq<IPostGasTank>, res: IRes) {
    const projectId = req.params.projectId;
    const { chainId, whitelist } = req.body;

    const gasTank = await addGasTank(
        projectId,
        {
            chainId,
            providerURL: EnvVars.dashboardTestProviderUrls[chainId]
        },
        whitelist
    );
    
    res.status(HttpStatusCodes.OK).json(gasTank);
}

async function updateGasTank(req: IReq<IUpdateGasTank>, res: IRes) {
    const { projectId, chainId } = req.params;

    const gasTank = await getReadyGasTankId(projectId, chainId);

    await gasTank.updateGasTankProviderUrl(
        EnvVars.dashboardTestProviderUrls[parseInt(chainId) as SupportedChainId]
    );
    res.status(HttpStatusCodes.OK).send();
}

async function addToGasTankWhitelist(
    req: IReq<IUpdateGasTankWhitelist>,
    res: IRes
) {
    const { projectId, chainId } = req.params;
    const { address } = req.body;

    const gasTank = await getReadyGasTankId(projectId, chainId);

    await gasTank.addToWhiteList(address);
    res.status(HttpStatusCodes.OK).send();
}

async function deleteFromGasTankWhitelist(
    req: IReq<IUpdateGasTankWhitelist>,
    res: IRes
) {
    const { projectId, chainId } = req.params;
    const { address } = req.body;

    const gasTank = await getReadyGasTankId(projectId, chainId);

    await gasTank.removeFromWhiteList(address);
    res.status(HttpStatusCodes.OK).send();
}

// **** Export default **** //

export default {
    paths,
    isAllowedOriginDashboard,
    isValidDashboardUser,
    isProjectOwner,
    isScwOwner,
    getProjects,
    postProject,
    getGasTanks,
    postGasTank,
    updateProject,
    updateGasTank,
    addToGasTankWhitelist,
    deleteFromGasTankWhitelist
} as const;
