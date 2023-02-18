import {
    isBuildExecTransaction,
    isWebHookAttributes,
    isDeployWebHookAttributes
} from '@src/util/zerowallet-validator';
import express, { NextFunction, Router } from 'express';

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
    authRoutes.isAllowedOriginAuth,
    body('zeroWalletAddress').isString().isLength({ min: 42, max: 42 }),
    body('chainId').isString(),
    (req: express.Request, res: express.Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        next()
    },
    authRoutes.authorize
);

// get Nonce route
authRouter.post(
    authRoutes.paths.getNonce,
    authRoutes.isAllowedOriginAuth,
    body('zeroWalletAddress').isString().isLength({ min: 42, max: 42 }),
    body('chainId').isString(),
    (req: express.Request, res: express.Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        return authRoutes.getNonce(req, res);
    }
);

// refresh Nonce route
authRouter.post(
    authRoutes.paths.refreshNonce,
    authRoutes.isAllowedOriginAuth,
    body('zeroWalletAddress').isString().isLength({ min: 42, max: 42 }),
    body('chainId').isString(),
    (req: express.Request, res: express.Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        return authRoutes.refreshNonce(req, res);
    }
);

// add authRouter
apiRouter.use(authRoutes.paths.basePath, authRouter);

// **** Setup gasless routes **** //
const gaslessRouter = Router();

// build transaction route
gaslessRouter.post(
    gaslessRoutes.paths.build,
    gaslessRoutes.isAllowedOriginGasless,
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
    }
);

// send transaction route
gaslessRouter.post(
    gaslessRoutes.paths.send,
    gaslessRoutes.isAllowedOriginGasless,
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
    }
);

// deploy transaction route
gaslessRouter.post(
    gaslessRoutes.paths.deploy,
    gaslessRoutes.isAllowedOriginGasless,
    body('zeroWalletAddress').isString().isLength({ min: 42, max: 42 }),
    body('chainId').isString(),
    body('webHookAttributes').custom(isDeployWebHookAttributes),
    (req: express.Request, res: express.Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        return gaslessRoutes.deploy(req, res);
    }
);

// Add gaslessRouter
apiRouter.use(gaslessRoutes.paths.basePath, gaslessRouter);

// **** Setup dashboard routes **** //
const dashboardRouter = Router();

dashboardRouter.use(
    dashboardRoutes.isValidDashboardUser,
    dashboardRoutes.isScwOwner
);

// get projects route
dashboardRouter.post(
    dashboardRoutes.paths.projects,
    dashboardRoutes.isAllowedOriginDashboard,
    body('webHookAttributes').custom(isDeployWebHookAttributes),
    body('ownerScw').isString().isLength({ min: 42, max: 42 }),
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    dashboardRoutes.getProjects
);

// post projects route
dashboardRouter.post(
    dashboardRoutes.paths.project,
    dashboardRoutes.isAllowedOriginDashboard,
    body('webHookAttributes').custom(isDeployWebHookAttributes),
    body('ownerScw').isString().isLength({ min: 42, max: 42 }),
    body('name').isString(),
    body('allowedOrigins').isArray(),
    body('allowedOrigins.*').isString(),
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        next();
    },
    dashboardRoutes.postProject
);

dashboardRouter.post(
    dashboardRoutes.paths.projectUpdate,
    dashboardRoutes.isAllowedOriginDashboard,
    body('webHookAttributes').custom(isDeployWebHookAttributes),
    body('ownerScw').isString().isLength({ min: 42, max: 42 }),
    body('name').isString(),
    body('allowedOrigins').isArray(),
    body('allowedOrigins.*').isString(),
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        next();
    },
    dashboardRoutes.updateProject
);

// get Gas Tanks route
dashboardRouter.post(
    dashboardRoutes.paths.gasTanks,
    dashboardRoutes.isAllowedOriginDashboard,
    body('webHookAttributes').custom(isDeployWebHookAttributes),
    body('ownerScw').isString().isLength({ min: 42, max: 42 }),
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        next();
    },
    dashboardRoutes.getGasTanks
);

// post Gas Tanks route
dashboardRouter.post(
    dashboardRoutes.paths.gasTank,
    dashboardRoutes.isAllowedOriginDashboard,
    body('webHookAttributes').custom(isDeployWebHookAttributes),
    body('ownerScw').isString().isLength({ min: 42, max: 42 }),
    body('chainId').isInt(),
    body('whitelist').isArray(),
    body('whitelist.*').isString(),
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    dashboardRoutes.postGasTank
);

// update gas tank route
dashboardRouter.post(
    dashboardRoutes.paths.updateGasTank,
    dashboardRoutes.isAllowedOriginDashboard,
    body('webHookAttributes').custom(isDeployWebHookAttributes),
    body('ownerScw').isString().isLength({ min: 42, max: 42 }),
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    dashboardRoutes.updateGasTank
);

// add to Gas Tank whitelist route
dashboardRouter.post(
    dashboardRoutes.paths.updateGasTankWhitelistAdd,
    dashboardRoutes.isAllowedOriginDashboard,
    body('webHookAttributes').custom(isDeployWebHookAttributes),
    body('ownerScw').isString().isLength({ min: 42, max: 42 }),
    body('address').isString().isLength({ min: 42, max: 42 }),
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    dashboardRoutes.addToGasTankWhitelist
);

// delete from Gas Tank whitelist route
dashboardRouter.post(
    dashboardRoutes.paths.updateGasTankWhitelistDelete,
    dashboardRoutes.isAllowedOriginDashboard,
    body('webHookAttributes').custom(isDeployWebHookAttributes),
    body('ownerScw').isString().isLength({ min: 42, max: 42 }),
    body('address').isString().isLength({ min: 42, max: 42 }),
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    dashboardRoutes.deleteFromGasTankWhitelist
);

apiRouter.use(dashboardRoutes.paths.basePath, dashboardRouter);

// **** Export default **** //

export default apiRouter;
