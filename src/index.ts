import Vue from 'Vue/types';
import { assert } from '@sleuren/sleuren-js/src/util';

interface Context {
    vue: {
        info: string;
        componentName: string;
    };
}

export function sleurenVue(Vue: Vue.VueConstructor) {
    const sleuren = typeof window !== 'undefined' ? window.sleuren : null;

    if (
        !assert(
            sleuren,
            'Sleuren Vue Plugin: the Sleuren Client could not be found. ' +
                'Errors in your Vue components will not be reported.',
            true
        ) ||
        !assert(
            Vue && Vue.config,
            'Sleuren Vue Plugin: The Vue errorHandler could not be found. ' +
                'Errors in your Vue components will not be reported.',
            sleuren ? sleuren.debug : false
        )
    ) {
        return;
    }

    const initialErrorHandler = Vue.config.errorHandler;

    Vue.config.errorHandler = (error: Error, vm: Vue, info: string) => {
        const componentName = vm && vm.$options && vm.$options.name ? vm.$options.name : 'AnonymousComponent';

        const context: Context = {
            vue: { info, componentName },
        };

        sleuren?.report(error, context, { vue: { vm, info } });

        if (typeof initialErrorHandler === 'function') {
            initialErrorHandler(error, vm, info);

            return;
        }

        throw error;
    };
}
