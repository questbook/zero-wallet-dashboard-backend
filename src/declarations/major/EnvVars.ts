/* eslint-disable node/no-process-env */

// eslint-disable-next-line max-len
import { SupportedChainId } from '@mohammadshahin/zero-wallet-dashboard-sdk';

export default {
    nodeEnv: process.env.NODE_ENV ?? '',
    port: process.env.PORT ?? 0,
    cookieProps: {
        key: 'ExpressGeneratorTs',
        secret: process.env.COOKIE_SECRET ?? '',
        options: {
            httpOnly: true,
            signed: true,
            path: process.env.COOKIE_PATH ?? '',
            maxAge: Number(process.env.COOKIE_EXP ?? 0),
            domain: process.env.COOKIE_DOMAIN ?? '',
            secure: process.env.SECURE_COOKIE === 'true'
        }
    },
    jwt: {
        secret: process.env.JWT_SECRET ?? '',
        exp: process.env.COOKIE_EXP ?? '' // exp at the same time as the cookie
    },
    dashboardProjectId: process.env.DASHBOARD_PROJECT_ID ?? '',
    dashboardOrigin: process.env.DASHBOARD_ORIGIN ?? '',
    dashboardTestGasTankChainId:
        process.env.DASHBOARD_TEST_GAS_TANK_CHAIN_ID ?? '',

    dashboardTestProviderUrls: {
        5: process.env.DASHBOARD_TEST_PROVIDER_URL_GOERLI ?? '',
        10: process.env.DASHBOARD_TEST_PROVIDER_URL_OPTIMISM ?? '',
        137: process.env.DASHBOARD_TEST_PROVIDER_URL_POLYGON ?? '',
        42220: process.env.DASHBOARD_TEST_PROVIDER_URL_CELO ?? '',
    } as { [key in SupportedChainId]: string }
} as const;
