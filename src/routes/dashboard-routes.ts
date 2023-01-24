import HttpStatusCodes from '@src/declarations/major/HttpStatusCodes';

import { DeployWebHookAttributesType } from '@src/types/zerowallet';
import { IReq, IRes } from './shared/types';
import { ethers } from 'ethers';

import projectManager, {
    addGasTank,
    getGasTanksRaw,
    getProjectsByOwner,
    getReadyGasTankApiKey,
} from '../projectManager';

import EnvVars from '@src/declarations/major/EnvVars';
import { NextFunction } from 'express';

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
    updateGasTankWhitelist: '/project/:projectId/gasTank/:chainId/whitelist',
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
    chainId: number;
    providerURL: string;
    whiteList: string[];
}

interface IUpdateGasTank extends IBase {
    providerURL: string;
}

interface IUpdateGasTankWhitelist extends IBase {
    address: string;
}

async function isValidDashboardUser(
    req: IReq<IBase>,
    res: IRes,
    next: NextFunction,
) {
    const {
        webHookAttributes: { nonce, signedNonce },
    } = req.body;
    const dashboardProject = await projectManager.getProjectById(
        EnvVars.dashboardProjectId,
        true,
    );
    const address = ethers.utils.recoverAddress(nonce, signedNonce);
    const gasTank = await dashboardProject.getLoadedGasTank(
        EnvVars.dashboardTestGasTankChainId,
    );
    const isAuthorized = await gasTank.authorizer.isUserAuthorized(
        signedNonce,
        nonce,
        address,
    );
    if (isAuthorized) {
        return next();
    }
    res.status(HttpStatusCodes.UNAUTHORIZED).send();
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
        webHookAttributes: { nonce, signedNonce },
    } = req.body;
    const address = ethers.utils.recoverAddress(nonce, signedNonce);

    const contract = ethers.ContractFactory.getContract(ownerScw, [
        'function owner() view returns (address)',
    ]);

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

    await projectManager.addProject(name, ownerScw, allowedOrigins);
    res.status(HttpStatusCodes.OK).send();
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
    const { chainId, providerURL, whiteList } = req.body;

    await addGasTank(
        projectId,
        {
            chainId,
            providerURL,
        },
        whiteList,
    );
    res.status(HttpStatusCodes.OK).send();
}

async function updateGasTank(req: IReq<IUpdateGasTank>, res: IRes) {
    const { projectId, chainId } = req.params;
    const { providerURL } = req.body;

    const gasTank = await getReadyGasTankApiKey(projectId, chainId);
    await gasTank.updateGasTankProviderUrl(providerURL);
    res.status(HttpStatusCodes.OK).send();
}

async function addToGasTankWhitelist(
    req: IReq<IUpdateGasTankWhitelist>,
    res: IRes,
) {
    const { projectId, chainId } = req.params;
    const { address } = req.body;

    const gasTank = await getReadyGasTankApiKey(projectId, chainId);
    await gasTank.addToWhiteList(address);
    res.status(HttpStatusCodes.OK).send();
}

async function deleteFromGasTankWhitelist(
    req: IReq<IUpdateGasTankWhitelist>,
    res: IRes,
) {
    const { projectId, chainId } = req.params;
    const { address } = req.body;

    const gasTank = await getReadyGasTankApiKey(projectId, chainId);
    await gasTank.removeFromWhiteList(address);
    res.status(HttpStatusCodes.OK).send();
}

// **** Export default **** //

export default {
    paths,
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
    deleteFromGasTankWhitelist,
} as const;
