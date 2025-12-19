export default {
    routes: [
        {
            method: 'POST',
            path: '/intent-submissions',
            handler: 'intent-submission.create',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
