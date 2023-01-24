import {
    isBuildExecTransaction,
    isWebHookAttributes,
    isDeployWebHookAttributes,
} from '@src/util/zerowallet-validator';
import express, { Router } from 'express';

import { body, validationResult } from 'express-validator';

import authRoutes from './auth-routes';
import gaslessRoutes from './gasless-routes';
import dashboardRoutes from './dashboard-routes';


// **** Init **** //

const apiRouter = Router();

// **** Setup auth routes **** //

const authRouter = Router();

// authorize user route
authRouter.post(
    authRoutes.paths.authorize,
    body('zeroWalletAddress').isString().isLength({ min: 42, max: 42 }),
    body('chainId').isString(),
    (req: express.Request, res: express.Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        return authRoutes.authorize(req, res);
    },
);

// get Nonce route
authRouter.post(
    authRoutes.paths.getNonce,
    body('zeroWalletAddress').isString().isLength({ min: 42, max: 42 }),
    body('chainId').isString(),
    (req: express.Request, res: express.Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        return authRoutes.getNonce(req, res);
    },
);

// refresh Nonce route
authRouter.post(
    authRoutes.paths.refreshNonce,
    body('zeroWalletAddress').isString().isLength({ min: 42, max: 42 }),
    body('chainId').isString(),
    (req: express.Request, res: express.Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        return authRoutes.refreshNonce(req, res);
    },
);

// add authRouter
apiRouter.use(authRoutes.paths.basePath, authRouter);

// **** Setup gasless routes **** //
const gaslessRouter = Router();

// build transaction route
gaslessRouter.post(
    gaslessRoutes.paths.build,
    body('zeroWalletAddress').isString().isLength({ min: 42, max: 42 }),
    body('chainId').isString(),
    body('data').isString(),
    body('webHookAttributes').custom(isWebHookAttributes),
    (req: express.Request, res: express.Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        return gaslessRoutes.build(req, res);
    },
);

// send transaction route
gaslessRouter.post(
    gaslessRoutes.paths.send,
    body('zeroWalletAddress').isString().isLength({ min: 42, max: 42 }),
    body('signature').isString(),
    body('chainId').isString(),
    body('webHookAttributes').custom(isWebHookAttributes),
    body('execTransactionBody').custom(isBuildExecTransaction),
    (req: express.Request, res: express.Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        return gaslessRoutes.send(req, res);
    },
);

// deploy transaction route
gaslessRouter.post(
    gaslessRoutes.paths.deploy,
    body('zeroWalletAddress').isString().isLength({ min: 42, max: 42 }),
    body('chainId').isString(),
    body('webHookAttributes').custom(isDeployWebHookAttributes),
    (req: express.Request, res: express.Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        return gaslessRoutes.deploy(req, res);
    },
);

// Add gaslessRouter
apiRouter.use(gaslessRoutes.paths.basePath, gaslessRouter);

// **** Setup dashboard routes **** //
const dashboardRouter = Router();

// get projects route
dashboardRouter.post(
    dashboardRoutes.paths.projects,
    body('webHookAttributes').custom(isDeployWebHookAttributes),
    body('ownerScw').isString().isLength({ min: 42, max: 42 }),
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    dashboardRoutes.getProjects,
);

// post projects route
dashboardRouter.post(
    dashboardRoutes.paths.project,
    body('webHookAttributes').custom(isDeployWebHookAttributes),
    body('ownerScw').isString().isLength({ min: 42, max: 42 }),
    body('name').isString(),
    body('allowedOrigins').isArray(),
    body('allowedOrigins.*').isString(),
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        next();
    },
    dashboardRoutes.postProject,
);

dashboardRouter.post(
    dashboardRoutes.paths.projectUpdate,
    body('webHookAttributes').custom(isDeployWebHookAttributes),
    body('ownerScw').isString().isLength({ min: 42, max: 42 }),
    body('name').isString(),
    body('allowedOrigins').isArray(),
    body('allowedOrigins.*').isString(),
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        next();
    },
    dashboardRoutes.updateProject,
);

// get Gas Tanks route
dashboardRouter.post(
    dashboardRoutes.paths.gasTanks,
    body('webHookAttributes').custom(isDeployWebHookAttributes),
    body('ownerScw').isString().isLength({ min: 42, max: 42 }),
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        next();
    },
    dashboardRoutes.getGasTanks,
);

// post Gas Tanks route
dashboardRouter.post(
    dashboardRoutes.paths.gasTank,
    body('webHookAttributes').custom(isDeployWebHookAttributes),
    body('ownerScw').isString().isLength({ min: 42, max: 42 }),
    body('name').isString(),
    body('chainId').isInt(),
    body('providerURL').isString(),
    body('fundingKey').isString(),
    body('whiteList').isArray(),
    body('whiteList.*').isString(),
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    dashboardRoutes.postGasTank,
);

// update gas tank route
dashboardRouter.post(
    dashboardRoutes.paths.updateGasTank,
    body('webHookAttributes').custom(isDeployWebHookAttributes),
    body('ownerScw').isString().isLength({ min: 42, max: 42 }),
    body('providerURL').isString(),
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    dashboardRoutes.updateGasTank,
);

// add to Gas Tank whitelist route
dashboardRouter.post(
    dashboardRoutes.paths.updateGasTankWhitelist,
    body('webHookAttributes').custom(isDeployWebHookAttributes),
    body('ownerScw').isString().isLength({ min: 42, max: 42 }),
    body('address').isString().isLength({ min: 42, max: 42 }),
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    dashboardRoutes.addToGasTankWhitelist,
);

// delete from Gas Tank whitelist route
dashboardRouter.delete(
    dashboardRoutes.paths.updateGasTankWhitelist,
    body('webHookAttributes').custom(isDeployWebHookAttributes),
    body('ownerScw').isString().isLength({ min: 42, max: 42 }),
    body('address').isString().isLength({ min: 42, max: 42 }),
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    dashboardRoutes.deleteFromGasTankWhitelist,
);

dashboardRouter.use(
    dashboardRoutes.isValidDashboardUser,
    dashboardRoutes.isScwOwner,
);

apiRouter.use(dashboardRoutes.paths.basePath, dashboardRouter);

// **** Export default **** //

export default apiRouter;
