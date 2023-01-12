import {
  ProjectsManager,
} from "@mohammadshahin/zero-wallet-dashboard-sdk/build/main";

const projectManager = new ProjectsManager('./config.yaml');

const getReadyGasTank = async (projectApiKey: string, chainId: number) => {
  const project = await projectManager.getProject(projectApiKey);
  const gasTank = await project.loadAndGetGasTankByChainId(
    chainId,
  );
  await gasTank.readyPromise;

  return gasTank;
};

export default projectManager;
export { getReadyGasTank };