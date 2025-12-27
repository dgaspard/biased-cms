export default {
    routes: [
        {
            method: 'POST',
            path: '/intent-submissions',
            handler: 'intent-submission.create',
            config: {
                auth: false,
                policies: [],
                middlewares: [],
            },
        },
    ],
};
