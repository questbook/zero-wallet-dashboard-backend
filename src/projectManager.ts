import {
    ProjectsManager,
    GasTankRawType,
    NewGasTankParams
} from '@mohammadshahin/zero-wallet-dashboard-sdk';

const projectManager = new ProjectsManager('./config.yaml');
projectManager.readyPromise.catch((err) => {
    console.error('Error initializing project manager', err);
});

async function getReadyGasTankId(
    projectId: string,
    chainId: string,
    loadRelayer = true
) {
    const project = await projectManager.getProjectById(projectId);
    const chainIdNumber = parseInt(chainId, 10);
    const gasTank = await project.loadAndGetGasTankByChainId(
        chainIdNumber,
        loadRelayer
    );
    await gasTank.readyPromise;

    return gasTank;
}

async function getReadyGasTankApiKey(
    projectId: string,
    chainId: string,
    loadRelayer = true
) {
    const project = await projectManager.getProjectByApiKey(projectId);
    await project.readyPromise;

    const chainIdNumber = parseInt(chainId, 10);
    const gasTank = await project.loadAndGetGasTankByChainId(
        chainIdNumber,
        loadRelayer
    );
    await gasTank.readyPromise;

    return gasTank;
}

async function getGasTankApiKey(projectId: string, chainId: string) {
    const project = await projectManager.getProjectByApiKey(projectId);
    await project.readyPromise;

    const chainIdNumber = parseInt(chainId, 10);
    const gasTank = await project.loadAndGetGasTankByChainId(
        chainIdNumber,
        false
    );

    return gasTank;
}

async function getProjectsByOwner(owner: string) {
    const projects = await projectManager.getAllProjectsOwnerRaw(owner);
    return projects;
}

async function getGasTanksRaw(projectId: string): Promise<GasTankRawType[]> {
    const project = await projectManager.getProjectById(projectId);
    const gasTanks = await project.getGasTanksRaw();
    return gasTanks;
}

async function addGasTank(
    projectId: string,
    gasTankProps: NewGasTankParams,
    whiteList: string[]
) {
    const project = await projectManager.getProjectById(projectId);
    const gasTank = await project.addGasTank(gasTankProps, whiteList);
    return gasTank
}

export default projectManager;
export {
    getReadyGasTankId,
    getReadyGasTankApiKey,
    getGasTankApiKey,
    getProjectsByOwner,
    getGasTanksRaw,
    addGasTank
};
