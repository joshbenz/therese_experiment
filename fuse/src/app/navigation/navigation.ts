import { FuseNavigation } from '@fuse/types';

export const navigation: FuseNavigation[] = [
    {
        id       : 'applications',
        title    : 'Applications',
        translate: 'NAV.APPLICATIONS',
        type     : 'group',
        children : [
            {
                id       : 'dashboard',
                title    : 'Dashboard',
                translate: 'NAV.DASHBOARD.TITLE',
                type     : 'item',
                icon     : 'dashboard',
                url      : '/dashboard',
                badge    : {
                    title    : '99',
                    translate: 'NAV.DASHBOARD.BADGE',
                    bg       : '#F44336',
                    fg       : '#FFFFFF'
                }
            },

            {
                id       : 'usermang',
                title    : 'User Management',
                translate: 'NAV.USERMANG.TITLE',
                type     : 'item',
                icon     : 'person',
                url      : '/usermang',
                badge    : {
                    title    : '25',
                    translate: 'NAV.USERMANG.BADGE',
                    bg       : '#F44336',
                    fg       : '#FFFFFF'
                }
            },

        ]
    }
];
