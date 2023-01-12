import HttpStatusCodes from '@src/declarations/major/HttpStatusCodes';

import { IReq, IRes } from './shared/types';

import { getReadyGasTank } from '../projectManager';

// **** Variables **** //

// Paths
const paths = {
  basePath: '/:apiKey/auth',
  authorize: '/authorize',
  getNonce: '/getNonce',
  refreshNonce: '/refreshNonce',
} as const;


// **** Types **** //

interface IAuthReq {
  zeroWalletAddress: string;
  gasTankName: string;
}


// **** Functions **** //

/**
 * Add an authorized user to the database
 */
async function authorize(req: IReq<IAuthReq>, res: IRes) {

  const { zeroWalletAddress, gasTankName } = req.body;
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

  await gasTank.addAuthorizedUser(zeroWalletAddress);

  return res.status(HttpStatusCodes.OK).end();
}

/**
 * Get the nonce of an authorized user
 */
async function getNonce(req: IReq<IAuthReq>, res: IRes) {

  const { zeroWalletAddress, gasTankName } = req.body;
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

  const nonce = await gasTank.getNonce(zeroWalletAddress);

  if(!nonce){
    return res.status(HttpStatusCodes.OK).json({ nonce: 'Token expired' });
  }

  return res.status(HttpStatusCodes.OK).json({ nonce: nonce });
}

async function refreshNonce(req: IReq<IAuthReq>, res: IRes) {

  const { zeroWalletAddress, gasTankName } = req.body;
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

  const nonce = await gasTank.authorizer.refreshUserAuthorization(
    zeroWalletAddress,
  );

  return res.status(HttpStatusCodes.OK).json({ nonce: nonce });
}



// **** Export default **** //

export default {
  paths,
  authorize,
  getNonce,
  refreshNonce,
} as const;
