import HttpStatusCodes from '@src/declarations/major/HttpStatusCodes';
import { 
  WebHookAttributesType,
  BuildExecTransactionType,
} from '@mohammadshahin/zero-wallet-dashboard-sdk/build/main';

import { DeployWebHookAttributesType } from '@src/types/zerowallet';
import { IReq, IRes } from './shared/types';

import { getReadyGasTank } from '../projectManager';

// **** Variables **** //

// Paths
const paths = {
  basePath: '/:apiKey/tx',
  send: '/send',
  build: '/build',
  deploy: '/deploy',
} as const;

// **** Types **** //

interface IBuildReq {
  zeroWalletAddress: string,
  data: string,
  webHookAttributes: WebHookAttributesType,
  gasTankName: string
}

interface ISendReq {
  execTransactionBody: BuildExecTransactionType,
  zeroWalletAddress: string,
  signature: string,
  webHookAttributes: WebHookAttributesType,
  gasTankName: string
}

interface IDeployReq {
  zeroWalletAddress: string,
  gasTankName: string,
  webHookAttributes: DeployWebHookAttributesType,
}

// **** Functions **** //

/**
 * Build the gasless transaction
 */
async function build(req: IReq<IBuildReq>, res: IRes) {
  const projectApiKey = req.params.apiKey;
  const { zeroWalletAddress, data, webHookAttributes, gasTankName } = req.body;

  const gasTank = await getReadyGasTank(
    projectApiKey, 
    parseInt("5"),
  );

  if (!gasTank) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json(
      { error: `Gas tank '${gasTankName}' not found` },
    );
  }

  const { safeTXBody, scwAddress } = await gasTank.buildTransaction(
    {
      zeroWalletAddress,
      populatedTx: data,
      webHookAttributes,
      targetContractAddress: webHookAttributes.to,
    },
  );

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
    gasTankName,
  } = req.body;
  
  const gasTank = await getReadyGasTank(
    projectApiKey, 
    parseInt("5"),
  );

  if (!gasTank) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json(
      { error: `Gas tank '${gasTankName}' not found` },
    );
  }

  const {walletAddress: scwAddress} = await gasTank.doesProxyWalletExist(
    zeroWalletAddress,
  );

  const txHash = await gasTank.sendGaslessTransaction(
    {
      safeTXBody: execTransactionBody,
      zeroWalletAddress,
      scwAddress,
      signature,
      webHookAttributes,
    },
  );
  
  return res.status(HttpStatusCodes.CREATED).json({ txHash });
}


/**
 * Deploy the smart contract wallet
 */
async function deploy(req: IReq<IDeployReq>, res: IRes) {
  const { zeroWalletAddress, gasTankName, webHookAttributes } = req.body;
  const projectApiKey = req.params.apiKey;

  const gasTank = await getReadyGasTank(
    projectApiKey, 
    parseInt("5"),
  );

  if (!gasTank) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json(
      { error: `Gas tank '${gasTankName}' not found` },
    );
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
  build,
  send,
  deploy,
} as const;
