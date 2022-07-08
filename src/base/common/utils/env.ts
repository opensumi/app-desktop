declare const WP_BUILD_ENV: string;

if (typeof WP_BUILD_ENV === 'undefined') {
  (global as any).WP_BUILD_ENV = process.env.BUILD_ENV || 'production';
}

export const isBeta = WP_BUILD_ENV === 'beta';
export const isProd = WP_BUILD_ENV === 'production';
export const isDev = process.env.SUMI_ENV === 'development' || (!isBeta && !isProd);
